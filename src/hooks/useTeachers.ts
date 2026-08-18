import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Teacher = {
  userId: string;
  name: string;
};

/**
 * Alle Benutzer, denen Anmeldungen zugewiesen werden können, alphabetisch sortiert.
 * Benutzer mit mehreren Rollen erscheinen nur einmal.
 */
export const useTeachers = (enabled = true) =>
  useQuery({
    queryKey: ['teachers'],
    queryFn: async (): Promise<Teacher[]> => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['teacher', 'leader', 'admin']);
      if (error) throw error;

      const userIds = [...new Set(roles.map((role) => role.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const profilesByUserId = new Map(profiles?.map((profile) => [profile.user_id, profile]) ?? []);

      return userIds
        .map((userId) => {
          const profile = profilesByUserId.get(userId);
          return { userId, name: profile?.display_name || profile?.email || userId };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'de'));
    },
    enabled,
  });
