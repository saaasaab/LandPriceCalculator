import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

import './CheckoutForm.scss'

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    
    const stripeReturn = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (stripeReturn.error?.type === "card_error" || stripeReturn.error?.type === "validation_error") {
      setMessage(stripeReturn.error?.message || "");
    } else if (stripeReturn.error) {
      setMessage("An unexpected error occured.");
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement
        id="payment-element"
        options={{
          wallets: {
            link: 'never',
          },
        }}
      />
      <button disabled={isProcessing || !stripe || !elements} id="submit" className="btn">
        <span id="button-text">
          {isProcessing ? "Processing..." : "Pay now"}
        </span>
      </button>
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
