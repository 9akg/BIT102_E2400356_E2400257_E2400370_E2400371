// gym.js

document.addEventListener("DOMContentLoaded", () => {
    // --- PAYMENT OPTIONS TAB SWITCHING ---
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
  
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((tc) => tc.classList.remove("active"));
        // Add active class to the clicked button and corresponding tab content
        btn.classList.add("active");
        const targetTab = btn.getAttribute("data-tab");
        document.getElementById(targetTab).classList.add("active");
      });
    });
  
    // --- Pre-fill Subscription Details (if provided via URL) ---
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get("plan");
    const duration = urlParams.get("duration");
    const price = urlParams.get("price");
    const benefits = urlParams.get("benefits");
  
    if (plan && price) {
      // Update header to indicate the selected subscription plan
      const header = document.querySelector("h1");
      header.textContent = `Subscribe to the ${plan} Plan`;
  
      // Display subscription info on the form page
      const subscriptionInfo = document.createElement("p");
      subscriptionInfo.innerHTML = `<strong>Duration:</strong> ${duration} <br>
                                    <strong>Price:</strong> ${price} <br>
                                    <strong>Benefits:</strong> ${benefits}`;
      document.querySelector(".container").insertBefore(subscriptionInfo, document.querySelector("form"));
  
      // Add hidden inputs to include subscription details in form submission
      const form = document.getElementById("gymRegistrationForm");
      form.insertAdjacentHTML("beforeend", `
        <input type="hidden" name="subscriptionPlan" value="${plan}">
        <input type="hidden" name="subscriptionDuration" value="${duration}">
        <input type="hidden" name="subscriptionPrice" value="${price}">
      `);
    }
  
    // --- Payment Integration Setup ---
  
    // 1) Card Payment using Stripe Elements
    const stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx"); // Replace with your test Stripe Publishable Key
    const elements = stripe.elements();
    const cardElement = elements.create("card");
    cardElement.mount("#card-element");
  
    cardElement.on("change", function (event) {
      const displayError = document.getElementById("card-errors");
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = "";
      }
    });
  
    // Handle gym form submission for Card Payment (only if Card Payment tab is active)
    const gymForm = document.getElementById("gymRegistrationForm");
    gymForm.addEventListener("submit", async (e) => {
      // Only process if the Card Payment tab is active
      if (!document.getElementById("card-tab").classList.contains("active")) return;
      e.preventDefault();
  
      // Collect gym membership details from the form
      const firstName = document.getElementById("firstName").value.trim();
      const middleName = document.getElementById("middleName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const age = document.getElementById("age").value.trim();
      const weight = document.getElementById("weight").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const altPhone = document.getElementById("altPhone").value.trim();
      const emergencyNumber = document.getElementById("emergencyNumber").value.trim();
      const referredBy = document.getElementById("referredBy").value.trim();
  
      const gymDetails = {
        firstName,
        middleName,
        lastName,
        age,
        weight,
        phone,
        altPhone,
        emergencyNumber,
        referredBy
      };
  
      // Combine names for billing details
      const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();
  
      // Use subscription price if provided; otherwise, default to $50.00
      let membershipFee = 50.0;
      if (price) {
        membershipFee = parseFloat(price.replace(/[^0-9\.]+/g, ""));
      }
      const amount = Math.round(membershipFee * 100); // Convert dollars to cents
  
      try {
        // Create PaymentIntent on your server with gymDetails as metadata
        const response = await fetch("/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            gymDetails: gymDetails
          })
        });
        const data = await response.json();
        if (!data.clientSecret) {
          alert("Error creating PaymentIntent");
          return;
        }
        // Confirm the card payment with Stripe
        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: fullName }
          }
        });
        if (result.error) {
          alert(result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
          // On success, redirect to the success page with the PaymentIntent ID
          window.location.href = `success.html?order_id=${result.paymentIntent.id}`;
        }
      } catch (err) {
        console.error(err);
        alert("Payment processing error. See console for details.");
      }
    });
  
    // 2) Khalti Payment Integration
    const khaltiPayButton = document.getElementById("khaltiPayButton");
    if (khaltiPayButton) {
      khaltiPayButton.addEventListener("click", () => {
        // Optional: Collect gymDetails if needed
        const gymDetails = {
          firstName: document.getElementById("firstName").value.trim(),
          middleName: document.getElementById("middleName").value.trim(),
          lastName: document.getElementById("lastName").value.trim(),
          age: document.getElementById("age").value.trim(),
          weight: document.getElementById("weight").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          altPhone: document.getElementById("altPhone").value.trim(),
          emergencyNumber: document.getElementById("emergencyNumber").value.trim(),
          referredBy: document.getElementById("referredBy").value.trim()
        };
  
        // Set fee in paisa (default: 5000 paisa for NPR 50.00)
        let fee = 5000;
        var khaltiConfig = {
          publicKey: "test_public_key_khalti_xxxxxx", // Replace with your test Khalti public key
          productIdentity: "gym_membership_001",
          productName: "Gym Membership",
          productUrl: window.location.href,
          eventHandler: {
            onSuccess(payload) {
              // Verify Khalti payment on your server
              fetch("/verify-khalti-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    window.location.href = `success.html?order_id=${data.order_id}`;
                  } else {
                    alert("Khalti Payment Verification Failed!");
                  }
                })
                .catch((err) => {
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
        khaltiCheckout.show({ amount: fee });
      });
    } else {
      console.warn("Khalti button not found. Please ensure an element with id 'khaltiPayButton' exists.");
    }
  
    // 3) eSewa Payment Integration
    const esewaPayButton = document.getElementById("esewaPayButton");
    if (esewaPayButton) {
      esewaPayButton.addEventListener("click", async () => {
        const gymDetails = {
          firstName: document.getElementById("firstName").value.trim(),
          middleName: document.getElementById("middleName").value.trim(),
          lastName: document.getElementById("lastName").value.trim(),
          age: document.getElementById("age").value.trim(),
          weight: document.getElementById("weight").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          altPhone: document.getElementById("altPhone").value.trim(),
          emergencyNumber: document.getElementById("emergencyNumber").value.trim(),
          referredBy: document.getElementById("referredBy").value.trim()
        };
  
        const bodyData = {
          paymentMethod: "esewa",
          gymDetails: gymDetails
        };
        try {
          const response = await fetch("/create-esewa-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
          });
          const data = await response.json();
          if (data.url) {
            window.location = data.url;
          } else {
            alert("Error creating eSewa payment.");
          }
        } catch (err) {
          console.error(err);
          alert("Something went wrong with eSewa payment.");
        }
      });
    } else {
      console.warn("eSewa button not found. Please ensure an element with id 'esewaPayButton' exists.");
    }
  });
  