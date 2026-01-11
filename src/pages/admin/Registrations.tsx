import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { buildRegistrationCsv, downloadCsv } from '@/utils/registrationCsv';

type RegistrationStatus = 'new' | 'in_review' | 'need_info' | 'confirmed' | 'done' | 'archived';

const statusColors: Record<RegistrationStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  need_info: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-green-100 text-green-800',
  done: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-gray-100 text-gray-600',
};

export default function Registrations() {
  const { t, i18n } = useTranslation();
  const { userRole, user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations', userRole, user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (userRole === 'teacher') {
        query = query.eq('assigned_teacher_user_id', user?.id);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as RegistrationStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredRegistrations = registrations?.filter((reg) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      reg.first_name.toLowerCase().includes(searchLower) ||
      reg.last_name.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower)
    );
  });

  const exportCSV = () => {
    if (!filteredRegistrations) return;
    
    const csv = buildRegistrationCsv(filteredRegistrations);
    downloadCsv(csv, 'anmeldungen.csv');
  };

  const dateLocale = i18n.language === 'de' ? de : enUS;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">{t('admin.registrations')}</h1>
          <p className="text-muted-foreground">{filteredRegistrations?.length || 0} Einträge</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('admin.exportCsv')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="new">{t('admin.status.new')}</SelectItem>
            <SelectItem value="in_review">{t('admin.status.inReview')}</SelectItem>
            <SelectItem value="need_info">{t('admin.status.needInfo')}</SelectItem>
            <SelectItem value="confirmed">{t('admin.status.confirmed')}</SelectItem>
            <SelectItem value="done">{t('admin.status.done')}</SelectItem>
            <SelectItem value="archived">{t('admin.status.archived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-10 bg-background">Name</TableHead>
              <TableHead className="sticky top-0 z-10 hidden bg-background md:table-cell">E-Mail</TableHead>
              <TableHead className="sticky top-0 z-10 hidden bg-background lg:table-cell">Kurs</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background">Status</TableHead>
              <TableHead className="sticky top-0 z-10 hidden bg-background sm:table-cell">Datum</TableHead>
              <TableHead className="sticky top-0 z-10 bg-background"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : filteredRegistrations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Keine Anmeldungen gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations?.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">
                    {reg.first_name} {reg.last_name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {reg.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {reg.course_basic && <Badge variant="outline">Basis</Badge>}
                      {reg.course_retreat && <Badge variant="outline">Retreat</Badge>}
                      {reg.course_few_days && <Badge variant="outline">Tage</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[reg.status as RegistrationStatus]}>
                      {t(`admin.status.${reg.status.replace('_', '')}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {format(new Date(reg.created_at), 'dd.MM.yyyy', { locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    <Link to={`/app/anmeldungen/${reg.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
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
