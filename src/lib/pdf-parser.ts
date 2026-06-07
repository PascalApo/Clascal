import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
}

const DATE_RE = /(\d{2})\.(\d{2})\.(\d{4})/;
const AMOUNT_RE = /(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})\s*€?/;

function parseGermanAmount(raw: string): number {
  const cleaned = raw.replace(/€/g, '').trim();
  const negative = cleaned.startsWith('-');
  const num = cleaned.replace(/^-/, '').replace(/\./g, '').replace(',', '.');
  const value = parseFloat(num);
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

export async function parseBankStatementPdf(file: File): Promise<ParsedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    lines.push(...pageText.split(/\s{2,}|\n/).filter(Boolean));
  }

  const transactions: ParsedTransaction[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const dateMatch = line.match(DATE_RE);
    const amountMatches = [...line.matchAll(new RegExp(AMOUNT_RE.source, 'g'))];

    if (!dateMatch || amountMatches.length === 0) continue;

    const amountStr = amountMatches[amountMatches.length - 1][1];
    const amount = parseGermanAmount(amountStr);
    if (amount >= 0) continue;

    const [, day, month, year] = dateMatch;
    const date = `${year}-${month}-${day}`;
    const description = line
      .replace(DATE_RE, '')
      .replace(amountStr, '')
      .replace(/€/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);

    if (!description || description.length < 3) continue;

    const key = `${date}-${amount}-${description}`;
    if (seen.has(key)) continue;
    seen.add(key);

    transactions.push({ date, description, amount: Math.abs(amount) });
  }

  return transactions;
}

export { guessCategory };
