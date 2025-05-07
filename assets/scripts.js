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
      const container = document.getElementById('course-or-modules-container');
      container.innerHTML = ''; // Clear existing options

      courses.forEach(course => {
        // Create a checkbox for the entire course
        const courseCheckbox = document.createElement('div');
        courseCheckbox.innerHTML = `
          <label>
            <input type="checkbox" name="courses[]" value="Course: ${course.title}">
            Course: ${course.title}
          </label>
        `;
        container.appendChild(courseCheckbox);

        // Create checkboxes for each module in the course
        course.modules.forEach(module => {
          const moduleCheckbox = document.createElement('div');
          moduleCheckbox.innerHTML = `
            <label style="margin-left: 20px;">
              <input type="checkbox" name="courses[]" value="Module: ${module.name}">
              Module: ${module.name}
            </label>
          `;
          container.appendChild(moduleCheckbox);
        });
      });
    })
    .catch(error => {
      console.error('Error loading courses:', error);
      alert('Failed to load courses. Please check your setup.');
    });
}

// Load courses when the page loads
document.addEventListener('DOMContentLoaded', loadCourses);

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