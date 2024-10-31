//let token; //to store the user's token for further usage!!!
document.addEventListener("DOMContentLoaded", function () {
  const contactBtn = document.getElementById("contact-us-btn");
  const contactPopup = document.getElementById("contact-popup");
  const contactCloseBtn = document.getElementById("contact-us-close-btn");
  // Select all elements with the class 'start-trigger'
  const getStartedBtns = document.querySelectorAll(".start-trigger");
  const signinPopup = document.getElementById("signin-popup");
  const signinCloseBtn = document.getElementById("signin-close-btn");
  const pricingBtn = document.getElementById("pricing-btn");
  const pricingPopup = document.getElementById("pricing-popup");
  const pricingCloseBtn = document.getElementById("pricing-close-btn");
  const testimonialBtn = document.getElementById("testimonial-btn");
  const testimonialPopup = document.getElementById("testimonial-popup");
  const testimonialCloseBtn = document.getElementById("testimonial-close-btn");
  const signUpBtn = document.getElementById("btn-signUp");
  const signUpPopup = document.getElementById("signUp-popup");
  const signUpCloseBtn = document.getElementById("signUp-close-btn");
  const signUpWarningmsg = document.getElementById("sign-up-warningmsg");
  const signInWarningmsg = document.getElementById("sign-in-warningmsg");
  /////////////////////////////////////////coding for contact us popup/////////////////////////////////////////////////////////////////
  // Open popup when clicking the "Contact Us" button
  contactBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    contactPopup.style.display = "flex";
  });

  // Close contact popup when clicking the close button
  contactCloseBtn.addEventListener("click", () => {
    contactPopup.style.display = "none";
  });
  // Close contact popup if clicking outside of the popup content
  contactPopup.addEventListener("click", (e) => {
    if (e.target === contactPopup) {
      contactPopup.style.display = "none";
    }
  });
  /////////////////////////////////////////////////code for pricing popup//////////////////////////////////////////////////////////////

  // Open pricing popup when clicking the "Pricing" button
  pricingBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    pricingPopup.style.display = "flex";
  });

  // Close pricing popup when clicking the close button
  pricingCloseBtn.addEventListener("click", () => {
    pricingPopup.style.display = "none";
  });
  // Close popup if clicking outside of the popup content
  pricingPopup.addEventListener("click", (e) => {
    if (e.target === pricingPopup) {
      pricingPopup.style.display = "none";
    }
  });
  /////////////////////////////////////////code for the testamonial popup////////////////////////////////////////////////////:::

  // Open testimonial popup when clicking the "Testimonials" button
  testimonialBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    testimonialPopup.style.display = "flex";
  });

  // Close testimonial popup when clicking the close button
  testimonialCloseBtn.addEventListener("click", () => {
    testimonialPopup.style.display = "none";
  });
  // Close popup if clicking outside of the popup content
  testimonialPopup.addEventListener("click", (e) => {
    if (e.target === testimonialPopup) {
      testimonialPopup.style.display = "none";
    }
  });
  //////////////////////////////////////////////code for sign-in popup///////////////////////////////////////////////////////////////////

  // Add the event listener to each button using forEach
  getStartedBtns.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default link behavior
      signinPopup.style.display = "flex"; // Use flex to center the popup
    });
  });

  // Close sign-in popup
  signinCloseBtn.addEventListener("click", () => {
    signinPopup.style.display = "none";
  });

  // Close popup if clicking outside of the popup content
  signinPopup.addEventListener("click", (e) => {
    if (e.target === signinPopup) {
      signinPopup.style.display = "none";
    }
  });
  ///////////////////////////code for sign-up button///////////////////////////////////////////////////////
  // Open popup when clicking the "sign-up" button
  signUpBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
    signinPopup.style.display = "none";
    signUpPopup.style.display = "flex";
  });

  // Close popup when clicking the close button
  signUpCloseBtn.addEventListener("click", () => {
    signUpPopup.style.display = "none";
  });
  // Close popup if clicking outside of the popup content
  signUpPopup.addEventListener("click", (e) => {
    if (e.target === signUpPopup) {
      signUpPopup.style.display = "none";
    }
  });
  //code for sign-in feature  working:::::://////////////////////////////////////////////
  document
    .getElementById("signin-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent default form submission
      //await msgflasher(signInWarningmsg, "Signing-in....", 2000);
      try {
        const email = document.getElementById("signin-email").value;
        const password = document.getElementById("signin-password").value;

        // Send email and password via POST request to server
        const response = await fetch("/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const newResponse = await response.json();
        if (newResponse.success) {
          // Handle successful login
          await msgflasher(
            signInWarningmsg,
            newResponse.message + "  Redirecting to dashboard!!!",
            3000
          );
          window.location.href = "/dashbd/home";
        } else {
          await msgflasher(
            signInWarningmsg,
            "Invalid credentials. Sign-in failed. \n Pls try again!!",
            5000
          );
        }
      } catch (error) {
        // console.error("Error:", error);
        await msgflasher(
          signInWarningmsg,
          "Sign-in failed!!! \n" + error,
          5000
        );
      }
    });
  //code for working of sign-up feature::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  // Handle form submission
  document
    .getElementById("signUp-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent form from refreshing the page
      //mechansim to display progress until next update...
      signUpWarningmsg.style.display = "block";
      signUpWarningmsg.innerHTML = "Sign-up in progress, Pls wait...";
      const username = document.getElementById("signUp-username").value;
      const email = document.getElementById("signUp-email").value;
      const phone = document.getElementById("signUp-phoneNumber").value;
      const password = document.getElementById("signUp-password").value;
      const isValid = true;
      if (username && email && phone && password) {
        if (!phoneNumberValidator(phone)) {
          await msgflasher(
            signUpWarningmsg,
            "Phone number provided is invalid.<br>" +
              "Please provide a valid phone number along with country code starting with a '+' sign. <br>" +
              "Please try again.",
            8000
          );
          isValid = false;
        }
        if (!passwordValidator(password)) {
          await msgflasher(
            signUpWarningmsg,
            "Password must be at least 8 characters long.<br>" +
              "It should contain at least: <br><span style='font-weight:bold'>&bull;</span> 1 letter, 1 number,1 special character<br>" +
              "PLS TRY AGAIN",
            8000
          );
          isValid = false;
        }
        if (isValid === true) {
          try {
            const response = await fetch("/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, email, phone, password }),
            });
            const result = await response.json();
            if (result.success) {
              signUpWarningmsg.innerHTML =
                "Sign-up successfull!!! \n Signing-in...";
              const response = await fetch("/signin", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              });
              const newResponse = await response.json();
              if (newResponse.success) {
                signUpWarningmsg.innerHTML =
                  newResponse.message + "\n Redirecting to the dashboard!!!";
                // Handle successful login
                window.location.href = "/dashbd/home";
              } else {
                //mechanism to open-up sign-in manually...
                await msgflasher(
                  signUpWarningmsg,
                  "Sign-in failed!!! Pls try signing-in again ",
                  5000
                );
                signUpPopup.style.display = "none";
                signinPopup.style.display = "flex";
              }
            } else {
              await msgflasher(
                signUpWarningmsg,
                `Sign-up failed. Pls try again!!! \n ${result.message}`,
                10000
              );
            }
          } catch (error) {
            await msgflasher(
              signUpWarningmsg,
              `Sign-up failed. Pls try again!!! \n ${error}`,
              10000
            );
          }
        }
      } else {
        await msgflasher(signUpWarningmsg, "Please fill in all fields.", 6000);
      }
    });
});
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
