import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

      {/* Basic Retreat Experience */}
      <div className="card-elevated p-6">
        <h3 className="font-serif text-lg text-foreground mb-4">
          {t('registration.step3.basicRetreat')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vipBasicWhen" className="form-label">
              {t('registration.step3.when')}
            </Label>
            <Input
              id="vipBasicWhen"
              value={data.vipBasicWhen}
              onChange={(e) => updateData({ vipBasicWhen: e.target.value })}
              className="input-field"
              placeholder={t('registration.step3.whenPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vipBasicWhere" className="form-label">
              {t('registration.step3.where')}
            </Label>
            <Input
              id="vipBasicWhere"
              value={data.vipBasicWhere}
              onChange={(e) => updateData({ vipBasicWhere: e.target.value })}
              className="input-field"
              placeholder={t('registration.step3.wherePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vipBasicTeacher" className="form-label">
              {t('registration.step3.teacher')}
            </Label>
            <Input
              id="vipBasicTeacher"
              value={data.vipBasicTeacher}
              onChange={(e) => updateData({ vipBasicTeacher: e.target.value })}
              className="input-field"
              placeholder={t('registration.step3.teacherPlaceholder')}
            />
          </div>
        </div>
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
          onValueChange={(value: 'de' | 'en') => updateData({ reportLanguage: value })}
        >
          <SelectTrigger className="input-field w-full md:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
