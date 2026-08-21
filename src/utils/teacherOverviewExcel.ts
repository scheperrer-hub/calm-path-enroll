import writeXlsxFile, { type Row, type SheetData } from 'write-excel-file/browser';
import {
  COURSE_DEFINITIONS,
  COURSE_KEYS,
  GROUP_ROW_BACKGROUND,
  GROUP_ROW_TEXT,
  OverviewLabels,
  TeacherGroup,
  buildOverviewFileName,
  buildOverviewTitle,
  countPresentPerDay,
  countStudents,
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
const COLOR_GRID = '#D9D2C7';
const COLOR_WEEKEND_BG = '#F6F2EC';
const COLOR_MUTED_TEXT = '#6B625B';

const buildLegend = (labels: OverviewLabels) =>
  COURSE_KEYS.map((key) => `${labels.courseCodes[key]} = ${labels.courseNames[key]}`).join('   ·   ');

const buildHeaderRow = (days: Date[], labels: OverviewLabels): Row => [
  { value: labels.room, fontWeight: 'bold', align: 'center', alignVertical: 'center', wrap: true, backgroundColor: COLOR_HEADER_BG, borderColor: COLOR_GRID, borderStyle: 'thin' },
  { value: labels.name, fontWeight: 'bold', alignVertical: 'center', wrap: true, backgroundColor: COLOR_HEADER_BG, borderColor: COLOR_GRID, borderStyle: 'thin' },
  { value: labels.codeHeader, fontWeight: 'bold', align: 'center', alignVertical: 'center', wrap: true, backgroundColor: COLOR_HEADER_BG, borderColor: COLOR_GRID, borderStyle: 'thin' },
  ...days.map((day) => ({
    value: `${formatWeekday(day, labels)}\n${formatDayNumber(day)}`,
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
    backgroundColor: GROUP_ROW_BACKGROUND,
    textColor: GROUP_ROW_TEXT,
  },
  ...Array.from({ length: INFO_COLUMN_COUNT - 1 }, () => null),
  ...days.map(() => ({ backgroundColor: GROUP_ROW_BACKGROUND })),
];

const buildRegistrationRow = (
  registration: TeacherGroup['registrations'][number],
  days: Date[],
  labels: OverviewLabels,
): Row => {
  const colorByDayIndex = new Map<number, string>();

  getDaySpans(registration, days).forEach((span) => {
    for (let index = span.startIndex; index <= span.endIndex; index += 1) {
      colorByDayIndex.set(index, COURSE_DEFINITIONS[span.key].color);
    }
  });

  return [
    { value: registration.room_number?.trim() || '', align: 'center', alignVertical: 'center', borderColor: COLOR_GRID, borderStyle: 'thin' },
    { value: getFullName(registration), alignVertical: 'center', borderColor: COLOR_GRID, borderStyle: 'thin' },
    { value: getCourseCode(registration, labels), align: 'center', alignVertical: 'center', borderColor: COLOR_GRID, borderStyle: 'thin' },
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

/** Zähler der Anwesenden je Tag – die letzte Zeile unter dem Kalender. */
const buildPresentRow = (groups: TeacherGroup[], days: Date[], labels: OverviewLabels): Row => [
  {
    value: `${labels.present}: ${countStudents(groups)}`,
    fontWeight: 'bold',
    alignVertical: 'center',
    columnSpan: INFO_COLUMN_COUNT,
    backgroundColor: COLOR_HEADER_BG,
    borderColor: COLOR_GRID,
    borderStyle: 'thin',
  },
  ...Array.from({ length: INFO_COLUMN_COUNT - 1 }, () => null),
  ...countPresentPerDay(groups, days).map((count, index) => ({
    value: count,
    type: Number,
    fontWeight: 'bold' as const,
    align: 'center' as const,
    alignVertical: 'center' as const,
    backgroundColor: isWeekend(days[index]) ? COLOR_HEADER_BG_WEEKEND : COLOR_HEADER_BG,
    borderColor: COLOR_GRID,
    borderStyle: 'thin' as const,
  })),
];

export const buildTeacherOverviewSheet = (
  groups: TeacherGroup[],
  days: Date[],
  labels: OverviewLabels,
): SheetData => {
  const columnCount = INFO_COLUMN_COUNT + days.length;
  const spacer = Array.from({ length: columnCount - 1 }, () => null);

  const rows: SheetData = [
    [{ value: buildOverviewTitle(days, labels), fontWeight: 'bold', fontSize: 14, columnSpan: columnCount }, ...spacer],
    [{ value: `${labels.generatedOn}: ${formatDate(new Date(), labels)}`, fontSize: 10, textColor: COLOR_MUTED_TEXT, columnSpan: columnCount }, ...spacer],
    [{ value: buildLegend(labels), fontSize: 10, textColor: COLOR_MUTED_TEXT, columnSpan: columnCount }, ...spacer],
    [],
    buildHeaderRow(days, labels),
  ];

  groups.forEach((group) => {
    rows.push(buildGroupRow(group, days));

    if (group.registrations.length === 0) {
      rows.push([
        { value: labels.noStudents, fontStyle: 'italic', textColor: COLOR_MUTED_TEXT, columnSpan: columnCount },
        ...spacer,
      ]);
      return;
    }

    group.registrations.forEach((registration) => {
      rows.push(buildRegistrationRow(registration, days, labels));
    });
  });

  if (groups.length > 0) rows.push(buildPresentRow(groups, days, labels));

  return rows;
};

export const buildTeacherOverviewColumns = (days: Date[]) => [
  { width: 8 },
  { width: 30 },
  { width: 10 },
  ...days.map(() => ({ width: 5 })),
];

export const downloadTeacherOverviewExcel = async (
  groups: TeacherGroup[],
  days: Date[],
  labels: OverviewLabels,
) => {
  await writeXlsxFile(buildTeacherOverviewSheet(groups, days, labels), {
    sheet: labels.sheetName,
    columns: buildTeacherOverviewColumns(days),
    orientation: 'landscape',
    stickyRowsCount: 5,
    stickyColumnsCount: INFO_COLUMN_COUNT,
    showGridLines: false,
  }).toFile(buildOverviewFileName(days, 'xlsx', labels));
};
