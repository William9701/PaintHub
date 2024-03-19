document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var firstName = document.querySelector('input[name="first_name"]').value;
    var lastName = document.querySelector('input[name="last_name"]').value;
    var email = document.querySelector('input[name="email"]').value;
    var password = document.querySelector('input[name="password"]').value;
    var confirmPassword = document.querySelector(
      'input[name="confirm_password"]'
    ).value;

    console.log(password, confirmPassword);
    if (password !== confirmPassword) {
      showToast("Passwords do not match");
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5001/api/v1/users", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          showToast("Sign-up Succesfull");
		  // Redirect to login page
		  window.location.href = "http://localhost:5000/login";
        } else if (xhr.status === 460) {
          // Error response
          showToast("Email already exist");
        }
      }
    };
    xhr.send(
      JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      })
    );
  });

function showToast(message) {
  var toast = document.querySelector(".toast");
  toast.querySelector(".toast-body").textContent = message;
  $(toast).toast("show");
}
