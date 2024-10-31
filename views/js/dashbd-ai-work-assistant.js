// Reference to the file input and label
const fileInput = document.getElementById("file-upload");
const fileNameDisplay = document.getElementById("file-name");
const uploadButton = document.querySelector(".custom-file-upload");
const sendBtn = document.querySelector("submitqueryButton");
const textarea = document.getElementById("userQuery");
document.addEventListener("DOMContentLoaded", () => {
  // Event listener for file selection
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      fileNameDisplay.textContent = `Selected file: ${file.name}`;
      uploadButton.classList.add("file-selected"); // Add class when file is selected
    } else {
      fileNameDisplay.textContent = "";
      uploadButton.classList.remove("file-selected"); // Remove class if no file selected
    }
  });
  // Event listener for the send button
  document
    .getElementById("queryForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      //await handleQuerySubmit(file, userQuery);
      const file = fileInput.files[0];
      if (file) {
        document.getElementById("ai-intro").style.display = "none";
        document.getElementById("response-box").style.textAlign = "center";
        document.getElementById("response-box").innerHTML = "Loading...";
        const userQuery = document.querySelector("#userQuery").value;
        const formData = new FormData();
        formData.append("file", file); // Append the file to the FormData object
        formData.append("userQuery", userQuery);
        try {
          const response = await fetch("/api/ai-work-assistant", {
            // Update with your backend endpoint
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          console.log(result);
          //this is the case of perfect response
          // Using regular expressions to replace ** with bold tags
          const decodedData = result.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
          document.getElementById("response-box").style.textAlign = "left";
          document.getElementById("response-box").innerHTML = decodedData;
        } catch (error) {
          console.error("Error uploading file:", error);
          document.getElementById("response-box").style.textAlign = "left";
          document.getElementById("response-box").innerHTML =
            "OOPS!! Some unexpected error happened. Please try again!!!";
        }
      } else {
        msgflasher(
          warningmsg,
          "Please enter both the query as well as the document!!!",
          5000
        );
      }
    });
  // mechanism to auto-resize the textarea i.e to handle the dynamic query box expansion upon need....
  // Attach the function to the input event
  textarea.addEventListener("input", autoResize);
  // Initial call to set the height on page load
  autoResize.call(textarea);
});
function autoResize() {
  this.style.height = "auto"; // Reset height
  this.style.height = this.scrollHeight + "px"; // Set height to scrollHeight
}

// Function to flash a message and then hide it after a delay
async function msgflasher(targetelement, msg, timeperiod) {
  // Ensure the element is visible and set the message
  targetelement.style.display = "block";
  targetelement.innerHTML = msg;

  // Wait for 1500ms before hiding the message
  await new Promise((resolve) => setTimeout(resolve, timeperiod));

  // Hide the message
  targetelement.style.display = "none";
}
