import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, User } from "../context/AuthContext";
import { postRequest } from "../utils/api";

function Completion() {

  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');


  const [hasRun, setHasRun] = useState(false);


  useEffect(() => {

    if (hasRun) return;
    if (!user) {
      return; // Prevent running logic until user is loaded
    }
    setHasRun(true)

    const handleComplete = async () => {
      try {

        const data = await postRequest<{ token: string; user: User }>(
          '/set-payment-status-to-true',
          { email: user.email }
        );

        if(data){
          login({ email: data.user.email, token: data.token, is_paid: data.user.is_paid }); // Save user data
        }
        // Should redirect to the one they were trying to get to.

        navigate('/');

      } catch (error: any) {
        console.warn('❌ Registration error:', error);

        if (error.response?.status === 400) {
          setErrorMessage('An account with this email already exists. Please use a different email or log in instead.');
        } else {
          setErrorMessage('Failed to create account. Please try again.');
        }
      }
    };

    handleComplete();
  }, [user]);

  return <>
    <h1>Thank you! 🎉</h1>

    {/*  */}

    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}


  </>
    ;
}

export default Completion;