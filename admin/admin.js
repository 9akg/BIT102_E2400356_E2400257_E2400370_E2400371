document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar ul.menu li a');
    const sections = document.querySelectorAll('.main-content section');
  
    // Function to display the correct section when a menu item is clicked
    menuItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        // Remove active class from all menu links
        menuItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked link
        item.classList.add('active');
        // Get target section ID from href (e.g., "#dashboard" becomes "dashboard")
        const target = item.getAttribute('href').substring(1);
        // Hide all sections, then show the target
        sections.forEach(section => {
          if (section.id === target) {
            section.classList.add('active');
          } else {
            section.classList.remove('active');
          }
        });
      });
    });
  
    // By default, show the Dashboard section
    if (menuItems.length > 0) {
      menuItems[0].click();
    }
  
    // Optional: Handle the workout form submission (for demonstration purposes)
    const workoutForm = document.getElementById('workoutForm');
    if (workoutForm) {
      workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Workout plan saved!');
        // Here, you could add code to send the form data to the server
        workoutForm.reset();
      });
    }
  });






  // Function to load workouts into admin panel
function loadWorkouts() {
    fetch('http://localhost:3000/api/workouts')
        .then(response => response.json())
        .then(data => {
            // Update the admin panel UI with the fetched workouts
            console.log(data);
            // For example, populate a table or form with the data.
        })
        .catch(error => console.error('Error:', error));
}

// Function to add a new workout (from form submission)
const workoutForm = document.getElementById('workoutForm');
workoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('workoutTitle').value;
    const description = document.getElementById('workoutDesc').value;
    const image = document.getElementById('workoutImage').value;

    fetch('http://localhost:3000/api/workouts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, image })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Workout added:', data);
        // Optionally refresh the list of workouts in the admin panel
        loadWorkouts();
    })
    .catch(error => console.error('Error:', error));
});

// Call loadWorkouts on page load
document.addEventListener('DOMContentLoaded', loadWorkouts);

  