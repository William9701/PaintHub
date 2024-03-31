document
  .getElementById("LoginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    var email = document.querySelector('input[name="email"]').value;
    var password = document.querySelector('input[name="password"]').value;

    try {
      fetch("/painter_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })
        .then((response) => {
          if (response.ok) {
            // If the response status is in the range 200-299
            // Set the session ID as a cookie for the homepage
            return response.json(); // Parse JSON response
          } else {
            // Handle other status codes (e.g., 401 Unauthorized)
            showToast("Wrong Login details");
          }
        })
        .then((data) => {
          // Assuming the server returns session_id in the response
          if (data && data.session_id) {
            document.cookie = `session_id=${data.session_id}`; // Set the session ID as a cookie
            window.location.href = "/paintersPage"; // Redirect to the homepage
          }
        })
        .catch((error) => {
          console.error("Error:", error); // Handle fetch error
        });
    } catch (error) {
      console.error("Error:", error); // Handle other errors
    }
  });

function showToast(message) {
  var toast = document.querySelector(".toast");
  toast.querySelector(".toast-body").textContent = message;
  $(toast).toast("show");
}
