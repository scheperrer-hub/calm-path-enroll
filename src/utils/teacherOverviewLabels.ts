import { de, enUS } from 'date-fns/locale';
import type { TFunction } from 'i18next';
import { COURSE_KEYS, CourseKey, OverviewLabels } from './teacherOverview';

const byCourse = (t: TFunction, group: string): Record<CourseKey, string> =>
  COURSE_KEYS.reduce(
    (result, key) => ({ ...result, [key]: t(`admin.teacherOverview.${group}.${key}`) }),
    {} as Record<CourseKey, string>,
  );

/**
 * Sammelt alle sprachabhängigen Texte der Übersicht an einer Stelle, damit die
 * Exporte in derselben Sprache erscheinen wie die Oberfläche.
 */
export const buildOverviewLabels = (t: TFunction, language: string): OverviewLabels => {
  const isGerman = language.startsWith('de');
  const courseCodes = byCourse(t, 'code');

  return {
    title: t('admin.teacherOverview.exportTitle'),
    generatedOn: t('admin.teacherOverview.generatedOn'),
    room: t('admin.teacherOverview.room'),
    name: t('admin.teacherOverview.name'),
    codeHeader: COURSE_KEYS.map((key) => courseCodes[key]).join('/'),
    unassigned: t('admin.teacherOverview.unassigned'),
    noStudents: t('admin.teacherOverview.noStudents'),
    noRegistrations: t('admin.teacherOverview.noRegistrations'),
    page: t('admin.teacherOverview.page'),
    sheetName: t('admin.teacherOverview.sheetName'),
    fileBaseName: t('admin.teacherOverview.fileBaseName'),
    courseNames: byCourse(t, 'course'),
    courseCodes,
    present: t('admin.teacherOverview.present'),
    dateLocale: isGerman ? de : enUS,
    // Im Englischen mit Monatsnamen, damit 19.8. nicht als 8. Tag gelesen wird.
    dateFormat: isGerman ? 'dd.MM.yyyy' : 'd MMM yyyy',
  };
};
