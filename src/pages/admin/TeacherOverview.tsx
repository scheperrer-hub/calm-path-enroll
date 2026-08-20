import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeacherOverviewTable } from '@/components/admin/TeacherOverviewTable';
import { TeacherOverviewChangeLog } from '@/components/admin/TeacherOverviewChangeLog';
import {
  COURSE_DEFINITIONS,
  COURSE_KEYS,
  Registration,
  UNASSIGNED_GROUP_ID,
  formatDate,
  getOverviewDays,
  groupByTeacher,
} from '@/utils/teacherOverview';
import { buildOverviewLabels } from '@/utils/teacherOverviewLabels';
import { TEACHERS } from '@/utils/teachers';

export default function TeacherOverview() {
  const { t, i18n } = useTranslation();
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const days = useMemo(() => getOverviewDays(), []);
  // Die Exporte erscheinen in derselben Sprache wie die Oberfläche.
  const labels = useMemo(() => buildOverviewLabels(t, i18n.language), [t, i18n.language]);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registrations', 'teacher-overview', includeArchived],
    queryFn: async (): Promise<Registration[]> => {
      let query = supabase.from('registrations').select('*');
      if (!includeArchived) {
        query = query.neq('status', 'archived');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const groups = useMemo(
    () => groupByTeacher(registrations ?? [], labels.unassigned),
    [registrations, labels.unassigned],
  );

  const visibleGroups = useMemo(
    () => (teacherFilter === 'all' ? groups : groups.filter((group) => group.id === teacherFilter)),
    [groups, teacherFilter],
  );

  const visibleCount = visibleGroups.reduce((total, group) => total + group.registrations.length, 0);

  const handleExport = async (kind: 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      // Die Export-Bibliotheken werden erst beim Klick geladen, damit sie nicht
      // im Haupt-Bundle landen.
      if (kind === 'excel') {
        const { downloadTeacherOverviewExcel } = await import('@/utils/teacherOverviewExcel');
        await downloadTeacherOverviewExcel(visibleGroups, days, labels);
      } else {
        const { downloadTeacherOverviewPdf } = await import('@/utils/teacherOverviewPdf');
        downloadTeacherOverviewPdf(visibleGroups, days, labels);
      }
    } catch (error) {
      console.error(error);
      toast.error(t('admin.teacherOverview.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">
            {t('admin.teacherOverview.title')}
          </h1>
          <p className="text-muted-foreground">
            {days.length > 0 &&
              `${formatDate(days[0], labels)} – ${formatDate(days[days.length - 1], labels)} · `}
            {visibleCount} {t('admin.teacherOverview.students')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('excel')}
            variant="outline"
            className="gap-2"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            {t('admin.teacherOverview.exportExcel')}
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            className="gap-2"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {t('admin.teacherOverview.exportPdf')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.teacherOverview.allTeachers')}</SelectItem>
            {TEACHERS.map((teacher) => (
              <SelectItem key={teacher} value={teacher}>
                {teacher}
              </SelectItem>
            ))}
            <SelectItem value={UNASSIGNED_GROUP_ID}>
              {t('admin.teacherOverview.unassigned')}
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="include-archived"
            checked={includeArchived}
            onCheckedChange={(checked) => setIncludeArchived(checked === true)}
          />
          <Label htmlFor="include-archived" className="cursor-pointer text-sm font-normal">
            {t('admin.teacherOverview.showArchived')}
          </Label>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:ml-auto">
          {COURSE_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="w-4 h-3 rounded-sm"
                style={{ backgroundColor: COURSE_DEFINITIONS[key].color }}
              />
              {labels.courseCodes[key]} = {labels.courseNames[key]}
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : (
        <TeacherOverviewTable groups={visibleGroups} days={days} labels={labels} />
      )}

      <TeacherOverviewChangeLog />

      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
        <Info className="w-3 h-3" />
        {t('admin.teacherOverview.exportHint')}
      </p>
    </div>
  );
}
