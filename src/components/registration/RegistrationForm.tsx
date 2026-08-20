import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormStepper } from './FormStepper';
import { Step1Person } from './Step1Person';
import { AddressAutocomplete } from './AddressAutocomplete';
import { Step3Experience } from './Step3Experience';
import { Step4Course } from './Step4Course';
import { Step5Review } from './Step5Review';
import {
  RegistrationFormData,
  initialFormData,
  COURSE_DATE_MIN,
  COURSE_DATE_MAX,
  isWithinCourseRange,
} from './types';
import { ArrowLeft, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { parseDraft, serializeDraft } from './draft';

const WEBHOOK_URL = 'https://hook.eu2.make.com/rqeqqhh7jo48n96fq5p42zshvnax2fku';

const STORAGE_KEY = 'vipassana-registration-draft';

const formatCourseDate = (isoDate: string) => isoDate.split('-').reverse().join('.');

export function RegistrationForm() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const draft = parseDraft(localStorage.getItem(STORAGE_KEY));

    if (!draft) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Mit den Startwerten mischen, damit neue Felder gesetzt sind.
    setFormData({ ...initialFormData, ...draft });
  }, []);

  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem(STORAGE_KEY, serializeDraft(formData));
    }
  }, [formData, isSubmitted]);

  const updateData = (updates: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = t('registration.validation.required');
      if (!formData.lastName.trim()) newErrors.lastName = t('registration.validation.required');
      if (!formData.gender) newErrors.gender = t('registration.validation.required');
      
      // Birth year validation
      if (!formData.birthYear.trim()) {
        newErrors.birthYear = t('registration.validation.required');
      } else {
        const year = parseInt(formData.birthYear);
        if (isNaN(year) || year < 1900 || year > currentYear) {
          newErrors.birthYear = t('registration.validation.invalidBirthYear');
        }
      }
      
      // Phone validation with libphonenumber
      if (!formData.phone.trim()) {
        newErrors.phone = t('registration.validation.required');
      } else if (!formData.phoneE164 || !isValidPhoneNumber(formData.phoneE164)) {
        newErrors.phone = t('registration.validation.invalidPhone');
      }
      
      if (!formData.email.trim()) newErrors.email = t('registration.validation.required');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('registration.validation.invalidEmail');
    } else if (step === 1) {
      if (!formData.street.trim()) newErrors.street = t('registration.validation.required');
      if (!formData.houseNumber.trim()) newErrors.houseNumber = t('registration.validation.required');
      if (!formData.zipCode.trim()) newErrors.zipCode = t('registration.validation.required');
      if (!formData.city.trim()) newErrors.city = t('registration.validation.required');
      if (!formData.country.trim()) newErrors.country = t('registration.validation.required');
    } else if (step === 2) {
      // Validate experience fields if hasBasicCourse is checked
      if (formData.hasBasicCourse) {
        if (!formData.vipBasicWhen.trim()) newErrors.vipBasicWhen = t('registration.validation.required');
        if (!formData.vipBasicWhere.trim()) newErrors.vipBasicWhere = t('registration.validation.required');
        if (!formData.vipBasicTeacher.trim()) newErrors.vipBasicTeacher = t('registration.validation.required');
        if (!formData.basicCourseDays.trim()) newErrors.basicCourseDays = t('registration.validation.required');
      }
    } else if (step === 3) {
      if (!formData.courseType) newErrors.courseType = t('registration.validation.selectCourse');

      // Die min/max-Attribute am Datumsfeld sind nur ein Hinweis und werden
      // besonders auf Mobilgeräten nicht durchgesetzt – deshalb hier prüfen.
      const rangeMessage = t('registration.validation.dateOutOfRange', {
        from: formatCourseDate(COURSE_DATE_MIN),
        to: formatCourseDate(COURSE_DATE_MAX),
      });

      const checkCourseDates = (startField: string, endField: string) => {
        const start = formData[startField as keyof RegistrationFormData] as string;
        const end = formData[endField as keyof RegistrationFormData] as string;

        if (!start) {
          newErrors[startField] = t('registration.validation.startDateRequired');
        } else if (!isWithinCourseRange(start)) {
          newErrors[startField] = rangeMessage;
        }

        if (!end) {
          newErrors[endField] = t('registration.validation.endDateRequired');
        } else if (!isWithinCourseRange(end)) {
          newErrors[endField] = rangeMessage;
        } else if (start && end < start) {
          newErrors[endField] = t('registration.validation.endDateAfterStart');
        }
      };

      if (formData.courseType === 'basic_course') checkCourseDates('startDateBasic', 'endDateBasic');
      if (formData.courseType === 'retreat') checkCourseDates('startDateRetreat', 'endDateRetreat');
      if (formData.courseType === 'few_days') checkCourseDates('startDateFew', 'endDateFew');
    } else if (step === 4) {
      if (!formData.privacyConsent) newErrors.privacyConsent = t('registration.validation.privacyRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    const submissionTimestamp = new Date().toISOString();

    try {
      const { error } = await supabase.from('registrations').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        phone_country: formData.phoneCountry,
        phone_e164: formData.phoneE164,
        birth_year: formData.birthYear ? parseInt(formData.birthYear) : null,
        email: formData.email,
        address_street: formData.street,
        address_house_number: formData.houseNumber,
        address_zip: formData.zipCode,
        address_city: formData.city,
        address_country: formData.country,
        address_validated: formData.addressValidated,
        has_basic_course: formData.hasBasicCourse,
        vip_basic_when: formData.hasBasicCourse ? formData.vipBasicWhen : null,
        vip_basic_where: formData.hasBasicCourse ? formData.vipBasicWhere : null,
        vip_basic_teacher: formData.hasBasicCourse ? formData.vipBasicTeacher : null,
        basic_course_days: formData.hasBasicCourse && formData.basicCourseDays ? parseInt(formData.basicCourseDays) : null,
        vip_other_experience: formData.otherExperience || null,
        mother_tongue: formData.motherTongue,
        report_language: formData.motherTongue,
        second_language: formData.secondLanguage || null,
        impairments: formData.impairments || null,
        gender: formData.gender || null,
        course_basic: formData.courseType === 'basic_course',
        course_retreat: formData.courseType === 'retreat',
        course_few_days: formData.courseType === 'few_days',
        start_date_basic: formData.startDateBasic || null,
        end_date_basic: formData.endDateBasic || null,
        start_date_retreat: formData.startDateRetreat || null,
        end_date_retreat: formData.endDateRetreat || null,
        start_date_few: formData.startDateFew || null,
        end_date_few: formData.endDateFew || null,
        additional_info: formData.additionalInfo || null,
        consent_privacy: formData.privacyConsent,
        consent_timestamp: submissionTimestamp,
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error(t('common.error'));
        return;
      }

      // Send structured webhook payload as form-urlencoded for Make.com
      try {
        const webhookData = new URLSearchParams();
        
        // Personal info
        webhookData.append('firstName', formData.firstName);
        webhookData.append('lastName', formData.lastName);
        webhookData.append('email', formData.email);
        webhookData.append('phoneCountry', formData.phoneCountry);
        webhookData.append('phoneE164', formData.phoneE164);
        webhookData.append('phoneNational', formData.phone);
        webhookData.append('birthYear', formData.birthYear || '');
        
        // Address
        webhookData.append('addressStreet', formData.street);
        webhookData.append('addressHouseNumber', formData.houseNumber);
        webhookData.append('addressZip', formData.zipCode);
        webhookData.append('addressCity', formData.city);
        webhookData.append('addressCountry', formData.country);
        webhookData.append('addressRaw', `${formData.street} ${formData.houseNumber}, ${formData.zipCode} ${formData.city}, ${formData.country}`);
        webhookData.append('addressValidated', String(formData.addressValidated));
        
        // Experience
        webhookData.append('experienceHasBasicCourse', String(formData.hasBasicCourse));
        if (formData.hasBasicCourse) {
          webhookData.append('experienceWhen', formData.vipBasicWhen);
          webhookData.append('experienceWhere', formData.vipBasicWhere);
          webhookData.append('experienceTeacher', formData.vipBasicTeacher);
          webhookData.append('experienceBasicCourseDays', formData.basicCourseDays);
        }
        webhookData.append('otherExperience', formData.otherExperience || '');
        webhookData.append('impairments', formData.impairments || '');
        
        // Languages
        webhookData.append('motherTongue', formData.motherTongue);
        webhookData.append('secondLanguage', formData.secondLanguage || '');
        
        // Gender
        webhookData.append('gender', formData.gender);
        
        // Course selection
        webhookData.append('courseType', formData.courseType);
        
        // Dates based on course type
        if (formData.courseType === 'basic_course') {
          webhookData.append('dateFrom', formData.startDateBasic);
          webhookData.append('dateTo', formData.endDateBasic);
        } else if (formData.courseType === 'retreat') {
          webhookData.append('dateFrom', formData.startDateRetreat);
          webhookData.append('dateTo', formData.endDateRetreat);
        } else if (formData.courseType === 'few_days') {
          webhookData.append('dateFrom', formData.startDateFew);
          webhookData.append('dateTo', formData.endDateFew);
        }
        
        webhookData.append('additionalInfo', formData.additionalInfo || '');
        webhookData.append('submissionTimestampISO', submissionTimestamp);

        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          mode: 'no-cors',
          body: webhookData.toString(),
        });
      } catch (webhookError) {
        console.log('Webhook backup sent (no-cors mode)');
      }

      localStorage.removeItem(STORAGE_KEY);
      setIsSubmitted(true);
      toast.success(t('common.success'));
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-serif text-3xl text-foreground mb-4">{t('registration.success.title')}</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('registration.success.message')}</p>
        <Link to="/">
          <Button variant="outline" size="lg">{t('registration.success.backToHome')}</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    <Step1Person key={0} data={formData} updateData={updateData} errors={errors} />,
    <AddressAutocomplete key={1} data={formData} updateData={updateData} errors={errors} />,
    <Step3Experience key={2} data={formData} updateData={updateData} errors={errors} />,
    <Step4Course key={3} data={formData} updateData={updateData} errors={errors} />,
    <Step5Review key={4} data={formData} updateData={updateData} errors={errors} />,
  ];

  return (
    <div className="w-full">
      <FormStepper currentStep={currentStep} totalSteps={5} />
      <div className="min-h-[400px]">{steps[currentStep]}</div>
      <div className="flex justify-between mt-10 pt-6 border-t border-border">
        <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Button>
        {currentStep < 4 ? (
          <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
            {t('common.next')} <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-primary hover:bg-primary/90">
            {isSubmitting ? t('common.loading') : t('common.submit')} <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
