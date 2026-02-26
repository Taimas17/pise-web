import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiService } from '@/services/api.service';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/services/types';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMe() {
  const setUser = useAuthStore(s => s.setUser);
  const query = useQuery<User | null>({
    queryKey: authKeys.me,
    queryFn: () => apiService.auth.me().catch(() => null),
    staleTime: 1000 * 60 * 5,
  });
  useEffect(() => {
    if (query.data !== undefined) setUser(query.data);
  }, [query.data, setUser]);
  return query;
}

export function useLogin() {
  const setUser = useAuthStore(s => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) => apiService.auth.login(payload),
    onSuccess(user) {
      setUser(user);
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore(s => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; phone?: string }) => apiService.auth.register(payload),
    onSuccess(user) {
      setUser(user);
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore(s => s.logout);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiService.auth.logout(),
    onSuccess() {
      logout();
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}
