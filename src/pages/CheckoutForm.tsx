import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";

import './CheckoutForm.scss'

export default function CheckoutForm() {
  const stripe = useStripe();

  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
  
    const stripeReturn = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (stripeReturn.error.type === "card_error" || stripeReturn.error.type === "validation_error") {
      setMessage(stripeReturn.error?.message || "");
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element"  />
      <button disabled={isProcessing || !stripe || !elements} id="submit">
        {isProcessing || !stripe || !elements ? <></> :
          <span id="button-text">
            {isProcessing ? "Processing ... " : "Pay now"}
          </span>
        }

      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}