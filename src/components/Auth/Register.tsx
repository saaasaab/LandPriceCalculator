import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import './Auth.scss';


const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const { data } = await axios.post('http://localhost:8080/register', {
        email,
        password,
      });
  
      console.log('✅ Account created:', data);
      alert('Account created successfully! Please log in.');
    } catch (error) {
      console.error('❌ Registration error:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create an Account</h2>
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
        <button type="submit">Sign Up</button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Register;
