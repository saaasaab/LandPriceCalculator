import Register from "../components/Auth/Register";

const Payment = () => {
    // const handlePayment = () => {
    //   // ✅ Simulate successful payment
    //   localStorage.setItem("isPaid", "true");
    //   alert("Payment successful! Thank you for your support.");
    //   window.location.href = "/";
    // };


  
    return (
      <div>
        <h2>Pay Login or Signup for Continued Access</h2>
        <p>Your 7-day trial has ended. Please login or create an account to continue</p>
        <Register/>
      </div>
    );
  };
  
  export default Payment;