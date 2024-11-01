import { updateattendancedisplay } from "./dashbd-common.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Get form and input elements
  const userForm = document.getElementById("userForm");
  const warningMsg = document.getElementById("warningmsg");
  const afterUserForm = document.getElementById("afterUserForm");
  //checking whether today's attendance is marked or not

  if (await checktodayattendance()) {
    userForm.style.display = "none";
    afterUserForm.style.display = "block";
    afterUserForm.textContent =
      "Today's attendance marked! \n Explore our latest ai-features and boost your productivity";
  }
  // Listen for form submission
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission
    // Get form input values
    let todayAttended = document.getElementById("todayattended").value;
    todayAttended = parseInt(todayAttended);
    let todayTotal = document.getElementById("todaytotal").value;
    todayTotal = parseInt(todayTotal);
    console.log(todayAttended);
    console.log(todayTotal);
    // Simple validation to check if valid values are provided
    if (
      (todayAttended <= todayTotal && todayAttended >= 0 && todayTotal > 0) ||
      (todayAttended === todayTotal && todayAttended === 0)
    ) {
      // Prepare data to send to the server
      const attendanceData = {
        todayAttended: parseInt(todayAttended),
        todayTotal: parseInt(todayTotal),
      };

      try {
        // Send POST request to the server
        const response = await fetch("/api/updateAttendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceData),
        });

        const result = await response.json(); // Assuming server returns a JSON response

        if (response.ok) {
          // Handle successful response
          warningMsg.textContent = "Attendance updated successfully!";
          userForm.style.display = "none";
          await updateattendancedisplay();
        } else {
          // Handle server errors
          warningMsg.textContent = `Error: ${result.message}`;
        }
      } catch (error) {
        warningMsg.textContent = `Request failed: ${error.message}`;
      }
    } else {
      warningMsg.textContent = "Please provide valid entries!!!";
    }
  });
});

async function checktodayattendance() {
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
    //console.log(attendance_bundle);

    if (attendance_bundle.today_done === true) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}
