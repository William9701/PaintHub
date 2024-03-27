const button = document.querySelector("#buy_now_btn");
var user_id = document.body.getAttribute("data-user-id");
var payment_cart = [];

button.addEventListener("click", (event) => {
  fetch("/stripe_pay", {
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
        .then(function (result) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer
          // using `result.error.message`.
        });
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
