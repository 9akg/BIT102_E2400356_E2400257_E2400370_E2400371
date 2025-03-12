<?php
require 'members.php'; // Include database connection

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Collect user input
    $first_name = $_POST['firstName'];
    $middle_name = $_POST['middleName'] ?? ''; // Optional field
    $last_name = $_POST['lastName'];
    $age = $_POST['age'];
    $weight = $_POST['weight'];
    $phone = $_POST['phone'];
    $alt_phone = $_POST['altPhone'] ?? '';
    $emergency_number = $_POST['emergencyNumber'];
    $referred_by = $_POST['referredBy'] ?? '';
    $payment_method = $_POST['paymentMethod'];
    
    // Insert data into the database
    $stmt = $conn->prepare("INSERT INTO gym_members (first_name, middle_name, last_name, age, weight, phone, alt_phone, emergency_number, referred_by, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssissssss", $first_name, $middle_name, $last_name, $age, $weight, $phone, $alt_phone, $emergency_number, $referred_by, $payment_method);

    if ($stmt->execute()) {
        $member_id = $stmt->insert_id; // Get the inserted member ID
        echo json_encode(["success" => true, "message" => "Registration successful!", "member_id" => $member_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }
    $stmt->close();
    $conn->close();
}
?>



<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gym Membership Registration & Payment</title>
  <link rel="stylesheet" href="gym.css" />
  <!-- Stripe JS for Card Payment -->
  <script src="https://js.stripe.com/v3/"></script>
  <!-- Khalti Checkout for Khalti Payment -->
  <script src="https://khalti.com/static/khalti-checkout.js"></script>
</head>
<body>
  <div class="container">
    <h1>Gym Membership Registration</h1>
    <form id="gymRegistrationForm">
      <fieldset>
        <legend>Personal Details</legend>
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" required />

        <label for="middleName">Middle Name:</label>
        <input type="text" id="middleName" />

        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" required />

        <label for="age">Age:</label>
        <input type="number" id="age" required />

        <label for="weight">Weight (kg):</label>
        <input type="number" id="weight" required />

        <label for="phone">Phone Number:</label>
        <input type="tel" id="phone" required />

        <label for="altPhone">Alternative Number:</label>
        <input type="tel" id="altPhone" />

        <label for="emergencyNumber">Emergency Number:</label>
        <input type="tel" id="emergencyNumber" required />

        <label for="referredBy">Referred By:</label>
        <input type="text" id="referredBy" />
      </fieldset>

      <fieldset>
        <legend>Payment Option</legend>
        <!-- Payment Options Tabs -->
        <div class="tabs">
          <button type="button" class="tab-button active" data-tab="card-tab">Card Payment</button>
          <button type="button" class="tab-button" data-tab="khalti-tab">Khalti</button>
          <button type="button" class="tab-button" data-tab="esewa-tab">eSewa</button>
        </div>

        <!-- Card Payment Tab -->
        <div class="tab-content active" id="card-tab">
          <div id="card-element"></div>
          <div id="card-errors" role="alert"></div>
          <button type="submit" id="cardPayButton">Pay with Card</button>
        </div>

        <!-- Khalti Payment Tab -->
        <div class="tab-content" id="khalti-tab">
          <button type="button" id="khaltiPayButton">Pay with Khalti</button>
        </div>

        <!-- eSewa Payment Tab -->
        <div class="tab-content" id="esewa-tab">
          <button type="button" id="esewaPayButton">Pay with eSewa</button>
        </div>
      </fieldset>
    </form>
  </div>

  <script src="gym.js"></script>
</body>
</html>
