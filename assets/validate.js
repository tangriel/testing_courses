// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

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

// Function to validate certificate
document.getElementById('validation-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const certificateIdInput = document.getElementById('certificate-id').value.trim();
  const nameInput = document.getElementById('participant-name').value.trim();
  const resultDiv = document.getElementById('validation-result');

  // Clear previous results and show loading indicator
  resultDiv.style.display = 'block';
  resultDiv.textContent = 'Validating certificate...';

  try {
    const certificateRef = ref(db, 'certificates');
    const snapshot = await get(certificateRef);

    if (snapshot.exists()) {
      const certificates = Object.values(snapshot.val());
      let matchedCertificates = [];

      if (certificateIdInput) {
        // Validate by Certificate ID
        matchedCertificates = certificates.filter(cert => cert.certificateId === certificateIdInput);
      } else if (nameInput) {
        // Validate by Name (Contains Search)
        matchedCertificates = certificates.filter(cert =>
          cert.name.toLowerCase().includes(nameInput.toLowerCase())
        );
      }

      if (matchedCertificates.length > 0) {
        displayCertificateValidationResults(matchedCertificates, resultDiv);
      } else {
        resultDiv.textContent = 'No matching certificates found.';
      }
    } else {
      resultDiv.textContent = 'Certificate database is empty.';
    }
  } catch (error) {
    console.error('Error validating certificate:', error);
    resultDiv.textContent = 'An error occurred while validating the certificate.';
  }
});

// Function to display validation results
function displayCertificateValidationResults(certificates, resultDiv) {
  resultDiv.innerHTML = `<h2>${certificates.length} Certificate(s) Found</h2>`;
  certificates.forEach(certificate => {
    const certHtml = `
      <div style="margin-bottom: 10px; padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 5px;">
        <p><strong>Name:</strong> ${certificate.name}</p>
        <p><strong>Courses/Modules:</strong> ${certificate.coursesOrModules}</p>
        <p><strong>Completion Date:</strong> ${certificate.date}</p>
        <p><strong>Certificate ID:</strong> ${certificate.certificateId}</p>
      </div>
    `;
    resultDiv.innerHTML += certHtml;
  });
}