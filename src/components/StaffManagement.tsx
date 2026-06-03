'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, X } from 'lucide-react';

interface Props {
  eventId: string;
  staff: Array<{ user_id: string; name: string; email: string; avatar_url?: string }>;
}

export function StaffManagement({ eventId, staff }: Props) {
  const [email, setEmail] = useState('');
  const qc = useQueryClient();

  const invite = useMutation({
    mutationFn: (email: string) => api.post(`/events/${eventId}/staff`, { email }).then(r => r.data),
    onSuccess: () => { toast.success('Staff invited'); setEmail(''); qc.invalidateQueries({ queryKey: ['event', eventId] }); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to invite'),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => api.delete(`/events/${eventId}/staff/${userId}`).then(r => r.data),
    onSuccess: () => { toast.success('Staff removed'); qc.invalidateQueries({ queryKey: ['event', eventId] }); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to remove'),
  });

  return (
    <div className="bg-white border rounded-xl p-5 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Staff Management</h3>

      <div className="flex gap-2 mb-4">
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Invite by email..."
          onKeyDown={e => { if (e.key === 'Enter') invite.mutate(email); }}
          className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button onClick={() => invite.mutate(email)} disabled={invite.isPending || !email}
          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
          <UserPlus size={14} /> Invite
        </button>
      </div>

      {staff.length === 0 ? (
        <p className="text-sm text-gray-400">No staff members yet.</p>
      ) : (
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.user_id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                {s.avatar_url ? (
                  <img src={s.avatar_url} className="w-7 h-7 rounded-full object-cover" alt={s.name} />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                    {s.name[0]}
                  </div>
                )}
                <span className="text-sm">{s.name}</span>
                <span className="text-xs text-gray-400">{s.email}</span>
              </div>
              <button onClick={() => remove.mutate(s.user_id)} className="text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
