<?php
session_start();

// Redirect if the user is not logged in
if (!isset($_SESSION['username'])) {
    header("Location: signin.php"); 
    exit;
}

$username = $_SESSION['username'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body>
    <script>
        alert("Welcome, <?php echo htmlspecialchars($username, ENT_QUOTES, 'UTF-8'); ?>!"); 
    </script>
    <h1>Welcome to the dashboard</h1> 
    <a href="logout.php">Logout</a>
</body>
</html>
