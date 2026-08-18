import writeXlsxFile, { type Row, type SheetData } from 'write-excel-file/browser';
import {
  COURSE_DEFINITIONS,
  COURSE_KEYS,
  TeacherGroup,
  buildOverviewFileName,
  buildOverviewTitle,
  formatDate,
  formatDayNumber,
  formatWeekday,
  getCourseCode,
  getDaySpans,
  getFullName,
  isWeekend,
} from './teacherOverview';

const INFO_COLUMN_COUNT = 3;

const COLOR_HEADER_BG = '#F2EAE0';
const COLOR_HEADER_BG_WEEKEND = '#E7DBCB';
const COLOR_GROUP_BG = '#3A3330';
const COLOR_GROUP_TEXT = '#FFFFFF';
const COLOR_GRID = '#D9D2C7';
const COLOR_WEEKEND_BG = '#F6F2EC';
const COLOR_MUTED_TEXT = '#6B625B';

const legendText = COURSE_KEYS.map((key) => {
  const definition = COURSE_DEFINITIONS[key];
  return `${definition.code} = ${definition.label}`;
}).join('   ·   ');

const buildHeaderRow = (days: Date[]): Row => [
  { value: 'Zi.Nr.', fontWeight: 'bold', align: 'center', alignVertical: 'center', wrap: true, backgroundColor: COLOR_HEADER_BG, borderColor: COLOR_GRID, borderStyle: 'thin' },
  { value: 'Vorname Nachname', fontWeight: 'bold', alignVertical: 'center', wrap: true, backgroundColor: COLOR_HEADER_BG, borderColor: COLOR_GRID, borderStyle: 'thin' },
  { value: 'GK/R/T', fontWeight: 'bold', align: 'center', alignVertical: 'center', wrap: true, backgroundColor: COLOR_HEADER_BG, borderColor: COLOR_GRID, borderStyle: 'thin' },
  ...days.map((day) => ({
    value: `${formatWeekday(day)}\n${formatDayNumber(day)}`,
    fontWeight: 'bold' as const,
    fontSize: 9,
    align: 'center' as const,
    alignVertical: 'center' as const,
    wrap: true,
    backgroundColor: isWeekend(day) ? COLOR_HEADER_BG_WEEKEND : COLOR_HEADER_BG,
    borderColor: COLOR_GRID,
    borderStyle: 'thin' as const,
  })),
];

const buildGroupRow = (group: TeacherGroup, days: Date[]): Row => [
  {
    value: `${group.name} (${group.registrations.length})`,
    fontWeight: 'bold',
    fontSize: 12,
    alignVertical: 'center',
    columnSpan: INFO_COLUMN_COUNT,
    backgroundColor: COLOR_GROUP_BG,
    textColor: COLOR_GROUP_TEXT,
  },
  ...Array.from({ length: INFO_COLUMN_COUNT - 1 }, () => null),
  ...days.map(() => ({ backgroundColor: COLOR_GROUP_BG })),
];

const buildRegistrationRow = (
  registration: TeacherGroup['registrations'][number],
  days: Date[],
): Row => {
  const spans = getDaySpans(registration, days);
  const colorByDayIndex = new Map<number, string>();

  spans.forEach((span) => {
    for (let index = span.startIndex; index <= span.endIndex; index += 1) {
      colorByDayIndex.set(index, COURSE_DEFINITIONS[span.key].color);
    }
  });

  return [
    { value: registration.room_number?.trim() || '', align: 'center', alignVertical: 'center', borderColor: COLOR_GRID, borderStyle: 'thin' },
    { value: getFullName(registration), alignVertical: 'center', borderColor: COLOR_GRID, borderStyle: 'thin' },
    { value: getCourseCode(registration), align: 'center', alignVertical: 'center', borderColor: COLOR_GRID, borderStyle: 'thin' },
    ...days.map((day, index) => {
      const color = colorByDayIndex.get(index);
      if (color) {
        // Gleiche Rahmen- und Füllfarbe, damit die Tage als durchgehender Balken erscheinen.
        return { backgroundColor: color, borderColor: color, borderStyle: 'thin' as const };
      }
      return {
        backgroundColor: isWeekend(day) ? COLOR_WEEKEND_BG : undefined,
        borderColor: COLOR_GRID,
        borderStyle: 'thin' as const,
      };
    }),
  ];
};

export const buildTeacherOverviewSheet = (groups: TeacherGroup[], days: Date[]): SheetData => {
  const columnCount = INFO_COLUMN_COUNT + days.length;
  const spacer = Array.from({ length: columnCount - 1 }, () => null);

  const rows: SheetData = [
    [{ value: buildOverviewTitle(days), fontWeight: 'bold', fontSize: 14, columnSpan: columnCount }, ...spacer],
    [{ value: `Stand: ${formatDate(new Date())}`, fontSize: 10, textColor: COLOR_MUTED_TEXT, columnSpan: columnCount }, ...spacer],
    [{ value: legendText, fontSize: 10, textColor: COLOR_MUTED_TEXT, columnSpan: columnCount }, ...spacer],
    [],
    buildHeaderRow(days),
  ];

  groups.forEach((group) => {
    rows.push(buildGroupRow(group, days));

    if (group.registrations.length === 0) {
      rows.push([
        { value: 'Keine Schüler zugeordnet', fontStyle: 'italic', textColor: COLOR_MUTED_TEXT, columnSpan: columnCount },
        ...spacer,
      ]);
      return;
    }

    group.registrations.forEach((registration) => {
      rows.push(buildRegistrationRow(registration, days));
    });
  });

  return rows;
};

export const buildTeacherOverviewColumns = (days: Date[]) => [
  { width: 8 },
  { width: 30 },
  { width: 10 },
  ...days.map(() => ({ width: 5 })),
];

export const downloadTeacherOverviewExcel = async (groups: TeacherGroup[], days: Date[]) => {
  await writeXlsxFile(buildTeacherOverviewSheet(groups, days), {
    sheet: 'Lehrer-Übersicht',
    columns: buildTeacherOverviewColumns(days),
    orientation: 'landscape',
    stickyRowsCount: 5,
    stickyColumnsCount: INFO_COLUMN_COUNT,
    showGridLines: false,
  }).toFile(buildOverviewFileName(days, 'xlsx'));
};
