import { useState } from 'react';
import './Auth.scss';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Password reset link sent to: ${email}`);
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      <p>Enter your email to receive a password reset link.</p>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
