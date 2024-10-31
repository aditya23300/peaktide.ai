let today = new Date();
today = `${today.getFullYear()}-${(today.getMonth() + 1)
  .toString()
  .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("userQuery");
  // Function to auto-resize the textarea i.e to handle the dynamic query box expansion upon need....
  function autoResize() {
    this.style.height = "auto"; // Reset height
    this.style.height = this.scrollHeight + "px"; // Set height to scrollHeight
  }
  // Attach the function to the input event
  textarea.addEventListener("input", autoResize);
  // Initial call to set the height on page load
  autoResize.call(textarea);
  // Attaching the submit event listener to the query-form
  document
    .getElementById("queryForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      document.getElementById("ai-intro").style.display = "none";
      document.getElementById("response-box").style.textAlign = "center";
      document.getElementById("response-box").innerHTML = "Loading...";
      const userQuery = document.querySelector("#userQuery").value;
      let qstartdate = "0001-01-01";
      let qenddate = today;
      await handleQuerySubmit(qstartdate, qenddate, userQuery);
    });
});
//function to handle the user query after clicking submit button
async function handleQuerySubmit(qstartdate, qenddate, userQuery) {
  // Data to send in the POST request
  const requestData = {
    qstartdate: qstartdate,
    qenddate: qenddate,
    userQuery: userQuery,
  };

  // Send a POST request using fetch
  fetch("/api/queryEngine", {
    // Replace with your server's actual endpoint
    method: "POST", // Use POST method
    headers: {
      "Content-Type": "application/json", // Specify that you're sending JSON
    },
    body: JSON.stringify(requestData), // Convert data to JSON format
  })
    .then((response) => response.json()) // Parse JSON response from server
    .then((data) => {
      console.log("Success:", data); // Handle success (data contains server's response)
      if (data.recordExists === false) {
        document.querySelector("#response-box").textContent =
          "No attendance records found in the given range.Please try again with a different range.";
      } else if (data.ai_response === "error from gemini-servers") {
        //error from gemini server and not from your server
        document.querySelector("#response-box").textContent =
          "OOPS!! Some unexpected error happened. Please try again!!!";
      } else {
        //this is the case of perfect response
        // Using regular expressions to replace ** with bold tags
        const decodedData = data.ai_response.replace(
          /\*\*(.*?)\*\*/g,
          "<b>$1</b>"
        );
        document.getElementById("response-box").style.textAlign = "left";
        document.getElementById("response-box").innerHTML = decodedData;
      }
    })
    .catch((error) => {
      console.error("Error:", error); // Handle any errors
      //this is the case where your internal server failed to respond
      document.querySelector("#queryResponse").textContent =
        "OOPS!! Some unexpected error happened. Please try again!!!";
    });
}
