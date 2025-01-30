import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postRequest } from '../../utils/api';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await postRequest<{ token: string; user: { email: string } }>(
        'http://localhost:8080/login', 
        { email, password }
      );

      console.log('✅ Logged in:', data);
      alert('Welcome back!');
    } catch (error) {
      alert('Failed to log in. Please check your credentials.');
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
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Enter your password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>

      <div className="auth-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Create an Account</Link>
      </div>
    </div>
  );
};

export default Login;