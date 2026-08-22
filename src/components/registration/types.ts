export interface RegistrationFormData {
  // Step 1 - Person
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountry: string;
  phoneE164: string;
  email: string;
  birthYear: string;
  gender: 'male' | 'female' | '';

  // Step 2 - Address
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
  addressValidated: boolean;

  // Step 3 - Experience
  hasBasicCourse: boolean;
  vipBasicWhen: string;
  vipBasicWhere: string;
  vipBasicTeacher: string;
  basicCourseDays: string;
  otherExperience: string;
  motherTongue: 'de' | 'en' | 'fr';
  reportLanguage: 'de' | 'en' | 'fr' | '';
  secondLanguage: 'de' | 'en' | 'fr' | '';
  impairments: string;

  // Step 4 - Course (single select now)
  courseType: 'basic_course' | 'retreat' | 'few_days' | '';
  startDateBasic: string;
  endDateBasic: string;
  startDateRetreat: string;
  endDateRetreat: string;
  startDateFew: string;
  endDateFew: string;
  additionalInfo: string;

  // Step 5 - Consent
  privacyConsent: boolean;
}

export const initialFormData: RegistrationFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  phoneCountry: 'DE',
  phoneE164: '',
  email: '',
  birthYear: '',
  gender: '',
  street: '',
  houseNumber: '',
  zipCode: '',
  city: '',
  country: '',
  addressValidated: false,
  hasBasicCourse: false,
  vipBasicWhen: '',
  vipBasicWhere: '',
  vipBasicTeacher: '',
  basicCourseDays: '',
  otherExperience: '',
  motherTongue: 'de',
  reportLanguage: '',
  secondLanguage: '',
  impairments: '',
  courseType: '',
  startDateBasic: '',
  endDateBasic: '',
  startDateRetreat: '',
  endDateRetreat: '',
  startDateFew: '',
  endDateFew: '',
  additionalInfo: '',
  privacyConsent: false,
};

/**
 * Kurszeitraum für Schüler. Lehrer und Helfer reisen bereits am 18.8. an,
 * für Anmeldungen zählt aber erst der 19.8.
 */
export const COURSE_DATE_MIN = '2026-08-19';
export const COURSE_DATE_MAX = '2026-09-03';

/**
 * Regeldauer des Retreats ab dem gewählten Anreisetag. Einen festen
 * Anreisetag gibt es nicht – der Schüler wählt ihn selbst und kann die
 * Dauer anschließend verkürzen.
 */
export const RETREAT_DURATION_DAYS = 13;

/** Nächte der Regeldauer – An- und Abreisetag zählen als ein Tag mehr. */
export const RETREAT_DURATION_NIGHTS = RETREAT_DURATION_DAYS - 1;

/**
 * Liegt ein Datum im Kurszeitraum? ISO-Daten (YYYY-MM-DD) lassen sich direkt
 * als Zeichenkette vergleichen. Nötig, weil die min/max-Attribute am
 * Datumsfeld nur ein Hinweis sind und mobil nicht durchgesetzt werden.
 */
export const isWithinCourseRange = (isoDate: string): boolean =>
  Boolean(isoDate) && isoDate >= COURSE_DATE_MIN && isoDate <= COURSE_DATE_MAX;
