document.addEventListener('DOMContentLoaded', () => {
  // Function to load courses and populate course details and multi-select component
  async function loadCourses() {
    try {
      const response = await fetch('data/courses.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const courses = await response.json();
      populateCourseDetails(courses);
      populateCourseDropdown(courses);
    } catch (error) {
      console.error('Error loading courses:', error);
      alert('Failed to load courses. Please check your setup.');
    }
  }

  // Populate course details in the "course-info" section
  function populateCourseDetails(courses) {
    const courseInfoDiv = document.getElementById('course-info');
    if (!courseInfoDiv) {
      console.error("Element with ID 'course-info' not found.");
      return;
    }

    courseInfoDiv.innerHTML = ''; // Clear any existing content

    courses.forEach(course => {
      // Add course title, description, and price
      const courseHeader = document.createElement('h3');
      courseHeader.textContent = `${course.title} (${course.price})`;
      courseInfoDiv.appendChild(courseHeader);

      const courseDescription = document.createElement('p');
      courseDescription.textContent = course.description;
      courseInfoDiv.appendChild(courseDescription);

      const courseDates = document.createElement('p');
      courseDates.textContent = `Duration: ${course.start_date} to ${course.end_date}`;
      courseInfoDiv.appendChild(courseDates);

      // Add modules with details
      const modulesHeader = document.createElement('h4');
      modulesHeader.textContent = "Modules:";
      courseInfoDiv.appendChild(modulesHeader);

      const modulesList = document.createElement('ul');
      course.modules.forEach(module => {
        const moduleItem = document.createElement('li');
        moduleItem.textContent = `${module.name} (${module.date} at ${module.time}) - ${module.price}`;
        modulesList.appendChild(moduleItem);
      });
      courseInfoDiv.appendChild(modulesList);
    });

    console.log("Course details populated successfully.");
  }

  // Populate the multi-select dropdown with courses and modules
  function populateCourseDropdown(courses) {
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
        moduleOption.textContent = `Module: ${module.name} (Price: ${module.price})`;
        courseDropdown.appendChild(moduleOption);
      });
    });

    console.log("Multi-select dropdown populated successfully.");
  }

  // Call the function to load courses
  loadCourses();

  // Handle sign-up form submission
  document.getElementById('sign-up-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);

    // Get form field values
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const comments = formData.get('comments'); // Get comments field value

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
      comments: comments || "No additional comments provided.", // Include comments or a placeholder
      subject: "New Course Registration",
      message: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourses/Modules: ${selectedOptions.join(', ')}\nComments: ${comments || "No additional comments provided."}`
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
});