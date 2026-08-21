import { useTranslation } from 'react-i18next';
import { addDays, format, parseISO, isAfter } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  RegistrationFormData,
  COURSE_DATE_MIN,
  COURSE_DATE_MAX,
  RETREAT_DURATION_DAYS,
  RETREAT_DURATION_NIGHTS,
} from './types';
import { cn } from '@/lib/utils';

interface Step4CourseProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

type CourseType = 'basic_course' | 'retreat' | 'few_days';

const formatCourseDate = (isoDate: string) => isoDate.split('-').reverse().join('.');
const COURSE_RANGE_LABEL = `${formatCourseDate(COURSE_DATE_MIN)} - ${formatCourseDate(COURSE_DATE_MAX)}`;

export function Step4Course({ data, updateData, errors }: Step4CourseProps) {
  const { t } = useTranslation();

  const handleCourseTypeChange = (courseType: CourseType) => {
    // Clear all date fields when changing course type
    const updates: Partial<RegistrationFormData> = {
      courseType,
      startDateBasic: '',
      endDateBasic: '',
      startDateRetreat: '',
      endDateRetreat: '',
      startDateFew: '',
      endDateFew: '',
    };

    // Der Grundkurs läuft immer über den gesamten Kurszeitraum.
    if (courseType === 'basic_course') {
      updates.startDateBasic = COURSE_DATE_MIN;
      updates.endDateBasic = COURSE_DATE_MAX;
    }

    // Das Retreat hat keinen festen Anreisetag – den wählt der Schüler.

    updateData(updates);
  };

  /** Enddatum einer Dauer in Tagen – Anreise- und Abreisetag zählen beide mit. */
  const calculateEndDate = (startDate: string, days: number): string => {
    if (!startDate) return '';
    try {
      const start = parseISO(startDate);
      let end = addDays(start, days - 1);
      const maxDate = parseISO(COURSE_DATE_MAX);
      
      // Ensure end date doesn't exceed max date
      if (isAfter(end, maxDate)) {
        end = maxDate;
      }
      
      return format(end, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const handleRetreatStartChange = (value: string) => {
    updateData({
      startDateRetreat: value,
      // Regeldauer als Vorschlag; der Schüler kann das Ende danach vorziehen.
      endDateRetreat: calculateEndDate(value, RETREAT_DURATION_DAYS),
    });
  };

  const courseOptions: { type: CourseType; label: string; description: string }[] = [
    {
      type: 'basic_course',
      label: t('registration.step4.basicCourse'),
      description: t('registration.step4.basicCourseDescription'),
    },
    {
      type: 'retreat',
      label: t('registration.step4.retreat'),
      description: t('registration.step4.retreatDescription'),
    },
    {
      type: 'few_days',
      label: t('registration.step4.fewDays'),
      description: t('registration.step4.fewDaysDescription'),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
          {t('registration.step4.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('registration.step4.description')}
        </p>
      </div>

      {/* Course Type Selection - Radio Group (Single Select) */}
      <div className="space-y-4">
        <Label className="form-label">{t('registration.step4.courseType')} *</Label>
        {errors.courseType && (
          <p className="text-sm text-destructive">{errors.courseType}</p>
        )}
        
        <RadioGroup
          value={data.courseType}
          onValueChange={(value) => handleCourseTypeChange(value as CourseType)}
          className="space-y-3"
        >
          {courseOptions.map((option) => (
            <div
              key={option.type}
              className={cn(
                "card-elevated p-4 cursor-pointer transition-all duration-200",
                data.courseType === option.type && "ring-2 ring-primary bg-secondary/50"
              )}
              onClick={() => handleCourseTypeChange(option.type)}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem
                  value={option.type}
                  id={option.type}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={option.type} className="font-medium text-foreground cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Date fields based on selection */}
      {data.courseType === 'basic_course' && (
        <div className="card-elevated p-6 animate-slide-up">
          <h3 className="font-serif text-lg text-foreground mb-4">
            {t('registration.step4.basicCourse')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('registration.step4.dateRange')}: {COURSE_RANGE_LABEL}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDateBasic" className="form-label">
                {t('registration.step4.startDate')}
              </Label>
              <Input
                id="startDateBasic"
                type="date"
                value={data.startDateBasic}
                readOnly
                className="input-field bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateBasic" className="form-label">
                {t('registration.step4.endDate')}
              </Label>
              <Input
                id="endDateBasic"
                type="date"
                value={data.endDateBasic}
                readOnly
                className="input-field bg-muted cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {data.courseType === 'retreat' && (
        <div className="card-elevated p-6 animate-slide-up">
          <h3 className="font-serif text-lg text-foreground mb-4">
            {t('registration.step4.retreat')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('registration.step4.dateRange')}: {COURSE_RANGE_LABEL}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDateRetreat" className="form-label">
                {t('registration.step4.startDate')} *
              </Label>
              <Input
                id="startDateRetreat"
                type="date"
                min={COURSE_DATE_MIN}
                max={COURSE_DATE_MAX}
                value={data.startDateRetreat}
                onChange={(e) => handleRetreatStartChange(e.target.value)}
                className={`input-field ${errors.startDateRetreat ? 'border-destructive' : ''}`}
              />
              {errors.startDateRetreat && (
                <p className="text-sm text-destructive">{errors.startDateRetreat}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateRetreat" className="form-label">
                {t('registration.step4.endDate')} *
              </Label>
              <Input
                id="endDateRetreat"
                type="date"
                min={data.startDateRetreat || COURSE_DATE_MIN}
                max={COURSE_DATE_MAX}
                value={data.endDateRetreat}
                onChange={(e) => updateData({ endDateRetreat: e.target.value })}
                className={`input-field ${errors.endDateRetreat ? 'border-destructive' : ''}`}
              />
              {errors.endDateRetreat ? (
                <p className="text-sm text-destructive">{errors.endDateRetreat}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('registration.step4.retreatDurationHint', {
                    days: RETREAT_DURATION_DAYS,
                    nights: RETREAT_DURATION_NIGHTS,
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {data.courseType === 'few_days' && (
        <div className="card-elevated p-6 animate-slide-up">
          <h3 className="font-serif text-lg text-foreground mb-4">
            {t('registration.step4.fewDays')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('registration.step4.dateRange')}: {COURSE_RANGE_LABEL}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDateFew" className="form-label">
                {t('registration.step4.startDate')} *
              </Label>
              <Input
                id="startDateFew"
                type="date"
                min={COURSE_DATE_MIN}
                max={COURSE_DATE_MAX}
                value={data.startDateFew}
                onChange={(e) => updateData({ startDateFew: e.target.value })}
                className={`input-field ${errors.startDateFew ? 'border-destructive' : ''}`}
              />
              {errors.startDateFew && (
                <p className="text-sm text-destructive">{errors.startDateFew}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateFew" className="form-label">
                {t('registration.step4.endDate')} *
              </Label>
              <Input
                id="endDateFew"
                type="date"
                min={data.startDateFew || COURSE_DATE_MIN}
                max={COURSE_DATE_MAX}
                value={data.endDateFew}
                onChange={(e) => updateData({ endDateFew: e.target.value })}
                className={`input-field ${errors.endDateFew ? 'border-destructive' : ''}`}
              />
              {errors.endDateFew && (
                <p className="text-sm text-destructive">{errors.endDateFew}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional info only */}
      {data.courseType && (
        <div className="space-y-2">
          <Label htmlFor="additionalInfo" className="form-label">
            {t('registration.step4.additionalInfo')}
          </Label>
          <Textarea
            id="additionalInfo"
            value={data.additionalInfo}
            onChange={(e) => updateData({ additionalInfo: e.target.value })}
            className="input-field min-h-[100px] resize-y"
            placeholder={t('registration.step4.additionalInfoPlaceholder')}
          />
        </div>
      )}
    </div>
  );
}
