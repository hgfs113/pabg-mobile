import { useState } from 'react';
import { useMultiplayer, PLAYER_AVATARS } from '../store/multiplayer';
import Logo from './Logo';

export default function LoginScreen() {
  const { register, login, players } = useMultiplayer();

  const noPlayers = Object.keys(players).length === 0;

  const [name,     setName]     = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [mode,     setMode]     = useState<'login' | 'register'>(noPlayers ? 'register' : 'login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = mode === 'register' ? register(name, password) : login(name, password);
    if (!result.ok) setError(result.error ?? 'Unknown error.');
  };

  const switchMode = () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); };

  // Portrait to show:
  // - Login mode: look up avatar of existing player by name
  // - Register mode: show the next available avatar
  const loginedPlayer = mode === 'login'
    ? players[name.trim().toLowerCase()]
    : null;

  const portraitSrc = loginedPlayer
    ? loginedPlayer.avatar
    : PLAYER_AVATARS[Object.keys(players).length % PLAYER_AVATARS.length];

  return (
    <div className="login-overlay">
      <div className="login-card">

        {/* Hero portrait — changes based on typed name */}
        <div className="login-portrait">
          <img src={portraitSrc} alt="Hero" key={portraitSrc} />
        </div>

        {/* Form side */}
        <div className="login-form-wrap">
          <Logo size="login" />
          <p className="login-subtitle">
            {noPlayers
              ? 'Create your account to begin the journey.'
              : mode === 'login'
              ? 'Welcome back. Enter your credentials.'
              : 'Choose a name and password to join.'}
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

            <button className="login-btn" type="submit">
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!noPlayers && (
            <button className="login-switch" type="button" onClick={switchMode}>
              {mode === 'login'
                ? "No account yet? Register"
                : 'Already registered? Sign in'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
