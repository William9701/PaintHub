// Initialize cart as an empty array
var cart = [];

// Function to handle adding to cart
function addToCart(product) {
  // Add the product to the cart
  cart.push(product);

  document.getElementById("cart-count").style.display = "inline";

  // Update the cart icon with the number of items in the cart
  document.getElementById("cart-count").textContent = cart.length;
}

// Add event listener to the "Add To Cart" button
document.querySelector(".btn").addEventListener("click", function (event) {
  event.preventDefault();
  addToCart("NIKE");
});

document
  .querySelector(".fa-cart-shopping")
  .addEventListener("click", function () {
    var cart = document.getElementById("cart");
    if (cart.style.display === "none") {
      cart.style.display = "block";
      cart.style.transform = "translateX(0)";
    } else {
      cart.style.display = "none";
      cart.style.transform = "translateX(100%)";
    }
  });
