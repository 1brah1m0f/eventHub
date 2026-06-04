import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useMyEvents() {
  return useQuery({
    queryKey: ['my-events'],
    queryFn: () => api.get('/auth/me/events').then(r => r.data),
  });
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.get('/auth/me/registrations').then(r => r.data),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; bio?: string; skills?: string[]; linkedin_url?: string }) =>
      api.patch('/auth/me', data).then(r => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['me'] });
      return updated;
    },
  });
}
