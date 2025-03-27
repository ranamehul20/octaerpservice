// PaymentComponent.js
import React from "react";

const PaymentComponent = () => {
  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay script. Please try again.");
      return;
    }

    const options = {
      key: "rzp_test_Ccj46pwLtMhcdD", // Replace with your Razorpay key ID
      amount: 20000, // Amount in paise (e.g., 50000 paise = INR 500)
      currency: "INR",
      name: "urjaanagar",
      description: "Test Transaction",
      image: "", // Optional company logo
      order_id: "order_PhODjSQAIIXlep", // Order ID from your backend
      handler: function (response) {
        console.log(`pssfdsfdd ${response}`);
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        // Call your backend to validate the payment
      },
      prefill: {
        name: "John Doe",
        email: "johndoe@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <div>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default PaymentComponent;
