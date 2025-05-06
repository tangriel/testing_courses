// Dynamically load courses and modules
fetch('data/courses.json')
  .then(response => response.json())
  .then(courses => {
    const courseList = document.getElementById('course-list');
    const courseSelect = document.querySelector('select[name="course"]');

    courses.forEach(course => {
      // Add course to list
      const li = document.createElement('li');
      li.innerHTML = `<strong>${course.title}</strong> - ${course.price}
                      <p>${course.description}</p>
                      <ul>
                        ${course.modules.map(module => `<li>${module.name} - ${module.price}</li>`).join('')}
                      </ul>`;
      courseList.appendChild(li);

      // Add course and modules to dropdown
      const courseOption = document.createElement('option');
      courseOption.value = `Course: ${course.title}`;
      courseOption.textContent = `Course: ${course.title}`;
      courseSelect.appendChild(courseOption);

      course.modules.forEach(module => {
        const moduleOption = document.createElement('option');
        moduleOption.value = `Module: ${module.name}`;
        moduleOption.textContent = `Module: ${module.name} (${course.title})`;
        courseSelect.appendChild(moduleOption);
      });
    });
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