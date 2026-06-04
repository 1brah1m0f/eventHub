import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';

export function useEvents(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const { data } = await api.get('/events', { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}`);
      return data;
    },
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.post('/events', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.patch(`/events/${eventId}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', eventId] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.delete(`/events/${eventId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useRegisterForEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { role?: string; team_name?: string; team_members?: string[]; invite_code?: string } | undefined) =>
      api.post(`/events/${eventId}/register`, payload || {}).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', eventId] }),
  });
}

export function useAttendees(eventId: string) {
  return useQuery({
    queryKey: ['attendees', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}/attendees`);
      return data;
    },
    enabled: !!eventId,
  });
}

export function useQuestions(eventId: string, filter?: string) {
  return useQuery({
    queryKey: ['questions', eventId, filter],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}/questions`, { params: filter ? { filter } : {} });
      return data;
    },
    enabled: !!eventId,
  });
}

export function usePostQuestion(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.post(`/events/${eventId}/questions`, { content }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', eventId] }),
  });
}

export function useUpvoteQuestion(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => api.post(`/events/${eventId}/questions/${questionId}/upvote`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', eventId] }),
  });
}

export function usePostAnswer(eventId: string, questionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post(`/events/${eventId}/questions/${questionId}/answers`, { content }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', eventId] }),
  });
}
