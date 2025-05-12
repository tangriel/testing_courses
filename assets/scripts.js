document.addEventListener('DOMContentLoaded', () => {
  // Language Translations
  const translations = {
    en: {
      "header-title": "Hanna Kaplun",
      "header-subtitle": "Expert in software testing, delivering exceptional courses for aspiring professionals.",
      "about-title": "About Me",
      "about-description": `Hi, I'm Hanna Kaplun, a software testing expert with a proven track record in delivering high-quality training. My courses focus on practical, real-world testing techniques to help you excel. Connect with me on <a href="https://www.linkedin.com/in/hanna-kaplun/" target="_blank">LinkedIn</a>.`,
      "course-details-title": "Course Details",
      "course-duration": "Duration:",
      "course": "Course",
      "module": "Module",
      "enrollment-title": "Sign Up for the Course",
      "label-name": "Name:",
      "label-email": "Email:",
      "label-phone": "Phone:",
      "label-courses": "Select Courses/Modules:",
      "label-comments": "Additional Comments or Questions:",
      "submit-button": "Sign Up"
    },
    ua: {
      "header-title": "Ганна Каплун",
      "header-subtitle": "Експерт у тестуванні ПЗ, надаю високоякісні курси для майбутніх професіоналів.",
      "about-title": "Про мене",
      "about-description": `Привіт! Я Ганна Каплун, експерт з тестування програмного забезпечення з великим досвідом у навчанні. Мої курси зосереджені на практичних методах тестування, які допоможуть вам досягти успіху. Зв'яжіться зі мною через <a href="https://www.linkedin.com/in/hanna-kaplun/" target="_blank">LinkedIn</a>.`,
      "course-details-title": "Деталі курсу",
      "course-duration": "Тривалість:",
      "course": "Курс",
      "module": "Модуль",
      "enrollment-title": "Запис на курс",
      "label-name": "Ім’я:",
      "label-email": "Електронна пошта:",
      "label-phone": "Телефон:",
      "label-courses": "Виберіть курси/модулі:",
      "label-comments": "Додаткові коментарі або питання:",
      "submit-button": "Записатися"
    }
  };

  // Language Switcher
  const languageSwitcher = document.getElementById('language-switcher');
  languageSwitcher.addEventListener('change', (event) => {
    const lang = event.target.value;
    updateLanguage(lang);
  });

  function updateLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      // Allow HTML content for certain keys, such as "about-description"
      if (key === "about-description") {
        el.innerHTML = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    });

    // Translate course data if available
    loadCourses(lang);
    populateCourseDropdown(lang);
  }

  // Populate Course Details as a Grid
  async function loadCourses(lang = 'en') {
    try {
      const response = await fetch('data/courses.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const courses = await response.json();
      const courseInfoDiv = document.getElementById('course-info');
      if (!courseInfoDiv) {
        console.error("Element with ID 'course-info' not found.");
        return;
      }

      courseInfoDiv.innerHTML = ""; // Clear previous content

      courses.forEach(course => {
        // Translate course data if available
        const title = lang === 'ua' ? course.title_ua : course.title;
        const description = lang === 'ua' ? course.description_ua : course.description;

        const courseHeader = document.createElement('h3');
        courseHeader.textContent = `${title} (${course.price})`;
        courseInfoDiv.appendChild(courseHeader);

        const courseDescription = document.createElement('p');
        courseDescription.innerHTML = description;
        courseInfoDiv.appendChild(courseDescription);

        const courseDates = document.createElement('p');
        courseDates.textContent = `${translations[lang]["course-duration"]} ${course.start_date} to ${course.end_date}`;
        courseInfoDiv.appendChild(courseDates);

        const moduleGrid = document.createElement('div');
        moduleGrid.className = 'module-grid';

        course.modules.forEach(module => {
          const moduleRow = document.createElement('div');
          moduleRow.className = 'module-row';

          const name = document.createElement('span');
          name.textContent = lang === 'ua' ? module.name_ua : module.name;

          const price = document.createElement('span');
          price.textContent = module.price;

          const dateTime = document.createElement('span');
          dateTime.textContent = `${module.date}, ${module.time}`;

          moduleRow.appendChild(name);
          moduleRow.appendChild(price);
          moduleRow.appendChild(dateTime);
          moduleGrid.appendChild(moduleRow);
        });

        courseInfoDiv.appendChild(moduleGrid);
      });
    } catch (error) {
      console.error('Error loading courses:', error);
      alert('Failed to load courses. Please check your setup.');
    }
  }

  // Populate the multi-select dropdown with courses and modules, excluding prices
  async function populateCourseDropdown(lang = 'en') {
    try {
      const response = await fetch('data/courses.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const courses = await response.json();
      const courseDropdown = document.getElementById('course-or-modules');
      if (!courseDropdown) {
        console.error("Element with ID 'course-or-modules' not found.");
        return;
      }

      courseDropdown.innerHTML = ''; // Clear existing options

      courses.forEach(course => {
        const title = lang === 'ua' ? course.title_ua : course.title;

        // Create an option for the entire course
        const courseOption = document.createElement('option');
        courseOption.value = `${translations[lang]["course"]}: ${title}`;
        courseOption.textContent = `${translations[lang]["course"]}: ${title}`;
        courseDropdown.appendChild(courseOption);

        // Create options for each module in the course
        course.modules.forEach(module => {
          const name = lang === 'ua' ? module.name_ua : module.name;

          const moduleOption = document.createElement('option');
          moduleOption.value = `${translations[lang]["module"]}: ${name}`;
          moduleOption.textContent = `${translations[lang]["module"]}: ${name}`;
          courseDropdown.appendChild(moduleOption);
        });
      });

      console.log("Multi-select dropdown populated successfully.");
    } catch (error) {
      console.error('Error loading courses for dropdown:', error);
    }
  }

  // Initial load
  loadCourses();
  populateCourseDropdown();

  // Handle sign-up form submission
  document.getElementById('sign-up-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);

    // Get form field values
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const comments = formData.get('comments'); // Get comments field value

    // Get selected courses/modules
    const selectedOptions = Array.from(document.getElementById('course-or-modules').selectedOptions)
      .map(option => option.value);

    // Validate fields
    if (!name || !email || !phone || selectedOptions.length === 0) {
      alert('Please fill in all fields and select at least one course or module.');
      return;
    }

    // Prepare data for Web3Forms submission
    const web3FormsData = {
      access_key: "11dc97ae-636d-4b68-a4dd-4c3d558d90ab", // Replace with your Web3Forms access key
      name: name,
      email: email,
      phone: phone,
      courses: selectedOptions.join(', '), // Combine selected courses/modules into a string
      comments: comments || "No additional comments provided.", // Include comments or a placeholder
      subject: "New Course Registration",
      message: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourses/Modules: ${selectedOptions.join(', ')}\nComments: ${comments || "No additional comments provided."}`
    };

    try {
      // Send data to Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(web3FormsData)
      });

      if (response.ok) {
        alert(`Thank you for signing up, ${name}! We will contact you soon.`);
        form.reset(); // Reset the form
      } else {
        const errorData = await response.json();
        console.error('Submission failed with error:', errorData);
        alert('Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error while submitting form:', error);
      alert('Something went wrong. Please try again later.');
    }
  });
});