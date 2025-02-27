import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getAppDefaultUrl } from '../../Routes';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Use custom hook


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {


      const data = await postRequest<{ token: string; user: { email: string } }>(
        '/login',
        { email, password }
      );


      login({ email: data.user.email, token: data.token }); // Save user data

        
      const isLocal = window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost");

      const targetUrl = getAppDefaultUrl(isLocal)
      window.location.href = targetUrl;

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
        {/* <Link to="/forgot-password">Forgot Password?</Link> */}
        <Link to="/register">Create an Account</Link>
      </div>
    </div>
  );
};

export default Login;