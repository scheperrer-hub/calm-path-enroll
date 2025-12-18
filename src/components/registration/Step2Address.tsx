import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RegistrationFormData } from './types';

interface Step2AddressProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export function Step2Address({ data, updateData, errors }: Step2AddressProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
          {t('registration.step2.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('registration.step2.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="street" className="form-label">
            {t('registration.step2.street')} *
          </Label>
          <Input
            id="street"
            value={data.street}
            onChange={(e) => updateData({ street: e.target.value })}
            className={`input-field ${errors.street ? 'border-destructive' : ''}`}
            placeholder={t('registration.step2.street')}
          />
          {errors.street && (
            <p className="text-sm text-destructive">{errors.street}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="houseNumber" className="form-label">
            {t('registration.step2.houseNumber')} *
          </Label>
          <Input
            id="houseNumber"
            value={data.houseNumber}
            onChange={(e) => updateData({ houseNumber: e.target.value })}
            className={`input-field ${errors.houseNumber ? 'border-destructive' : ''}`}
            placeholder="12a"
          />
          {errors.houseNumber && (
            <p className="text-sm text-destructive">{errors.houseNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="zipCode" className="form-label">
            {t('registration.step2.zipCode')} *
          </Label>
          <Input
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => updateData({ zipCode: e.target.value })}
            className={`input-field ${errors.zipCode ? 'border-destructive' : ''}`}
            placeholder="12345"
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive">{errors.zipCode}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="city" className="form-label">
            {t('registration.step2.city')} *
          </Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            className={`input-field ${errors.city ? 'border-destructive' : ''}`}
            placeholder={t('registration.step2.city')}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="form-label">
          {t('registration.step2.country')} *
        </Label>
        <Input
          id="country"
          value={data.country}
          onChange={(e) => updateData({ country: e.target.value })}
          className={`input-field ${errors.country ? 'border-destructive' : ''}`}
          placeholder="Deutschland"
        />
        {errors.country && (
          <p className="text-sm text-destructive">{errors.country}</p>
        )}
      </div>
    </div>
  );
}
