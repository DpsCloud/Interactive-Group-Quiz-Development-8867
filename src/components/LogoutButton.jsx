import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
    } else {
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
    >
      Sair
    </button>
  );
}