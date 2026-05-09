import { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Trash2, Loader2, Clock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    // Admin needs to see all comments including unapproved
    // We use service role key via RPC or direct query
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching comments:', error.message);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) {
      console.error('[v0] Error approving comment:', error.message);
    } else {
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c));
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_approved: false })
      .eq('id', id);

    if (error) {
      console.error('[v0] Error rejecting comment:', error.message);
    } else {
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: false } : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este comentario?')) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[v0] Error deleting comment:', error.message);
    } else {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredComments = comments.filter(c => {
    if (filter === 'pending') return !c.is_approved;
    if (filter === 'approved') return c.is_approved;
    return true;
  });

  const pendingCount = comments.filter(c => !c.is_approved).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Comentarios</h1>
            <p className="text-xs text-gray-500">Moderar comentarios dos utilizadores</p>
          </div>
        </div>
      </header>

      {/* Stats and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === 'approved'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            Aprovados
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === 'all'
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            Todos ({comments.length})
          </button>
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="bg-[#0d121b] border border-white/5 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 opacity-20">
            <MessageSquare className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sem comentarios</h3>
          <p className="text-sm text-gray-500">
            {filter === 'pending' ? 'Nao ha comentarios pendentes de aprovacao.' : 'Nenhum comentario encontrado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-[#0d121b] border rounded-2xl p-5 transition-colors ${
                comment.is_approved ? 'border-green-500/20' : 'border-yellow-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{comment.author_name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                    <span
                      className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        comment.is_approved
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {comment.is_approved ? 'Aprovado' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed pl-11">
                    {comment.content}
                  </p>
                </div>

                <div className="flex gap-2 sm:shrink-0 pl-11 sm:pl-0">
                  {!comment.is_approved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Aprovar
                    </button>
                  )}
                  {comment.is_approved && (
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-2 rounded-lg text-xs font-bold hover:bg-yellow-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Ocultar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
