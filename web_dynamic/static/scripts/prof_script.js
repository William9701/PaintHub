var user_id = document.body.getAttribute("data-user-id");

function toggleDetails(detailsId) {
  var details = document.getElementById(detailsId);
  if (details.classList.contains("hidden")) {
    // If hidden, remove the 'hidden' class to display the details
    details.classList.remove("hidden");
    details.style.display = "table-row"; // Display the details as table row
  } else {
    // If not hidden, add the 'hidden' class to hide the details
    details.classList.add("hidden");
    details.style.display = "none"; // Hide the details
  }
}

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

        // Prepare the data for the PUT request
        var userData = {
          Image: filePath,
        };

        // Send a PUT request to the users API
        fetch("http://127.0.0.1:5001/api/v1/users/" + user_id, {
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
