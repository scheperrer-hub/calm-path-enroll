import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { RegistrationFormData } from './types';

interface AddressAutocompleteProps {
  data: RegistrationFormData;
  updateData: (updates: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
}

export function AddressAutocomplete({ data, updateData, errors }: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidated, setIsValidated] = useState(data.addressValidated || false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use Nominatim (OpenStreetMap) for address autocomplete
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept-Language': 'de,en',
          },
        }
      );
      const results: NominatimResult[] = await response.json();
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsValidated(false);
    updateData({ addressValidated: false });

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const selectAddress = (result: NominatimResult) => {
    const addr = result.address;
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    
    updateData({
      street: addr.road || '',
      houseNumber: addr.house_number || '',
      zipCode: addr.postcode || '',
      city: city,
      country: addr.country || '',
      addressValidated: true,
    });
    
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidated(true);
  };

  const validateAddress = async () => {
    if (!data.street || !data.city || !data.country) {
      return;
    }

    setIsLoading(true);
    try {
      const query = `${data.street} ${data.houseNumber}, ${data.zipCode} ${data.city}, ${data.country}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept-Language': 'de,en',
          },
        }
      );
      const results: NominatimResult[] = await response.json();
      
      if (results.length > 0) {
        setIsValidated(true);
        updateData({ addressValidated: true });
      } else {
        setIsValidated(false);
        updateData({ addressValidated: false });
      }
    } catch (error) {
      console.error('Address validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Address Search */}
      <div ref={wrapperRef} className="relative">
        <Label className="form-label flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {t('registration.step2.searchAddress')}
        </Label>
        <div className="relative mt-2">
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="input-field pr-10"
            placeholder={t('registration.step2.searchPlaceholder')}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => selectAddress(result)}
                className="w-full px-4 py-3 text-left hover:bg-secondary/50 border-b border-border last:border-0 transition-colors"
              >
                <p className="text-sm text-foreground truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validation status */}
      {(data.street || data.city) && (
        <div className={`flex items-center gap-2 text-sm ${isValidated ? 'text-green-600' : 'text-amber-600'}`}>
          {isValidated ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{t('registration.step2.addressVerified')}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>{t('registration.step2.addressNotVerified')}</span>
              <button 
                type="button"
                onClick={validateAddress}
                className="underline hover:no-underline ml-2"
              >
                {t('registration.step2.verifyNow')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Manual address fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="street" className="form-label">
            {t('registration.step2.street')} *
          </Label>
          <Input
            id="street"
            value={data.street}
            onChange={(e) => {
              updateData({ street: e.target.value, addressValidated: false });
              setIsValidated(false);
            }}
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
            onChange={(e) => {
              updateData({ houseNumber: e.target.value, addressValidated: false });
              setIsValidated(false);
            }}
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
            onChange={(e) => {
              updateData({ zipCode: e.target.value, addressValidated: false });
              setIsValidated(false);
            }}
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
            onChange={(e) => {
              updateData({ city: e.target.value, addressValidated: false });
              setIsValidated(false);
            }}
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
          onChange={(e) => {
            updateData({ country: e.target.value, addressValidated: false });
            setIsValidated(false);
          }}
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
