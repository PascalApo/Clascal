import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  CalendarDays,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppData } from '@/context/AppDataContext';
import { useUser } from '@/context/UserContext';
import { USER_BASE, type UserId } from '@/types';
import { generateIcs, downloadIcs } from '@/lib/ics-export';
import {
  CALENDAR_WEEKDAYS,
  EVENT_COLOR,
  toDateKey,
  dateToWeekday,
  getMonthGrid,
  getItemsForDate,
  formatMonthYear,
} from '@/lib/calendar-utils';
import type { Task } from '@/lib/sync/types';

type AddMode = 'task' | 'event' | null;

function creatorLabel(id: string): string {
  if (id === 'user1' || id === 'user2') return USER_BASE[id as UserId].name;
  return 'Mitglied';
}

export function Kalender() {
  const { userId, userColors, getAssigneeColor } = useUser();
  const { tasks, events, addTask, toggleTask, removeTask, addEvent, removeEvent } = useAppData();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [addMode, setAddMode] = useState<AddMode>(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    assignedTo: 'user1' as Task['assignedTo'],
    recurring: true,
  });
  const [eventForm, setEventForm] = useState({ title: '', description: '' });

  const monthGrid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const selectedItems = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return getItemsForDate(new Date(y, m - 1, d), tasks, events);
  }, [selectedDate, tasks, events]);

  const goToMonth = (offset: number) => {
    const d = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(toDateKey(now));
  };

  const handleExport = () => {
    downloadIcs(generateIcs(events, tasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !userId || !selectedDate) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    addTask({
      title: taskForm.title,
      assignedTo: taskForm.assignedTo,
      weekday: dateToWeekday(date),
      date: taskForm.recurring ? undefined : selectedDate,
      recurring: taskForm.recurring,
      createdBy: userId,
    });
    setTaskForm({ title: '', assignedTo: 'user1', recurring: true });
    setAddMode(null);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !userId || !selectedDate) return;
    const iso = new Date(selectedDate + 'T12:00:00').toISOString();
    addEvent({
      title: eventForm.title,
      description: eventForm.description || undefined,
      startDate: iso,
      endDate: iso,
      allDay: true,
      createdBy: userId,
    });
    setEventForm({ title: '', description: '' });
    setAddMode(null);
  };

  const selectedLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-start justify-between">
        <PageHeader title="Kalender" subtitle="Aufgaben & Termine gemeinsam" />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs accent-bg-muted accent-text"
        >
          <Download size={14} />
          .ics
        </motion.button>
      </div>

      {/* Legende */}
      <div className="flex flex-wrap gap-3 text-[10px] text-white/50">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-4 rounded-sm border border-dashed"
            style={{ borderColor: userColors.user1, backgroundColor: `${userColors.user1}33` }}
          />
          Aufgabe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: EVENT_COLOR }} />
          Termin
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: userColors.user1 }} /> Clara
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: userColors.user2 }} /> Pascal
        </span>
      </div>

      {/* Monatsnavigation */}
      <div className="glass-card p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => goToMonth(-1)}
            className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h3 className="font-display text-base font-bold capitalize accent-gradient-text">
              {formatMonthYear(viewYear, viewMonth)}
            </h3>
            <button
              onClick={goToToday}
              className="mt-0.5 text-[10px] text-white/65 hover:text-white/70"
            >
              Heute
            </button>
          </div>
          <button
            onClick={() => goToMonth(1)}
            className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
            aria-label="Nächster Monat"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Wochentage */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {CALENDAR_WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1 text-center text-[10px] font-medium text-white/55">
              {wd}
            </div>
          ))}
        </div>

        {/* Kalendergrid */}
        <div className="space-y-1">
          {monthGrid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((date, di) => {
                if (!date) {
                  return <div key={di} className="aspect-square" />;
                }
                const key = toDateKey(date);
                const isToday = key === toDateKey(today);
                const isSelected = key === selectedDate;
                const { tasks: dayTasks, events: dayEvents } = getItemsForDate(date, tasks, events);
                const total = dayTasks.length + dayEvents.length;

                return (
                  <button
                    key={di}
                    onClick={() => setSelectedDate(key)}
                    className={`relative aspect-square rounded-xl p-0.5 text-left transition-all ${
                      isSelected
                        ? 'ring-1 accent-border accent-bg-muted'
                        : 'hover:bg-white/5'
                    } ${isToday ? 'bg-white/5' : ''}`}
                  >
                    <span
                      className={`block text-center text-xs font-medium ${
                        isToday ? 'accent-text' : isSelected ? 'text-white' : 'text-white/60'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {total > 0 && (
                      <div className="mt-0.5 flex flex-col gap-px px-0.5">
                        {dayTasks.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="h-1 rounded-full border border-dashed opacity-80"
                            style={{
                              borderColor: t.assignedTo === 'both' ? undefined : getAssigneeColor(t.assignedTo),
                              background:
                                t.assignedTo === 'both'
                                  ? getAssigneeColor('both')
                                  : `${getAssigneeColor(t.assignedTo)}40`,
                            }}
                          />
                        ))}
                        {dayEvents.slice(0, 2 - Math.min(dayTasks.length, 2)).map((ev) => (
                          <span
                            key={ev.id}
                            className="h-1 rounded-full"
                            style={{ backgroundColor: EVENT_COLOR }}
                          />
                        ))}
                        {total > 2 && (
                          <span className="text-center text-[8px] text-white/55">+{total - 2}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tagesdetail */}
      <div className="glass-card p-4">
        <h4 className="mb-3 text-sm font-medium text-white/60">{selectedLabel}</h4>

        {selectedItems.tasks.length === 0 && selectedItems.events.length === 0 ? (
          <p className="py-4 text-center text-xs text-white/55">Nichts geplant</p>
        ) : (
          <div className="space-y-2">
            {selectedItems.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-dark-200/40 px-3 py-2"
                style={{
                  borderColor:
                    task.assignedTo === 'both'
                      ? 'rgba(255,255,255,0.15)'
                      : `${getAssigneeColor(task.assignedTo)}50`,
                }}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    task.completed ? 'border-green-500 bg-green-500/20' : 'border-white/20'
                  }`}
                >
                  {task.completed && <Check size={12} className="text-green-400" />}
                </button>
                <ListTodo size={14} className="shrink-0 text-white/55" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${task.completed ? 'text-white/55 line-through' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-[10px] text-white/55">
                    Aufgabe · {task.recurring ? 'Wöchentlich' : 'Einmalig'} ·{' '}
                    {task.assignedTo === 'both' ? 'Beide' : USER_BASE[task.assignedTo].name}
                  </p>
                </div>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background:
                      task.assignedTo === 'both' ? getAssigneeColor('both') : getAssigneeColor(task.assignedTo),
                  }}
                />
                <button onClick={() => removeTask(task.id)} className="text-white/50 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}

            {selectedItems.events.map((ev) => (
              <motion.div
                key={ev.id}
                layout
                className="flex items-center gap-3 rounded-xl px-3 py-2"
                style={{ backgroundColor: `${EVENT_COLOR}18`, borderLeft: `3px solid ${EVENT_COLOR}` }}
              >
                <CalendarDays size={14} className="shrink-0" style={{ color: EVENT_COLOR }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{ev.title}</p>
                  <p className="text-[10px] text-white/55">
                    Termin · {creatorLabel(ev.createdBy)}
                    {ev.description ? ` · ${ev.description}` : ''}
                  </p>
                </div>
                <button onClick={() => removeEvent(ev.id)} className="text-white/50 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setAddMode(addMode === 'task' ? null : 'task')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs ${
              addMode === 'task' ? 'accent-bg-muted accent-text' : 'bg-dark-200/50 text-white/50'
            }`}
          >
            <ListTodo size={14} /> Aufgabe
          </button>
          <button
            onClick={() => setAddMode(addMode === 'event' ? null : 'event')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs ${
              addMode === 'event' ? 'text-amber-400' : 'bg-dark-200/50 text-white/50'
            }`}
            style={addMode === 'event' ? { backgroundColor: `${EVENT_COLOR}20` } : undefined}
          >
            <CalendarDays size={14} /> Termin
          </button>
        </div>

        <AnimatePresence>
          {addMode === 'task' && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTask}
              className="mt-3 space-y-3 overflow-hidden border-t border-white/5 pt-3"
            >
              <input
                type="text"
                placeholder="Aufgabe (z.B. Staubsaugen)"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full rounded-xl bg-dark-200 px-3 py-2.5 text-sm outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value as Task['assignedTo'] })
                  }
                  className="rounded-xl bg-dark-200 px-3 py-2.5 text-sm outline-none"
                >
                  <option value="user1">Clara</option>
                  <option value="user2">Pascal</option>
                  <option value="both">Beide</option>
                </select>
                <select
                  value={taskForm.recurring ? 'weekly' : 'once'}
                  onChange={(e) => setTaskForm({ ...taskForm, recurring: e.target.value === 'weekly' })}
                  className="rounded-xl bg-dark-200 px-3 py-2.5 text-sm outline-none"
                >
                  <option value="weekly">Jede Woche</option>
                  <option value="once">Nur diesen Tag</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl py-2.5 text-sm accent-bg-muted accent-text"
              >
                Aufgabe hinzufügen
              </button>
            </motion.form>
          )}

          {addMode === 'event' && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddEvent}
              className="mt-3 space-y-3 overflow-hidden border-t border-white/5 pt-3"
            >
              <input
                type="text"
                placeholder="Termin-Titel"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full rounded-xl bg-dark-200 px-3 py-2.5 text-sm outline-none"
                required
              />
              <textarea
                placeholder="Beschreibung (optional)"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full rounded-xl bg-dark-200 px-3 py-2.5 text-sm outline-none"
                rows={2}
              />
              <button
                type="submit"
                className="w-full rounded-xl py-2.5 text-sm text-amber-400"
                style={{ backgroundColor: `${EVENT_COLOR}20` }}
              >
                Termin hinzufügen
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
