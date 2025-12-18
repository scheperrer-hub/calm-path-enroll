export interface RegistrationFormData {
  // Step 1 - Person
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  // Step 2 - Address
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;

  // Step 3 - Experience
  vipBasicWhen: string;
  vipBasicWhere: string;
  vipBasicTeacher: string;
  otherExperience: string;
  reportLanguage: 'de' | 'en';

  // Step 4 - Course
  courseTypes: ('basic_course' | 'retreat' | 'few_days')[];
  startDateBasic: string;
  endDateBasic: string;
  startDateRetreat: string;
  endDateRetreat: string;
  startDateFew: string;
  endDateFew: string;
  additionalInfo: string;
  roomNumber: string;
  registrationDate: string;

  // Step 5 - Consent
  privacyConsent: boolean;
}

export const initialFormData: RegistrationFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  street: '',
  houseNumber: '',
  zipCode: '',
  city: '',
  country: '',
  vipBasicWhen: '',
  vipBasicWhere: '',
  vipBasicTeacher: '',
  otherExperience: '',
  reportLanguage: 'de',
  courseTypes: [],
  startDateBasic: '',
  endDateBasic: '',
  startDateRetreat: '',
  endDateRetreat: '',
  startDateFew: '',
  endDateFew: '',
  additionalInfo: '',
  roomNumber: '',
  registrationDate: new Date().toISOString().split('T')[0],
  privacyConsent: false,
};
