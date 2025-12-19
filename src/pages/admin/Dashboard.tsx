import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, UserCheck, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { userRole, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['registrationStats', userRole, user?.id],
    queryFn: async () => {
      let query = supabase.from('registrations').select('status', { count: 'exact' });
      
      if (userRole === 'teacher') {
        query = query.eq('assigned_teacher_user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const statusCounts = {
        new: 0,
        in_review: 0,
        need_info: 0,
        confirmed: 0,
        done: 0,
        archived: 0,
        total: data?.length || 0,
      };

      data?.forEach((row) => {
        if (row.status in statusCounts) {
          statusCounts[row.status as keyof typeof statusCounts]++;
        }
      });

      return statusCounts;
    },
  });

  const statCards = [
    { 
      title: t('admin.totalRegistrations'), 
      value: stats?.total || 0, 
      icon: ClipboardList,
      color: 'bg-blue-500/10 text-blue-600'
    },
    { 
      title: t('admin.newRegistrations'), 
      value: stats?.new || 0, 
      icon: Clock,
      color: 'bg-warm-orange/10 text-warm-orange'
    },
    { 
      title: t('admin.pendingReview'), 
      value: (stats?.in_review || 0) + (stats?.need_info || 0), 
      icon: UserCheck,
      color: 'bg-yellow-500/10 text-yellow-600'
    },
    { 
      title: t('admin.confirmed'), 
      value: stats?.confirmed || 0, 
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-600'
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-2">{t('admin.dashboard')}</h1>
        <p className="text-muted-foreground">
          {userRole === 'teacher' ? t('admin.myAssignments') : t('admin.allRegistrations')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i}>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}