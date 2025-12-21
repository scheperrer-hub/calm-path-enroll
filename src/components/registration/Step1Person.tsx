import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RegistrationFormData } from './types';
import { PhoneInput } from './PhoneInput';

interface Step1PersonProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export function Step1Person({ data, updateData, errors }: Step1PersonProps) {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear;

  const handlePhoneChange = (phone: string, phoneCountry: string, phoneE164: string, isValid: boolean) => {
    updateData({ phone, phoneCountry, phoneE164 });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
          {t('registration.step1.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('registration.step1.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="form-label">
            {t('registration.step1.firstName')} *
          </Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            className={`input-field ${errors.firstName ? 'border-destructive' : ''}`}
            placeholder={t('registration.step1.firstName')}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="form-label">
            {t('registration.step1.lastName')} *
          </Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            className={`input-field ${errors.lastName ? 'border-destructive' : ''}`}
            placeholder={t('registration.step1.lastName')}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Birth Year */}
      <div className="space-y-2">
        <Label htmlFor="birthYear" className="form-label">
          {t('registration.step1.birthYear')} *
        </Label>
        <Input
          id="birthYear"
          type="number"
          min={minYear}
          max={maxYear}
          value={data.birthYear}
          onChange={(e) => updateData({ birthYear: e.target.value })}
          className={`input-field w-full md:w-[150px] ${errors.birthYear ? 'border-destructive' : ''}`}
          placeholder="1985"
        />
        {errors.birthYear && (
          <p className="text-sm text-destructive">{errors.birthYear}</p>
        )}
      </div>

      {/* Phone with country selector */}
      <PhoneInput
        value={data.phone}
        phoneCountry={data.phoneCountry}
        onChange={handlePhoneChange}
        error={errors.phone}
      />

      <div className="space-y-2">
        <Label htmlFor="email" className="form-label">
          {t('registration.step1.email')} *
        </Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          className={`input-field ${errors.email ? 'border-destructive' : ''}`}
          placeholder="name@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>
    </div>
  );
}
