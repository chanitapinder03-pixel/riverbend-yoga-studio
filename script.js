"use strict";

// Class data is kept in an array of objects so recommendations can be changed
// without rewriting the feature logic.
const classOptions = [
  {
    name: "Gentle Yoga",
    interestValue: "gentle",
    goals: ["ease", "relax"],
    levels: ["new", "some", "experienced"],
    description: "A slower-paced class with supportive options, ideal for building confidence and moving comfortably."
  },
  {
    name: "Vinyasa Yoga",
    interestValue: "vinyasa",
    goals: ["energy"],
    levels: ["some", "experienced"],
    description: "A flowing practice that links movement and breathing for students who want a more active class."
  },
  {
    name: "Restorative Yoga",
    interestValue: "restorative",
    goals: ["relax"],
    levels: ["new", "some", "experienced"],
    description: "A quiet, supported practice designed for rest, stress relief, and a slower pace."
  }
];

function chooseClass(goal, experience) {
  const matches = classOptions.filter((item) =>
    item.goals.includes(goal) && item.levels.includes(experience)
  );

  if (matches.length > 0) {
    return matches[0];
  }

  // A new student who selects an active goal still receives a beginner-friendly option.
  if (experience === "new") {
    return classOptions.find((item) => item.name === "Gentle Yoga");
  }

  return classOptions.find((item) => item.name === "Vinyasa Yoga");
}

function saveRecommendation(recommendation) {
  localStorage.setItem("riverbendClassPreference", JSON.stringify(recommendation));
}

function loadRecommendation() {
  const saved = localStorage.getItem("riverbendClassPreference");
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem("riverbendClassPreference");
    return null;
  }
}

function showRecommendation(recommendation, saved = false) {
  const result = document.getElementById("class-result");
  if (!result || !recommendation) return;

  const savedText = saved
    ? '<p class="saved-note">Your saved recommendation was loaded from your last visit.</p>'
    : '<p class="saved-note">We saved this recommendation for your next visit.</p>';

  result.innerHTML = `
    <div class="recommendation-card">
      <h3>${recommendation.name}</h3>
      <p>${recommendation.description}</p>
      ${savedText}
      <p><a href="events.html">Request information about ${recommendation.name}</a></p>
    </div>`;
}

function initializeClassFinder() {
  const button = document.getElementById("find-class-button");
  if (!button) return;

  const saved = loadRecommendation();
  if (saved) showRecommendation(saved, true);

  button.addEventListener("click", () => {
    const goal = document.getElementById("goal").value;
    const experience = document.getElementById("finder-experience").value;
    const result = document.getElementById("class-result");

    if (!goal || !experience) {
      result.innerHTML = '<p class="field-error">Please choose both a goal and an experience level.</p>';
      return;
    }

    const recommendation = chooseClass(goal, experience);
    saveRecommendation(recommendation);
    showRecommendation(recommendation);
  });
}

function showFieldError(field, message) {
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = message;
  field.classList.toggle("input-error", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(form) {
  const name = form.elements.name;
  const email = form.elements.email;
  const interest = form.elements.interest;
  const message = form.elements.message;
  let valid = true;

  if (name.value.trim().length < 2) {
    showFieldError(name, "Please enter your name using at least 2 characters.");
    valid = false;
  } else {
    showFieldError(name, "");
  }

  if (!validateEmail(email.value.trim())) {
    showFieldError(email, "Please enter a valid email address, such as name@example.com.");
    valid = false;
  } else {
    showFieldError(email, "");
  }

  if (!interest.value) {
    showFieldError(interest, "Please choose a class or event that interests you.");
    valid = false;
  } else {
    showFieldError(interest, "");
  }

  if (message.value.trim().length < 10) {
    showFieldError(message, "Please enter a message of at least 10 characters.");
    valid = false;
  } else {
    showFieldError(message, "");
  }

  return valid;
}

function applySavedPreferenceToForm() {
  const interest = document.getElementById("interest");
  if (!interest) return;

  const saved = loadRecommendation();
  if (!saved) return;

  const matchingOption = Array.from(interest.options).find(
    (option) => option.value === saved.interestValue
  );
  if (matchingOption) interest.value = saved.interestValue;
}

function initializeFormValidation() {
  const form = document.getElementById("interest-form");
  if (!form) return;

  applySavedPreferenceToForm();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.getElementById("form-status");

    if (!validateForm(form)) {
      status.textContent = "Please correct the highlighted fields and try again.";
      status.className = "form-status";
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    status.textContent = "Thanks! Your request looks complete and is ready to send to Riverbend Yoga Studio.";
    status.className = "form-status success";
  });

  ["name", "email", "interest", "message"].forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateForm(form);
    });
    field.addEventListener("change", () => {
      if (field.getAttribute("aria-invalid") === "true") validateForm(form);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeClassFinder();
  initializeFormValidation();
});
