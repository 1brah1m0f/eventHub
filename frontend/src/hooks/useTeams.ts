import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useMyTeams() {
  return useQuery({
    queryKey: ['teams', 'my'],
    queryFn: () => api.get('/teams/my').then(r => r.data),
  });
}

export function useOpenTeams(enabled = true) {
  return useQuery({
    queryKey: ['teams', 'open'],
    queryFn: () => api.get('/teams/open').then(r => r.data),
    enabled,
  });
}

export function useEventTeams(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['teams', 'event', eventId],
    queryFn: () => api.get(`/teams/event/${eventId}`).then(r => r.data),
    enabled: !!eventId && enabled,
  });
}

export function useMyInvites() {
  return useQuery({
    queryKey: ['teams', 'invites'],
    queryFn: () => api.get('/teams/invites/my').then(r => r.data),
  });
}

export function useJoinRequests(teamId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['teams', teamId, 'join-requests'],
    queryFn: () => api.get(`/teams/${teamId}/join-requests`).then(r => r.data),
    enabled: !!teamId && enabled,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post('/teams', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, email }: { teamId: string; email: string }) =>
      api.post(`/teams/${teamId}/members`, { email }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      api.delete(`/teams/${teamId}/members/${userId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useLeaveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => api.post(`/teams/${teamId}/leave`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => api.delete(`/teams/${teamId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useUpdateTeamSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, join_requests_open }: { teamId: string; join_requests_open: boolean }) =>
      api.patch(`/teams/${teamId}`, { join_requests_open }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
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
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['teams', 'event', eventId] });
      qc.invalidateQueries({ queryKey: ['event', eventId] });
      qc.invalidateQueries({ queryKey: ['attendees', eventId] });
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
      api.patch(`/teams/${teamId}/members/${userId}/role`, { role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => api.post(`/teams/invites/${inviteId}/accept`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useDeclineInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => api.post(`/teams/invites/${inviteId}/decline`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useRequestToJoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, message }: { teamId: string; message?: string }) =>
      api.post(`/teams/${teamId}/join-request`, { message }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useAcceptJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => api.post(`/teams/join-requests/${requestId}/accept`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useDeclineJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => api.post(`/teams/join-requests/${requestId}/decline`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}
