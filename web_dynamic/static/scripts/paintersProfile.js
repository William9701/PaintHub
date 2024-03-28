// Get all images
const images = document.querySelectorAll(".photos img");

// Create a modal
const modal = document.createElement("div");
modal.style.display = "none";
modal.style.position = "fixed";
modal.style.top = "0";
modal.style.right = "0";
modal.style.bottom = "0";
modal.style.left = "0";
modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
modal.style.zIndex = "1000";
modal.style.padding = "50px";
modal.style.boxSizing = "border-box";
modal.style.overflow = "auto";

// Create an image element for the modal
const modalImage = document.createElement("img");
modalImage.style.width = "100%";
modalImage.style.height = "auto";
modalImage.style.maxWidth = "800px";
modalImage.style.margin = "0 auto";
modalImage.style.display = "block";

// Add the image element to the modal
modal.appendChild(modalImage);

// Add the modal to the body
document.body.appendChild(modal);

// Add a click event listener to each image
images.forEach((image) => {
  image.addEventListener("click", (event) => {
    // Prevent the default action
    event.preventDefault();

    // Get the source of the clicked image
    const src = event.target.src;

    // Set the source of the modal image
    modalImage.src = src;

    // Show the modal
    modal.style.display = "block";
  });
});

// Add a click event listener to the modal
modal.addEventListener("click", () => {
  // Hide the modal
  modal.style.display = "none";
});

// Get all a tags
const links = document.querySelectorAll(".right__col ul li a");

// Get all sections
const sections = document.querySelectorAll(".right__col div");
var comment_box = document.getElementById("cbox");
var comment_user = document.getElementById("cbox1");
var comment_date = document.getElementById("cbox2");
var comment_text = document.getElementById("cbox3");

// Add a click event listener to each a tag
links.forEach((link) => {
  link.addEventListener("click", (event) => {
    // Prevent the default action
    event.preventDefault();

    // Get the class of the clicked a tag
    const className = link.textContent.toLowerCase();

    // Hide all sections
    sections.forEach((section) => {
      section.style.display = "none";
    });

    // Show the section that corresponds to the clicked a tag
    const section = document.querySelector(".right__col ." + className);
    if (section) {
      if (section === "comments") {
        comment_box.style.display = "block";
        comment_user.style.display = "block";
        comment_date.style.display = "block";
        comment_text.style.display = "block";
      }
      section.style.display = "grid";
    }
  });
});

const hireButton = document.getElementById("hire");
const popupForm = document.getElementById("popup-form");
const submitButton = document.getElementById("submit-button");
const loadingMessage = document.getElementById("loading-message");

hireButton.addEventListener("click", () => {
  popupForm.style.display = "block";
});

submitButton.addEventListener("click", () => {
  // Simulate loading
  loadingMessage.style.display = "block";
  setTimeout(() => {
    // Redirect to checkout page (not implemented)
    // For now, just hide the popup
    popupForm.style.display = "none";
  }, 20000); // 2 seconds
});
