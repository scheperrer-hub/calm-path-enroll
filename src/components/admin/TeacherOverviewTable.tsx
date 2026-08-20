import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  COURSE_DEFINITIONS,
  GROUP_ROW_BACKGROUND,
  GROUP_ROW_TEXT,
  OverviewLabels,
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
  labels: OverviewLabels;
}

/**
 * Kalenderansicht der Schüler je Lehrer. Die Tage bilden ein CSS-Grid, in dem
 * jeder Aufenthalt als durchgehender Balken über die betroffenen Spalten liegt.
 */
export function TeacherOverviewTable({ groups, days, labels }: TeacherOverviewTableProps) {
  const gridTemplateColumns = `72px minmax(200px, 1fr) 72px repeat(${days.length}, minmax(30px, 1fr))`;

  return (
    <div className="border rounded-lg overflow-auto max-h-none lg:max-h-[calc(100vh-20rem)]">
      <div className="min-w-[900px]">
        <div
          className="grid sticky top-0 z-20 bg-secondary border-b text-xs"
          style={{ gridTemplateColumns }}
        >
          <div
            style={{ gridColumn: 1, gridRow: 1 }}
            className="flex items-center justify-center px-2 py-2 font-medium"
          >
            {labels.room}
          </div>
          <div
            style={{ gridColumn: 2, gridRow: 1 }}
            className="flex items-center px-3 py-2 font-medium"
          >
            {labels.name}
          </div>
          <div
            style={{ gridColumn: 3, gridRow: 1 }}
            className="flex items-center justify-center px-2 py-2 font-medium"
          >
            {labels.codeHeader}
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
              <span className="text-muted-foreground">{formatWeekday(day, labels)}</span>
              <span className="font-medium">{formatDayNumber(day)}</span>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            {labels.noRegistrations}
          </div>
        )}

        {groups.map((group) => (
          <div key={group.id}>
            <div
              className="flex items-center gap-2 px-4 py-2 border-y"
              style={{ backgroundColor: GROUP_ROW_BACKGROUND, color: GROUP_ROW_TEXT }}
            >
              <span className="font-serif text-lg">{group.name}</span>
              <span className="text-sm opacity-70">({group.registrations.length})</span>
            </div>

            {group.registrations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground italic">
                {labels.noStudents}
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
                    {getCourseCode(registration, labels) || '–'}
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
                      title={`${labels.courseNames[span.key]}: ${formatStayRange(span, labels)}`}
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
