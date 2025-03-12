document.addEventListener("DOMContentLoaded", () => {
  // --- TAB SWITCHING ---
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((tc) => tc.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // --- Load Order Summary Based on Query Parameter ---
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');  // "cart" or "buy"
  
  if (type === 'cart') {
    // Load entire cart from localStorage (assume cart is an array)
    const cartData = JSON.parse(localStorage.getItem('cart'));
    if (cartData && cartData.length > 0) {
      const orderSummaryContainer = document.getElementById('order-summary');
      orderSummaryContainer.innerHTML = '<h2>Order Summary</h2>';
      let total = 0;
      cartData.forEach(item => {
         total += item.price * item.quantity;
         const orderItem = document.createElement('div');
         orderItem.className = 'order-item';
         orderItem.innerHTML = `
           <img src="${item.image}" alt="Product Image">
           <div class="item-details">
             <h3>${item.name}</h3>
             <p>Quantity: ${item.quantity}</p>
             <p>Price: $${item.price.toFixed(2)}</p>
           </div>
         `;
         orderSummaryContainer.appendChild(orderItem);
      });
      const orderTotalDiv = document.createElement('div');
      orderTotalDiv.className = 'order-total';
      orderTotalDiv.innerHTML = `<p>Total: $${total.toFixed(2)}</p>`;
      orderSummaryContainer.appendChild(orderTotalDiv);
      
      // Also update Khalti and eSewa summary sections
      document.getElementById('khalti-order-summary').innerHTML = orderSummaryContainer.innerHTML;
      document.getElementById('esewa-order-summary').innerHTML = orderSummaryContainer.innerHTML;
    }
  } else {
    // Else, load single product from localStorage (for "buy" button)
    const orderData = localStorage.getItem("order");
    if (orderData) {
      const order = JSON.parse(orderData);
      const quantity = order.quantity || 1;
      const total = parseFloat(order.price) * quantity;
      // Update Card tab
      document.getElementById("order-image").src = order.image || "https://via.placeholder.com/100";
      document.getElementById("order-name").textContent = order.name || "Product Name";
      document.getElementById("order-quantity").textContent = "Quantity: " + quantity;
      document.getElementById("order-price").textContent = "Price: $" + parseFloat(order.price).toFixed(2);
      document.getElementById("order-total").textContent = "Total: $" + total.toFixed(2);
      // Update Khalti tab
      document.getElementById("khalti-order-image").src = order.image || "https://via.placeholder.com/100";
      document.getElementById("khalti-order-name").textContent = order.name || "Product Name";
      document.getElementById("khalti-order-quantity").textContent = "Quantity: " + quantity;
      document.getElementById("khalti-order-price").textContent = "Price: $" + parseFloat(order.price).toFixed(2);
      document.getElementById("khalti-order-total").textContent = "Total: $" + total.toFixed(2);
      // Update eSewa tab
      document.getElementById("esewa-order-image").src = order.image || "https://via.placeholder.com/100";
      document.getElementById("esewa-order-name").textContent = order.name || "Product Name";
      document.getElementById("esewa-order-quantity").textContent = "Quantity: " + quantity;
      document.getElementById("esewa-order-price").textContent = "Price: $" + parseFloat(order.price).toFixed(2);
      document.getElementById("esewa-order-total").textContent = "Total: $" + total.toFixed(2);
    }
  }

  // --- 1) Card Payment using Stripe Elements ---
  const stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx"); // Your test Stripe Publishable Key
  const elements = stripe.elements();
  const cardElement = elements.create("card");
  cardElement.mount("#card-element");

  cardElement.on('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  const cardPaymentForm = document.getElementById("cardPaymentForm");
  cardPaymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Gather delivery details
    const fullName = document.getElementById("fullName").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const zip = document.getElementById("zip").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Get the order total (in dollars) from the order summary
    let totalText;
    if (type === 'cart') {
      // For cart, parse the total from the generated summary
      totalText = document.querySelector('#order-summary .order-total p').textContent.replace("Total: $", "");
    } else {
      totalText = document.getElementById("order-total").textContent.replace("Total: $", "");
    }
    const amount = Math.round(parseFloat(totalText) * 100); // Convert dollars to cents

    try {
      // Create PaymentIntent on the server
      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          delivery: { fullName, address, city, state, zip, phone }
        })
      });
      const data = await response.json();
      if (!data.clientSecret) {
        alert("Error creating PaymentIntent");
        return;
      }
      // Confirm the card payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: fullName,
            address: {
              line1: address,
              city: city,
              state: state,
              postal_code: zip
            }
          }
        }
      });
      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Redirect to the success page with the PaymentIntent ID as order_id
        window.location.href = `success.html?order_id=${result.paymentIntent.id}`;
      }
      
    } catch (err) {
      console.error(err);
      alert("Payment processing error. See console for details.");
    }
  });

  // --- 2) Khalti Payment ---
  const khaltiPaymentForm = document.getElementById("khaltiPaymentForm");
  khaltiPaymentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // For testing, we use a fixed amount in paisa.
    // In production, you would convert your order total to the local currency's smallest unit.
    const amount = 29990; // e.g., NPR 299.90 represented in paisa
    var khaltiConfig = {
      publicKey: "test_public_key_khalti_xxxxxx", // Your test Khalti public key
      productIdentity: "order_test_98765",
      productName: "Example Product",
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload) {
          // Verify Khalti payment on your server
          fetch("/verify-khalti-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              // Redirect to the success page with the order_id returned from your server
              window.location.href = `success.html?order_id=${data.order_id}`;
            } else {
              alert("Khalti Payment Verification Failed!");
            }
            
          })
          .catch(err => {
            console.error(err);
            alert("Verification error.");
          });
        },
        onError(error) {
          console.error("Khalti Payment Error:", error);
          alert("Khalti payment error.");
        },
        onClose() {
          console.log("Khalti widget closed.");
        }
      }
    };
    var khaltiCheckout = new KhaltiCheckout(khaltiConfig);
    khaltiCheckout.show({ amount: amount });
  });

  // --- 3) eSewa Payment ---
  const esewaPaymentForm = document.getElementById("esewaPaymentForm");
  const successUrl = encodeURIComponent(`${req.headers.origin}/success.html?order_id=${txnId}`);

  esewaPaymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Collect delivery details
    const fullName = document.getElementById("esewa_fullName").value.trim();
    const address = document.getElementById("esewa_address").value.trim();
    const city = document.getElementById("esewa_city").value.trim();
    const state = document.getElementById("esewa_state").value.trim();
    const zip = document.getElementById("esewa_zip").value.trim();
    const phone = document.getElementById("esewa_phone").value.trim();

    const bodyData = {
      paymentMethod: "esewa",
      delivery: { fullName, address, city, state, zip, phone }
    };

    try {
      const response = await fetch("/create-esewa-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await response.json();
      if (data.url) {
        // For eSewa, redirect to their payment page.
        window.location = data.url;
      } else {
        alert("Error creating eSewa payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with eSewa payment.");
    }
  });
});
