import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth, dashboardPathFor } from '@/lib/auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser, refresh } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || '';
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate('/login');
      return;
    }
    const session_id = match[1];

    (async () => {
      try {
        const { data } = await api.post('/auth/google/session', { session_id });
        setUser(data.user);
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
        navigate(dashboardPathFor(data.user.role), { replace: true, state: { user: data.user } });
      } catch (e) {
        await refresh();
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate, setUser, refresh]);

  return (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <div className="font-mono text-xs tracking-widest opacity-70">AUTHENTICATING · THE MOMENT CLUB</div>
    </div>
  );
}
