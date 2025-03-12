// workout.js

if (document.getElementById("workoutsLink")) {
    document.getElementById("workoutsLink").addEventListener("click", function () {
      window.location.href = "workouts.html";
    });
  }
  
  function showWorkout(workoutType) {

    const workoutTitle = document.getElementById("workoutTitle");
    const workoutImage = document.getElementById("workoutImage");
    const workoutDesc = document.getElementById("workoutDesc");
    const benefitsList = document.getElementById("benefitsList");
    const subscriptionSection = document.getElementById("subscriptionSection");
    const subscriptionTitle = document.getElementById("subscriptionTitle");
    const subscriptionBody = document.getElementById("subscriptionBody");
  
    // Define workout data with image paths and subscription plans
    const workoutData = {
      strength: {
        title: "Strength Training",
        image: "strength.jpg",
        desc: "Strength training involves lifting weights to build muscle and increase strength.",
        benefits: ["Increases muscle mass", "Boosts metabolism", "Enhances endurance"],
        subscription: [
          { plan: "Basic", duration: "1 Month", price: "$9.99", benefits: "Access to beginner strength training" },
          { plan: "Pro", duration: "3 Months", price: "$24.99", benefits: "Advanced weight training guides" },
          { plan: "Elite", duration: "6 Months", price: "$44.99", benefits: "Personalized strength training plans with expert coaching" }
        ]
      },
      cardio: {
        title: "Cardio Workouts",
        image: "cardio.jpg",
        desc: "Cardio workouts improve heart health and endurance through aerobic exercises.",
        benefits: ["Improves cardiovascular health", "Aids weight loss", "Enhances stamina"],
        subscription: [
          { plan: "Basic", duration: "1 Month", price: "$8.99", benefits: "Access to beginner cardio workouts" },
          { plan: "Pro", duration: "3 Months", price: "$22.99", benefits: "Intermediate HIIT and endurance training" },
          { plan: "Elite", duration: "6 Months", price: "$39.99", benefits: "Personalized cardio coaching & advanced plans" }
        ]
      },
      yoga: {
        title: "Yoga & Flexibility",
        image: "yoga.jpg",
        desc: "Yoga improves flexibility, posture, and mental relaxation.",
        benefits: ["Enhances flexibility", "Reduces stress", "Improves posture"],
        subscription: [
          { plan: "Basic", duration: "1 Month", price: "$7.99", benefits: "Access to beginner yoga sessions" },
          { plan: "Pro", duration: "3 Months", price: "$19.99", benefits: "Intermediate & flexibility routines" },
          { plan: "Elite", duration: "6 Months", price: "$34.99", benefits: "Advanced yoga sessions with expert guidance" }
        ]
      },
      fullbody: {
        title: "Full Body Workout",
        image: "full_body.jpg",
        desc: "Full body workouts engage all muscle groups for balanced fitness.",
        benefits: ["Maximizes efficiency", "Burns calories", "Improves overall strength"],
        subscription: [
          { plan: "Basic", duration: "1 Month", price: "$10.99", benefits: "Access to general full-body routines" },
          { plan: "Pro", duration: "3 Months", price: "$27.99", benefits: "Customized full-body workout plans" },
          { plan: "Elite", duration: "6 Months", price: "$49.99", benefits: "Expert coaching and progress tracking" }
        ]
      }
    };
  
    // Retrieve data for the selected workout type
    const data = workoutData[workoutType];
    if (!data) {
      console.error("Workout type not found:", workoutType);
      return;
    }
  
    // Update workout details on the page
    workoutTitle.innerText = data.title;
    // Use the assets folder for the image path
    workoutImage.src = "" + data.image;
    workoutDesc.innerText = data.desc;
    benefitsList.innerHTML = data.benefits.map(benefit => `<li>${benefit}</li>`).join("");
  
    // Update the subscription table with available plans
    subscriptionTitle.innerText = `${data.title} Subscription Plans`;
    subscriptionBody.innerHTML = data.subscription.map(sub => `
      <tr>
        <td>${sub.plan}</td>
        <td>${sub.duration}</td>
        <td>${sub.price}</td>
        <td>${sub.benefits}</td>
        <td>
          <button class="subscribe-btn" 
                  data-plan="${sub.plan}" 
                  data-duration="${sub.duration}" 
                  data-price="${sub.price}" 
                  data-benefits="${sub.benefits}">
            Subscribe
          </button>
        </td>
      </tr>
    `).join("");
  
    // Ensure the subscription section is visible
    subscriptionSection.style.display = "block";
  }
  
  // Event delegation for handling subscription button clicks
  document.getElementById("subscriptionBody").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("subscribe-btn")) {
      const btn = e.target;
      const plan = btn.getAttribute("data-plan");
      const duration = btn.getAttribute("data-duration");
      const price = btn.getAttribute("data-price");
      const benefits = btn.getAttribute("data-benefits");
      const query = new URLSearchParams({ plan, duration, price, benefits });
      window.location.href = `gym.php?${query.toString()}`;
    }
  });
  