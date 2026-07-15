import { useState } from 'react';
import { useMultiplayer, PLAYER_AVATARS } from '../store/multiplayer';
import Logo from './Logo';

export default function LoginScreen() {
  const { register, login, players } = useMultiplayer();

  const [name,     setName]     = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const [mode,     setMode]     = useState<'login' | 'register'>('register');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await (mode === 'register' ? register(name, password) : login(name, password));
    setBusy(false);
    if (!result.ok) setError(result.error ?? 'Unknown error.');
  };

  const switchMode = () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); };

  const loginedPlayer = mode === 'login'
    ? players[name.trim().toLowerCase()]
    : null;

  const portraitSrc = loginedPlayer
    ? loginedPlayer.avatar
    : PLAYER_AVATARS[Object.keys(players).length % PLAYER_AVATARS.length];

  return (
    <div className="login-overlay">
      <div className="login-card">

        <div className="login-portrait">
          <img src={portraitSrc} alt="Hero" key={portraitSrc} />
        </div>

        <div className="login-form-wrap">
          <Logo size="login" />
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Welcome back. Enter your credentials.'
              : 'Choose a name and password to join the journey.'}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Name</label>
              <input
                className="login-input"
                type="text"
                autoComplete="username"
                placeholder="your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-btn" type="submit" disabled={busy}>
              {busy ? '…' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <button className="login-switch" type="button" onClick={switchMode}>
            {mode === 'login'
              ? "No account yet? Register"
              : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
