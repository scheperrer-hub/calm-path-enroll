import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  COURSE_DEFINITIONS,
  GROUP_ROW_BACKGROUND,
  GROUP_ROW_TEXT,
  OverviewLabels,
  Registration,
  TeacherGroup,
  countPresentPerDay,
  countStudents,
  formatDayNumber,
  formatDayOfMonth,
  formatStayRange,
  formatWeekday,
  getCourseCode,
  getDaySpans,
  getFullName,
  isMonthStart,
  isWeekend,
} from '@/utils/teacherOverview';

const INFO_COLUMN_COUNT = 3;

interface TeacherOverviewTableProps {
  groups: TeacherGroup[];
  days: Date[];
  labels: OverviewLabels;
}

function GroupHeading({ group, className }: { group: TeacherGroup; className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-2 px-4 py-2 border-y', className)}
      style={{ backgroundColor: GROUP_ROW_BACKGROUND, color: GROUP_ROW_TEXT }}
    >
      <span className="font-serif text-lg">{group.name}</span>
      <span className="text-sm opacity-70">({group.registrations.length})</span>
    </div>
  );
}

/** Balken eines Aufenthalts, über die Tagesspalten gelegt. */
function StayBars({
  registration,
  days,
  labels,
  firstDayColumn,
  paddingY,
}: {
  registration: Registration;
  days: Date[];
  labels: OverviewLabels;
  firstDayColumn: number;
  paddingY: number;
}) {
  return (
    <>
      {getDaySpans(registration, days).map((span) => (
        <div
          key={span.key}
          style={{
            gridColumn: `${firstDayColumn + span.startIndex} / span ${
              span.endIndex - span.startIndex + 1
            }`,
            gridRow: 1,
            paddingTop: paddingY,
            paddingBottom: paddingY,
            paddingLeft: span.clippedStart ? 0 : 2,
            paddingRight: span.clippedEnd ? 0 : 2,
          }}
          className="z-10 flex items-center"
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
    </>
  );
}

/** Leere Tagesspalten – sie zeichnen das Kalenderraster hinter den Balken. */
function DayCells({
  days,
  firstDayColumn,
  weekendClass,
}: {
  days: Date[];
  firstDayColumn: number;
  weekendClass: string;
}) {
  return (
    <>
      {days.map((day, index) => (
        <div
          key={day.toISOString()}
          style={{ gridColumn: firstDayColumn + index, gridRow: 1 }}
          className={cn(
            'border-l',
            isMonthStart(day, index, days) && index > 0 && 'border-l-foreground/30',
            isWeekend(day) && weekendClass,
          )}
        />
      ))}
    </>
  );
}

/**
 * Kalenderansicht der Schüler je Lehrer.
 *
 * Beide Layouts zeigen dieselben Tagesspalten. Auf dem Handy stehen Zimmer,
 * Name und Kürzel über dem Kalender, damit die 16 Tage nebeneinander passen –
 * gescrollt wird dabei weder waagrecht noch senkrecht, die Seite selbst
 * übernimmt das.
 */
export function TeacherOverviewTable({ groups, days, labels }: TeacherOverviewTableProps) {
  const desktopColumns = `56px minmax(170px, 260px) 56px repeat(${days.length}, minmax(32px, 1fr))`;
  const mobileColumns = `repeat(${days.length}, minmax(0, 1fr))`;
  const presentPerDay = countPresentPerDay(groups, days);
  const total = countStudents(groups);

  const emptyState = (
    <div className="px-4 py-8 text-center text-muted-foreground">{labels.noRegistrations}</div>
  );

  return (
    <>
      {/* Handy und Tablet */}
      <div className="lg:hidden border rounded-lg overflow-hidden">
        <div
          className="grid bg-secondary border-b px-2 py-1 text-[10px] leading-tight"
          style={{ gridTemplateColumns: mobileColumns }}
        >
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col items-center',
                isWeekend(day) && 'text-foreground font-medium',
                !isWeekend(day) && 'text-muted-foreground',
              )}
            >
              <span>{formatWeekday(day, labels)}</span>
              <span className="tabular-nums">{formatDayOfMonth(day)}</span>
            </div>
          ))}
        </div>

        {groups.length === 0 && emptyState}

        {groups.map((group) => (
          <div key={group.id}>
            <GroupHeading group={group} />
            {group.registrations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground italic">
                {labels.noStudents}
              </div>
            ) : (
              group.registrations.map((registration) => (
                <div key={registration.id} className="px-2 py-2 border-b last:border-b-0">
                  <div className="flex items-baseline gap-2 px-1">
                    <span className="w-7 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {registration.room_number?.trim() || '–'}
                    </span>
                    <Link
                      to={`/app/anmeldungen/${registration.id}`}
                      className="flex-1 min-w-0 truncate text-sm font-medium hover:text-primary hover:underline"
                    >
                      {getFullName(registration)}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {getCourseCode(registration, labels) || '–'}
                    </span>
                  </div>
                  <div
                    className="grid mt-1 h-4 border-t border-b bg-card"
                    style={{ gridTemplateColumns: mobileColumns }}
                  >
                    <DayCells days={days} firstDayColumn={1} weekendClass="bg-sand-light/60" />
                    <StayBars
                      registration={registration}
                      days={days}
                      labels={labels}
                      firstDayColumn={1}
                      paddingY={3}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        ))}

        {groups.length > 0 && (
          <div className="border-t bg-secondary px-2 py-1.5">
            <p className="px-1 pb-1 text-xs font-medium">
              {labels.present} · {total}
            </p>
            <div
              className="grid text-[10px] tabular-nums"
              style={{ gridTemplateColumns: mobileColumns }}
            >
              {presentPerDay.map((count, index) => (
                <span key={days[index].toISOString()} className="text-center">
                  {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Große Bildschirme */}
      <div className="hidden lg:block border rounded-lg overflow-x-auto">
        <div
          className="grid bg-secondary border-b text-xs min-w-[794px]"
          style={{ gridTemplateColumns: desktopColumns }}
        >
          <div
            style={{ gridColumn: 1, gridRow: 1 }}
            className="flex items-center justify-center px-1 py-2 font-medium"
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
            className="flex items-center justify-center px-1 py-2 font-medium"
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
              <span className="font-medium text-[11px] tabular-nums">{formatDayNumber(day)}</span>
            </div>
          ))}
        </div>

        {groups.length === 0 && emptyState}

        {groups.map((group) => (
          <div key={group.id}>
            <GroupHeading group={group} className="min-w-[794px]" />

            {group.registrations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground italic min-w-[794px]">
                {labels.noStudents}
              </div>
            ) : (
              group.registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="grid border-b last:border-b-0 hover:bg-muted/40 transition-colors min-w-[794px]"
                  style={{ gridTemplateColumns: desktopColumns }}
                >
                  <div
                    style={{ gridColumn: 1, gridRow: 1 }}
                    className="flex items-center justify-center px-1 py-2 text-sm"
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
                    className="flex items-center justify-center px-1 py-2 text-xs text-muted-foreground"
                  >
                    {getCourseCode(registration, labels) || '–'}
                  </div>

                  <DayCells
                    days={days}
                    firstDayColumn={INFO_COLUMN_COUNT + 1}
                    weekendClass="bg-sand-light/60"
                  />
                  <StayBars
                    registration={registration}
                    days={days}
                    labels={labels}
                    firstDayColumn={INFO_COLUMN_COUNT + 1}
                    paddingY={7}
                  />
                </div>
              ))
            )}
          </div>
        ))}

        {groups.length > 0 && (
          <div
            className="grid border-t bg-secondary text-xs min-w-[794px]"
            style={{ gridTemplateColumns: desktopColumns }}
          >
            <div
              style={{ gridColumn: `1 / span ${INFO_COLUMN_COUNT}`, gridRow: 1 }}
              className="flex items-center gap-2 px-3 py-2 font-medium"
            >
              {labels.present}
              <span className="text-muted-foreground tabular-nums">{total}</span>
            </div>
            {presentPerDay.map((count, index) => (
              <div
                key={days[index].toISOString()}
                style={{ gridColumn: INFO_COLUMN_COUNT + 1 + index, gridRow: 1 }}
                className={cn(
                  'flex items-center justify-center border-l py-2 tabular-nums',
                  isWeekend(days[index]) && 'bg-sand-light',
                )}
              >
                {count}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
