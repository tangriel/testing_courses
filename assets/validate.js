// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

// Firebase configuration (replace with your own Firebase project configuration)
const firebaseConfig = {
  apiKey: "AIzaSyAhzG2ZD53g7HAPAV8eagrFty5DSea6YTA",
  authDomain: "testdesigncourse.firebaseapp.com",
  databaseURL: "https://testdesigncourse-default-rtdb.europe-west1.firebasedatabase.app", // Ensure this is included for Realtime Database
  projectId: "testdesigncourse",
  storageBucket: "testdesigncourse.firebasestorage.app",
  messagingSenderId: "921823882139",
  appId: "7a9c03ed7caddfe1e20f3e",
  measurementId: "G-5FBWX5JCXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to validate certificate
document.getElementById('validation-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const certificateIdInput = document.getElementById('certificate-id').value.trim();
  const nameInput = document.getElementById('participant-name').value.trim();
  const courseInput = document.getElementById('course-name').value.trim();
  const resultDiv = document.getElementById('validation-result');
  
  resultDiv.textContent = ''; // Clear previous results

  if (!certificateIdInput && (!nameInput || !courseInput)) {
    resultDiv.textContent = 'Please provide either the Certificate ID or Name and Course.';
    return;
  }

  try {
    if (certificateIdInput) {
      // Validate by Certificate ID
      const certificateRef = ref(db, 'certificates');
      const certificateQuery = query(certificateRef, orderByChild('certificateId'), equalTo(certificateIdInput));
      
      const snapshot = await get(certificateQuery);

      if (snapshot.exists()) {
        const certificate = Object.values(snapshot.val())[0]; // Get first certificate
        displayCertificateValidationResult(certificate, resultDiv);
      } else {
        resultDiv.textContent = 'Certificate not found or invalid.';
      }
    } else if (nameInput && courseInput) {
      // Validate by Name and Course
      const certificateRef = ref(db, 'certificates');
      const snapshot = await get(certificateRef);

      if (snapshot.exists()) {
        const certificates = Object.values(snapshot.val());
        const matchedCertificate = certificates.find(cert =>
          cert.name.toLowerCase() === nameInput.toLowerCase() &&
          cert.coursesOrModules.toLowerCase().includes(courseInput.toLowerCase())
        );

        if (matchedCertificate) {
          displayCertificateValidationResult(matchedCertificate, resultDiv);
        } else {
          resultDiv.textContent = 'Certificate not found or invalid.';
        }
      } else {
        resultDiv.textContent = 'Certificate database is empty.';
      }
    }
  } catch (error) {
    console.error('Error validating certificate:', error);
    resultDiv.textContent = 'An error occurred while validating the certificate.';
  }
});

// Function to display validation result
function displayCertificateValidationResult(certificate, resultDiv) {
  resultDiv.innerHTML = `
    <h2>Certificate is Valid</h2>
    <p><strong>Name:</strong> ${certificate.name}</p>
    <p><strong>Courses/Modules:</strong> ${certificate.coursesOrModules}</p>
    <p><strong>Completion Date:</strong> ${certificate.date}</p>
    <p><strong>Certificate ID:</strong> ${certificate.certificateId}</p>
  `;
}