import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postRequest } from '../../utils/api';
import { PROJECT_NAME } from '../../utils/constants';
import { routes } from '../Navbar';
import './Auth.scss';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await postRequest<{ success: boolean; message: string }>(
        '/land-price-calculator/forgot-password',
        { email, projectName: PROJECT_NAME },
      );
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again in a minute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <h2>Check your inbox</h2>
        <p className="auth-success">
          If <strong>{email}</strong> is registered, we sent a reset link. It expires in 1 hour.
        </p>
        <div className="auth-links">
          <Link to={routes.LOGIN}>Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Forgot your password?</h2>
      <p>Enter your email and we'll send you a link to reset it.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          className={error ? 'has-error' : ''}
          required
        />

        {error ? (
          <p className="auth-error" role="alert">{error}</p>
        ) : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <div className="auth-links">
        <Link to={routes.LOGIN}>Back to login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
