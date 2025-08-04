import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

// Firebase config (same as validate.js)
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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const messages = {
  en: {
    name: "Name:",
    courses: "Courses/Modules:",
    date: "Completion Date:",
    id: "Certificate ID:",
    openPdf: "Open Certificate PDF"
  },
  ua: {
    name: "Ім'я:",
    courses: "Курси/Модулі:",
    date: "Дата завершення:",
    id: "ID сертифіката:",
    openPdf: "Відкрити PDF сертифіката"
  }
};

function getCurrentLang() {
  const lang = localStorage.getItem('lang');
  return lang === 'ua' ? 'ua' : 'en';
}

const lang = getCurrentLang();

const urlParams = new URLSearchParams(window.location.search);
const certId = urlParams.get('id');

const container = document.getElementById('certificate-card-container');

signInAnonymously(auth).then(async () => {
  const certificateRef = ref(db, 'certificates');
  const snapshot = await get(certificateRef);

  if (snapshot.exists()) {
    const certificates = Object.values(snapshot.val());
    const cert = certificates.find(c => c.certificateId === certId);

    if (cert) {
      container.innerHTML = `
        <div class="certificate-card" style="margin: 30px auto; max-width: 500px; padding: 20px; background: #fff; border: 1px solid #ccc; border-radius: 8px;">
          <p><strong>${messages[lang].name}</strong> ${cert.name}</p>
          <p><strong>${messages[lang].courses}</strong> ${cert.coursesOrModules}</p>
          <p><strong>${messages[lang].date}</strong> ${cert.date}</p>
          <p><strong>${messages[lang].id}</strong> ${cert.certificateId}</p>
          <p>
            <a href="#" id="open-pdf-link" style="color:#0077b6; text-decoration:underline; cursor:pointer;">
              ${messages[lang].openPdf}
            </a>
          </p>
        </div>
      `;

      document.getElementById('open-pdf-link').addEventListener('click', (e) => {
        e.preventDefault();
        generateCertificatePDF(cert.name, cert.coursesOrModules, cert.date, cert.certificateId, true);
      });
    } else {
      container.innerHTML = `<p>Certificate not found.</p>`;
    }
  } else {
    container.innerHTML = `<p>No certificates found.</p>`;
  }
});


function generateCertificatePDF(name, selectedCoursesOrModules, date, certificateId, openInNewTab = false) {
  const { jsPDF } = window.jspdf; // Assuming jsPDF is already added
  const doc = new jsPDF('landscape', 'mm', 'a4'); // A4 page in landscape

  // Certificate Dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add Frame Background Image
  const frameImg = new Image();
  frameImg.src = 'assets/frame.jpeg'; // Path to the frame image
  frameImg.onload = function () {
    doc.addImage(frameImg, 'JPEG', 0, 0, pageWidth, pageHeight); // Cover the entire page with the background image

    // Calculate Vertical Centering
    let contentHeight = 0;
    const lineHeight = 10;
    const textLines = [
      'Certificate of Completion',
      `This is to certify that`,
      name,
      `successfully completed the following:`,
      ...selectedCoursesOrModules.split(', '),
      `on ${new Date(date).toLocaleDateString()}`,
      `Certificate ID: ${certificateId}`,
    ];

    textLines.forEach((line, index) => {
      contentHeight += (index === 2 ? 12 : lineHeight); // Larger font size for name
    });

    const startY = (pageHeight - contentHeight) / 2;

    // Add Certificate Content
    let currentY = startY;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('Certificate of Completion', pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight + 5;

    // Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`This is to certify that`, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight;

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(name, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight + 2;

    // Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`successfully completed the following:`, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight;

    // Courses/Modules
    doc.setFontSize(14); // Adjusted font size for the list
    const coursesOrModulesArray = selectedCoursesOrModules.split(', ');

    if (coursesOrModulesArray.length <= 2) {
      // Single-column layout
      coursesOrModulesArray.forEach((courseOrModule) => {
        doc.text(courseOrModule, pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeight;
      });
    } else {
      // Two-column layout for courses/modules
      const columnGap = 40; // Horizontal gap between columns
      const columnWidth = (pageWidth - columnGap) / 2 - 20; // Width of each column with padding for safety
      const centerX = pageWidth / 2; // Center of the page
      const columnStartXLeft = centerX - columnWidth; // Left column starting X position
      const columnStartXRight = centerX + columnGap / 2; // Right column starting X position
      let currentYLeft = currentY; // Y position for the left column
      let currentYRight = currentY; // Y position for the right column

      coursesOrModulesArray.forEach((courseOrModule, index) => {
        const wrappedText = doc.splitTextToSize(courseOrModule, columnWidth); // Wrap text to fit within column width

        if (index % 2 === 0) {
          // Left column
          wrappedText.forEach((line) => {
            doc.text(line, columnStartXLeft, currentYLeft, { align: 'left' });
            currentYLeft += lineHeight;
          });
        } else {
          // Right column
          wrappedText.forEach((line) => {
            doc.text(line, columnStartXRight, currentYRight, { align: 'left' });
            currentYRight += lineHeight;
          });
        }
      });

      // Adjust `currentY` to the lowest point between the two columns
      currentY = Math.max(currentYLeft, currentYRight);
    }

    // Completion Date
    doc.text(`on ${new Date(date).toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight;

    // Certificate ID
    doc.setFontSize(12);
    doc.text(`Certificate ID: ${certificateId}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight;

    // Add Signature
    const signatureImg = new Image();
    signatureImg.src = 'assets/signature.png'; // Path to the signature
    signatureImg.onload = function () {
      const signatureWidth = 25; // Reduced width for a smaller signature
      const signatureHeight = (signatureImg.height / signatureImg.width) * signatureWidth;

      // Positioning Elements
      const centerX = pageWidth / 2; // Horizontal center of the page
      const signatureY = currentY + 10; // Signature below the certificate ID
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
      if (openInNewTab) {
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
      } else {
        doc.save(`${name}_${certificateId}_Certificate.pdf`);
      }
    };
  };
}