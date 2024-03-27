const button = document.querySelector("#buy_now_btn");
var user_id = document.body.getAttribute("data-user-id");
var payment_cart = [];
var delivery_cost = 50;

button.addEventListener("click", (event) => {
  fetch(`/stripe_pay/${user_id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment_cart),
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      var stripe = Stripe(data.checkout_public_key);
      stripe
        .redirectToCheckout({
          sessionId: data.checkout_session_id,
        })
        .then(function (result) {});
      var data = {
        user_id: user_id,
      };
      fetch(`http://127.0.0.1:5001/api/v1/invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((invoice) => {
          var payload = {
            payment_cart: payment_cart,
          };
          fetch(`http://127.0.0.1:5001/api/v1/invoice/${invoice.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
            .then((response) => response.json())
            .then((nuser) => {
              console.log(nuser);
            });
          var data = {
            delivery_charge: delivery_cost,
          };
          fetch(`http://127.0.0.1:5001/api/v1/invoicep/${invoice.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((response) => response.json())
            .then((nuser) => {
              console.log(nuser);
            });
          
        })
        .catch((error) => console.error("Error:", error));
    });
});

document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch(`http://127.0.0.1:5001/api/v1/users/${user_id}`);
  const user = await response.json();
  for (var key in user.cart_contentsQuantity) {
    var value = user.cart_contentsQuantity[key];
    const reply = await fetch(`/getStripeId/${key}`);
    const stripeId = await reply.json();
    var data = {
      price: stripeId.id,
      quantity: value,
    };
    payment_cart.push(data);
  }
});

var subtotal = 0;
// This function calculates the total price
function calculateTotal() {
  var total = 0;
  // Get all the rows in the table
  var rows = document.querySelectorAll("table tbody tr");
  for (var i = 0; i < rows.length; i++) {
    // Get the price and quantity for each row
    var price = parseFloat(
      rows[i].querySelectorAll("td")[7].innerText.replace("$", "")
    );
    var quantity = parseInt(rows[i].querySelectorAll("td")[6].innerText);
    // Add the product of price and quantity to the total
    total += price * quantity;
  }
  subtotal = total.toFixed(2);
  // Update the total in the footer
  document.getElementById("subTotal").innerText = "$" + total.toFixed(2);
}
// Call the function when the page loads
window.onload = calculateTotal;

document.getElementById("sub-btn").addEventListener("click", function () {
  var inputs = document.querySelectorAll(".user input");
  var allInputsNotEmpty = true; // Flag to track if all inputs are not empty

  // Check if any input is empty
  inputs.forEach(function (input) {
    if (input.value.trim() === "") {
      input.parentElement.classList.add("highlight");
      allInputsNotEmpty = false;
    } else {
      input.parentElement.classList.remove("highlight");
    }
  });

  // If all inputs are not empty, retrieve all input fields
  if (allInputsNotEmpty) {
    var addressInput = document.getElementById("address").value;
    var streetInput = document.getElementById("street").value;
    var cityInput = document.getElementById("city").value;
    var stateInput = document.getElementById("state").value;
    var pincodeInput = document.getElementById("pincode").value;
    var landmarkInput = document.getElementById("landmark").value;
    var phoneNumberInput = document.getElementById("Phonenumber").value;

    var Delivery_id = "price_1OytcwRtCndOdsDRFo96wIc4";

    document.getElementById(
      "Del_Address"
    ).textContent = `${addressInput}, ${cityInput}, ${stateInput}.`;

    document.getElementById("PhoneNumber").textContent = phoneNumberInput;
    fetch(`/CalculateDistance/${cityInput}`)
      .then((response) => response.json())
      .then((reply) => {
        delivery_cost = reply.delivery_cost;
        document.getElementById(
          "delivery_charge"
        ).textContent = `$${delivery_cost}.00`;

        var total = parseInt(subtotal) + delivery_cost;
        document.getElementById("total_due").textContent = `$${total}.00`;

        fetch(`/update_price/${Delivery_id}/${delivery_cost}`)
          .then((response) => response.json())
          .then((reply) => {
            console.log(reply);
            var data = {
              price: reply.newPrice,
              quantity: "1",
            };
            payment_cart.push(data);
            button.style.display = "block";
            // Clear input fields after form submission
            inputs.forEach(function (input) {
              input.value = "";
            });
          });
      });
  }
});
