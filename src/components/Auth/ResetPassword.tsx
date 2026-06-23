import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { postRequest } from '../../utils/api';
import { routes } from '../Navbar';
import './Auth.scss';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is invalid.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await postRequest<{ success: boolean; message: string }>(
        `/land-price-calculator/reset-password/${token}`,
        { password },
      );
      navigate(routes.LOGIN);
    } catch {
      setError('This reset link is invalid or has expired. Request a new one.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Pick a new password</h2>
      <p>Make it something you'll remember this time.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          className={error ? 'has-error' : ''}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          className={error ? 'has-error' : ''}
          required
        />

        {error ? (
          <p className="auth-error" role="alert">
            {error}{' '}
            <Link to={routes.FORGOT_PASSWORD}>Request a new link</Link>
          </p>
        ) : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Update password'}
        </button>
      </form>

      <div className="auth-links">
        <Link to={routes.LOGIN}>Back to login</Link>
      </div>
    </div>
  );
};

export default ResetPassword;
