import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
  role?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['auth'],
    queryFn: async (): Promise<AuthUser | null> => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const userRole = user.user_metadata?.role || 'user';
      const isAdmin = userRole === 'admin';

      return {
        id: user.id,
        email: user.email || '',
        isAdmin,
        role: userRole,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
  });
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
