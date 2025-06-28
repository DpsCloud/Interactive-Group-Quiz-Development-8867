import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function AuthWrapper({ children, requireAdmin = false }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/login');
        return;
      }

      if (requireAdmin) {
        // Verificação simplificada - considerar implementar lógica de admin mais robusta
        if (!user.email?.endsWith('@admin.com')) {
          navigate('/');
        }
      }
    };

    checkAuth();
  }, [navigate, requireAdmin]);

  return children;
}