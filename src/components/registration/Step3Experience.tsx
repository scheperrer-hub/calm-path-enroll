import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RegistrationFormData } from './types';

interface Step3ExperienceProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export function Step3Experience({ data, updateData, errors }: Step3ExperienceProps) {
  const { t } = useTranslation();

  const handleHasBasicCourseChange = (checked: boolean) => {
    updateData({ 
      hasBasicCourse: checked,
      // Clear fields if unchecked
      ...(checked ? {} : { vipBasicWhen: '', vipBasicWhere: '', vipBasicTeacher: '', basicCourseDays: '' })
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
          {t('registration.step3.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('registration.step3.description')}
        </p>
      </div>

      {/* Basic Course Checkbox */}
      <div className="card-elevated p-6">
        <div className="flex items-start gap-4">
          <Checkbox
            id="hasBasicCourse"
            checked={data.hasBasicCourse}
            onCheckedChange={handleHasBasicCourseChange}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="hasBasicCourse" className="text-foreground font-medium cursor-pointer">
              {t('registration.step3.hasBasicCourse')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('registration.step3.hasBasicCourseDescription')}
            </p>
          </div>
        </div>

        {/* Conditional fields */}
        {data.hasBasicCourse && (
          <div className="mt-6 pt-6 border-t border-border animate-fade-in">
            <h3 className="font-serif text-lg text-foreground mb-4">
              {t('registration.step3.basicRetreat')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="vipBasicWhen" className="form-label">
                  {t('registration.step3.when')} *
                </Label>
                <Input
                  id="vipBasicWhen"
                  value={data.vipBasicWhen}
                  onChange={(e) => updateData({ vipBasicWhen: e.target.value })}
                  className={`input-field ${errors.vipBasicWhen ? 'border-destructive' : ''}`}
                  placeholder={t('registration.step3.whenPlaceholder')}
                />
                {errors.vipBasicWhen && (
                  <p className="text-sm text-destructive">{errors.vipBasicWhen}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vipBasicWhere" className="form-label">
                  {t('registration.step3.where')} *
                </Label>
                <Input
                  id="vipBasicWhere"
                  value={data.vipBasicWhere}
                  onChange={(e) => updateData({ vipBasicWhere: e.target.value })}
                  className={`input-field ${errors.vipBasicWhere ? 'border-destructive' : ''}`}
                  placeholder={t('registration.step3.wherePlaceholder')}
                />
                {errors.vipBasicWhere && (
                  <p className="text-sm text-destructive">{errors.vipBasicWhere}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vipBasicTeacher" className="form-label">
                  {t('registration.step3.teacher')} *
                </Label>
                <Input
                  id="vipBasicTeacher"
                  value={data.vipBasicTeacher}
                  onChange={(e) => updateData({ vipBasicTeacher: e.target.value })}
                  className={`input-field ${errors.vipBasicTeacher ? 'border-destructive' : ''}`}
                  placeholder={t('registration.step3.teacherPlaceholder')}
                />
                {errors.vipBasicTeacher && (
                  <p className="text-sm text-destructive">{errors.vipBasicTeacher}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="basicCourseDays" className="form-label">
                  {t('registration.step3.basicCourseDays')} *
                </Label>
                <Input
                  id="basicCourseDays"
                  type="number"
                  min={1}
                  max={60}
                  value={data.basicCourseDays}
                  onChange={(e) => updateData({ basicCourseDays: e.target.value })}
                  className={`input-field ${errors.basicCourseDays ? 'border-destructive' : ''}`}
                  placeholder={t('registration.step3.basicCourseDaysPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('registration.step3.basicCourseDaysDescription')}
                </p>
                {errors.basicCourseDays && (
                  <p className="text-sm text-destructive">{errors.basicCourseDays}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Experience */}
      <div className="space-y-2">
        <Label htmlFor="otherExperience" className="form-label">
          {t('registration.step3.otherExperience')}
        </Label>
        <Textarea
          id="otherExperience"
          value={data.otherExperience}
          onChange={(e) => updateData({ otherExperience: e.target.value })}
          className="input-field min-h-[150px] resize-y"
          placeholder={t('registration.step3.otherExperiencePlaceholder')}
        />
      </div>

      {/* Mother Tongue */}
      <div className="space-y-2">
        <Label htmlFor="motherTongue" className="form-label">
          {t('registration.step3.motherTongue')} *
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          {t('registration.step3.motherTongueDescription')}
        </p>
        <Select
          value={data.motherTongue}
          onValueChange={(value: 'de' | 'en' | 'fr') => updateData({ motherTongue: value })}
        >
          <SelectTrigger className="input-field w-full md:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Language */}
      <div className="space-y-2">
        <Label htmlFor="reportLanguage" className="form-label">
          {t('registration.step3.reportLanguage')} *
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          {t('registration.step3.reportLanguageDescription')}
        </p>
        <Select
          value={data.reportLanguage}
          onValueChange={(value: 'de' | 'en' | 'fr') => updateData({ reportLanguage: value })}
        >
          <SelectTrigger
            id="reportLanguage"
            className={`input-field w-full md:w-[280px] ${errors.reportLanguage ? 'border-destructive' : ''}`}
          >
            <SelectValue placeholder={t('registration.step3.reportLanguagePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
          </SelectContent>
        </Select>
        {errors.reportLanguage && (
          <p className="text-sm text-destructive">{errors.reportLanguage}</p>
        )}
      </div>

      {/* Second Language */}
      <div className="space-y-2">
        <Label htmlFor="secondLanguage" className="form-label">
          {t('registration.step3.secondLanguage')}
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          {t('registration.step3.secondLanguageDescription')}
        </p>
        <Select
          value={data.secondLanguage || 'none'}
          onValueChange={(value) => updateData({ secondLanguage: value === 'none' ? '' : value as 'de' | 'en' | 'fr' })}
        >
          <SelectTrigger className="input-field w-full md:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— {t('registration.step3.noSecondLanguage')}</SelectItem>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Impairments */}
      <div className="space-y-2">
        <Label htmlFor="impairments" className="form-label">
          {t('registration.step3.impairments')}
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          {t('registration.step3.impairmentsDescription')}
        </p>
        <Textarea
          id="impairments"
          value={data.impairments}
          onChange={(e) => updateData({ impairments: e.target.value })}
          className="input-field min-h-[100px] resize-y"
          placeholder={t('registration.step3.impairmentsPlaceholder')}
        />
      </div>
    </div>
  );
}
