import { Elements } from "@stripe/react-stripe-js";

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import { getRequest, postRequest } from "../utils/api";


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// const stripePromise = loadStripe('pk_test_51QBPgCCLU8SJtxVAAKrfqmUccC92ceL5aZtYvLhD5Sbz8PzOs7DqmDZbGWix6Ny8w5h4qCU9LlSiI4lvqwrQo9G400URRM2hDA');

const Payment = ({ email }: { email: string }) => {
  // const handlePayment = () => {
  //   // ✅ Simulate successful payment
  //   localStorage.setItem("isPaid", "true");
  //   alert("Payment successful! Thank you for your support.");
  //   window.location.href = "/";
  // };
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState("");

  const [error, setError] = useState('');


  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const { publishableKey } = await getRequest<{ publishableKey: string | null }>(
          '/config'
        );

        if (publishableKey) {
          const stripeInstance = await loadStripe(publishableKey);
          if (stripeInstance !== null)
            setStripePromise(stripeInstance);

        }
      } catch (error) {
        setError('Stripe failed to load. Please email me at ExpanseInvestments@gmail.com for access')
        console.error("Error loading Stripe:", error);
      }
    };

    fetchStripeKey();
  }, []);

  useEffect(() => {
    const handleCreatePaymentIntent = async () => {
      try {
        const { clientSecret } = await postRequest<{ clientSecret: string | null }>(
          '/create-payment-intent', { email: email }
        );

        if (clientSecret) {
          setClientSecret(clientSecret);
        }
      } catch (error) {
        console.error('❌ Registration error:', error);
        alert('Failed to create stripe payment intent');
      }
    };

    handleCreatePaymentIntent();

  }, []);

  return (
    <>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}


    </>
  );
};

export default Payment;