const warningmsg = document.querySelector(".warningmsg");
const picFileInput = document.getElementById("picFileInput");
// Store the original dropdown options in an array of objects
const originalOptions = Array.from(
  document.querySelectorAll("#fieldSelect option")
).map((option) => ({ value: option.value, text: option.text }));
document.addEventListener("DOMContentLoaded", function () {
  const fieldSelect = document.getElementById("fieldSelect");

  // event listener to enable add button only when a valid selection is made
  document
    .getElementById("fieldSelect")
    .addEventListener("change", function () {
      const addFieldButton = document.getElementById("addFieldButton");
      if (this.value) {
        addFieldButton.disabled = false; // Enable button if valid selection
      } else {
        addFieldButton.disabled = true; // Disable button if null selection
      }
    });

  // Add event listener to the "Add Field" button
  document
    .getElementById("addFieldButton")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default form submission behavior
      addField(); // Call the function to add the selected field
    });
  // Event listener for submit button
  document
    .getElementById("editSubmitBtn")
    .addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent default form submission
      // Get all dynamically generated input fields
      const inputs = document.querySelectorAll("#formContainer .form-input");
      // creating ref for warning element

      // checking whether at least one input element is present or not during the submission...
      if (inputs.length < 1) {
        msgflasher(
          warningmsg,
          "No field selected, pls select and fill at least one field ",
          4000
        );
      } else if (inputs.length > 0) {
        // Validate all fields
        let isValid = true;
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];

          if (!input.value) {
            isValid = false;
            msgflasher(
              warningmsg,
              "ERROR: Field cannot be left blank.\nPLS TRY AGAIN",
              4000
            );
            break; // Exit the loop
          }
          if (input.name === "password") {
            if (!passwordValidator(input.value)) {
              isValid = false;
              msgflasher(
                warningmsg,
                "Password must be at least 8 characters long.<br>" +
                  "It should contain at least: <br><span style='font-weight:bold'>&bull;</span> 1 letter, 1 number,1 special character<br>" +
                  "PLS TRY AGAIN",
                8000
              );
              break;
            }
          }
          if (input.name === "phone") {
            if (!phoneNumberValidator(input.value)) {
              isValid = false;
              msgflasher(
                warningmsg,
                "Phone number provided is not valid. Please try again.",
                4000
              );
              break;
            }
          }
        }

        if (isValid) {
          await editFormUploadHandler(inputs);
        }
      }
    });
  //event listener for edit profile button::::::::::::
  document
    .getElementById("editProfileBtn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.querySelector(".info-container").style.display = "none";
      document.querySelector("#parent-container").style.display = "block";
    });
  //event listener for pic-upload button:::

  // Add event listener to the button to trigger the file input mechanism
  document.getElementById("uploadPicButton").addEventListener("click", () => {
    // triggering the pic input element to proceed with the next steps of the mechanism
    picFileInput.click(); // Simulate click on the hidden file input so as to activate its event listener
  });

  //Adding an event listener to handle file selection
  picFileInput.addEventListener("change", async () => {
    const file = picFileInput.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();

      //this function gets invoked When the file is successfully read, update the img src
      reader.onload = function (e) {
        document.querySelector(".picPreview").src = e.target.result; // Set the src of the avatar to the selected image
      };
      //this line passes the file to the reader function so as to start the reading of file
      reader.readAsDataURL(file); // Read the file as a Data URL for preview
      await picUpdateHandler(file);
    } else {
      msgflasher(
        warningmsg,
        "Unable to select a valid profile-picture! \n Please try again.",
        5000
      );
    }
  });
});
async function picUpdateHandler(file) {
  // After previewing the image, send the file to the backend
  // The FormData object here is used to send the file as multipart/form-data in an HTTP request, which is useful when uploading files to the server.
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch("/api/updateProfilePic", {
      method: "POST",
      body: formData,
    });
    const newResponse = await response.json();
    if (newResponse.status === "success") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // waits for 3 seconds
      await updateUserDisplay();
      msgflasher(warningmsg, "User-details updated successfully.", 5000);
      // Clear all input fields from the form container:
      document.getElementById("formContainer").innerHTML = ""; // This will remove all input fields
      resetDropDown(originalOptions);
      //code to redirect to user profile details setup:
      document.querySelector(".info-container").style.display = "block";
      document.querySelector("#parent-container").style.display = "none";
      location.reload();
    } else {
      // console.error("File upload failed:");
      msgflasher(warningmsg, "Profile pic upload failed", 5000);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    msgflasher(warningmsg, "Profile pic upload failed,pls try again!", 5000);
  }
}
// Function to dynamically add input fields and remove them from the dropdown
function addField() {
  const fieldSelect = document.getElementById("fieldSelect");
  const selectedField = fieldSelect.value;

  // Ensure a valid field is selected
  if (!selectedField) return;

  // Create a new div for the field with a close button
  const formGroup = document.createElement("div");
  formGroup.classList.add("form-group");

  // Create a label for the input element
  const labelElement = document.createElement("label");
  labelElement.innerText = `${
    selectedField.charAt(0).toUpperCase() + selectedField.slice(1)
  }: `;
  labelElement.setAttribute("for", selectedField);
  labelElement.style.fontWeight = "bold";

  // Create an input element for the selected field
  const inputElement = document.createElement("input");
  inputElement.name = selectedField;
  inputElement.placeholder = `Enter new ${selectedField}`;
  inputElement.classList.add("form-input");
  inputElement.style.width = "35%";
  inputElement.style.marginTop = "1%";
  if (inputElement.name === "phone") {
    inputElement.style.marginLeft = "5.5%";
  }
  if (inputElement.name === "email") {
    inputElement.style.marginLeft = "6.25%";
  }
  if (inputElement.name === "password") {
    inputElement.style.marginLeft = "2.2%";
  }
  if (inputElement.name === "username") {
    inputElement.style.marginLeft = "2%";
  }
  // Create a close button to remove the input field
  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.classList.add("close-btn");
  closeButton.style.width = "fit-content";
  closeButton.style.height = "fit-content";
  closeButton.style.marginTop = "1%";

  // Event listener to remove the field and re-add it to the dropdown
  closeButton.addEventListener("click", function () {
    // Remove the form group (label + input + close button)
    formGroup.remove();

    // Re-add the removed option back to the dropdown
    const optionElement = document.createElement("option");
    optionElement.value = selectedField;
    optionElement.text =
      selectedField.charAt(0).toUpperCase() + selectedField.slice(1);
    fieldSelect.add(optionElement);

    // Reset add button state after removal
    document.getElementById("addFieldButton").disabled = true;
  });

  // Append the label, input, and close button to the form group
  formGroup.appendChild(labelElement);
  formGroup.appendChild(inputElement);
  formGroup.appendChild(closeButton);

  // Append the form group to the form container
  document.getElementById("formContainer").appendChild(formGroup);

  // Remove the selected option from the dropdown
  fieldSelect.remove(fieldSelect.selectedIndex);

  // Reset the dropdown to the null selection
  fieldSelect.selectedIndex = 0;

  // Disable add button as dropdown is reset to null selection
  document.getElementById("addFieldButton").disabled = true;
}

function resetDropDown(originalOptions) {
  // Get the select element
  const fieldSelect = document.getElementById("fieldSelect");
  // Clear all current options
  fieldSelect.innerHTML = ""; // This removes all the options
  // Restore original options
  originalOptions.forEach((optionData) => {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.text = optionData.text;
    fieldSelect.add(option);
  });
  // Reset to default value (first option)
  fieldSelect.selectedIndex = 0;
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
function passwordValidator(password) {
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return passwordRegex.test(password);
}

function phoneNumberValidator(phoneNumber) {
  // Regex to validate E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  // Check if the phone number matches the E.164 format
  return e164Regex.test(phoneNumber);
}
async function updateUserDisplay() {
  try {
    const response = await fetch("/api/getUserDetails");
    const userData = await response.json();
    //now updating the data on the dashboard
    const userAvatar = document.querySelectorAll(".avatar-img");
    const username = document.querySelectorAll(".username");
    const email = document.querySelectorAll(".email");
    userAvatar.forEach((element) => {
      element.src = userData.photoURL;
    });
    username.forEach((element) => {
      element.innerHTML = userData.username;
    });
    email.forEach((element) => {
      element.innerHTML = userData.email;
    });
  } catch (error) {
    console.error("error encounterd in updateUserDisplay is", error);
  }
}
async function editFormUploadHandler(inputs) {
  // All fields are valid, proceed with form submission or further processing
  const formData = { credentials: {}, details: {} };
  inputs.forEach((input) => {
    if (input.name === "email" || input.name === "password") {
      formData.credentials[input.name] = input.value;
    }
    formData.details[input.name] = input.value;
  });
  try {
    // Await the fetch request
    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData), // Convert the formData object to JSON
    });
    const data = await response.json(); // Await the JSON response
    if (
      !data.credentials.hasOwnProperty("error") &&
      !data.details.hasOwnProperty("error")
    ) {
      await updateUserDisplay();
      msgflasher(warningmsg, "User-details updated successfully.", 5000);
      //code to reset the edit-details ui setup:::::::::::::::::::::::
      // Clear all input fields from the form container:
      document.getElementById("formContainer").innerHTML = ""; // This will remove all input fields
      resetDropDown(originalOptions);

      //code to redirect to user profile details setup:
      document.querySelector(".info-container").style.display = "block";
      document.querySelector("#parent-container").style.display = "none";
    } else {
      let error = "Error encountered:---\n";
      if (data.credentials.hasOwnProperty("error")) {
        error = error + data.credentials.error.message + "\n";
      }
      if (data.details.hasOwnProperty("error")) {
        error = error + data.details.error.message + "\n";
      }
      error = error + "Please try again!!!";
      msgflasher(warningmsg, error, 8000);
    }
  } catch (error) {
    //code to reset the U.I::::::::::;
    // Clear all input fields from the form container
    const formContainer = document.getElementById("formContainer");
    formContainer.innerHTML = ""; // This will remove all input fields
    console.error("Error:", error);
    msgflasher(warningmsg, "An error occurred. Please try again.", 5000);
  }
}
