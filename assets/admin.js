// Certificate Generation Logic
document.getElementById('certificate-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const name = document.getElementById('participant-name').value.trim();
  const selectedOptions = Array.from(document.getElementById('course-or-modules').selectedOptions)
    .map(option => option.value.trim()); // Get all selected options as an array
  const date = document.getElementById('completion-date').value;

  if (!name || selectedOptions.length === 0 || !date) {
    alert('Please fill in all fields.');
    return;
  }

  const selectedCoursesOrModules = selectedOptions.join(', '); // Combine all selected options into a string

  try {
    // Generate unique certificate ID
    const certificateId = await generateCertificateId(name, selectedOptions);

    // Save certificate data
    saveCertificateData(name, selectedCoursesOrModules, date, certificateId);

    // Generate and download the certificate
    generateCertificatePDF(name, selectedCoursesOrModules, date, certificateId);

    alert(`Certificate generated successfully!\nID: ${certificateId}`);
  } catch (error) {
    console.error('Error generating certificate:', error);
    alert('An error occurred while generating the certificate. Please try again.');
  }
});

async function generateCertificateId(name, selectedCoursesOrModules) {
  // Concatenate name and selectedCoursesOrModules into a single string
  const inputString = `${name}:${selectedCoursesOrModules.join(',')}`;

  // Encode the string into bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);

  // Generate a SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash buffer into a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  // Return a shortened version of the hash (first 12 characters)
  return hashHex.substring(0, 12);
}

function generateCertificatePDF(name, selectedCoursesOrModules, date, certificateId) {
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
  doc.text(`successfully completed the following:`, 105, 100, { align: 'center' });

  // Split the selected courses/modules into lines and display them
  const coursesOrModulesArray = selectedCoursesOrModules.split(', ');
  let startY = 120; // Initial Y position for the list
  coursesOrModulesArray.forEach((courseOrModule, index) => {
    doc.text(`- ${courseOrModule}`, 105, startY + index * 10, { align: 'center' });
  });

  // Add completion date
  doc.text(`on ${new Date(date).toLocaleDateString()}`, 105, startY + coursesOrModulesArray.length * 10 + 10, { align: 'center' });

  // Add Certificate ID
  doc.text(`Certificate ID: ${certificateId}`, 105, startY + coursesOrModulesArray.length * 10 + 30, { align: 'center' });

  // Save the PDF
  doc.save(`${name}_${certificateId}_Certificate.pdf`);
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

// Firebase configuration (replace with your own Firebase project configuration)
const firebaseConfig = {
  apiKey: "AIzaSyAhzG2ZD53g7HAPAV8eagrFty5DSea6YTA",
  authDomain: "testdesigncourse.firebaseapp.com",
  databaseURL: "https://testdesigncourse-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "testdesigncourse",
  storageBucket: "testdesigncourse.firebasestorage.app",
  messagingSenderId: "921823882139",
  appId: "7a9c03ed7caddfe1e20f3e",
  measurementId: "G-5FBWX5JCXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function saveCertificateData(name, selectedCoursesOrModules, date, certificateId) {
  const certificateRef = ref(db, `certificates/${certificateId}`);
  const certificateData = {
    name,
    coursesOrModules: selectedCoursesOrModules,
    date,
    certificateId
  };

  set(certificateRef, certificateData)
    .then(() => {
      console.log('Certificate saved successfully');
    })
    .catch(error => {
      console.error('Error saving certificate:', error);
    });
}

// Function to load courses and populate the dropdown
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
      courseDropdown.innerHTML = ''; // Clear existing options

      courses.forEach(course => {
        // Create an option for the entire course in the dropdown
        const courseOption = document.createElement('option');
        courseOption.value = `Course: ${course.title}`;
        courseOption.textContent = `Course: ${course.title}`;
        courseDropdown.appendChild(courseOption);

        // Create options for each module in the dropdown
        course.modules.forEach(module => {
          const moduleOption = document.createElement('option');
          moduleOption.value = `Module: ${module.name}`;
          moduleOption.textContent = `Module: ${module.name}`;
          courseDropdown.appendChild(moduleOption);
        });
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