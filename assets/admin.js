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

  // Certificate Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add Light Green Background
  doc.setFillColor(240, 255, 240); // Very light green
  doc.rect(0, 0, pageWidth, pageHeight, 'F'); // Fill the entire page with the color

  // Add Dark Green Border
  doc.setDrawColor(34, 139, 34); // Darker green
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Draw a rectangle for the border

  // Add Logo on Top
  const logoImg = new Image();
  logoImg.src = 'assets/logo.png'; // Path to the logo
  logoImg.onload = function () {
    const logoWidth = 60; // Adjusted width
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth; // Maintain aspect ratio
    doc.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, 15, logoWidth, logoHeight);

    // Certificate Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('Certificate of Completion', pageWidth / 2, 60, { align: 'center' });

    // Certificate Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`This is to certify that`, pageWidth / 2, 75, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(name, pageWidth / 2, 95, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`successfully completed the following:`, pageWidth / 2, 115, { align: 'center' });

    // List Courses/Modules
    const coursesOrModulesArray = selectedCoursesOrModules.split(', ');
    let startY = 135; // Initial Y position for the list
    if (coursesOrModulesArray.length === 1) {
      // Single value, no hyphen
      doc.text(coursesOrModulesArray[0], pageWidth / 2, startY, { align: 'center' });
    } else {
      // Multiple values, include hyphen
      coursesOrModulesArray.forEach((courseOrModule, index) => {
        doc.text(`- ${courseOrModule}`, pageWidth / 2, startY + index * 10, { align: 'center' });
      });
    }

    // Completion Date
    doc.text(`on ${new Date(date).toLocaleDateString()}`, pageWidth / 2, startY + coursesOrModulesArray.length * 10 + 10, {
      align: 'center',
    });

    // Certificate ID
    doc.setFontSize(12);
    doc.text(`Certificate ID: ${certificateId}`, pageWidth / 2, startY + coursesOrModulesArray.length * 10 + 30, {
      align: 'center',
    });

    // Add Signature
    const signatureImg = new Image();
    signatureImg.src = 'assets/signature.png'; // Path to the signature
    signatureImg.onload = function () {
      const signatureWidth = 25; // Reduced width for a smaller signature
      const signatureHeight = (signatureImg.height / signatureImg.width) * signatureWidth; // Maintain aspect ratio

      // Positioning Elements
      const centerX = pageWidth / 2; // Horizontal center of the page
      const signatureY = pageHeight - signatureHeight - 30; // Signature closer to the bottom
      const lineY = signatureY + signatureHeight + 3; // Line slightly below the signature
      const lineWidth = signatureWidth + 40; // Line length (longer than the signature)

      // Add the signature image
      const signatureX = centerX - (signatureWidth / 2); // Center the signature over the line
      doc.addImage(signatureImg, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);

      // Add a centered line below the signature
      const lineStartX = centerX - (lineWidth / 2); // Start point of the line
      const lineEndX = centerX + (lineWidth / 2); // End point of the line
      doc.setDrawColor(0); // Black color
      doc.setLineWidth(0.2); // Thinner line
      doc.line(lineStartX, lineY, lineEndX, lineY); // Draw the line

      // Add "Trainer: Hanna Kaplun" text, centered with the line
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      const trainerTextY = lineY + 5; // Position the text slightly below the line
      doc.text('Trainer: Hanna Kaplun', centerX, trainerTextY, { align: 'center' });

      // Save the PDF
      doc.save(`${name}_${certificateId}_Certificate.pdf`);
    };
  };
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

// Firebase configuration (replace with your own Firebase project configuration)
const firebaseConfig = {
  apiKey: atob("QUl6YVN5QWh6RzJaRDUzZzdIQVBBVjhlYWdyRnR5NURTZWE2WVRB").trim(),
  authDomain: atob("dGVzdGRlc2lnbmNvdXJzZS5maXJlYmFzZWFwcC5jb20=").trim(),
  databaseURL: atob("aHR0cHM6Ly90ZXN0ZGVzaWduY291cnNlLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA=").trim(),
  projectId: atob("dGVzdGRlc2lnbmNvdXJzZQ==").trim(),
  storageBucket: atob("dGVzdGRlc2lnbmNvdXJzZS5maXJlYmFzZXN0b3JhZ2UuYXBw").trim(),
  messagingSenderId: atob("OTIxODIzODgyMTM5").trim(),
  appId: atob("N2E5YzAzZWQ3Y2FkZGZlMWUyMGYzZQ==").trim(),
  measurementId: atob("Ry01RkJXWDVKQ1hK").trim(),
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