import { Elements } from "@stripe/react-stripe-js";

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import { getRequest, postRequest } from "../utils/api";
import { PROJECT_NAME } from "../utils/constants";
import { plans } from "./Pricing";
import './Payment.scss';


// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// const stripePromise = loadStripe('pk_test_51QBPgCCLU8SJtxVAAKrfqmUccC92ceL5aZtYvLhD5Sbz8PzOs7DqmDZbGWix6Ny8w5h4qCU9LlSiI4lvqwrQo9G400URRM2hDA');

const Payment = ({ email, showPageLayout = false }: { email: string; showPageLayout?: boolean }) => {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState('');

  const projectName = PROJECT_NAME;
  const plan = plans[0];

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const { publishableKey } = await getRequest<{ publishableKey: string | null }>(
          '/land-price-calculator/config'
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
          '/land-price-calculator/create-payment-intent', { email: email, projectName }
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

  }, [email]);

  const paymentContent = (
    <>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}

      {error && <p className="payment-page__error">{error}</p>}
    </>
  );

  if (!showPageLayout) {
    return paymentContent;
  }

  return (
    <section className="payment-page">
      <div className="payment-page__header">
        <div className="header-copy">
          <h2 className="title">Lifetime access</h2>
          <p className="subtitle">Complete your purchase</p>
        </div>
        <div className="price-display">
          <span className="price">${plan.price}</span>
          <span className="duration">{plan.duration}</span>
        </div>
      </div>
      {paymentContent}
    </section>
  );
};

export default Payment;
