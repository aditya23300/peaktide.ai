document.addEventListener("DOMContentLoaded", function () {
  const dateRangeForm = document.getElementById("dateRangeForm");
  dateRangeForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!validateDateRange(startDate, endDate)) {
      await msgflasher(
        invalidDateWarning,
        "Invalid Date Range provided!!! Try Again"
      );
    } else {
      // Create the data object to be sent in the body of the POST request
      const requestData = {
        startDate: startDate,
        endDate: endDate,
      };

      // Make a POST request to the server
      await fetch("/api/getAttendanceRecords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Indicate that we're sending JSON data
        },
        body: JSON.stringify(requestData), // Convert the object to a JSON string
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json(); // Assuming the server returns JSON data
        })
        .then((data) => {
          console.log("Attendance Records:", data); // Handle the returned attendance records
          displayAttendanceRecords(data, startDate, endDate);
        })
        .catch((error) => {
          console.error("Error fetching attendance records:", error);
        });
    }
  });
  // Add a click event listener to the button
  document.getElementById("retry-btn").addEventListener("click", function () {
    document.querySelector("#attendanceSection").style.display = "none";
    document.querySelector("#dateRangeForm").style.display = "block";
    document.querySelector("#dateRangeForm").reset();
    console.log("button clicked");
  });
});
//creating a function to ensure that valid start and end dates are provided
function validateDateRange(startDate, endDate) {
  // Get the values of the date inputs
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if the start date is later than the end date
  if (start > end) {
    return false; // dates are invalid
  }
  return true; // Dates are valid, allow further actions
}
// Function to flash a message and then hide it after a delay
async function msgflasher(targetelement, msg) {
  // Ensure the element is visible and set the message
  targetelement.style.display = "block";
  targetelement.textContent = msg;

  // Wait for 1500ms before hiding the message
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Hide the message
  targetelement.style.display = "none";
}
// Function to display attendance records in a table
function displayAttendanceRecords(attendanceRecords, startDate, endDate) {
  if (attendanceRecords.length == 0) {
    //this will execute if no records are found in given date range...
    document.getElementById("noRecordsMessage").style.display = "block";
    document.querySelector("#attendanceSection").style.display = "none";
    document.querySelector("#dateRangeForm").style.display = "block";
  } else {
    document.getElementById("noRecordsMessage").style.display = "none"; //so that "no records" message remains hidden in all possible cases...
    document.querySelector("#attendanceSection").style.display = "block";

    const tableBody = document.querySelector("#attendanceTable tbody");
    tableBody.innerHTML = ""; // Clear previous records
    //logic for printing the total days and logged dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in milliseconds
    const differenceInTime = end.getTime() - start.getTime();

    // Convert milliseconds to days (1 day = 86400000 milliseconds)
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    const diffval = Math.round(differenceInDays); // Round to the nearest whole number
    document.querySelector(
      "#dates-summary"
    ).innerHTML = `No of days in this range: ${diffval} <br> No of days logged: ${attendanceRecords.length}`;

    let totalClassesAttended = 0;
    let totalClassesScheduled = 0;

    attendanceRecords.forEach((record) => {
      const row = document.createElement("tr");

      // Create table cells for date, attended classes, total classes, and percentage
      const dateCell = document.createElement("td");
      dateCell.textContent = record.date;

      const attendedCell = document.createElement("td");
      attendedCell.textContent = record.attended;
      totalClassesAttended += record.attended;

      const totalCell = document.createElement("td");
      totalCell.textContent = record.total;
      totalClassesScheduled += record.total;

      const percentageCell = document.createElement("td");
      const percentage = ((record.attended / record.total) * 100).toFixed(2);
      percentageCell.textContent = `${percentage}%`;

      row.appendChild(dateCell);
      row.appendChild(attendedCell);
      row.appendChild(totalCell);
      row.appendChild(percentageCell);

      tableBody.appendChild(row);
    });

    // Add average row
    const averageRow = document.createElement("tr");
    averageRow.classList.add("average-row"); // Add a class to the average row
    const averageDateCell = document.createElement("td");
    averageDateCell.textContent = "Average";

    const averageAttendedCell = document.createElement("td");
    averageAttendedCell.textContent = (
      totalClassesAttended / attendanceRecords.length
    ).toFixed(2);

    const averageTotalCell = document.createElement("td");
    averageTotalCell.textContent = (
      totalClassesScheduled / attendanceRecords.length
    ).toFixed(2);

    const averagePercentageCell = document.createElement("td");
    const averagePercentage = (
      (totalClassesAttended / totalClassesScheduled) *
      100
    ).toFixed(2);
    averagePercentageCell.textContent = `${averagePercentage}%`;

    averageRow.appendChild(averageDateCell);
    averageRow.appendChild(averageAttendedCell);
    averageRow.appendChild(averageTotalCell);
    averageRow.appendChild(averagePercentageCell);

    tableBody.appendChild(averageRow);
  }
}
// Function to retrieve any query from url....
async function getParamsFromURL(param_name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param_name);
}
