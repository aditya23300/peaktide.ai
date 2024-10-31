// Add an event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  const logoutPopupCloseBtn = document.getElementById("logout-close-btn");
  const logoutPopup = document.getElementById("logout-popup");
  const logoutPopupTextContent = document.getElementById(
    "logout-popup-text-content"
  );
  //code for loading up the initial attendance records of the user.
  await updateattendancedisplay();
  //event listener for home button on top ::::::::::::
  document.getElementById("homeButton").addEventListener("click", function () {
    window.location.href = "/dashbd/home"; // Replace with the actual home page URL
  });
  //event listener for logout button on the top //logoutButton
  document
    .getElementById("logoutButton")
    .addEventListener("click", async function () {
      const response = await fetch("/api/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const newResponse = await response.json();
      logoutPopup.style.display = "flex"; // Use flex to center the popup
      logoutPopupTextContent.innerHTML = newResponse.message;
      if (newResponse.status === "success") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        window.location.href = "/";
      }
    });
  // Close logout popup
  logoutPopupCloseBtn.addEventListener("click", () => {
    logoutPopup.style.display = "none";
  });
  // Close logout popup if clicking outside of the popup content
  logoutPopup.addEventListener("click", (e) => {
    if (e.target === logoutPopup) {
      logoutPopup.style.display = "none";
    }
  });
  //event-listener for click event on attendance-records button:::::::::
  document
    .getElementById("attendance-records")
    .addEventListener("click", async () => {
      // Redirect to the /dashbd-records endpoint

      window.location.href = "/dashbd/records";
    });
  //event-listener for click event on query-engine button:::::::::
  document
    .getElementById("ai-query-engine")
    .addEventListener("click", async () => {
      // Redirect to the /dashbd-records endpoint

      window.location.href = "/dashbd/ai-query-engine";
    });
  //event-listener for click event on ai-work-assistant button:::::::::
  document
    .getElementById("ai-work-assistant")
    .addEventListener("click", async () => {
      // Redirect to the /dashbd-records endpoint

      window.location.href = "/dashbd/ai-work-assistant";
      // console.log("hii from commonjs file!!");
    });

  //event-listener for click event on notification-setings button:::::::::
  document
    .getElementById("notification-settings")
    .addEventListener("click", async () => {
      // Redirect to the /dashbd-records endpoint

      window.location.href = "/dashbd/notification-settings";
    });
  //event-listener for click event on profile-setings button:::::::::
  document
    .getElementById("profile-settings")
    .addEventListener("click", async () => {
      // Redirect to the /dashbd-records endpoint

      window.location.href = "/dashbd/profile-settings";
    });
});

export async function updateattendancedisplay() {
  try {
    const response = await fetch("/api/todayandoverallBundle", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching user details: ${response.statusText}`);
    }
    const attendance_bundle = await response.json();
    // console.log(attendance_bundle);

    if (attendance_bundle.overall_started === true) {
      //DOM MANIPULATION FOR PRINTING OVERALL ATTENDANCE:::
      document.getElementById(
        "overallattendance"
      ).textContent = `Overall attendance : ${attendance_bundle.overall_percentage}`;
      //DOM MANIPULATION FOR PRINTING TODAY'S ATTENDANCE:::
      if (attendance_bundle.today_done === true) {
        document.getElementById(
          "todayattendance"
        ).textContent = `Today's attendance : ${attendance_bundle.today_percentage}`;
      } else {
        document.getElementById(
          "todayattendance"
        ).textContent = `Today's attendance not marked yet`;
      }
    } else {
      document.getElementById("overallattendance").textContent =
        "Your classes havent started yet!";
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
