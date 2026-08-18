import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tables } from '@/integrations/supabase/types';
import { TEACHERS } from './teachers';

export type Registration = Tables<'registrations'>;

/** Kalender-Zeitraum der Übersicht, beide Tage inklusive. */
export const OVERVIEW_START = '2026-08-19';
export const OVERVIEW_END = '2026-09-03';

export type CourseKey = 'basic' | 'retreat' | 'few';

type CourseDefinition = {
  /** Kürzel in der Spalte "GK/R/T". */
  code: string;
  label: string;
  /** Balkenfarbe – identisch in Web, Excel und PDF. */
  color: string;
  flag: keyof Registration;
  startField: keyof Registration;
  endField: keyof Registration;
};

export const COURSE_KEYS: CourseKey[] = ['basic', 'retreat', 'few'];

export const COURSE_DEFINITIONS: Record<CourseKey, CourseDefinition> = {
  basic: {
    code: 'GK',
    label: 'Grundkurs',
    color: '#AD1F2B',
    flag: 'course_basic',
    startField: 'start_date_basic',
    endField: 'end_date_basic',
  },
  retreat: {
    code: 'R',
    label: 'Retreat',
    color: '#D99726',
    flag: 'course_retreat',
    startField: 'start_date_retreat',
    endField: 'end_date_retreat',
  },
  few: {
    code: 'T',
    label: 'Tage',
    color: '#5B7C6F',
    flag: 'course_few_days',
    startField: 'start_date_few',
    endField: 'end_date_few',
  },
};

export const UNASSIGNED_GROUP_ID = 'unassigned';
export const UNASSIGNED_GROUP_LABEL = 'Nicht zugewiesen';

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value) return null;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Alle Tage des Zeitraums als Liste. */
export const getOverviewDays = (start = OVERVIEW_START, end = OVERVIEW_END): Date[] => {
  const first = parseDate(start);
  const last = parseDate(end);
  if (!first || !last) return [];

  const count = differenceInCalendarDays(last, first) + 1;
  return Array.from({ length: Math.max(count, 0) }, (_, index) => addDays(first, index));
};

/**
 * Gebuchte Kursarten. Sind keine Kurs-Häkchen gesetzt (Altdaten oder manuell
 * bearbeitete Anmeldungen), wird auf vorhandene Kursdaten zurückgefallen.
 */
export const getCourseKeys = (registration: Registration): CourseKey[] => {
  const flagged = COURSE_KEYS.filter((key) => registration[COURSE_DEFINITIONS[key].flag] === true);
  if (flagged.length > 0) return flagged;

  return COURSE_KEYS.filter((key) => parseDate(registration[COURSE_DEFINITIONS[key].startField]) !== null);
};

/** Kürzel für die Spalte "GK/R/T", z. B. "GK" oder "GK/R". */
export const getCourseCode = (registration: Registration): string =>
  getCourseKeys(registration)
    .map((key) => COURSE_DEFINITIONS[key].code)
    .join('/');

export type StaySegment = {
  key: CourseKey;
  start: Date;
  end: Date;
};

/** Aufenthalt je gebuchter Kursart. */
export const getStaySegments = (registration: Registration): StaySegment[] =>
  getCourseKeys(registration).flatMap((key) => {
    const definition = COURSE_DEFINITIONS[key];
    const start = parseDate(registration[definition.startField]);
    if (!start) return [];

    const end = parseDate(registration[definition.endField]) ?? start;
    return [{ key, start, end: end < start ? start : end }];
  });

export type DaySpan = StaySegment & {
  /** Nullbasierter Index des ersten Tags im Zeitraum. */
  startIndex: number;
  /** Nullbasierter Index des letzten Tags im Zeitraum (inklusive). */
  endIndex: number;
  /** Aufenthalt beginnt vor dem Zeitraum. */
  clippedStart: boolean;
  /** Aufenthalt endet nach dem Zeitraum. */
  clippedEnd: boolean;
};

/** Aufenthalte auf die Tagesspalten des Zeitraums abbilden. */
export const getDaySpans = (registration: Registration, days: Date[]): DaySpan[] => {
  if (days.length === 0) return [];

  const first = days[0];
  const last = days[days.length - 1];

  return getStaySegments(registration).flatMap((segment) => {
    if (segment.end < first || segment.start > last) return [];

    return [
      {
        ...segment,
        startIndex: Math.max(0, differenceInCalendarDays(segment.start, first)),
        endIndex: Math.min(days.length - 1, differenceInCalendarDays(segment.end, first)),
        clippedStart: segment.start < first,
        clippedEnd: segment.end > last,
      },
    ];
  });
};

/** Gesamter Aufenthalt über alle Kursarten hinweg. */
export const getStayRange = (registration: Registration): StaySegment | null => {
  const segments = getStaySegments(registration);
  if (segments.length === 0) return null;

  return segments.reduce((range, segment) => ({
    key: range.key,
    start: segment.start < range.start ? segment.start : range.start,
    end: segment.end > range.end ? segment.end : range.end,
  }));
};

export type TeacherGroup = {
  id: string;
  name: string;
  registrations: Registration[];
};

const compareRegistrations = (a: Registration, b: Registration): number => {
  const roomA = a.room_number?.trim() ?? '';
  const roomB = b.room_number?.trim() ?? '';

  // Anmeldungen ohne Zimmernummer ans Ende der Gruppe.
  if (roomA && !roomB) return -1;
  if (!roomA && roomB) return 1;
  if (roomA && roomB && roomA !== roomB) {
    return roomA.localeCompare(roomB, 'de', { numeric: true });
  }

  return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`, 'de');
};

/**
 * Anmeldungen nach zugeordnetem Lehrer gruppieren – in der Reihenfolge von
 * TEACHERS, danach eventuelle Alt-Zuordnungen mit unbekanntem Namen, zuletzt
 * die nicht zugewiesenen Anmeldungen.
 */
export const groupByTeacher = (registrations: Registration[]): TeacherGroup[] => {
  const groups: TeacherGroup[] = TEACHERS.map((name) => ({ id: name, name, registrations: [] }));
  const groupsByName = new Map(groups.map((group) => [group.name, group]));
  const unassigned: TeacherGroup = {
    id: UNASSIGNED_GROUP_ID,
    name: UNASSIGNED_GROUP_LABEL,
    registrations: [],
  };
  // Namen, die nicht mehr in TEACHERS stehen, bekommen eine eigene Gruppe,
  // damit keine Anmeldung unbemerkt unter "Nicht zugewiesen" verschwindet.
  const unknown: TeacherGroup[] = [];

  registrations.forEach((registration) => {
    const name = registration.assigned_teacher?.trim();
    if (!name) {
      unassigned.registrations.push(registration);
      return;
    }

    let group = groupsByName.get(name);
    if (!group) {
      group = { id: name, name, registrations: [] };
      groupsByName.set(name, group);
      unknown.push(group);
    }
    group.registrations.push(registration);
  });

  const all = [...groups, ...unknown, ...(unassigned.registrations.length > 0 ? [unassigned] : [])];
  all.forEach((group) => group.registrations.sort(compareRegistrations));

  return all;
};

export const getFullName = (registration: Registration): string =>
  `${registration.first_name} ${registration.last_name}`.trim();

export const isWeekend = (day: Date): boolean => day.getDay() === 0 || day.getDay() === 6;

export const formatDayNumber = (day: Date): string => format(day, 'd.M.');

export const formatWeekday = (day: Date): string => format(day, 'EEEEEE', { locale: de });

export const formatDate = (day: Date): string => format(day, 'dd.MM.yyyy');

export const formatStayRange = (segment: StaySegment): string =>
  `${formatDate(segment.start)} – ${formatDate(segment.end)}`;

export const buildOverviewTitle = (days: Date[]): string => {
  if (days.length === 0) return 'Schüler-Übersicht nach Lehrer';
  return `Schüler-Übersicht nach Lehrer ${formatDate(days[0])} – ${formatDate(days[days.length - 1])}`;
};

export const buildOverviewFileName = (days: Date[], extension: string): string => {
  if (days.length === 0) return `lehrer-uebersicht.${extension}`;
  const from = format(days[0], 'yyyy-MM-dd');
  const to = format(days[days.length - 1], 'yyyy-MM-dd');
  return `lehrer-uebersicht-${from}_${to}.${extension}`;
};
