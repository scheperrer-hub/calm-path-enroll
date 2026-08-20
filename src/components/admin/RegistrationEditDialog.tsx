import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { COURSE_DATE_MIN, COURSE_DATE_MAX, isWithinCourseRange } from '@/components/registration/types';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Registration = Tables<'registrations'>;

interface RegistrationEditDialogProps {
  registration: Registration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}


const formatCourseDate = (isoDate: string) => isoDate.split('-').reverse().join('.');

/**
 * Weist auf Daten außerhalb des Kurszeitraums hin, ohne das Speichern zu
 * blockieren – Leitung und Admins sollen bewusste Ausnahmen eintragen können.
 */
function CourseRangeHint({ value }: { value: string | null | undefined }) {
  if (!value || isWithinCourseRange(value)) return null;

  return (
    <p className="mt-1 text-xs text-destructive">
      Außerhalb des Kurszeitraums ({formatCourseDate(COURSE_DATE_MIN)} –{' '}
      {formatCourseDate(COURSE_DATE_MAX)})
    </p>
  );
}

export function RegistrationEditDialog({ registration, open, onOpenChange, onDeleted }: RegistrationEditDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Registration>>({});

  useEffect(() => {
    if (registration) {
      setFormData(registration);
    }
  }, [registration]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Registration>) => {
      const { error } = await supabase
        .from('registrations')
        .update(data)
        .eq('id', registration?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration', registration?.id] });
      toast.success('Änderungen gespeichert');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'archived' })
        .eq('id', registration?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration', registration?.id] });
      toast.success('Anmeldung archiviert');
    },
    onError: () => {
      toast.error('Fehler beim Archivieren');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registration?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Anmeldung gelöscht');
      onOpenChange(false);
      onDeleted?.();
    },
    onError: () => {
      toast.error('Fehler beim Löschen');
    },
  });

  const handleArchive = () => {
    archiveMutation.mutate();
  };

  const handleDelete = () => {
    if (!window.confirm('Möchten Sie diese Anmeldung wirklich löschen?')) return;
    deleteMutation.mutate();
  };

  const updateField = (field: keyof Registration, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!registration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anmeldung bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Data */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Persönliche Daten</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Vorname</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => updateField('first_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nachname</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => updateField('last_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Geschlecht</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => updateField('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bitte auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Männlich</SelectItem>
                    <SelectItem value="female">Weiblich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birth_year">Geburtsjahr</Label>
                <Input
                  id="birth_year"
                  type="number"
                  value={formData.birth_year ?? ''}
                  onChange={(e) => updateField('birth_year', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Adresse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address_street">Straße</Label>
                <Input
                  id="address_street"
                  value={formData.address_street || ''}
                  onChange={(e) => updateField('address_street', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address_house_number">Hausnummer</Label>
                <Input
                  id="address_house_number"
                  value={formData.address_house_number || ''}
                  onChange={(e) => updateField('address_house_number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address_zip">PLZ</Label>
                <Input
                  id="address_zip"
                  value={formData.address_zip || ''}
                  onChange={(e) => updateField('address_zip', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address_city">Stadt</Label>
                <Input
                  id="address_city"
                  value={formData.address_city || ''}
                  onChange={(e) => updateField('address_city', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address_country">Land</Label>
                <Input
                  id="address_country"
                  value={formData.address_country || ''}
                  onChange={(e) => updateField('address_country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Kurse</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="course_basic"
                  checked={formData.course_basic || false}
                  onCheckedChange={(checked) => updateField('course_basic', checked)}
                />
                <Label htmlFor="course_basic">Basiskurs</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="course_retreat"
                  checked={formData.course_retreat || false}
                  onCheckedChange={(checked) => updateField('course_retreat', checked)}
                />
                <Label htmlFor="course_retreat">Retreat</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="course_few_days"
                  checked={formData.course_few_days || false}
                  onCheckedChange={(checked) => updateField('course_few_days', checked)}
                />
                <Label htmlFor="course_few_days">Ein paar Tage</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date_basic">Start Basiskurs</Label>
                <Input
                  id="start_date_basic"
                  type="date"
                  min={COURSE_DATE_MIN}
                  max={COURSE_DATE_MAX}
                  value={formData.start_date_basic || ''}
                  onChange={(e) => updateField('start_date_basic', e.target.value || null)}
                />
                <CourseRangeHint value={formData.start_date_basic} />
              </div>
              <div>
                <Label htmlFor="end_date_basic">Ende Basiskurs</Label>
                <Input
                  id="end_date_basic"
                  type="date"
                  min={COURSE_DATE_MIN}
                  max={COURSE_DATE_MAX}
                  value={formData.end_date_basic || ''}
                  onChange={(e) => updateField('end_date_basic', e.target.value || null)}
                />
                <CourseRangeHint value={formData.end_date_basic} />
              </div>
              <div>
                <Label htmlFor="start_date_retreat">Start Retreat</Label>
                <Input
                  id="start_date_retreat"
                  type="date"
                  min={COURSE_DATE_MIN}
                  max={COURSE_DATE_MAX}
                  value={formData.start_date_retreat || ''}
                  onChange={(e) => updateField('start_date_retreat', e.target.value || null)}
                />
                <CourseRangeHint value={formData.start_date_retreat} />
              </div>
              <div>
                <Label htmlFor="end_date_retreat">Ende Retreat</Label>
                <Input
                  id="end_date_retreat"
                  type="date"
                  min={COURSE_DATE_MIN}
                  max={COURSE_DATE_MAX}
                  value={formData.end_date_retreat || ''}
                  onChange={(e) => updateField('end_date_retreat', e.target.value || null)}
                />
                <CourseRangeHint value={formData.end_date_retreat} />
              </div>
              <div>
                <Label htmlFor="start_date_few">Start Kurzbesuch</Label>
                <Input
                  id="start_date_few"
                  type="date"
                  min={COURSE_DATE_MIN}
                  max={COURSE_DATE_MAX}
                  value={formData.start_date_few || ''}
                  onChange={(e) => updateField('start_date_few', e.target.value || null)}
                />
                <CourseRangeHint value={formData.start_date_few} />
              </div>
              <div>
                <Label htmlFor="end_date_few">Ende Kurzbesuch</Label>
                <Input
                  id="end_date_few"
                  type="date"
                  min={COURSE_DATE_MIN}
                  max={COURSE_DATE_MAX}
                  value={formData.end_date_few || ''}
                  onChange={(e) => updateField('end_date_few', e.target.value || null)}
                />
                <CourseRangeHint value={formData.end_date_few} />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Erfahrungen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_basic_course"
                  checked={formData.has_basic_course || false}
                  onCheckedChange={(checked) => updateField('has_basic_course', checked)}
                />
                <Label htmlFor="has_basic_course">Basiskurs besucht</Label>
              </div>
              <div>
                <Label htmlFor="basic_course_days">Basiskurs-Tage</Label>
                <Input
                  id="basic_course_days"
                  type="number"
                  value={formData.basic_course_days ?? ''}
                  onChange={(e) => updateField('basic_course_days', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <Label htmlFor="mother_tongue">Muttersprache</Label>
                <Input
                  id="mother_tongue"
                  value={formData.mother_tongue || ''}
                  onChange={(e) => updateField('mother_tongue', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="second_language">Zweitsprache</Label>
                <Input
                  id="second_language"
                  value={formData.second_language || ''}
                  onChange={(e) => updateField('second_language', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vip_basic_when">Wann</Label>
                <Input
                  id="vip_basic_when"
                  value={formData.vip_basic_when || ''}
                  onChange={(e) => updateField('vip_basic_when', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vip_basic_where">Wo</Label>
                <Input
                  id="vip_basic_where"
                  value={formData.vip_basic_where || ''}
                  onChange={(e) => updateField('vip_basic_where', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vip_basic_teacher">Lehrer</Label>
                <Input
                  id="vip_basic_teacher"
                  value={formData.vip_basic_teacher || ''}
                  onChange={(e) => updateField('vip_basic_teacher', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vip_other_experience">Andere Erfahrungen</Label>
              <Textarea
                id="vip_other_experience"
                value={formData.vip_other_experience || ''}
                onChange={(e) => updateField('vip_other_experience', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="impairments">Beeinträchtigungen</Label>
              <Textarea
                id="impairments"
                value={formData.impairments || ''}
                onChange={(e) => updateField('impairments', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Other */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Sonstiges</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report_language">Reportsprache</Label>
                <Select
                  value={formData.report_language || 'de'}
                  onValueChange={(value) => updateField('report_language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room_number">Zimmernummer</Label>
                <Input
                  id="room_number"
                  value={formData.room_number || ''}
                  onChange={(e) => updateField('room_number', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="additional_info">Zusätzliche Informationen</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info || ''}
                onChange={(e) => updateField('additional_info', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Löschen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Archivieren
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
