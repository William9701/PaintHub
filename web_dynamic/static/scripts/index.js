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

async function displayCart(user_id) {
  var cart = document.getElementById("cart");
  // Update cart display
  if (cart.style.display === "none") {
    cart.style.display = "block";
    cart.style.transform = "translateX(0)";
    const response = await fetch(
      `http://127.0.0.1:5001/api/v1/users/${user_id}`
    );
    const user = await response.json();
    const cartContents = user.cart_contents;
    const tableBody = cart.querySelector("tbody");
    tableBody.innerHTML = "";
    let totalPrice = 0; // Initialize total price variable

    for (const product_id of cartContents) {
      const productResponse = await fetch(
        `http://127.0.0.1:5001/api/v1/products/${product_id}`
      );
      const product = await productResponse.json();
      createProductCart(product, user_id);

      let quantity;
      // Fetch the quantity for the product asynchronously
      const quantityResponse = await fetch(
        `/get_product_quantity/${user_id}/${product.id}`
      );
      const data = await quantityResponse.json();
      quantity = data.quantity;

      // document.getElementById(`quantity-${product.id}`).value = quantity;
      totalPrice += product.Price * quantity;

      updateTotal(totalPrice); // Update total display
    }
  } else {
    cart.style.display = "none";
    cart.style.transform = "translateX(100%)";
  }
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
      newRow.setAttribute("id", `product-${product.id}`);

      // Set the inner HTML of the new row
      newRow.innerHTML = `
        <td><img src="${product.ProductImage}" style="width: 40px;"></td>
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

function RemoveFromCart(user_id, product_id) {
  fetch(`http://127.0.0.1:5001/api/v1/users/${user_id}/${product_id}`)
    .then((request) => request.json())
    .then((user) => {
      var cart = document.getElementById("cart");
      fetch(`http://127.0.0.1:5001/api/v1/users/${user_id}`)
        .then((response) => response.json())
        .then((user) => {
          const rowToRemove = document.getElementById(`product-${product_id}`);
          if (rowToRemove) {
            rowToRemove.remove();
          }

          const cartContents = user.cart_contents;

          if (cartContents.length === 0) {
            updateTotal(0);
            var cart = document.getElementById("cart");
            cart.style.display = "none";
            cart.style.transform = "translateX(100%)";
            document.getElementById("cart-count").style.display = "none";
          }

          let totalPrice = 0; // Initialize total price variable
          cartContents.forEach((product_id) => {
            fetch(`http://127.0.0.1:5001/api/v1/products/${product_id}`)
              .then((response) => response.json())
              .then((product) => {
                totalPrice += parseInt(product.Price); // Add product price to total price
                updateTotal(totalPrice); // Update total display
              });
          });
          document.getElementById("cart-count").textContent =
            user.cart_contents.length;
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

  // Fetch products from the API
  fetch("http://127.0.0.1:5001/api/v1/products")
    .then((response) => response.json())
    .then((data) => {
      // Extract unique categories, materials, and brands from the products
      var categories = [...new Set(data.map((product) => product.Category))];
      var materials = [...new Set(data.map((product) => product.Material))];
      var brands = [...new Set(data.map((product) => product.Brand))];

      var value, options;

      if (this.value === "Search by Color") {
        searchBar.style.display = "";
      } else if (this.value === "Search by Category") {
        searchBar.style.display = "none";
        value = "Category";
        options = categories;
      } else if (this.value === "Search by Brand") {
        searchBar.style.display = "none";
        value = "Brand";
        options = brands;
      } else if (this.value === "Search by Material") {
        searchBar.style.display = "none";
        value = "Material";
        options = materials;
      } else if (this.value === "ALL") {
        searchBar.style.display = "";
      }

      // Add options to the select tag dynamically
      selectTag.innerHTML = `<option value="">--Choose a ${value}--</option>`;
      options.forEach((option) => {
        selectTag.innerHTML += `<option value="${option}">${option}</option>`;
      });

      // Insert the dynamically created select tag into the form
      this.form.insertBefore(selectTag, searchBar.nextSibling);
    })
    .catch((error) => console.error("Error fetching products:", error));
});

document
  .querySelector(".search-bar")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var searchBar = document.querySelector('input[name="search-bar"]');
    var selectTag = document.querySelector('select[name="search-bar"]');
    var filter = document.querySelector('select[name="filter"]');

    if (filter.value === "" && searchBar.style.display !== "none") {
      console.log("Search input value:", searchBar.value);
      fetch(`http://127.0.0.1:5001/api/v1/product/Color/${searchBar.value}`)
        .then((response) => response.json())
        .then((data) => {
          createProductCards(data);
        })
        .catch((error) => console.error("Error:", error));
      searchBar.value = ""; // Clear the input field
    } else if (filter.value === "ALL") {
      fetch(`http://127.0.0.1:5001/api/v1/products`)
        .then((response) => response.json())
        .then((data) => {
          createProductCards(data);
        })
        .catch((error) => console.error("Error:", error));
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

var user_id;

if (document.body.hasAttribute("data-user-id")) {
  user_id = document.body.getAttribute("data-user-id");
} else {
  user_id = null;
}

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
    imageDiv.innerHTML = `<img style="cursor: pointer;" src="${product.ProductImage}" />`;

    const productsTextDiv = document.createElement("div");
    productsTextDiv.classList.add("products_text");
    productsTextDiv.innerHTML = `
    <div class="products_text">
        <h2>${product.Name}</h2>
        <p>Category: ${product.Category}</p>
        <p>Color: ${product.Color}</p>
        <p>Material: ${product.Material}</p>
        <p>Brand: ${product.Brand}</p>
        <h3>$${product.Price}</h3>
        ${
          user_id !== null
            ? `<a href="#" class="btn" onclick="addToCart('${product.id}', '${user_id}')">Add To Cart</a>`
            : `<a href="/login" class="btn">Add To Cart</a>`
        }
    </div>
`;

    cardDiv.appendChild(smallCardDiv);
    cardDiv.appendChild(imageDiv);
    cardDiv.appendChild(productsTextDiv);
    boxDiv.appendChild(cardDiv);
  });
}

function wallPaint(src, product_id) {
  document.querySelector(".paint-box").style.backgroundImage =
    "url(" + src + ")";
  fetch(`http://127.0.0.1:5001/api/v1/products/${product_id}`)
    .then((request) => request.json())
    .then((product) => {
      if (product.Category.toLowerCase() === "wallpaper") {
        document.querySelector("#painter-man").classList.add("hidden");
        document.querySelector("#painter-woman").classList.remove("hidden");
        document.querySelector("#painter-woman").style.display = "block";
      } else {
        document.querySelector("#painter-man").classList.remove("hidden");
        document.querySelector("#painter-woman").classList.add("hidden");
      }
      document.querySelector("#p-name").textContent = product.Name;
      document.querySelector("#p-brands").textContent = product.Brand;
    })
    .catch((error) => console.error("Error:", error));
}

window.onload = function () {
  var src = document
    .querySelector(".colors img:first-child")
    .getAttribute("src");
  document.querySelector(".paint-box").style.backgroundImage =
    "url(" + src + ")";
  var product_id = document
    .querySelector(".colors img:first-child")
    .getAttribute("name");
  fetch(`http://127.0.0.1:5001/api/v1/products/${product_id}`)
    .then((request) => request.json())
    .then((product) => {
      console.log(product);
      document.querySelector("#p-name").textContent = product.Name;
      document.querySelector("#p-brands").textContent = product.Brand;
    })
    .catch((error) => console.error("Error:", error));
};

document.addEventListener("DOMContentLoaded", function () {
  const designSelect = document.getElementById("design-select");
  designSelect.addEventListener("change", function () {
    const selectedCategory = designSelect.value;
    if (selectedCategory === "All") {
      // If "All" is selected, fetch all products
      fetch(`http://127.0.0.1:5001/api/v1/products`)
        .then((response) => response.json())
        .then((products) => {
          displayFilteredProducts(products);
        })
        .catch((error) => console.error("Error fetching products:", error));
    } else {
      // Fetch products based on the selected category
      fetch(`http://127.0.0.1:5001/api/v1/products`)
        .then((response) => response.json())
        .then((products) => {
          const filteredProducts = products.filter(
            (product) => product.Category === selectedCategory
          );
          displayFilteredProducts(filteredProducts);
        })
        .catch((error) => console.error("Error fetching products:", error));
    }
  });
});

function displayFilteredProducts(filteredProducts) {
  const paintSelectContainer = document.querySelector(".paint-select");
  paintSelectContainer.innerHTML = ""; // Clear previous products

  filteredProducts.forEach((product) => {
    // Create a new container for each color
    const colorContainer = document.createElement("div");
    colorContainer.classList.add("colors");

    // Create the image element
    const img = document.createElement("img");
    img.style.width = "100%";
    img.style.borderRadius = "30px";
    img.src = product.ColorImage;
    img.name = product.id;
    img.onclick = function () {
      wallPaint(product.ColorImage, product.id);
    };

    // Append the image to the color container
    colorContainer.appendChild(img);

    // Append the color container to the paint select container
    paintSelectContainer.appendChild(colorContainer);
  });
}

document.getElementById("sub").addEventListener("click", function (event) {
  event.preventDefault();

  var inputs = document.querySelectorAll(".form");
  var allInputsNotEmpty = true; // Flag to track if all inputs are not empty

  // Check if any input is empty
  inputs.forEach(function (input) {
    if (input.value.trim() === "") {
      input.classList.add("highlight");
      allInputsNotEmpty = false;
    } else {
      input.classList.remove("highlight");
    }
  });

  if (allInputsNotEmpty) {
    var height = parseFloat(document.getElementById("height").value); // Parse float to handle decimal values
    var width = parseFloat(document.getElementById("width").value); // Parse float to handle decimal values
    var material = document.getElementById("material").value; // Get the selected material

    // Calculate the area of the wall
    var area = height * width;

    document.getElementById("height").value = "";
    document.getElementById("width").value = "";

    // Define liters per square meter based on the material
    var litersPerSquareMeter;
    switch (material) {
      case "Satin":
        litersPerSquareMeter = 0.5; // Define the liters per square meter for Satin
        break;
      case "Gloss":
        litersPerSquareMeter = 0.6; // Define the liters per square meter for Gloss
        break;
      case "Elusion":
        litersPerSquareMeter = 0.7; // Define the liters per square meter for Elusion
        break;
      case "Tescote":
        litersPerSquareMeter = 0.8; // Define the liters per square meter for Tescote
        break;
      case "Paper":
        litersPerSquareMeter = 0.4; // Define the liters per square meter for Paper
        break;
      default:
        // Default value if material is not recognized
        litersPerSquareMeter = 0.2; // Define a default value
        break;
    }

    // Calculate the total liters needed based on the area and liters per square meter
    var litersNeeded = area * litersPerSquareMeter;

    document.getElementById(
      "quotation"
    ).textContent = `You will need ${litersNeeded} Liters of paint`;
    document.getElementById("quotBod").style.display = "flex";

    // Display the result or do further processing
    console.log("Liters needed:", litersNeeded);
  }
});

var images = [
  { src: "../static/images/painters.jpeg", text: "We do outdoor Painting" }, // Image 1
  {
    src: "../static/images/indoor-painter.jpeg",
    text: "And also indoor Painting",
  }, // Image 2
];
var index = 0;
setInterval(function () {
  var img = document.getElementById("dynamicImage");
  var p = document.getElementById("dynamicText");
  img.classList.add("hide"); // Add the hide class to fade out the image
  setTimeout(function () {
    // Change the image and text after the fade out effect
    img.src = images[index].src;
    p.textContent = images[index].text;
    img.classList.remove("hide"); // Remove the hide class to fade in the new image
    index = (index + 1) % images.length; // Loop back to the first image
  }, 400); // Wait for the fade out transition to complete
}, 10000); // Change image and text every 10 seconds

var ProdImages = [
  {
    src: "../static/images/1st-home-color.jpeg",
    text: "Beautiful Home Paint Colors",
  },
  {
    src: "../static/images/2nd-home-color.jpeg",
    text: "Beautiful Home Paint Colors",
  },
  {
    src: "../static/images/1st-3d-wallpaper.jpeg",
    text: "Beautiful 3D-Wallpaper Designs",
  },
  {
    src: "../static/images/2nd-3d-wallpaper.jpeg",
    text: "Beautiful Wallpaper Designs",
  },
  {
    src: "../static/images/1st-wallart.jpeg",
    text: "Breath-taking Wall-Arts ",
  },
  {
    src: "../static/images/2nd-wallart.jpeg",
    text: "Breath-taking Wall-Arts",
  },
  {
    src: "../static/images/3d-wallprint.jpeg",
    text: "Beautiful 3D-Wall-Prints",
  },
  {
    src: "../static/images/finished-panel1.jpeg",
    text: "Amazing 3D-Wall-Panels",
  },
  {
    src: "../static/images/finsihed-panel5.jpeg",
    text: "Amazing 3D-Wall-Panels",
  },
  {
    src: "../static/images/finished-panel2.jpeg",
    text: "Amazing 3D-Wall-Panels",
  },
];
var Pindex = 0;
setInterval(function () {
  var Simg = document.getElementById("SellImage");
  var Sp = document.getElementById("SellText");
  Simg.classList.add("hide"); // Add the hide class to fade out the image
  setTimeout(function () {
    // Change the image and text after the fade out effect
    Simg.src = ProdImages[Pindex].src;
    Sp.textContent = ProdImages[Pindex].text;
    Simg.classList.remove("hide"); // Remove the hide class to fade in the new image
    Pindex = (Pindex + 1) % ProdImages.length; // Loop back to the first image
  }, 400); // Wait for the fade out transition to complete
}, 7000); // Change image and text every 7 seconds

var WallpaperImages = [
  {
    src: "../static/images/wallpaper4.jpeg",
    text: "With a good Touch of Beauty",
  },
  {
    src: "../static/images/wallpaper1.jpeg",
    text: "With the Right smothening Tools",
  },
  {
    src: "../static/images/wallpaper2.jpeg",
    text: "With the Right smothening Tools",
  },
  {
    src: "../static/images/wallpaper3.jpeg",
    text: "With the Right cutting Tools",
  },
  {
    src: "../static/images/wallpaper5.jpeg",
    text: "Perfect Lining",
  },
];
var Windex = 0;
setInterval(function () {
  var Simg = document.getElementById("wallpaperImage");
  var Sp = document.getElementById("wallpaperText");
  Simg.classList.add("hide"); // Add the hide class to fade out the image
  setTimeout(function () {
    // Change the image and text after the fade out effect
    Simg.src = WallpaperImages[Windex].src;
    Sp.textContent = WallpaperImages[Windex].text;
    Simg.classList.remove("hide"); // Remove the hide class to fade in the new image
    Windex = (Windex + 1) % WallpaperImages.length; // Loop back to the first image
  }, 400); // Wait for the fade out transition to complete
}, 8000); // Change image and text every 8 seconds

var WallpanelImages = [
  {
    src: "../static/images/wallpanel3.jpeg",
    text: "Perfection with every tile",
  },
  {
    src: "../static/images/wallpanel5.jpeg",
    text: "Perfection with every tile",
  },
  {
    src: "../static/images/wallpanel4.jpeg",
    text: "Perfection with every tile",
  },
  {
    src: "../static/images/wallpanel1.jpeg",
    text: "Perfection with every tile",
  },
  {
    src: "../static/images/wallpanel2.jpeg",
    text: "Perfection with every tile",
  },
];
var Wpindex = 0;
setInterval(function () {
  var Simg = document.getElementById("wallpanelImage");
  var Sp = document.getElementById("wallpanelText");
  Simg.classList.add("hide"); // Add the hide class to fade out the image
  setTimeout(function () {
    // Change the image and text after the fade out effect
    Simg.src = WallpanelImages[Wpindex].src;
    Sp.textContent = WallpanelImages[Wpindex].text;
    Simg.classList.remove("hide"); // Remove the hide class to fade in the new image
    Wpindex = (Wpindex + 1) % WallpanelImages.length; // Loop back to the first image
  }, 400); // Wait for the fade out transition to complete
}, 6000); // Change image and text every 6 seconds

// Get all product Images
const fimages = document.querySelectorAll(".image img");

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
fimages.forEach((image) => {
  image.addEventListener("click", (event) => {
    // Prevent the default action
    event.preventDefault();

    // Get the source of the clicked image
    const src = event.target.src;

    fetch(`http://127.0.0.1:5001/api/v1/getProduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ src: src }),
    })
      .then((request) => request.json())
      .then((product) => {
        modalImage.src = product.ColorImage;

        // Show the modal
        modal.style.display = "block";
      })
      .catch((error) => console.error("error:", error));
  });
});

// Add a click event listener to the modal
modal.addEventListener("click", () => {
  // Hide the modal
  modal.style.display = "none";
});
