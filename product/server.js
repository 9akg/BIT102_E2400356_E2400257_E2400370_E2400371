const express = require('express');
const path = require('path');
const Stripe = require('stripe');
const fetch = require('node-fetch'); // For Node versions prior to v18

// Test credentials – replace with your own test keys
const stripe = Stripe('sk_test_BQokikJOvBiI2HlWgH4olfQ2'); // Stripe Test Secret Key
const ESEWA_MERCHANT_CODE = 'TEST_MERCHANT_CODE';          // eSewa Test Merchant Code
const KHALTI_SECRET_KEY = 'test_secret_key_khalti_xxxxxx';   // Khalti Test Secret Key

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint: Create PaymentIntent for Card Payment
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, delivery } = req.body; // amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // Adjust currency as needed
      metadata: {
        fullName: delivery.fullName,
        address: delivery.address,
        city: delivery.city,
        state: delivery.state,
        zip: delivery.zip,
        phone: delivery.phone
      }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Create eSewa Payment URL (Test Mode)
app.post('/create-esewa-payment', async (req, res) => {
  try {
    const { paymentMethod, delivery } = req.body;
    // For demonstration, assume a fixed amount in NPR (e.g., NPR 299.90)
    const amt = 299.90;
    const taxAmt = 0;
    const psc = 0;
    const pdc = 0;
    const tAmt = amt;
    const txnId = 'TXN-' + Math.floor(Math.random() * 1000000);
    const successUrl = encodeURIComponent(`${req.headers.origin}/success.html?order_id=${txnId}`);
    const failureUrl = encodeURIComponent(`${req.headers.origin}/failure.html`);
    const esewaUrl = `https://esewa.com.np/epay/main?amt=${amt}&txAmt=${taxAmt}&psc=${psc}&pdc=${pdc}&tAmt=${tAmt}&pid=${txnId}&scd=${ESEWA_MERCHANT_CODE}&su=${successUrl}&fu=${failureUrl}`;
    res.json({ url: esewaUrl });
  } catch (error) {
    console.error("Error creating eSewa payment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Endpoint: Verify Khalti Payment (Test Mode)
app.post('/verify-khalti-payment', async (req, res) => {
  const payload = req.body;
  const verificationData = {
    token: payload.token,
    amount: payload.amount
  };
  try {
    const response = await fetch('https://khalti.com/api/v2/payment/verify/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Key ' + KHALTI_SECRET_KEY
      },
      body: JSON.stringify(verificationData)
    });
    const data = await response.json();
    if (data.idx) {
      const order_id = 'ORDER-' + Math.floor(Math.random() * 1000000);
      res.json({ success: true, order_id });
    } else {
      res.status(400).json({ success: false, error: "Verification failed", data });
    }
  } catch (error) {
    console.error("Error verifying Khalti payment:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
