

function calculateBmi() {
  var age = document.getElementById("age").value;
  var height = document.getElementById("height").value;
  var weight = document.getElementById("weight").value;
  var result = document.getElementById("result");
  var resultArea = document.querySelector(".comment");
  var male = document.getElementById("m").checked;
  var female = document.getElementById("f").checked;

  if (age == "" || height == "" || weight == "" || (!male && !female)) {
    alert("Please fill out all the fields.");
    return;
  }

  // Convert height from centimeters to meters
  height = height / 100;

  var bmi = weight / (height * height);

  result.innerHTML = bmi.toFixed(2);

  // Display BMI category
  if (bmi < 18.5) {
    resultArea.innerHTML = "Underweight";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    resultArea.innerHTML = "Normal weight";
  } else if (bmi >= 25 && bmi <= 29.9) {
    resultArea.innerHTML = "Overweight";
  } else {
    resultArea.innerHTML = "Obese";
  }
}