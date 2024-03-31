var painters_id = document.body.getAttribute("data-painter-id");
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
const sections = document.querySelectorAll(
  ".right__col .photo, .right__col .video, .right__col .comment, .right__col .profile"
);
var button = document.getElementById("add-photo");
var button2 = document.getElementById("add-video");
var photodiv = document.getElementById("photodiv");
var block_boxes = document.querySelectorAll(".block-box");
var vid_boxes = document.querySelectorAll(".vid-box");
var videosdiv = document.getElementById("videosdiv");
var commentdiv = document.getElementById("commentdiv");
var profilediv = document.getElementById("profilediv");

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
      if (className === "photos") {
        videosdiv.style.display = "none";
        commentdiv.style.display = "none";
        profilediv.style.display = "none";
        block_boxes.forEach((block_box) => {
          block_box.style.display = "block";
        });
        button.style.display = "block";
        button2.style.display = "none";
      } else if (className === "videos") {
        photodiv.style.display = "none";
        commentdiv.style.display = "none";
        profilediv.style.display = "none";
        vid_boxes.forEach((vid_box) => {
          vid_box.style.display = "block";
        });
        button2.style.display = "block";
        button.style.display = "none";
      } else if (className === "comments") {
        photodiv.style.display = "none";
        videosdiv.style.display = "none";
        profilediv.style.display = "none";
        button.style.display = "none";
        button2.style.display = "none";
      } else if (className === "profile") {
        photodiv.style.display = "none";
        commentdiv.style.display = "none";
        videosdiv.style.display = "none";
        button.style.display = "none";
        button2.style.display = "none";
      }
      section.style.display = "grid";
    }
  });
});

document.getElementById("add-photo").addEventListener("click", function () {
  document.getElementById("photo-input").click();
});
document.getElementById("add-video").addEventListener("click", function () {
  document.getElementById("video-input").click();
});

document.getElementById("photo-input").addEventListener("change", function (e) {
  uploadFile(e, "/upload_photo");
});

document.getElementById("video-input").addEventListener("change", function (e) {
  uploadFile(e, "/upload_video");
});

document.getElementById("fileinput").addEventListener("change", function (e) {
  var file = e.target.files[0];
  var reader = new FileReader();

  reader.onloadend = function () {
    // Display the selected image
    document.getElementById("avatar").src = reader.result;

    // Create a FormData object
    var formData = new FormData();
    formData.append("file", file);

    // Send a POST request to the server with the image file
    fetch("/upload_photo", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // The server responds with the URL of the uploaded image
        // Extract the file path from the message
        var filePath = data.file_url;

        // Set the src of the img element to the file path
        document.getElementById("avatar").src = filePath;
        document.getElementById("profImg").src = filePath;

        // Prepare the data for the PUT request
        var userData = {
          profile_image: filePath,
        };

        // Send a PUT request to the users API
        fetch("http://127.0.0.1:5001/api/v1/painters/" + painters_id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      });
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    document.getElementById("avatar").src = "";
  }
});

function saveChanges() {
  // Get form data
  var formData = {
    first_name: document.getElementById("first_name").value,
    last_name: document.getElementById("last_name").value,
    email: document.getElementById("email").value,
    // Add other form fields as needed
  };

  // Send PUT request to the server
  fetch("http://127.0.0.1:5001/api/v1/painters/" + painters_id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle response from the server, e.g., show success message
      console.log(data);
    })
    .catch((error) => {
      // Handle errors
      console.error("Error:", error);
    });
}

function uploadFile(e, route) {
  var file = e.target.files[0];
  var formData = new FormData();
  formData.append("file", file);

  fetch(route, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      fetch(`/check/${painters_id}`)
        .then((request) => request.json())
        .then((response) => {
          if (response.reply === false) {
            fetch("http://127.0.0.1:5001/api/v1/paintersMedia", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ painters_id: painters_id }),
            })
              .then((response) => response.json())
              .then((media) => {
                console.log(media);
                if (route === "/upload_video") {
                  fetch(
                    `http://127.0.0.1:5001/api/v1/paintersMedias/${painters_id}/video`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ video: data.file_url }),
                    }
                  )
                    .then((response) => response.json())
                    .then((media) => {
                      updatePage(media);
                    });
                } else if (route === "/upload_photo") {
                  fetch(
                    `http://127.0.0.1:5001/api/v1/paintersMedias/${painters_id}/photos`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ photos: data.file_url }),
                    }
                  )
                    .then((response) => response.json())
                    .then((media) => {
                      updatePage(media);
                    });
                }
              });
          } else if (response.reply === true) {
            if (route === "/upload_video") {
              fetch(
                `http://127.0.0.1:5001/api/v1/paintersMedias/${painters_id}/video`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ video: data.file_url }),
                }
              )
                .then((response) => response.json())
                .then((media) => {
                  updatePage(media);
                });
            } else if (route === "/upload_photo") {
              fetch(
                `http://127.0.0.1:5001/api/v1/paintersMedias/${painters_id}/photos`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ photos: data.file_url }),
                }
              )
                .then((response) => response.json())
                .then((media) => {
                  updatePage(media);
                });
            }
          }
        });
    })
    .catch((error) => {
      console.error(error);
    });
}

function updatePage(media) {
  // Get the divs
  var photoDiv = document.getElementById("photodiv");
  var videoDiv = document.getElementById("videosdiv");

  // Clear the divs
  photoDiv.innerHTML = "";
  videoDiv.innerHTML = "";

  // Add the photos
  for (var i = 0; i < media.photos.length; i++) {
    var photo = media.photos[i];
    var photoHTML = `
      <div class="block-box">
        <img src="${photo}" alt="Photo" style="width: 320px; height: 200px" />
        <span id="close-span" style="cursor: pointer; position: relative" class="material-icons-sharp" onclick="deleteMediaP('${painters_id}', '${photo}')">close</span>
      </div>
    `;
    photoDiv.innerHTML += photoHTML;
  }

  // Add the videos
  for (var i = 0; i < media.video.length; i++) {
    var video = media.video[i];
    var videoHTML = `
      <div class="vid-box">
        <video width="320" height="240" controls>
          <source src="${video}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <span id="close-span" style="cursor: pointer; position: relative" class="material-icons-sharp" onclick="deleteMediaV('${painters_id}', '${video}')">close</span>
      </div>
    `;
    videoDiv.innerHTML += videoHTML;
  }
}

function deleteMediaP(painter_id, src) {
  fetch(`http://127.0.0.1:5001/api/v1/paintersMediaP`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      painter_id: painter_id,
      src: src,
      attr: "photos",
    }),
  })
    .then((response) => response.json())
    .then((reply) => {
      console.log(reply);
      updatePage(reply);
    });
}

function deleteMediaV(painter_id, src) {
  fetch(`http://127.0.0.1:5001/api/v1/paintersMediaP`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      painter_id: painter_id,
      src: src,
      attr: "video",
    }),
  })
    .then((response) => response.json())
    .then((reply) => {
      console.log(reply);
      updatePage(reply);
    });
}
