import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

/** Wie viele Einträge geladen werden; sichtbar sind fünf, der Rest per Scrollen. */
const CHANGE_LIMIT = 50;

type ChangeEntry = {
  id: string;
  changedAt: string;
  registrationId: string;
  registrationName: string;
  authorName: string | null;
  field: string;
  oldValue: string | null;
  newValue: string | null;
};

const isDateField = (field: string) => field.startsWith('start_date') || field.startsWith('end_date');

export function TeacherOverviewChangeLog() {
  const { t } = useTranslation();

  const { data: entries, error } = useQuery({
    queryKey: ['registration-changes'],
    queryFn: async (): Promise<ChangeEntry[]> => {
      const { data: changes, error: changesError } = await supabase
        .from('registration_changes')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(CHANGE_LIMIT);
      if (changesError) throw changesError;
      if (!changes || changes.length === 0) return [];

      const registrationIds = [...new Set(changes.map((change) => change.registration_id))];
      const authorIds = [...new Set(changes.map((change) => change.changed_by).filter(Boolean))];

      const [{ data: registrations }, { data: profiles }] = await Promise.all([
        supabase.from('registrations').select('id, first_name, last_name').in('id', registrationIds),
        authorIds.length > 0
          ? supabase.from('profiles').select('user_id, display_name, email').in('user_id', authorIds)
          : Promise.resolve({ data: [] as { user_id: string; display_name: string | null; email: string | null }[] }),
      ]);

      const namesById = new Map(
        registrations?.map((r) => [r.id, `${r.first_name} ${r.last_name}`.trim()]) ?? [],
      );
      const authorsById = new Map(
        profiles?.map((p) => [p.user_id, p.display_name || p.email || null]) ?? [],
      );

      return changes.map((change) => ({
        id: change.id,
        changedAt: change.changed_at,
        registrationId: change.registration_id,
        registrationName: namesById.get(change.registration_id) ?? '—',
        authorName: change.changed_by ? authorsById.get(change.changed_by) ?? null : null,
        field: change.field,
        oldValue: change.old_value,
        newValue: change.new_value,
      }));
    },
    retry: false,
  });

  const formatValue = (field: string, value: string | null): string => {
    if (!value) return '–';
    if (isDateField(field)) {
      try {
        return format(parseISO(value), 'dd.MM.yyyy');
      } catch {
        return value;
      }
    }
    if (field === 'status') return t(`admin.status.${value.replace('_', '')}`);
    return value;
  };

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 font-serif text-xl text-foreground mb-3">
        <History className="w-4 h-4" />
        {t('admin.teacherOverview.changeLog.title')}
      </h2>

      <div className="border rounded-lg">
        {error ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            {t('admin.teacherOverview.changeLog.unavailable')}
          </p>
        ) : !entries || entries.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            {t('admin.teacherOverview.changeLog.empty')}
          </p>
        ) : (
          // Rund fünf Einträge sichtbar, der Rest per Scrollen.
          <ul className="max-h-64 overflow-y-auto divide-y">
            {entries.map((entry) => (
              <li key={entry.id} className="px-4 py-2.5 text-sm">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {format(parseISO(entry.changedAt), 'dd.MM.yyyy HH:mm')}
                  </span>
                  <Link
                    to={`/app/anmeldungen/${entry.registrationId}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {entry.registrationName}
                  </Link>
                  {entry.authorName && (
                    <span className="text-xs text-muted-foreground">
                      {t('admin.teacherOverview.changeLog.by')} {entry.authorName}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {t(`admin.teacherOverview.field.${entry.field}`, { defaultValue: entry.field })}:{' '}
                  <span className="line-through">{formatValue(entry.field, entry.oldValue)}</span>
                  {' → '}
                  <span className="text-foreground">{formatValue(entry.field, entry.newValue)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
