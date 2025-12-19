import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type RegistrationStatus = 'new' | 'in_review' | 'need_info' | 'confirmed' | 'done' | 'archived';

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: RegistrationStatus;
  course_basic: boolean;
  course_retreat: boolean;
  course_few_days: boolean;
}

const statusColumns: RegistrationStatus[] = ['new', 'in_review', 'need_info', 'confirmed', 'done', 'archived'];

const statusColors: Record<RegistrationStatus, string> = {
  new: 'bg-blue-500',
  in_review: 'bg-yellow-500',
  need_info: 'bg-orange-500',
  confirmed: 'bg-green-500',
  done: 'bg-emerald-500',
  archived: 'bg-gray-400',
};

export default function Board() {
  const { t } = useTranslation();
  const { userRole, user } = useAuth();
  const queryClient = useQueryClient();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: registrations } = useQuery({
    queryKey: ['registrations', userRole, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('registrations')
        .select('id, first_name, last_name, email, status, course_basic, course_retreat, course_few_days')
        .order('created_at', { ascending: false });

      if (userRole === 'teacher') {
        query = query.eq('assigned_teacher_user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Registration[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RegistrationStatus }) => {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: RegistrationStatus) => {
    e.preventDefault();
    if (draggingId) {
      updateStatus.mutate({ id: draggingId, status });
      setDraggingId(null);
    }
  };

  const getRegistrationsByStatus = (status: RegistrationStatus) => {
    return registrations?.filter((r) => r.status === status) || [];
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground mb-2">{t('admin.board')}</h1>
        <p className="text-muted-foreground">Drag & Drop um den Status zu ändern</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((status) => (
          <div
            key={status}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', statusColors[status])} />
              <h3 className="font-medium text-sm">
                {t(`admin.status.${status.replace('_', '')}`)}
              </h3>
              <Badge variant="secondary" className="ml-auto">
                {getRegistrationsByStatus(status).length}
              </Badge>
            </div>
            
            <div className="space-y-3 min-h-[200px] bg-muted/30 rounded-lg p-3">
              {getRegistrationsByStatus(status).map((reg) => (
                <Card
                  key={reg.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, reg.id)}
                  className={cn(
                    "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
                    draggingId === reg.id && "opacity-50"
                  )}
                >
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {reg.first_name} {reg.last_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {reg.email}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {reg.course_basic && (
                        <Badge variant="outline" className="text-xs">Basis</Badge>
                      )}
                      {reg.course_retreat && (
                        <Badge variant="outline" className="text-xs">Retreat</Badge>
                      )}
                      {reg.course_few_days && (
                        <Badge variant="outline" className="text-xs">Tage</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}