'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQuestions, usePostQuestion, useUpvoteQuestion, usePostAnswer } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ChevronUp, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Props {
  eventId: string;
  eventRole: string;
}

export function QASection({ eventId, eventRole }: Props) {
  const [filter, setFilter] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});

  const { data: questions, isLoading } = useQuestions(eventId, filter);
  const postQuestion = usePostQuestion(eventId);
  const upvote = useUpvoteQuestion(eventId);
  const { user } = useAuthStore();

  const canAsk = user && ['owner', 'staff', 'attendee'].includes(eventRole);
  const canAnswer = ['owner', 'staff'].includes(eventRole);

  const handlePostQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      await postQuestion.mutateAsync(newQuestion.trim());
      setNewQuestion('');
      toast.success('Question posted!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to post question');
    }
  };

  const handleUpvote = async (questionId: string) => {
    if (!user) { toast.error('Login to upvote'); return; }
    await upvote.mutateAsync(questionId);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Q&amp;A</h2>

      <div className="flex gap-2 mb-4">
        {['', 'answered', 'unanswered'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              filter === f ? 'bg-blue-800 text-white border-blue-800' : 'hover:bg-gray-50'
            }`}>
            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {canAsk && (
        <div className="flex gap-2 mb-6">
          <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handlePostQuestion(); }}
            placeholder="Ask a question..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          <button onClick={handlePostQuestion} disabled={postQuestion.isPending}
            className="bg-blue-800 text-white px-3 py-2 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors">
            <Send size={16} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : questions?.length === 0 ? (
        <p className="text-gray-500 text-sm">No questions yet.</p>
      ) : (
        <div className="space-y-3">
          {questions?.map((q: any) => (
            <QuestionItem key={q.question_id} question={q} canAnswer={canAnswer} eventId={eventId}
              isExpanded={expandedQuestion === q.question_id}
              onToggle={() => setExpandedQuestion(expandedQuestion === q.question_id ? null : q.question_id)}
              onUpvote={() => handleUpvote(q.question_id)}
              answerText={answerTexts[q.question_id] || ''}
              onAnswerChange={(val: string) => setAnswerTexts(prev => ({ ...prev, [q.question_id]: val }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionItem({ question, canAnswer, eventId, isExpanded, onToggle, onUpvote, answerText, onAnswerChange }: any) {
  const postAnswer = usePostAnswer(eventId, question.question_id);

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    try {
      await postAnswer.mutateAsync(answerText.trim());
      onAnswerChange('');
      toast.success('Answer posted!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to post answer');
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex gap-3">
        <button onClick={onUpvote}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-blue-700 transition-colors min-w-[32px]">
          <ChevronUp size={16} />
          <span className="text-xs font-medium">{question.upvotes}</span>
        </button>
        <div className="flex-1">
          <p className="text-gray-900 text-sm">{question.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{question.asker_name} · {format(new Date(question.created_at), 'MMM d')}</span>
            {question.is_answered && <span className="text-xs text-green-600 font-medium">Answered</span>}
            <button onClick={onToggle} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-700 transition-colors">
              <MessageSquare size={12} /> {question.answer_count} answers
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pl-10">
          <AnswerList questionId={question.question_id} eventId={eventId} />
          {canAnswer && (
            <div className="flex gap-2 mt-3">
              <input value={answerText} onChange={e => onAnswerChange(e.target.value)}
                placeholder="Write an answer..."
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
              <button onClick={handleAnswer} disabled={postAnswer.isPending}
                className="bg-blue-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-900 disabled:opacity-50 transition-colors">
                Answer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnswerList({ questionId, eventId }: { questionId: string; eventId: string }) {
  const { data: answers } = useQuery({
    queryKey: ['answers', questionId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}/questions/${questionId}/answers`);
      return data;
    },
  });

  if (!answers?.length) return <p className="text-xs text-gray-400">No answers yet.</p>;

  return (
    <div className="space-y-2">
      {answers.map((a: any) => (
        <div key={a.answer_id} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-sm text-gray-800">{a.content}</p>
          <p className="text-xs text-gray-500 mt-1">{a.answerer_name} · {format(new Date(a.created_at), 'MMM d')}</p>
        </div>
      ))}
    </div>
  );
}
