import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useMyTeams() {
  return useQuery({
    queryKey: ['teams', 'my'],
    queryFn: () => api.get('/teams/my').then(r => r.data),
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post('/teams', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', 'my'] }),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
      api.post(`/teams/${teamId}/members`, { email }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', 'my'] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      api.delete(`/teams/${teamId}/members/${userId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', 'my'] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => api.delete(`/teams/${teamId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', 'my'] }),
  });
}

export function useAvailableHackathons(enabled: boolean) {
  return useQuery({
    queryKey: ['hackathons', 'available'],
    queryFn: () => api.get('/teams/hackathons').then(r => r.data),
    enabled,
  });
}

export function useRegisterTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, eventId }: { teamId: string; eventId: string }) =>
      api.post(`/teams/${teamId}/register/${eventId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams', 'my'] }),
  });
}
