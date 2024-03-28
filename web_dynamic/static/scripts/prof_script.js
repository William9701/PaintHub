function toggleDetails(detailsId) {
  var details = document.getElementById(detailsId);
  if (details.classList.contains("hidden")) {
    // If hidden, remove the 'hidden' class to display the details
    details.classList.remove("hidden");
    details.style.display = "table-row"; // Display the details as table row
  } else {
    // If not hidden, add the 'hidden' class to hide the details
    details.classList.add("hidden");
    details.style.display = "none"; // Hide the details
  }
}


