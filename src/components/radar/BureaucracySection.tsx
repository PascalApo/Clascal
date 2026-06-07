import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, Check, ChevronDown } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';
import { BUREAUCRACY_TEMPLATES } from '@/data/bureaucracy-templates';
import { daysUntilDue } from '@/types/bureaucracy-deadline';

export function BureaucracySection() {
  const { bureaucracyDeadlines, addBureaucracyDeadline, toggleBureaucracyDeadline, removeBureaucracyDeadline } = useAppData();
  const { userId } = useUser();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<'user1' | 'user2' | 'both'>('both');

  const open = bureaucracyDeadlines.filter((d) => !d.completed);
  const done = bureaucracyDeadlines.filter((d) => d.completed);

  const handleAdd = () => {
    const template = BUREAUCRACY_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template || !dueDate) return;
    addBureaucracyDeadline({
      templateId: template.id,
      title: template.title,
      category: template.category,
      dueDate,
      assignedTo,
      estimatedCost: template.estimatedCost,
      createdBy: userId ?? 'user1',
    });
    setSelectedTemplate('');
    setDueDate('');
    setShowTemplates(false);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white">
          <FileText size={16} className="accent-text" />
          Bürokratie-Fristen
        </h3>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="rounded-lg p-1.5 accent-bg-muted transition-colors hover-accent-bg"
        >
          <Plus size={16} className="accent-text" />
        </button>
      </div>

      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card space-y-2 overflow-hidden p-3"
          >
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white/5 px-3 py-2 pr-8 text-sm text-white outline-none focus:ring-1 accent-ring"
              >
                <option value="">Frist auswählen…</option>
                {BUREAUCRACY_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            </div>
            {selectedTemplate && (
              <p className="text-xs text-white/40">
                {BUREAUCRACY_TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
              </p>
            )}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 accent-ring"
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value as typeof assignedTo)}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 accent-ring"
            >
              <option value="both">Beide</option>
              <option value="user1">Clara</option>
              <option value="user2">Pascal</option>
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedTemplate || !dueDate}
              className="w-full rounded-lg py-2 text-sm font-medium accent-bg text-black disabled:opacity-40"
            >
              Frist hinzufügen
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {open.length === 0 && done.length === 0 ? (
        <p className="text-xs text-white/30">Keine Fristen — deutsche Vorlagen mit einem Klick hinzufügen.</p>
      ) : (
        <div className="space-y-1.5">
          {open.map((deadline) => {
            const days = daysUntilDue(deadline.dueDate);
            const urgent = days <= 3;
            return (
              <div key={deadline.id} className="glass-card flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleBureaucracyDeadline(deadline.id)}
                  className="rounded-full border border-white/20 p-1 hover:border-green-400"
                >
                  <Check size={12} className="text-white/30" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${urgent ? 'text-amber-300' : 'text-white'}`}>{deadline.title}</p>
                  <p className="text-xs text-white/40">
                    {deadline.dueDate} · {days <= 0 ? 'Überfällig' : `in ${days} Tagen`}
                    {deadline.estimatedCost ? ` · ~${deadline.estimatedCost} €` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBureaucracyDeadline(deadline.id)}
                  className="rounded p-1 text-white/20 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          {done.length > 0 && (
            <p className="pt-2 text-xs text-white/25">{done.length} erledigt</p>
          )}
        </div>
      )}
    </section>
  );
}
