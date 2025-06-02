// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

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

// Initialize Firebase Auth and sign in anonymously
const auth = getAuth(app);
let isReady = false;

signInAnonymously(auth)
  .then(() => {
    isReady = true;
    // Now Firebase DB can be used safely!
  })
  .catch((error) => {
    console.error("Anonymous sign-in error:", error);
    alert("Failed to authenticate. Please refresh the page or try again later.");
  });

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
    // Wait until authentication is ready
    if (!isReady) {
      resultDiv.textContent = "Authenticating... please wait.";
      await new Promise(resolve => onAuthStateChanged(auth, () => resolve()));
    }

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