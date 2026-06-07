import * as pdfjs from 'pdfjs-dist';
import type { PDFPageProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
}

const DATE_RE = /(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.((?:19|20)\d{2})/;
const AMOUNT_RE = /(-?(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2})\s*(?:€|EUR)?/g;

const SKIP_LINE =
  /kontostand|saldo\s+(neu|alt)|alter saldo|neuer saldo|umsätze|seite\s+\d|ing[\s-]?(diba|deutschland)?|kontoauszug|filiale|datum\s+buchung|währung|abrechnung|kundennummer|kontonummer|iban|bic|auftragskonto|anfangssaldo|endsaldo|summe/i;

const ING_TX_TYPES =
  /^(Lastschrift|Überweisung|Ueberweisung|Gutschrift|Bezüge|Bezuege|Gehalt\/Rente|Dauerauftrag|Terminüberw|Entgelt|Retoure|Abbuchung|Kartenzahlung|Bareinzahlung|Zahlungseingang)/i;

function parseGermanAmount(raw: string): number {
  const cleaned = raw.replace(/€|EUR/gi, '').trim();
  const negative = cleaned.startsWith('-');
  const num = cleaned.replace(/^-/, '').replace(/\./g, '').replace(',', '.');
  const value = parseFloat(num);
  if (Number.isNaN(value)) return NaN;
  return negative ? -Math.abs(value) : value;
}

function guessCategory(description: string): import('@/types/expense').ExpenseCategory {
  const d = description.toLowerCase();
  if (/rewe|edeka|aldi|lidl|kaufland|penny|netto|lebensmittel|bäcker|metzger/.test(d))
    return 'lebensmittel';
  if (/miete|strom|gas|wasser|versicherung|telekom|vodafone|o2|internet/.test(d))
    return 'wohnen';
  if (/tank|aral|shell|db |bahn|uber|taxi|adac|park/.test(d)) return 'transport';
  if (/apotheke|arzt|kranken|dm |rossmann/.test(d)) return 'gesundheit';
  if (/h&m|zara|amazon.*mode|kleidung/.test(d)) return 'kleidung';
  if (/netflix|spotify|kino|restaurant|bar |café|steam/.test(d)) return 'freizeit';
  return 'sonstiges';
}

/** PDF-Text in Zeilen gruppieren (ING & andere Banken liefern oft keine echten \n). */
async function extractLinesFromPage(page: PDFPageProxy): Promise<string[]> {
  const content = await page.getTextContent();
  const items: { str: string; x: number; y: number }[] = [];

  for (const raw of content.items) {
    if (!('str' in raw)) continue;
    const str = raw.str.replace(/\s+/g, ' ').trim();
    if (!str) continue;
    const [, , , , x, y] = raw.transform;
    items.push({ str, x, y });
  }

  items.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.x - b.x;
  });

  const lines: string[] = [];
  let bucket: typeof items = [];
  let bucketY = NaN;

  const flush = () => {
    if (bucket.length === 0) return;
    bucket.sort((a, b) => a.x - b.x);
    const line = bucket
      .map((i) => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line) lines.push(line);
    bucket = [];
  };

  for (const item of items) {
    if (bucket.length === 0 || Math.abs(item.y - bucketY) <= 4) {
      bucket.push(item);
      if (bucket.length === 1) bucketY = item.y;
    } else {
      flush();
      bucket = [item];
      bucketY = item.y;
    }
  }
  flush();

  return lines;
}

function cleanDescription(raw: string): string {
  return raw
    .replace(DATE_RE, ' ')
    .replace(/€|EUR/gi, '')
    .replace(ING_TX_TYPES, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function parseTransactionLine(line: string): ParsedTransaction | null {
  const trimmed = line.trim();
  if (trimmed.length < 8 || SKIP_LINE.test(trimmed)) return null;

  const dateMatch = trimmed.match(DATE_RE);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const amounts = [...trimmed.matchAll(AMOUNT_RE)];
  if (amounts.length === 0) return null;

  // ING: oft Buchung + Saldo in einer Zeile → Ausgabe ist der negative Betrag
  let expenseRaw: string | null = null;
  for (const match of amounts) {
    const value = parseGermanAmount(match[1]);
    if (!Number.isNaN(value) && value < 0) {
      expenseRaw = match[1];
      break;
    }
  }

  // Fallback: letzter Betrag ist negativ (klassisches Format)
  if (!expenseRaw) {
    const last = amounts[amounts.length - 1];
    const value = parseGermanAmount(last[1]);
    if (Number.isNaN(value) || value >= 0) return null;
    expenseRaw = last[1];
  }

  const amount = Math.abs(parseGermanAmount(expenseRaw));
  if (amount <= 0) return null;

  let description = trimmed;
  description = description.replace(dateMatch[0], ' ');
  for (const match of amounts) {
    description = description.replace(match[0], ' ');
  }
  description = cleanDescription(description);

  if (description.length < 2) return null;

  return {
    date: `${year}-${month}-${day}`,
    description,
    amount,
  };
}

export async function parseBankStatementPdf(file: File): Promise<ParsedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    lines.push(...(await extractLinesFromPage(page)));
  }

  const transactions: ParsedTransaction[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const tx = parseTransactionLine(line);
    if (!tx) continue;

    const key = `${tx.date}-${tx.amount}-${tx.description}`;
    if (seen.has(key)) continue;
    seen.add(key);

    transactions.push(tx);
  }

  return transactions;
}

export { guessCategory };
