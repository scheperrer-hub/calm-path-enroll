/**
 * Feste Lehrerliste des Kurses.
 *
 * Die Lehrer sind bewusst keine Benutzerkonten im CRM – sie loggen sich nicht
 * ein, sie werden nur zugeordnet. Diese Reihenfolge bestimmt zugleich die
 * Reihenfolge der Gruppen in der Übersicht und in beiden Exporten.
 *
 * Kommt ein Lehrer dazu, reicht ein Eintrag in dieser Liste – sonst muss
 * nichts angepasst werden.
 */
export const TEACHERS = ['Phra Manfred', 'Mohammed', 'Hannah'] as const;

export type TeacherName = (typeof TEACHERS)[number];

export const isKnownTeacher = (value: string | null | undefined): value is TeacherName =>
  typeof value === 'string' && (TEACHERS as readonly string[]).includes(value);
