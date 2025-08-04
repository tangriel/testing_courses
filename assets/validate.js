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

// Helper: Get current language from the language switcher
function getCurrentLang() {
  const switcher = document.getElementById('language-switcher');
  return switcher ? switcher.value : 'en';
}

// Translation messages (should match those in scripts.js)
const messages = {
  en: {
    validating: "Validating certificate...",
    authenticating: "Authenticating... please wait.",
    noCertificates: "Certificate database is empty.",
    noMatching: "No matching certificates found.",
    error: "An error occurred while validating the certificate.",
    found: "Certificate(s) Found",
    name: "Name:",
    courses: "Courses/Modules:",
    date: "Completion Date:",
    id: "Certificate ID:",
    "open-certificate-page": "Open certificate page",
    "open-certificate-pdf": "Open Certificate PDF"
  },
  ua: {
    validating: "Перевірка сертифіката...",
    authenticating: "Аутентифікація... зачекайте.",
    noCertificates: "База сертифікатів порожня.",
    noMatching: "Сертифікат не знайдено.",
    error: "Сталася помилка під час перевірки сертифіката.",
    found: "сертифікат(и) знайдено",
    name: "Ім'я:",
    courses: "Курси/Модулі:",
    date: "Дата завершення:",
    id: "ID сертифіката:",
    "open-certificate-page": "Відкрити сторінку сертифіката",
    "open-certificate-pdf": "Відкрити PDF сертифіката"
  }
};

// Function to validate certificate
document.getElementById('validation-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const lang = getCurrentLang();
  const certificateIdInput = document.getElementById('certificate-id').value.trim();
  const nameInput = document.getElementById('participant-name').value.trim();
  const resultDiv = document.getElementById('validation-result');

  // Clear previous results and show loading indicator
  resultDiv.style.display = 'block';
  resultDiv.textContent = messages[lang].validating;

  try {
    // Wait until authentication is ready
    if (!isReady) {
      resultDiv.textContent = messages[lang].authenticating;
      await new Promise(resolve => onAuthStateChanged(auth, () => resolve()));
    }

    const certificateRef = ref(db, 'certificates');
    const snapshot = await get(certificateRef);

    if (snapshot.exists()) {
      const certificates = Object.values(snapshot.val());
      let matchedCertificates = [];

      if (certificateIdInput) {
        matchedCertificates = certificates.filter(cert => cert.certificateId === certificateIdInput);
      } else if (nameInput) {
        matchedCertificates = certificates.filter(cert =>
          cert.name.toLowerCase().includes(nameInput.toLowerCase())
        );
      }

      if (matchedCertificates.length > 0) {
        displayCertificateValidationResults(matchedCertificates, resultDiv, lang);
      } else {
        resultDiv.textContent = messages[lang].noMatching;
      }
    } else {
      resultDiv.textContent = messages[lang].noCertificates;
    }
  } catch (error) {
    console.error('Error validating certificate:', error);
    resultDiv.textContent = messages[lang].error;
  }
});

// Function to display validation results with clickable cards
function displayCertificateValidationResults(certificates, resultDiv, lang) {
  resultDiv.innerHTML = `<h2>${certificates.length} ${messages[lang].found}</h2>`;
  certificates.forEach(certificate => {
    const certHtml = `
      <div class="certificate-card" style="margin-bottom: 10px; padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 5px; cursor:pointer;" data-cert-id="${certificate.certificateId}" title="${messages[lang]['open-certificate-page']}">
        <p><strong>${messages[lang].name}</strong> ${certificate.name}</p>
        <p><strong>${messages[lang].courses}</strong> ${certificate.coursesOrModules}</p>
        <p><strong>${messages[lang].date}</strong> ${certificate.date}</p>
        <p><strong>${messages[lang].id}</strong> ${certificate.certificateId}</p>
      </div>
    `;
    resultDiv.innerHTML += certHtml;
  });

  // Make the whole card clickable
  resultDiv.querySelectorAll('.certificate-card').forEach(card => {
    card.addEventListener('click', () => {
      const certId = card.getAttribute('data-cert-id');
      window.open(`certificate-view.html?id=${encodeURIComponent(certId)}`, '_blank');
    });
  });
}