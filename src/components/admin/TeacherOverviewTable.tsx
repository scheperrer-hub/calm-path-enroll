import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  COURSE_DEFINITIONS,
  TeacherGroup,
  formatDayNumber,
  formatStayRange,
  formatWeekday,
  getCourseCode,
  getDaySpans,
  getFullName,
  isWeekend,
} from '@/utils/teacherOverview';

const INFO_COLUMN_COUNT = 3;

interface TeacherOverviewTableProps {
  groups: TeacherGroup[];
  days: Date[];
}

/**
 * Kalenderansicht der Schüler je Lehrer. Die Tage bilden ein CSS-Grid, in dem
 * jeder Aufenthalt als durchgehender Balken über die betroffenen Spalten liegt.
 */
export function TeacherOverviewTable({ groups, days }: TeacherOverviewTableProps) {
  const { t } = useTranslation();
  const gridTemplateColumns = `72px minmax(200px, 1fr) 72px repeat(${days.length}, minmax(30px, 1fr))`;

  return (
    <div className="border rounded-lg overflow-auto max-h-[calc(100vh-20rem)]">
      <div className="min-w-[900px]">
        <div
          className="grid sticky top-0 z-20 bg-secondary border-b text-xs"
          style={{ gridTemplateColumns }}
        >
          <div
            style={{ gridColumn: 1, gridRow: 1 }}
            className="flex items-center justify-center px-2 py-2 font-medium"
          >
            {t('admin.teacherOverview.room')}
          </div>
          <div
            style={{ gridColumn: 2, gridRow: 1 }}
            className="flex items-center px-3 py-2 font-medium"
          >
            {t('admin.teacherOverview.name')}
          </div>
          <div
            style={{ gridColumn: 3, gridRow: 1 }}
            className="flex items-center justify-center px-2 py-2 font-medium"
          >
            GK/R/T
          </div>
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              style={{ gridColumn: INFO_COLUMN_COUNT + 1 + index, gridRow: 1 }}
              className={cn(
                'flex flex-col items-center justify-center py-1 border-l',
                isWeekend(day) && 'bg-sand-light',
              )}
            >
              <span className="text-muted-foreground">{formatWeekday(day)}</span>
              <span className="font-medium">{formatDayNumber(day)}</span>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            {t('admin.teacherOverview.noRegistrations')}
          </div>
        )}

        {groups.map((group) => (
          <div key={group.id}>
            <div className="flex items-center gap-2 bg-charcoal text-cream px-4 py-2">
              <span className="font-serif text-lg">{group.name}</span>
              <span className="text-cream/60 text-sm">({group.registrations.length})</span>
            </div>

            {group.registrations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground italic">
                {t('admin.teacherOverview.noStudents')}
              </div>
            ) : (
              group.registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="grid border-b last:border-b-0 hover:bg-muted/40 transition-colors"
                  style={{ gridTemplateColumns }}
                >
                  <div
                    style={{ gridColumn: 1, gridRow: 1 }}
                    className="flex items-center justify-center px-2 py-2 text-sm"
                  >
                    {registration.room_number?.trim() || '–'}
                  </div>
                  <div
                    style={{ gridColumn: 2, gridRow: 1 }}
                    className="flex items-center px-3 py-2 min-w-0"
                  >
                    <Link
                      to={`/app/anmeldungen/${registration.id}`}
                      className="text-sm font-medium hover:text-primary hover:underline truncate"
                    >
                      {getFullName(registration)}
                    </Link>
                  </div>
                  <div
                    style={{ gridColumn: 3, gridRow: 1 }}
                    className="flex items-center justify-center px-2 py-2 text-sm text-muted-foreground"
                  >
                    {getCourseCode(registration) || '–'}
                  </div>

                  {days.map((day, index) => (
                    <div
                      key={day.toISOString()}
                      style={{ gridColumn: INFO_COLUMN_COUNT + 1 + index, gridRow: 1 }}
                      className={cn('border-l', isWeekend(day) && 'bg-sand-light/60')}
                    />
                  ))}

                  {getDaySpans(registration, days).map((span) => (
                    <div
                      key={span.key}
                      style={{
                        gridColumn: `${INFO_COLUMN_COUNT + 1 + span.startIndex} / span ${
                          span.endIndex - span.startIndex + 1
                        }`,
                        gridRow: 1,
                        paddingLeft: span.clippedStart ? 0 : 2,
                        paddingRight: span.clippedEnd ? 0 : 2,
                      }}
                      className="z-10 flex items-center py-[7px]"
                      title={`${COURSE_DEFINITIONS[span.key].label}: ${formatStayRange(span)}`}
                    >
                      <span
                        className={cn(
                          'h-full w-full',
                          span.clippedStart ? 'rounded-l-none' : 'rounded-l-full',
                          span.clippedEnd ? 'rounded-r-none' : 'rounded-r-full',
                        )}
                        style={{ backgroundColor: COURSE_DEFINITIONS[span.key].color }}
                      />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
