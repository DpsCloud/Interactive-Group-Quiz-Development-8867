import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';
import AuthWrapper from '../components/AuthWrapper';

export default function AdminDashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('owner_id', user.id);

      if (error) console.error(error);
      else setQuizzes(data || []);

      setLoading(false);
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Tem certeza que deseja excluir este quiz?')) return;

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) {
      console.error(error);
      alert('Erro ao excluir quiz');
    } else {
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Quizzes</h1>
        <Link
          to="/create-quiz"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Criar Novo Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p>Você ainda não criou nenhum quiz.</p>
      ) : (
        <div className="grid gap-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="border p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                <div className="flex gap-2">
                  <Link
                    to={`/edit-quiz/${quiz.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ProtectedAdminDashboard = () => (
  <AuthWrapper>
    <AdminDashboardPage />
  </AuthWrapper>
);