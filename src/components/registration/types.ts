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

// Date constraints for the retreat 2026
export const COURSE_DATE_MIN = '2026-08-18';
export const COURSE_DATE_MAX = '2026-09-03';
