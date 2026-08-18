import { Tables } from '@/integrations/supabase/types';

type Registration = Tables<'registrations'>;

type CsvColumn = {
  label: string;
  value: (registration: Registration) => string | number | boolean | null | undefined;
};

const CSV_COLUMNS: CsvColumn[] = [
  { label: 'Vorname', value: (registration) => registration.first_name },
  { label: 'Nachname', value: (registration) => registration.last_name },
  { label: 'E-Mail', value: (registration) => registration.email },
  { label: 'Telefon', value: (registration) => registration.phone },
  { label: 'Telefon Land', value: (registration) => registration.phone_country },
  { label: 'Telefon E.164', value: (registration) => registration.phone_e164 },
  { label: 'Geburtsjahr', value: (registration) => registration.birth_year },
  { label: 'Straße', value: (registration) => registration.address_street },
  { label: 'Hausnummer', value: (registration) => registration.address_house_number },
  { label: 'PLZ', value: (registration) => registration.address_zip },
  { label: 'Stadt', value: (registration) => registration.address_city },
  { label: 'Land', value: (registration) => registration.address_country },
  { label: 'Adresse validiert', value: (registration) => registration.address_validated },
  { label: 'Basiskurs absolviert', value: (registration) => registration.has_basic_course },
  { label: 'Basiskurs wann', value: (registration) => registration.vip_basic_when },
  { label: 'Basiskurs wo', value: (registration) => registration.vip_basic_where },
  { label: 'Basiskurs Lehrer', value: (registration) => registration.vip_basic_teacher },
  { label: 'Andere Erfahrungen', value: (registration) => registration.vip_other_experience },
  { label: 'Reportsprache', value: (registration) => registration.report_language },
  { label: 'Kurs Basiskurs', value: (registration) => registration.course_basic },
  { label: 'Kurs Retreat', value: (registration) => registration.course_retreat },
  { label: 'Kurs Ein paar Tage', value: (registration) => registration.course_few_days },
  { label: 'Startdatum Basiskurs', value: (registration) => registration.start_date_basic },
  { label: 'Enddatum Basiskurs', value: (registration) => registration.end_date_basic },
  { label: 'Startdatum Retreat', value: (registration) => registration.start_date_retreat },
  { label: 'Enddatum Retreat', value: (registration) => registration.end_date_retreat },
  { label: 'Startdatum Ein paar Tage', value: (registration) => registration.start_date_few },
  { label: 'Enddatum Ein paar Tage', value: (registration) => registration.end_date_few },
  { label: 'Zusätzliche Infos', value: (registration) => registration.additional_info },
  { label: 'Datenschutz Zustimmung', value: (registration) => registration.consent_privacy },
  { label: 'Datenschutz Zustimmung Zeitpunkt', value: (registration) => registration.consent_timestamp },
  { label: 'Lehrer', value: (registration) => registration.assigned_teacher },
  { label: 'Zimmernummer', value: (registration) => registration.room_number },
  { label: 'Status', value: (registration) => registration.status },
  { label: 'Erstellt am', value: (registration) => registration.created_at },
];

const formatValue = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  return String(value);
};

const escapeCsvValue = (value: string): string => {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const buildRegistrationCsv = (registrations: Registration[]): string => {
  const headers = CSV_COLUMNS.map((column) => column.label);
  const rows = registrations.map((registration) =>
    CSV_COLUMNS.map((column) => escapeCsvValue(formatValue(column.value(registration)))),
  );

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
};

export const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const buildRegistrationCsvFileName = (registration: Registration) => {
  const baseName = `${registration.last_name || 'anmeldung'}-${registration.first_name || ''}`.trim();
  const safeName = baseName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  return `${safeName || 'anmeldung'}.csv`;
};
