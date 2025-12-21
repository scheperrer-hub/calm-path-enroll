import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Loader2, Pencil, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { RegistrationEditDialog } from '@/components/admin/RegistrationEditDialog';
import { buildRegistrationCsv, buildRegistrationCsvFileName, downloadCsv } from '@/utils/registrationCsv';

type RegistrationStatus = 'new' | 'in_review' | 'need_info' | 'confirmed' | 'done' | 'archived';

const statusOptions: RegistrationStatus[] = ['new', 'in_review', 'need_info', 'confirmed', 'done', 'archived'];

export default function RegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const { data: registration, isLoading } = useQuery({
    queryKey: ['registration', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', id],
    queryFn: async () => {
      const { data: notesData, error } = await supabase
        .from('notes')
        .select('*')
        .eq('registration_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profiles separately
      const authorIds = [...new Set(notesData.map(n => n.author_user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', authorIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      return notesData.map(note => ({
        ...note,
        profile: profilesMap.get(note.author_user_id),
      }));
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['teacher', 'leader', 'admin']);
      if (error) throw error;

      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      return rolesData.map(role => ({
        ...role,
        profile: profilesMap.get(role.user_id),
      }));
    },
    enabled: userRole === 'admin' || userRole === 'leader',
  });

  const updateRegistration = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await supabase
        .from('registrations')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration', id] });
      toast.success('Gespeichert');
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notes').insert({
        registration_id: id,
        author_user_id: user?.id,
        note_text: newNote,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      setNewNote('');
      toast.success('Notiz hinzugefügt');
    },
  });

  const calculateDeletionDate = () => {
    if (!registration) return null;
    const dates: Date[] = [];
    if (registration.end_date_basic) dates.push(new Date(registration.end_date_basic));
    if (registration.end_date_retreat) dates.push(new Date(registration.end_date_retreat));
    if (registration.end_date_few) dates.push(new Date(registration.end_date_few));
    if (dates.length === 0) return null;
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return addDays(maxDate, 28);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!registration) {
    return <div className="p-8">Anmeldung nicht gefunden</div>;
  }

  const deletionDate = calculateDeletionDate();

  const handleDownload = () => {
    const csv = buildRegistrationCsv([registration]);
    downloadCsv(csv, buildRegistrationCsvFileName(registration));
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">
            {registration.first_name} {registration.last_name}
          </h1>
          <p className="text-muted-foreground">{registration.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {t('admin.exportCsv')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            {t('common.edit')}
          </Button>
          <Select
            value={registration.status}
            onValueChange={(value) => updateRegistration.mutate({ status: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`admin.status.${status.replace('_', '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Telefon</Label>
              <p>{registration.phone}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">E-Mail</Label>
              <p>{registration.email}</p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-muted-foreground">Adresse</Label>
              <p>
                {registration.address_street} {registration.address_house_number}<br />
                {registration.address_zip} {registration.address_city}<br />
                {registration.address_country}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kursdetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {registration.course_basic && <Badge>Basiskurs</Badge>}
              {registration.course_retreat && <Badge>Retreat</Badge>}
              {registration.course_few_days && <Badge>Ein paar Tage</Badge>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {registration.start_date_basic && (
                <div>
                  <Label className="text-muted-foreground">Basiskurs</Label>
                  <p>{format(new Date(registration.start_date_basic), 'dd.MM.yyyy')} - {registration.end_date_basic && format(new Date(registration.end_date_basic), 'dd.MM.yyyy')}</p>
                </div>
              )}
              {registration.start_date_retreat && (
                <div>
                  <Label className="text-muted-foreground">Retreat</Label>
                  <p>{format(new Date(registration.start_date_retreat), 'dd.MM.yyyy')} - {registration.end_date_retreat && format(new Date(registration.end_date_retreat), 'dd.MM.yyyy')}</p>
                </div>
              )}
              {registration.start_date_few && (
                <div>
                  <Label className="text-muted-foreground">Ein paar Tage</Label>
                  <p>{format(new Date(registration.start_date_few), 'dd.MM.yyyy')} - {registration.end_date_few && format(new Date(registration.end_date_few), 'dd.MM.yyyy')}</p>
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Reportsprache</Label>
                <p>{registration.report_language === 'de' ? 'Deutsch' : 'Englisch'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Zimmernummer</Label>
                <Input
                  value={registration.room_number || ''}
                  onChange={(e) => updateRegistration.mutate({ room_number: e.target.value })}
                  placeholder="Zimmernummer eingeben"
                />
              </div>
            </div>
            {deletionDate && (
              <div>
                <Label className="text-muted-foreground">{t('admin.plannedDeletion')}</Label>
                <p className="text-destructive">{format(deletionDate, 'dd.MM.yyyy')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience */}
        {(registration.vip_basic_when || registration.vip_other_experience) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Erfahrungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {registration.vip_basic_when && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Wann</Label>
                    <p>{registration.vip_basic_when}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Wo</Label>
                    <p>{registration.vip_basic_where || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Lehrer</Label>
                    <p>{registration.vip_basic_teacher || '-'}</p>
                  </div>
                </div>
              )}
              {registration.vip_other_experience && (
                <div>
                  <Label className="text-muted-foreground">Andere Erfahrungen</Label>
                  <p className="whitespace-pre-wrap">{registration.vip_other_experience}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Teacher Assignment */}
        {(userRole === 'admin' || userRole === 'leader') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('admin.assignTeacher')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={registration.assigned_teacher_user_id || 'none'}
                onValueChange={(value) => 
                  updateRegistration.mutate({ 
                    assigned_teacher_user_id: value === 'none' ? null : value 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lehrer auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nicht zugewiesen</SelectItem>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.user_id} value={teacher.user_id}>
                      {teacher.profile?.display_name || teacher.profile?.email || teacher.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.notes')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Neue Notiz..."
                rows={2}
              />
              <Button
                onClick={() => addNote.mutate()}
                disabled={!newNote.trim() || addNote.isPending}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {notes?.map((note) => (
                <div key={note.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{note.note_text}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {note.profile?.display_name || 'Unbekannt'} • {format(new Date(note.created_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <RegistrationEditDialog 
        registration={registration} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
    </div>
  );
}
