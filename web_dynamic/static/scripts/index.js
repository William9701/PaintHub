// Initialize cart as an empty array
var cart = [];

// Function to handle adding to cart
function addToCart(product_id, user_id) {
  event.preventDefault(); // Prevent default form submission behavior

  // Check if user_id is provided
  if (user_id) {
    var data = {
      cart_contents: product_id,
    };

    // Send a PUT request to update the user's cart contents
    fetch("http://127.0.0.1:5001/api/v1/users/" + user_id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update user cart");
        }
        // Fetch updated user data after updating cart contents
        return fetch(
          `http://127.0.0.1:5001/api/v1/users/${user_id}/${product_id}/1`
        );
      })
      .then((response) => response.json())
      .then((user) => {
        // Update cart count display
        document.getElementById("cart-count").style.display = "inline";
        document.getElementById("cart-count").textContent =
          user.cart_contents.length;
        console.log(user); // Optional: log user data
      })
      .catch((error) => console.error("Error:", error)); // Log any errors during the process
  } else {
    // If user_id is not provided, handle adding the product to cart directly
    cart.push(product_id); // Assuming 'cart' is a global variable storing cart contents

    // Update cart count display
    document.getElementById("cart-count").style.display = "inline";
    document.getElementById("cart-count").textContent = cart.length;
  }
}

function displayCart(user_id) {
  var cart = document.getElementById("cart");

  fetch(`http://127.0.0.1:5001/api/v1/users/${user_id}`)
    .then((response) => response.json())
    .then((user) => {
      const cartContents = user.cart_contents;
      const cart = document.getElementById("cart");
      const tableBody = cart.querySelector("tbody");
      tableBody.innerHTML = "";
      let totalPrice = 0; // Initialize total price variable

      cartContents.forEach((product_id) => {
        fetch(`http://127.0.0.1:5001/api/v1/products/${product_id}`)
          .then((response) => response.json())
          .then((product) => {
            createProductCart(product, user_id);

            // Fetch the quantity for the product asynchronously
            fetch(`/get_product_quantity/${user_id}/${product.id}`)
              .then((response) => response.json())
              .then((data) => {
                // If quantity is not null, set it as the value for the quantity input field
                // If quantity is null, default it to 1
                const quantity = data.quantity !== null ? data.quantity : 1;
                document.getElementById(`quantity-${product.id}`).value =
                  quantity;
              })
              .catch((error) => console.error("Error:", error));
            totalPrice += product.Price;
            console.log(totalPrice);
            console.log("i am here in totakl price");
            updateTotal(totalPrice); // Update total display
          });
      });

      // Update cart display
      if (cart.style.display === "none") {
        cart.style.display = "block";
        cart.style.transform = "translateX(0)";
      } else {
        cart.style.display = "none";
        cart.style.transform = "translateX(100%)";
      }
    })
    .catch((error) => console.error("Error:", error));
}

function createProductCart(product, user_id) {
  const cart = document.getElementById("cart");
  const tableBody = cart.querySelector("tbody");

  // Fetch the product quantity from the server
  fetch(`/get_product_quantity/${user_id}/${product.id}`)
    .then((response) => response.json())
    .then((data) => {
      let quantity = data.quantity;

      // Default quantity to 1 if it is null or undefined
      if (quantity === null || quantity === undefined) {
        quantity = 1;
      }

      // Calculate the total price for the product
      const totalPrice = product.Price * quantity;

      // Create a new table row for each product
      const newRow = document.createElement("tr");

      // Set the inner HTML of the new row
      newRow.innerHTML = `
        <td><img src="${product.ProductImage}.png" style="width: 40px;"></td>
        <td>${product.Name}</td>
        <td>$<span class="subtotal">${totalPrice}</span></td>
        <td><input style="width: 60px; height: 30px; text-align: center;" type="number" placeholder="Quantity" value="${quantity}" onchange="updateSubtotal(this, '${product.Price}', '${product.id}', '${user_id}')"></td>
        <td><span style="cursor: pointer;" onclick="RemoveFromCart('${user_id}', '${product.id}')" class="material-icons-sharp">close</span></td>
      `;

      // Append the new row to the table body
      tableBody.appendChild(newRow);
    })
    .catch((error) => console.error("Error fetching product quantity:", error));
}

function updateTotal(totalPrice) {
  const cart = document.getElementById("cart");
  const total = document.getElementById("total");
  total.textContent = "Total";
  const totalCell = cart.querySelector("tfoot td:last-child");
  totalCell.textContent = `$${totalPrice}`; // Update total amount with two decimal places
}

function updateSubtotal(inputField, price, product_id, user_id) {
  const quantity = parseInt(inputField.value);
  const subtotal = quantity * price;
  const row = inputField.parentElement.parentElement;
  const subtotalCell = row.querySelector(".subtotal");
  subtotalCell.textContent = subtotal; // Update subtotal with two decimal places

  // Recalculate total price
  let totalPrice = 0;
  const rows = document.querySelectorAll("#cart tbody tr");
  rows.forEach((row) => {
    totalPrice += parseFloat(row.querySelector(".subtotal").textContent);
  });
  updateTotal(totalPrice);
  fetch(
    `http://127.0.0.1:5001/api/v1/users/${user_id}/${product_id}/${quantity}`
  )
    .then((request) => request.json())
    .then((user) => {
      console.log(user);
    });
}

// REWRITE THIS FUNCTION
function RemoveFromCart(user_id, product_id) {
  fetch(`http://127.0.0.1:5001/api/v1/users/${user_id}/${product_id}`)
    .then((request) => request.json())
    .then((user) => {
      var cart = document.getElementById("cart");
      fetch(`http://127.0.0.1:5001/api/v1/users/${user_id}`)
        .then((response) => response.json())
        .then((user) => {
          const cartContents = user.cart_contents;
          const cart = document.getElementById("cart");
          const tableBody = cart.querySelector("tbody");
          tableBody.innerHTML = "";
          let totalPrice = 0; // Initialize total price variable

          cartContents.forEach((product_id) => {
            fetch(`http://127.0.0.1:5001/api/v1/products/${product_id}`)
              .then((response) => response.json())
              .then((product) => {
                createProductCart(product, user_id);
                totalPrice += parseInt(product.Price); // Add product price to total price
                updateTotal(totalPrice); // Update total display
              });
          });
        });
    })
    .catch((error) => console.error("Error:", error));
}

document
  .getElementById("filterImage")
  .addEventListener("click", function (event) {
    event.preventDefault();
    var filterSelect = document.getElementById("filterSelect");
    filterSelect.style.display =
      filterSelect.style.display === "none" ? "block" : "none";
  });

document.getElementById("filterSelect").addEventListener("change", function () {
  var searchBar = document.querySelector('input[name="search-bar"]');
  var existingSelect = document.querySelector('select[name="search-bar"]');
  var filterSelect = document.getElementById("filterSelect");

  filterSelect.style.display == "none";

  // If a select tag already exists, remove it
  if (existingSelect) {
    existingSelect.remove();
  }

  var selectTag = document.createElement("select");
  selectTag.name = "search-bar";

  // Add the requested styles to the select tag
  selectTag.style.background = "transparent";
  selectTag.style.flex = "1";
  selectTag.style.border = "0";
  selectTag.style.outline = "none";
  selectTag.style.padding = "24px 20px";
  selectTag.style.fontSize = "22px";
  selectTag.style.color = "rgb(29, 28, 26)";

  var value, value1, value2, value3;

  if (this.value === "Search by Color") {
    searchBar.style.display = "";
  } else if (this.value === "Search by Category") {
    searchBar.style.display = "none";
    value = "Category";
    value1 = "Paint";
    value2 = "Wallpaper";
    value3 = "";
    this.form.insertBefore(selectTag, searchBar.nextSibling);
  } else if (this.value === "Search by Brand") {
    searchBar.style.display = "none";
    value = "Brand";
    value1 = "Dulux";
    value2 = "Comus";
    value3 = "Timeless";
    this.form.insertBefore(selectTag, searchBar.nextSibling);
  } else if (this.value === "Search by Material") {
    searchBar.style.display = "none";
    value = "Material";
    value1 = "Satin";
    value2 = "Catin";
    value3 = "oil";
    this.form.insertBefore(selectTag, searchBar.nextSibling);
  }

  // Add options to the select tag as per your requirement
  selectTag.innerHTML = `<option value="">--Choose a ${value}--</option>
                             <option value="${value1}">${value1}</option>
                             <option value="${value2}">${value2}</option>
                             <option value="${value3}">${value3}</option>`;
});

document
  .querySelector(".search-bar")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var searchBar = document.querySelector('input[name="search-bar"]');
    var selectTag = document.querySelector('select[name="search-bar"]');
    var filter = document.querySelector('select[name="filter"]');

    if (searchBar.style.display !== "none") {
      console.log("Search input value:", searchBar.value);
      fetch(`http://127.0.0.1:5001/api/v1/product/Color/${searchBar.value}`)
        .then((response) => response.json())
        .then((data) => {
          createProductCards(data);
        })
        .catch((error) => console.error("Error:", error));
      searchBar.value = ""; // Clear the input field
    } else if (selectTag) {
      if (filter.value === "Search by Brand") {
        fetch(`http://127.0.0.1:5001/api/v1/product/Brand/${selectTag.value}`)
          .then((response) => response.json())
          .then((data) => {
            createProductCards(data);
          })
          .catch((error) => console.error("Error:", error));
      } else if (filter.value === "Search by Category") {
        fetch(
          `http://127.0.0.1:5001/api/v1/product/Category/${selectTag.value}`
        )
          .then((response) => response.json())
          .then((data) => {
            createProductCards(data);
          })
          .catch((error) => console.error("Error:", error));
      } else if (filter.value === "Search by Material") {
        fetch(
          `http://127.0.0.1:5001/api/v1/product/Material/${selectTag.value}`
        )
          .then((response) => response.json())
          .then((data) => {
            createProductCards(data);
          })
          .catch((error) => console.error("Error:", error));
      }
      selectTag.value = ""; // Reset the select tag
    }
  });

function createProductCards(products) {
  const boxDiv = document.querySelector(".box"); // Assuming you have an existing .box element

  // Clear existing content in the boxDiv
  boxDiv.innerHTML = "";

  products.forEach((product) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    const smallCardDiv = document.createElement("div");
    smallCardDiv.classList.add("small_card");
    smallCardDiv.innerHTML = `
            <i class="fa-solid fa-heart"></i>
            <i class="fa-solid fa-share"></i>
        `;

    const imageDiv = document.createElement("div");
    imageDiv.classList.add("image");
    imageDiv.innerHTML = `<img src="${product.ProductImage}.png" />`;

    const productsTextDiv = document.createElement("div");
    productsTextDiv.classList.add("products_text");
    productsTextDiv.innerHTML = `
            <h2>${product.Name}</h2>
            <p>Category: ${product.Category}</p>
            <p>Color: ${product.Color}</p>
            <p>Material: ${product.Material}</p>
            <p>Brand: ${product.Brand}</p>
            <h3>$${product.Price}</h3>
            <a href="" class="btn">Add To Cart</a>
        `;

    cardDiv.appendChild(smallCardDiv);
    cardDiv.appendChild(imageDiv);
    cardDiv.appendChild(productsTextDiv);
    boxDiv.appendChild(cardDiv);
  });
}
