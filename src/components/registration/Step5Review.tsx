import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RegistrationFormData } from './types';
import { User, MapPin, BookOpen, Calendar, Check } from 'lucide-react';

interface Step5ReviewProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export function Step5Review({ data, updateData, errors }: Step5ReviewProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'de' ? de : enUS;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd. MMMM yyyy', { locale });
    } catch {
      return dateStr;
    }
  };

  const courseTypeLabels: Record<string, string> = {
    basic_course: t('registration.step4.basicCourse'),
    retreat: t('registration.step4.retreat'),
    few_days: t('registration.step4.fewDays'),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
          {t('registration.step5.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('registration.step5.description')}
        </p>
      </div>

      {/* Personal Info */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-lg text-foreground">
            {t('registration.step5.personalInfo')}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('registration.step1.firstName')}:</span>
            <span className="ml-2 text-foreground font-medium">{data.firstName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('registration.step1.lastName')}:</span>
            <span className="ml-2 text-foreground font-medium">{data.lastName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('registration.step1.email')}:</span>
            <span className="ml-2 text-foreground font-medium">{data.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('registration.step1.phone')}:</span>
            <span className="ml-2 text-foreground font-medium">{data.phone}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-lg text-foreground">
            {t('registration.step5.addressInfo')}
          </h3>
        </div>
        <p className="text-foreground">
          {data.street} {data.houseNumber}<br />
          {data.zipCode} {data.city}<br />
          {data.country}
        </p>
      </div>

      {/* Experience */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-lg text-foreground">
            {t('registration.step5.experienceInfo')}
          </h3>
        </div>
        <div className="space-y-3 text-sm">
          {(data.vipBasicWhen || data.vipBasicWhere || data.vipBasicTeacher) && (
            <div>
              <span className="text-muted-foreground font-medium">{t('registration.step3.basicRetreat')}:</span>
              <p className="text-foreground mt-1">
                {data.vipBasicWhen && `${t('registration.step3.when')}: ${data.vipBasicWhen}`}
                {data.vipBasicWhere && ` • ${t('registration.step3.where')}: ${data.vipBasicWhere}`}
                {data.vipBasicTeacher && ` • ${t('registration.step3.teacher')}: ${data.vipBasicTeacher}`}
              </p>
            </div>
          )}
          {data.otherExperience && (
            <div>
              <span className="text-muted-foreground font-medium">{t('registration.step3.otherExperience')}:</span>
              <p className="text-foreground mt-1 whitespace-pre-wrap">{data.otherExperience}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">{t('registration.step3.reportLanguage')}:</span>
            <span className="ml-2 text-foreground font-medium">
              {data.reportLanguage === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
            </span>
          </div>
        </div>
      </div>

      {/* Course Selection */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-lg text-foreground">
            {t('registration.step5.courseInfo')}
          </h3>
        </div>
        <div className="space-y-4">
          {data.courseTypes.map((courseType) => (
            <div key={courseType} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-forest-light mt-0.5" />
              <div>
                <span className="font-medium text-foreground">{courseTypeLabels[courseType]}</span>
                <p className="text-sm text-muted-foreground">
                  {courseType === 'basic_course' && data.startDateBasic && (
                    <>{formatDate(data.startDateBasic)} - {formatDate(data.endDateBasic)}</>
                  )}
                  {courseType === 'retreat' && data.startDateRetreat && (
                    <>{formatDate(data.startDateRetreat)} - {formatDate(data.endDateRetreat)}</>
                  )}
                  {courseType === 'few_days' && data.startDateFew && (
                    <>{formatDate(data.startDateFew)} - {formatDate(data.endDateFew)}</>
                  )}
                </p>
              </div>
            </div>
          ))}
          {data.roomNumber && (
            <p className="text-sm">
              <span className="text-muted-foreground">{t('registration.step4.roomNumber')}:</span>
              <span className="ml-2 text-foreground">{data.roomNumber}</span>
            </p>
          )}
          {data.additionalInfo && (
            <div className="pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">{t('registration.step4.additionalInfo')}:</span>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{data.additionalInfo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Consent */}
      <div className="card-elevated p-6 border-2 border-primary/20">
        <div className="flex items-start gap-4">
          <Checkbox
            id="privacyConsent"
            checked={data.privacyConsent}
            onCheckedChange={(checked) => updateData({ privacyConsent: checked as boolean })}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="privacyConsent" className="text-sm text-foreground cursor-pointer">
              {t('registration.step5.privacyConsentText')}
            </Label>
            <Link 
              to="/privacy" 
              target="_blank" 
              className="block mt-2 text-sm text-primary hover:underline"
            >
              {t('registration.step5.privacyLink')} →
            </Link>
          </div>
        </div>
        {errors.privacyConsent && (
          <p className="text-sm text-destructive mt-2">{errors.privacyConsent}</p>
        )}
      </div>
    </div>
  );
}
