import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormStepper } from './FormStepper';
import { Step1Person } from './Step1Person';
import { Step2Address } from './Step2Address';
import { Step3Experience } from './Step3Experience';
import { Step4Course } from './Step4Course';
import { Step5Review } from './Step5Review';
import { RegistrationFormData, initialFormData } from './types';
import { ArrowLeft, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WEBHOOK_URL = 'https://hook.eu2.make.com/rqeqqhh7jo48n96fq5p42zshvnax2fku';

const STORAGE_KEY = 'vipassana-registration-draft';

export function RegistrationForm() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isSubmitted]);

  const updateData = (updates: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = t('registration.validation.required');
      if (!formData.lastName.trim()) newErrors.lastName = t('registration.validation.required');
      if (!formData.phone.trim()) newErrors.phone = t('registration.validation.required');
      if (!formData.email.trim()) newErrors.email = t('registration.validation.required');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('registration.validation.invalidEmail');
    } else if (step === 1) {
      if (!formData.street.trim()) newErrors.street = t('registration.validation.required');
      if (!formData.houseNumber.trim()) newErrors.houseNumber = t('registration.validation.required');
      if (!formData.zipCode.trim()) newErrors.zipCode = t('registration.validation.required');
      if (!formData.city.trim()) newErrors.city = t('registration.validation.required');
      if (!formData.country.trim()) newErrors.country = t('registration.validation.required');
    } else if (step === 3) {
      if (formData.courseTypes.length === 0) newErrors.courseTypes = t('registration.validation.selectCourse');
      if (formData.courseTypes.includes('basic_course') && !formData.startDateBasic) newErrors.startDateBasic = t('registration.validation.startDateRequired');
      if (formData.courseTypes.includes('retreat') && !formData.startDateRetreat) newErrors.startDateRetreat = t('registration.validation.startDateRequired');
      if (formData.courseTypes.includes('few_days')) {
        if (!formData.startDateFew) newErrors.startDateFew = t('registration.validation.startDateRequired');
        if (!formData.endDateFew) newErrors.endDateFew = t('registration.validation.endDateRequired');
      }
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
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('registrations').insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address_street: formData.street,
        address_house_number: formData.houseNumber,
        address_zip: formData.zipCode,
        address_city: formData.city,
        address_country: formData.country,
        vip_basic_when: formData.vipBasicWhen || null,
        vip_basic_where: formData.vipBasicWhere || null,
        vip_basic_teacher: formData.vipBasicTeacher || null,
        vip_other_experience: formData.otherExperience || null,
        report_language: formData.reportLanguage,
        course_basic: formData.courseTypes.includes('basic_course'),
        course_retreat: formData.courseTypes.includes('retreat'),
        course_few_days: formData.courseTypes.includes('few_days'),
        start_date_basic: formData.startDateBasic || null,
        end_date_basic: formData.endDateBasic || null,
        start_date_retreat: formData.startDateRetreat || null,
        end_date_retreat: formData.endDateRetreat || null,
        start_date_few: formData.startDateFew || null,
        end_date_few: formData.endDateFew || null,
        room_number: formData.roomNumber || null,
        additional_info: formData.additionalInfo || null,
        registration_date: formData.registrationDate || new Date().toISOString().split('T')[0],
        consent_privacy: formData.privacyConsent,
        consent_timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error(t('common.error'));
        return;
      }

      // Send to webhook as backup
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            address: `${formData.street} ${formData.houseNumber}, ${formData.zipCode} ${formData.city}, ${formData.country}`,
            vip_basic_when: formData.vipBasicWhen,
            vip_basic_where: formData.vipBasicWhere,
            vip_basic_teacher: formData.vipBasicTeacher,
            other_experience: formData.otherExperience,
            report_language: formData.reportLanguage,
            course_basic: formData.courseTypes.includes('basic_course'),
            course_retreat: formData.courseTypes.includes('retreat'),
            course_few_days: formData.courseTypes.includes('few_days'),
            start_date_basic: formData.startDateBasic,
            start_date_retreat: formData.startDateRetreat,
            start_date_few: formData.startDateFew,
            end_date_few: formData.endDateFew,
            additional_info: formData.additionalInfo,
            submitted_at: new Date().toISOString(),
          }),
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
    <Step2Address key={1} data={formData} updateData={updateData} errors={errors} />,
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