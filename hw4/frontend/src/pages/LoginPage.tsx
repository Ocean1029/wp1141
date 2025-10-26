// Login/Register page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css';

export function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">🗺️ TripTimeline Maps</h1>
          <p className="login-subtitle">
            Plan your trip with interactive maps and timeline
          </p>
        </div>

        <div className="login-card">
          <h2 className="login-card-title">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLoginMode ? 'Enter password' : 'At least 8 chars with letter & number'}
                required
                disabled={isSubmitting}
              />
              {!isLoginMode && (
                <p className="form-hint">
                  Password must be at least 8 characters and contain both letters and numbers
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  {isLoginMode ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLoginMode ? 'Log In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="login-footer">
            <button onClick={toggleMode} className="link-btn">
              {isLoginMode
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </button>
          </div>

          {isLoginMode && (
            <div className="demo-credentials">
              <p className="demo-title">Demo Credentials:</p>
              <p className="demo-info">Email: demo@example.com</p>
              <p className="demo-info">Password: Demo1234</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

