import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList, UserCheck, Clock, CheckCircle, Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  new: '#f97316',
  in_review: '#eab308',
  need_info: '#ef4444',
  confirmed: '#22c55e',
  done: '#3b82f6',
  archived: '#6b7280',
};

const COURSE_COLORS = {
  basic: '#8b5cf6',
  retreat: '#06b6d4',
  few_days: '#f59e0b',
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { userRole, user } = useAuth();

  // Get all registrations with full data for analytics
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['dashboardAnalytics', userRole, user?.id],
    queryFn: async () => {
      let query = supabase.from('registrations').select('*');
      
      if (userRole === 'teacher') {
        query = query.eq('assigned_teacher_user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate stats
  const stats = {
    total: registrations?.length || 0,
    new: registrations?.filter(r => r.status === 'new').length || 0,
    in_review: registrations?.filter(r => r.status === 'in_review').length || 0,
    need_info: registrations?.filter(r => r.status === 'need_info').length || 0,
    confirmed: registrations?.filter(r => r.status === 'confirmed').length || 0,
    done: registrations?.filter(r => r.status === 'done').length || 0,
    archived: registrations?.filter(r => r.status === 'archived').length || 0,
  };

  // Status distribution for pie chart
  const statusData = [
    { name: t('admin.status.new'), value: stats.new, color: STATUS_COLORS.new },
    { name: t('admin.status.inReview'), value: stats.in_review, color: STATUS_COLORS.in_review },
    { name: t('admin.status.needInfo'), value: stats.need_info, color: STATUS_COLORS.need_info },
    { name: t('admin.status.confirmed'), value: stats.confirmed, color: STATUS_COLORS.confirmed },
    { name: t('admin.status.done'), value: stats.done, color: STATUS_COLORS.done },
    { name: t('admin.status.archived'), value: stats.archived, color: STATUS_COLORS.archived },
  ].filter(s => s.value > 0);

  // Course type distribution
  const courseData = [
    { 
      name: t('registration.step4.basicCourse'), 
      value: registrations?.filter(r => r.course_basic).length || 0,
      color: COURSE_COLORS.basic
    },
    { 
      name: t('registration.step4.retreat'), 
      value: registrations?.filter(r => r.course_retreat).length || 0,
      color: COURSE_COLORS.retreat
    },
    { 
      name: t('registration.step4.fewDays'), 
      value: registrations?.filter(r => r.course_few_days).length || 0,
      color: COURSE_COLORS.few_days
    },
  ].filter(s => s.value > 0);

  // Registrations over time (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const registrationsByDay = last30Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = registrations?.filter(r => {
      const regDate = format(new Date(r.created_at), 'yyyy-MM-dd');
      return regDate === dayStr;
    }).length || 0;
    return {
      date: format(day, 'dd.MM', { locale: i18n.language === 'de' ? de : undefined }),
      count,
    };
  });

  // Report language distribution
  const languageData = [
    { name: 'Deutsch', value: registrations?.filter(r => r.report_language === 'de').length || 0 },
    { name: 'English', value: registrations?.filter(r => r.report_language === 'en').length || 0 },
    { name: 'Français', value: registrations?.filter(r => r.report_language === 'fr').length || 0 },
  ].filter(s => s.value > 0);

  // Has basic course experience
  const experienceData = [
    { 
      name: t('common.yes'), 
      value: registrations?.filter(r => r.has_basic_course).length || 0,
      fill: '#22c55e'
    },
    { 
      name: t('common.no'), 
      value: registrations?.filter(r => !r.has_basic_course).length || 0,
      fill: '#ef4444'
    },
  ].filter(s => s.value > 0);

  const statCards = [
    { 
      title: t('admin.totalRegistrations'), 
      value: stats.total, 
      icon: ClipboardList,
      color: 'bg-primary/10 text-primary',
      trend: '+12%'
    },
    { 
      title: t('admin.newRegistrations'), 
      value: stats.new, 
      icon: Clock,
      color: 'bg-orange-500/10 text-orange-600',
      trend: '+5'
    },
    { 
      title: t('admin.pendingReview'), 
      value: stats.in_review + stats.need_info, 
      icon: UserCheck,
      color: 'bg-yellow-500/10 text-yellow-600',
      trend: null
    },
    { 
      title: t('admin.confirmed'), 
      value: stats.confirmed, 
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-600',
      trend: '+8'
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">
          {userRole === 'teacher' ? t('admin.myAssignments') : t('admin.allRegistrations')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              {card.trend && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {card.trend} diese Woche
                </p>
              )}
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/60" />
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Over Time */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Anmeldungen (letzte 30 Tage)
            </CardTitle>
            <CardDescription>Tägliche Entwicklung der neuen Anmeldungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationsByDay}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#colorCount)" 
                    name="Anmeldungen"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Status-Verteilung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Kursarten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" name="Teilnehmer" radius={[0, 4, 4, 0]}>
                    {courseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Report Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌍 Reportsprachen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {languageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#f97316', '#8b5cf6'][index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Vorerfahrung mit Grundkurs</CardTitle>
            <CardDescription>Haben Teilnehmer bereits einen Grundkurs absolviert?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experienceData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" name="Teilnehmer" radius={[4, 4, 0, 0]}>
                    {experienceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Übersicht</CardTitle>
            <CardDescription>Wichtige Kennzahlen auf einen Blick</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Aktive Anmeldungen</span>
                <span className="font-bold text-lg">{stats.total - stats.archived}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Bestätigungsrate</span>
                <span className="font-bold text-lg text-green-600">
                  {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Offene Rückfragen</span>
                <span className="font-bold text-lg text-yellow-600">{stats.need_info}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Abgeschlossen</span>
                <span className="font-bold text-lg text-blue-600">{stats.done}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
