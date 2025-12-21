import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PhoneInputProps {
  value: string;
  phoneCountry: string;
  onChange: (phone: string, phoneCountry: string, phoneE164: string, isValid: boolean) => void;
  error?: string;
}

const POPULAR_COUNTRIES: CountryCode[] = ['DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'IT', 'ES', 'GB', 'US'];

const COUNTRY_NAMES: Record<string, string> = {
  DE: 'Deutschland',
  AT: 'Österreich',
  CH: 'Schweiz',
  FR: 'France',
  NL: 'Nederland',
  BE: 'België',
  IT: 'Italia',
  ES: 'España',
  GB: 'United Kingdom',
  US: 'United States',
  PL: 'Polska',
  CZ: 'Česká republika',
  DK: 'Danmark',
  SE: 'Sverige',
  NO: 'Norge',
  FI: 'Suomi',
  PT: 'Portugal',
  GR: 'Ελλάδα',
  HU: 'Magyarország',
  RO: 'România',
  BG: 'България',
  HR: 'Hrvatska',
  SK: 'Slovensko',
  SI: 'Slovenija',
  LU: 'Luxembourg',
  IE: 'Ireland',
  AU: 'Australia',
  NZ: 'New Zealand',
  CA: 'Canada',
  IN: 'India',
  JP: 'Japan',
  BR: 'Brasil',
  MX: 'México',
  TH: 'Thailand',
  LK: 'Sri Lanka',
  MM: 'Myanmar',
  VN: 'Vietnam',
};

export function PhoneInput({ value, phoneCountry, onChange, error }: PhoneInputProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<CountryCode>((phoneCountry as CountryCode) || 'DE');
  const [nationalNumber, setNationalNumber] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get all countries and sort them
  const allCountries = getCountries();
  const otherCountries = allCountries.filter(c => !POPULAR_COUNTRIES.includes(c)).sort((a, b) => {
    const nameA = COUNTRY_NAMES[a] || a;
    const nameB = COUNTRY_NAMES[b] || b;
    return nameA.localeCompare(nameB);
  });

  useEffect(() => {
    // Parse existing value on mount
    if (value && !nationalNumber) {
      try {
        const parsed = parsePhoneNumber(value, country);
        if (parsed) {
          setNationalNumber(parsed.nationalNumber);
          if (parsed.country) {
            setCountry(parsed.country);
          }
        }
      } catch {
        setNationalNumber(value);
      }
    }
  }, []);

  const validateAndUpdate = (number: string, countryCode: CountryCode) => {
    setNationalNumber(number);
    setCountry(countryCode);

    if (!number.trim()) {
      setValidationError(null);
      onChange(number, countryCode, '', false);
      return;
    }

    try {
      const fullNumber = `+${getCountryCallingCode(countryCode)}${number.replace(/\D/g, '')}`;
      
      if (isValidPhoneNumber(fullNumber)) {
        const parsed = parsePhoneNumber(fullNumber);
        if (parsed) {
          const phoneType = parsed.getType();
          // Accept mobile, fixed-line, or unknown (for some countries mobile detection is not reliable)
          const isAcceptable = !phoneType || phoneType === 'MOBILE' || phoneType === 'FIXED_LINE' || phoneType === 'FIXED_LINE_OR_MOBILE';
          
          if (isAcceptable) {
            setValidationError(null);
            onChange(parsed.nationalNumber, countryCode, parsed.format('E.164'), true);
          } else {
            setValidationError(t('registration.validation.invalidPhone'));
            onChange(number, countryCode, '', false);
          }
        }
      } else {
        setValidationError(t('registration.validation.invalidPhone'));
        onChange(number, countryCode, '', false);
      }
    } catch {
      setValidationError(t('registration.validation.invalidPhone'));
      onChange(number, countryCode, '', false);
    }
  };

  const handleCountryChange = (newCountry: string) => {
    validateAndUpdate(nationalNumber, newCountry as CountryCode);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value;
    validateAndUpdate(number, country);
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="form-label">
        {t('registration.step1.phone')} *
      </Label>
      <div className="flex gap-2">
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[140px] input-field">
            <SelectValue>
              +{getCountryCallingCode(country)} {country}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {/* Popular countries first */}
            {POPULAR_COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                +{getCountryCallingCode(c)} {COUNTRY_NAMES[c] || c}
              </SelectItem>
            ))}
            <div className="border-t border-border my-1" />
            {/* Other countries */}
            {otherCountries.map((c) => (
              <SelectItem key={c} value={c}>
                +{getCountryCallingCode(c)} {COUNTRY_NAMES[c] || c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id="phone"
          type="tel"
          value={nationalNumber}
          onChange={handleNumberChange}
          className={`flex-1 input-field ${displayError ? 'border-destructive' : ''}`}
          placeholder="123 456789"
        />
      </div>
      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}
    </div>
  );
}
