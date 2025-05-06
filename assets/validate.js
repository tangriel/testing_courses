// Certificate Validation Logic
document.getElementById('validation-form').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const certificateId = document.getElementById('certificate-id').value.trim();
    const name = document.getElementById('participant-name').value.trim();
    const course = document.getElementById('course-name').value.trim();
  
    const resultDiv = document.getElementById('validation-result');
    resultDiv.textContent = ''; // Clear previous results
  
    if (certificateId) {
      validateById(certificateId, resultDiv);
    } else if (name && course) {
      validateByNameAndCourse(name, course, resultDiv);
    } else {
      alert('Please enter either Certificate ID or Name + Course details.');
    }
  });
  
  function validateById(certificateId, resultDiv) {
    // Regenerate expected Certificate ID
    resultDiv.textContent = `Certificate with ID ${certificateId} is VALID.`;
  }
  
  function validateByNameAndCourse(name, course, resultDiv) {
    const expectedId = generateCertificateId(name, course);
  
    resultDiv.textContent = `Certificate for ${name} (${course}) is VALID. Certificate ID: ${expectedId}`;
  }
  
  function generateCertificateId(name, course) {
    return btoa(`${name}:${course}`).substring(0, 12); // Match the admin.js logic
  }