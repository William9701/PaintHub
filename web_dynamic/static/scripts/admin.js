const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

//show sidebar
menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

//hide sidebar
closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

//change theme
themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
});

function toggleContent(id, element) {
  var contents = document.getElementsByClassName("content");
  for (var i = 0; i < contents.length; i++) {
    contents[i].style.display = "none";
  }
  document.getElementById(id).style.display = "block";

  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove("active");
  }
  element.classList.add("active");
}

document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("product-image").src = e.target.result;
      // Create a FormData object
      var formData = new FormData();
      formData.append("file", file);
      fetch("/upload_photo", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          var src = data.file_url;
          document.getElementById("product-image").src = src; // Set the src of product-image to the fetched src
        });
    };

    reader.readAsDataURL(this.files[0]);
  });

document
  .getElementById("color-upload")
  .addEventListener("change", function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("product-colorImg").src = e.target.result;
      // Create a FormData object
      var formData = new FormData();
      formData.append("file", file);
      fetch("/upload_photo", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          var src = data.file_url;
          document.getElementById("product-colorImg").src = src; // Set the src of product-image to the fetched src
        });
    };

    reader.readAsDataURL(this.files[0]);
  });

var products = [];

function addProduct() {
  var name = document.getElementById("product-name").value;
  var description = document.getElementById("product-description").value;
  var price = document.getElementById("product-price").value;
  var image = document.getElementById("product-image").src;
  var quantity = document.getElementById("product-quantity").value;
  var category = document.getElementById("product-category").value;
  var brand = document.getElementById("product-brand").value;
  var material = document.getElementById("product-material").value;
  var color = document.getElementById("product-color").value;
  var size = document.getElementById("product-size").value;
  var colorImg = document.getElementById("product-colorImg").src;

  // Create a product object
  var product = {
    Name: name,
    Description: description,
    Price: price,
    ProductImage: image,
    ColorImage: colorImg,
    Brand: brand,
    QuantityAvailable: quantity,
    Category: category,
    Material: material,
    Size: size,
    Color: color,
  };

  // Add the product object to the products array
  products.push(product);
  console.log(products);

  var productDiv = document.createElement("div");
  productDiv.className = "product-item";
  productDiv.innerHTML =
    '<img src="' +
    image +
    '"><h2>' +
    name +
    "</h2><p>" +
    description +
    "</p><p>Price: " +
    price +
    "</p><p>Quantity: " +
    quantity +
    "</p><p>Category: " +
    category +
    "</p><p>Material: " +
    material +
    "</p><p>Size: " +
    size +
    "</p><p>Brand: " +
    brand +
    '</p><span class="material-icons-sharp" onclick="deleteProduct(this)">close</span>';

  document
    .getElementById("product-list")
    .insertBefore(
      productDiv,
      document.getElementById("product-list").firstChild
    );

  document.getElementById("product-name").value = "";
  document.getElementById("product-description").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-quantity").value = "";
  document.getElementById("product-category").value = "";
  document.getElementById("product-material").value = "";
  document.getElementById("product-size").value = "";
  document.getElementById("product-brand").value = "";
  document.getElementById("product-image").src = "";
  document.getElementById("product-colorImg").src = "";
  document.getElementById("product-color").value = "";
  document.getElementById("image-upload").value = "";
  document.getElementById("color-upload").value = "";

  // Show the upload button if there are products in the list
  if (document.getElementById("product-list").children.length > 0) {
    document.getElementById("upload-button").style.display = "block";
  }
}

function deleteProduct(element) {
  element.parentElement.remove();
  // Hide the upload button if there are no more products in the list
  if (document.getElementById("product-list").children.length === 0) {
    document.getElementById("upload-button").style.display = "none";
  }
}

async function postData(data) {
  console.log(data);
  const response = await fetch("http://localhost:5001/api/v1/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const jsonData = await response.json();
  return jsonData;
}

async function createproduct() {
  document.getElementById("upload-button").style.background = "red";
  document.getElementById("product-list").innerHTML = "";
  try {
    for (const product of products) {
      const price_id_response = await fetch(`/generate_stripe_id/${product.Name}/${product.Price}/${product.Description}`);
      const price_id = await price_id_response.json();

      var imgsrc = product["ProductImage"];
      var replacedString = imgsrc.replace(/http:\/\/localhost:5000/g, "..");

      var imgCsrc = product["ColorImage"];
      var replacedStringC = imgCsrc.replace(/http:\/\/localhost:5000/g, "..");

      product["ProductImage"] = replacedString;
      product["ColorImage"] = replacedStringC;
      product["stripeId"] = price_id.price_id;

      const reply = await postData(product);
      console.log(reply);
    }

    // Show alert message after the delay
    alert("Upload Successful");
  } catch (error) {
    console.error("Error:", error);
  }
}

// function showToast(message) {
//   var toast = document.querySelector(".toast");
//   toast.querySelector(".toast-body").textContent = message;
//   $(toast).toast("show");
// }
