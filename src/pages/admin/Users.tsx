import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

type AppRole = 'admin' | 'leader' | 'teacher';

const MAIN_ADMIN_EMAIL = 'info@impactink.de';

export default function Users() {
  const { t } = useTranslation();
  const { userRole, user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('teacher');
  const [inviteDisplayName, setInviteDisplayName] = useState('');

  const isMainAdmin = user?.email === MAIN_ADMIN_EMAIL;

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
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
    enabled: userRole === 'admin',
  });

  const inviteUser = useMutation({
    mutationFn: async () => {
      // Call edge function to create user with invite email
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: inviteEmail,
          role: inviteRole,
          displayName: inviteDisplayName || undefined,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOpen(false);
      setInviteEmail('');
      setInviteDisplayName('');
      toast.success(data?.message || 'Einladung gesendet');
    },
    onError: (error) => {
      console.error('Invite error:', error);
      toast.error(error.message || 'Fehler beim Einladen');
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rolle aktualisiert');
    },
    onError: (error) => {
      console.error('Role update error:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  if (userRole !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Keine Berechtigung</p>
      </div>
    );
  }

  const canInviteUsers = isMainAdmin || userRole === 'admin';
  const canEditRoles = isMainAdmin;

  const roleColors: Record<AppRole, string> = {
    admin: 'bg-red-100 text-red-800',
    leader: 'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t('admin.users')}</h1>
          <p className="text-muted-foreground">{users?.length || 0} Benutzer</p>
        </div>
        {canInviteUsers && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t('admin.inviteUser')}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Benutzer per E-Mail einladen
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>E-Mail-Adresse *</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@beispiel.de"
                />
                <p className="text-xs text-muted-foreground">
                  Der Benutzer erhält eine Einladungs-E-Mail mit einem Link zum Einloggen.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Anzeigename (optional)</Label>
                <Input
                  type="text"
                  value={inviteDisplayName}
                  onChange={(e) => setInviteDisplayName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label>Rolle *</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">{t('admin.role.teacher')}</SelectItem>
                    <SelectItem value="leader">{t('admin.role.leader')}</SelectItem>
                    <SelectItem value="admin">{t('admin.role.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => inviteUser.mutate()}
                disabled={!inviteEmail || inviteUser.isPending}
                className="w-full gap-2"
              >
                {inviteUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Einladung senden
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-10 bg-background">Name</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">E-Mail</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">Rolle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Keine Benutzer
                </TableCell>
              </TableRow>
            ) : (
              users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.profile?.display_name || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.profile?.email || '-'}
                  </TableCell>
                  <TableCell>
                    {canEditRoles ? (
                      <Select
                        value={u.role}
                        onValueChange={(role) => updateRole.mutate({ id: u.id, role: role as AppRole })}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={roleColors[u.role as AppRole]}>
                            {t(`admin.role.${u.role}`)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">{t('admin.role.teacher')}</SelectItem>
                          <SelectItem value="leader">{t('admin.role.leader')}</SelectItem>
                          <SelectItem value="admin">{t('admin.role.admin')}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={roleColors[u.role as AppRole]}>
                        {t(`admin.role.${u.role}`)}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
