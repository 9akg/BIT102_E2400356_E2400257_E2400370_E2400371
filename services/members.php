<?php
// Database configuration
define('DB_HOST', 'localhost');  
define('DB_USER', 'root');   
define('DB_PASS', '');           
define('DB_NAME', 'user_management'); 

// Establish connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Set character encoding to avoid character issues
$conn->set_charset("utf8");

?>
