import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RegistrationFormData } from './types';

interface Step1PersonProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export function Step1Person({ data, updateData, errors }: Step1PersonProps) {
  const { t } = useTranslation();

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

      <div className="space-y-2">
        <Label htmlFor="phone" className="form-label">
          {t('registration.step1.phone')} *
        </Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => updateData({ phone: e.target.value })}
          className={`input-field ${errors.phone ? 'border-destructive' : ''}`}
          placeholder="+49 123 456789"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

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
