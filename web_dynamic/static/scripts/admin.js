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
    };

    reader.readAsDataURL(this.files[0]);
  });

function addProduct() {
  var name = document.getElementById("product-name").value;
  var description = document.getElementById("product-description").value;
  var price = document.getElementById("product-price").value;
  var image = document.getElementById("product-image").src;

  var product = document.createElement("div");
  product.className = "product-item";
  product.innerHTML =
    '<img src="' +
    image +
    '"><h2>' +
    name +
    "</h2><p>" +
    description +
    "</p><p>Price: " +
    price +
    '</p><span class="material-icons-sharp" onclick="deleteProduct(this)">close</span>';
  document
    .getElementById("product-list")
    .insertBefore(product, document.getElementById("product-list").firstChild);

  document.getElementById("product-name").value = "";
  document.getElementById("product-description").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-image").src = "";
  document.getElementById("image-upload").value = "";

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
  fetch("/generate_stripe_id")
    .then((request) => request.json())
    .then(async (price_id) => {
      console.log(price_id.price_id);
      var data = {
        Name: "Black",
        Description: "sharp Clean",
        Price: "800",
        Brand: "Timeless",
        Category: "Paint",
        stripeId: price_id.price_id,
        Color: "green",
        Material: "Satin",
        Size: "7 liters",
        ProductImage: "../static/images/acrylic-bucket",
        ColorImage: "../static/images/pexels-toa-heftiba-şinca-1194420",
      };
      const product = await postData(data);
      console.log(product);
    });
}
