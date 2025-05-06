// Certificate Generation Logic
document.getElementById('certificate-form').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const name = document.getElementById('participant-name').value.trim();
    const course = document.getElementById('course-name').value.trim();
    const date = document.getElementById('completion-date').value;
  
    if (!name || !course || !date) {
      alert('Please fill in all fields.');
      return;
    }
  
    // Generate unique certificate ID
    const certificateId = generateCertificateId(name, course);
  
    // Generate and download the certificate
    generateCertificatePDF(name, course, date, certificateId);
  });
  
  function generateCertificateId(name, course) {
    // Create a unique ID using a hash of name and course
    return btoa(`${name}:${course}`).substring(0, 12); // Shortened base64
  }
  
  function generateCertificatePDF(name, course, date, certificateId) {
    const { jsPDF } = window.jspdf; // Assuming jsPDF is already added
    const doc = new jsPDF();
  
    // Certificate Template
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Certificate of Completion', 105, 40, { align: 'center' });
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`This is to certify that`, 105, 60, { align: 'center' });
  
    doc.setFontSize(20);
    doc.text(name, 105, 80, { align: 'center' });
  
    doc.setFontSize(16);
    doc.text(`successfully completed the course`, 105, 100, { align: 'center' });
    doc.text(course, 105, 120, { align: 'center' });
  
    doc.text(`on ${new Date(date).toLocaleDateString()}`, 105, 140, { align: 'center' });
  
    doc.text(`Certificate ID: ${certificateId}`, 105, 160, { align: 'center' });
  
    // Save the PDF
    doc.save(`${name}_Certificate.pdf`);
  }

// Function to load courses from the JSON file and display them in the admin panel
function loadCourses() {
    fetch('data/courses.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(courses => {
        const courseList = document.getElementById('admin-course-list');
        courseList.innerHTML = ''; // Clear existing list
  
        courses.forEach(course => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${course.title}</strong> - ${course.price}
            <p>${course.description}</p>
            <ul>
              ${course.modules.map(module => `<li>${module.name} - ${module.price}</li>`).join('')}
            </ul>
          `;
          courseList.appendChild(li);
        });
      })
      .catch(error => {
        console.error('Error loading courses:', error);
        alert('Failed to load courses. Please check your setup.');
      });
  }
  
  // Function to add a new course or module
  function addCourseOrModule(event) {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const price = formData.get('price');
    const modules = formData.get('modules');
  
    if (!title || !price) {
      alert('Please fill in the required fields.');
      return;
    }
  
    // Fetch existing courses, add the new course, and save back to the file
    fetch('data/courses.json')
      .then(response => response.json())
      .then(courses => {
        const newCourse = {
          id: courses.length + 1,
          title,
          description,
          price,
          modules: modules ? modules.split(',').map(module => ({ name: module.trim(), price: 'TBD' })) : []
        };
  
        courses.push(newCourse);
  
        // Save updated courses (this requires server-side handling, which is not available in static sites)
        console.log('New course added:', newCourse);
        alert('New course added successfully! (NOTE: Saving changes requires server-side support.)');
      })
      .catch(error => {
        console.error('Error adding new course:', error);
      });
  
    event.target.reset();
  }
  
  // Attach event listeners
  document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
  
    const addCourseForm = document.getElementById('add-course-form');
    if (addCourseForm) {
      addCourseForm.addEventListener('submit', addCourseOrModule);
    }
  });