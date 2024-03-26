document
  .getElementById("LoginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var email = document.querySelector('input[name="email"]').value;
    var password = document.querySelector('input[name="password"]').value;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5001/api/v1/painter_sessions", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var painter = JSON.parse(xhr.responseText);
          console.log(painter);
          window.location.href = `/paintersPage/${painter.id}`;
        } else if (xhr.status === 401) {
          // Error response
          showToast("Wrong Login details");
        }
      }
    };
    xhr.send(
      JSON.stringify({
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
