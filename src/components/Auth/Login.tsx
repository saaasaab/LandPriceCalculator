import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getAppDefaultUrl } from '../../Routes';
import { routes } from '../Navbar';
import { PROJECT_NAME } from '../../utils/constants';
import './Auth.scss';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const { login } = useAuth();
  const projectName = PROJECT_NAME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);

    try {
      const data = await postRequest<{
        token: string;
        user: {
          email: string;
          is_paid: boolean;
          days_since_first_login?: number;
          free_access_expired?: boolean;
          first_logged_in?: string | null;
        };
      }>(
        '/land-price-calculator/login',
        { email, password, projectName }
      );

      login({
        email: data.user.email,
        token: data.token,
        is_paid: data.user.is_paid,
        days_since_first_login: data.user.days_since_first_login,
        free_access_expired: data.user.free_access_expired,
        first_logged_in: data.user.first_logged_in,
      });

      if (data.user.free_access_expired && !data.user.is_paid) {
        window.location.href = routes.END_FREE_TRIAL;
        return;
      }

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname.endsWith('.localhost');
      const targetUrl = getAppDefaultUrl(isLocal);
      window.location.href = targetUrl;
    } catch {
      setLoginError(true);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLoginError(false);
          }}
          className={loginError ? 'has-error' : ''}
          aria-invalid={loginError}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setLoginError(false);
          }}
          className={loginError ? 'has-error' : ''}
          aria-invalid={loginError}
          required
        />

        {loginError ? (
          <p className="auth-error" role="alert">
            Invalid email or password.{' '}
            <Link to={routes.SIGN_UP}>Create an account</Link>
          </p>
        ) : null}

        <button type="submit">Login</button>
      </form>

      <div className="auth-links">
        <Link to={routes.FORGOT_PASSWORD}>Forgot password?</Link>
        <Link to={routes.SIGN_UP}>Create an Account</Link>
      </div>
    </div>
  );
};

export default Login;
