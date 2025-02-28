import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth, User } from '../../context/AuthContext';
import { postRequest } from '../../utils/api';
import { getAppDefaultUrl } from '../../Routes';
import './Auth.scss';
import { routes } from '../Navbar';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            const data = await postRequest<{ token: string; user:User }>(
                '/register',
                { email, password }
            );
            
            login({ email: data.user.email, token: data.token, is_paid: data.user.is_paid });

            const isLocal = window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost");

            const targetUrl = getAppDefaultUrl(isLocal)
            
            window.location.href = targetUrl;

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

            <p>Already have an account? <Link to={routes.LOGIN}>Login</Link></p>
        </div>
    );
};

export default Register;
