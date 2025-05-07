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
document.getElementById('sign-up-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const form = event.target;
  const formData = new FormData(form);

  // Get form field values
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');

  // Get selected courses/modules
  const selectedOptions = Array.from(document.getElementById('course-or-modules').selectedOptions)
    .map(option => option.value);

  // Validate fields
  if (!name || !email || !phone || selectedOptions.length === 0) {
    alert('Please fill in all fields and select at least one course or module.');
    return;
  }

  // Prepare data for Web3Forms submission
  const web3FormsData = {
    access_key: "11dc97ae-636d-4b68-a4dd-4c3d558d90ab", // Replace with your Web3Forms access key
    name: name,
    email: email,
    phone: phone,
    courses: selectedOptions.join(', '), // Combine selected courses/modules into a string
    subject: "New Course Registration",
    message: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourses/Modules: ${selectedOptions.join(', ')}`
  };

  try {
    // Send data to Web3Forms
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(web3FormsData)
    });

    if (response.ok) {
      alert(`Thank you for signing up, ${name}! We will contact you soon.`);
      form.reset(); // Reset the form
    } else {
      const errorData = await response.json();
      console.error('Submission failed with error:', errorData);
      alert('Something went wrong. Please try again later.');
    }
  } catch (error) {
    console.error('Error while submitting form:', error);
    alert('Something went wrong. Please try again later.');
  }
});