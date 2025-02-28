import { useState } from 'react';
import './Pricing.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, User } from '../context/AuthContext';
import Payment from './Payment';
import { postRequest } from '../utils/api';
import { routes } from '../components/Navbar';

export const plans = [
    {
        link: '********',
        priceId: '********',
        price: 20,
        duration: '/Lifetime'
    },
    // {
    //     link: '********',
    //     priceId: '********',
    //     price: 99,
    //     duration: '/year'
    // }
];

const Pricing = () => {

    const { login } = useAuth();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');


    const [showPaymentForm, setShowPaymentForm] = useState(false);


    const [plan, _setPlan] = useState(plans[0]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            const data = await postRequest<{ message: string, token: string; user: User }>(
                '/register',
                { email, password }
            );

            if (data.message) {
               

                // User may already exist, so try logging them in
                const loginData = await postRequest<{ token: string; user: { email: string, is_paid: boolean } }>(
                    '/login',
                    { email, password }
                );




                if(loginData.user.is_paid){
                    alert("You've already paid, logging you in now.")
                    setErrorMessage('');
                    login({ email: loginData.user.email, token: loginData.token, is_paid: loginData.user.is_paid });
                    navigate('/')
                    return
                }
                else if (loginData.user.email && loginData.token && loginData.user.is_paid === false) {
                    login({ email: loginData.user.email, token: loginData.token, is_paid: loginData.user.is_paid });
                    setErrorMessage('');
                    setShowPaymentForm(true);
                    return
                }

                else{
                    setErrorMessage('error logging someone in')
                    return
                }

            }

            if (data.user?.email && data?.token) {
                login({ email: data.user.email, token: data.token, is_paid: data.user.is_paid });
                setErrorMessage('');
                setShowPaymentForm(true);
                return
            }
        } catch (error: any) {
            console.error('❌ Registration error:', error);
        }
    };





    return (
        <section id="pricing" className="pricing-section">
            <div className="container">
                <div className="header">
                    <h2 className="title">Lifetime access</h2>
                    <div className="subtitle">to advanced real estate tools</div>
                </div>

                <div className="pricing-content">
                    <div className="pricing-card">
                        {/* <div className="pricing-options">
                            <div className="option" onClick={() => setPlan(plans[0])}>
                                <input
                                    type="radio"
                                    name="pricing"
                                    className="radio"
                                    checked={plan.price === 19}
                                />
                                <span>Pay monthly</span>
                            </div>
                            <div className="option" onClick={() => setPlan(plans[1])}>
                                <input
                                    type="radio"
                                    name="pricing"
                                    className="radio"
                                    checked={plan.price === 99}
                                />
                                <span>Pay yearly (60% OFF 💰)</span>
                            </div>
                        </div> */}

                        <div className="price-display">
                            <p className="price">${plan.price}</p>
                            <div className="duration">{plan.duration}</div>
                        </div>

                        {!showPaymentForm ?
                            <ul className="features-list">
                                {[
                                    "Land Analysis & Zoning Insights",
                                    "Automated Site Plan Generation",
                                    "Financial Projections & ROI Analysis",
                                    "Multi-Family & Commercial Development Tools",
                                    "Investor Returns Modeling",
                                    "Construction Budget Generator",
                                    // "Lending & Financing Calculator – Compare financing options, loan terms, and interest impact.
                                    // "Comparable Sales & Market Data – Pull recent sales and rental comps to validate pricing.
                                    "Profitability & Offer Price Calculator",
                                    // "Interactive Mapping & Parcel Data – Explore properties with GIS overlays and ownership details.
                                    // "Risk Assessment & Sensitivity Analysis – Test different scenarios to optimize development strategy.
                                    // "Seamless Integrations 


                                  
                                ].map((feature, i) => (
                                    <li key={i} className="feature-item">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="icon"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul> : <></>}

                        {!showPaymentForm ? (
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
                                    placeholder="Choose a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <div className="subscribe-button">
                                    <button type="submit" className="btn btn-primary" >
                                        Access
                                    </button>
                                </div>

                            </form>) : <Payment email={email}/>}
                    </div>
                </div>
            </div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <p>Already have an account? <Link to={routes.LOGIN}>Login</Link></p>
        </section>
    );
};

export default Pricing;