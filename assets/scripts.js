document.addEventListener('DOMContentLoaded', () => {

  // Function to load courses and populate the multi-select component
  function loadCourses() {
    fetch('data/courses.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(courses => {
        const courseDropdown = document.getElementById('course-or-modules');
        if (!courseDropdown) {
          console.error("Element with ID 'course-or-modules' not found.");
          return;
        }
  
        courseDropdown.innerHTML = ''; // Clear existing options
  
        courses.forEach(course => {
          // Create an option for the entire course
          const courseOption = document.createElement('option');
          courseOption.value = `Course: ${course.title}`;
          courseOption.textContent = `Course: ${course.title}`;
          courseDropdown.appendChild(courseOption);
  
          // Create options for each module in the course
          course.modules.forEach(module => {
            const moduleOption = document.createElement('option');
            moduleOption.value = `Module: ${module.name}`;
            moduleOption.textContent = `Module: ${module.name}`;
            courseDropdown.appendChild(moduleOption);
          });
        });
  
        console.log("Multi-select dropdown populated successfully.");
      })
      .catch(error => {
        console.error('Error loading courses:', error);
        alert('Failed to load courses. Please check your setup.');
      });
  }

  // Call the function to load courses
  loadCourses();
});

// Handle sign-up form submission
document.getElementById('sign-up-form').addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(event.target);

  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const course = formData.get('course');

  if (!name || !email || !phone || !course) {
    alert('Please fill in all fields.');
    return;
  }

  alert(`Thank you for signing up, ${name}! We will contact you soon.`);
  event.target.reset();
});