require("dotenv").config(); // Load environment variables
const {
  admin,
  db,
  getStorage,
  getDownloadURL,
  getAuth,
} = require("../../firebase-admin-config.js"); // Adjust the path as necessary
const multer = require("multer");
//function defintion starts from here....
async function getDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(today.getDate()).padStart(2, "0");
  // Format the date as "YYYY-MM-DD"
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
async function createUserWithEmailandPassword(
  username,
  email,
  phone,
  password
) {
  try {
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
    });
    console.log("Successfully created new user:,", userRecord.uid);

    // Create a new user document in the 'users' collection
    const userRef = db.collection("users").doc(userRecord.uid); // Create a new document with a unique ID
    await userRef.set({
      username,
      email,
      phone,
      password,
      overallattended: 0,
      overalltotal: 0,
      photoURL: process.env.PLACEHOLDER_IMAGE_URL,
      attendance: {}, // Initialize the attendance field as an empty map
    });
    return { success: true }; // Return success and user ID
  } catch (error) {
    console.log("Error creating new user:", error.message);
    return { success: false, message: error.message }; // Return error message
  }
}
async function getUserDetailsFromFirestore(uid) {
  const userRef = db.collection("users").doc(uid);

  try {
    const doc = await userRef.get();
    if (doc.exists) {
      return doc.data(); // Return the user data if found
    } else {
      console.log("No such document!");
      return "no user found"; // Return null if no document exists
    }
  } catch (error) {
    console.error("Error getting document:", error);
    //throw error; // Rethrow the error for further handling if needed
    return error;
  }
}
async function renewFirebaseRefreshToken(uid) {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    console.log("Successfully logged out"); // Log success message
    return uid; // Return success message upon successful logout
  } catch (error) {
    console.error("Error logging out user:", error); // Handle any errors
    return null; // Return null on failure
  }
}

async function updateUserCredentials(uid, newDetails) {
  try {
    const userRecord = await admin
      .auth()
      .updateUser(uid, newDetails.credentials);
    console.log("Successfully updated user", userRecord.toJSON());
    return {
      message: "successfully updated the user-credentials on firebase",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    // throw error; // Optionally rethrow for further handling
    return { error };
  }
}
async function todayandoverallBundle(uid) {
  const attendance_bundle = {
    today_done: false,
    today_percentage: 0,
    overall_started: false,
    overall_percentage: 0,
  };
  const userDetails = await getUserDetailsFromFirestore(uid);
  if (userDetails.overalltotal !== 0) {
    //setting up overall related vals
    attendance_bundle.overall_started = true;
    attendance_bundle.overall_percentage = (
      (userDetails.overallattended / userDetails.overalltotal) *
      100
    ).toFixed(2);
    //setting up today values
    const attendanceMap = userDetails.attendance || {}; // Get attendance map or default to an empty object
    const date = await getDate();
    //ensuring whether attendance named field is non-empty because initially its empty until the 1st attendance is marked by the user.
    if (Object.keys(attendanceMap).length > 0) {
      // Check if an entry with the given date exists in the attendance map
      if (attendanceMap.hasOwnProperty(date)) {
        attendance_bundle.today_done = true;
        // Access the percentage value correctly
        const todayAttendance = attendanceMap[date]; // Get today's attendance data
        attendance_bundle.today_percentage = todayAttendance
          ? todayAttendance.percentage
          : 0; // Access percentage safely
      }
    }
  }

  return attendance_bundle;
}

// Update the user's attendance details in Firestore
async function updateTodayAttendance(uid, todayAttendedValue, todayTotalValue) {
  try {
    if (!uid) {
      throw new Error("uid is null");
    }

    const userDocRef = db.collection("users").doc(uid); // Reference to the user's document
    const percentage = ((todayAttendedValue / todayTotalValue) * 100).toFixed(
      2
    );
    const date = await getDate(); // Assuming getDate() is defined and returns the current date as a string

    const attendanceData = {
      date: date,
      attended: todayAttendedValue,
      total: todayTotalValue,
      percentage: percentage,
    };

    // Increment the overall attendance values
    await userDocRef.update({
      overallattended: admin.firestore.FieldValue.increment(todayAttendedValue),
      overalltotal: admin.firestore.FieldValue.increment(todayTotalValue),
      [`attendance.${date}`]: attendanceData,
    });

    console.log("User details updated successfully.");
  } catch (error) {
    console.error("Error updating user details:", error);
  }
}
//creating the function to retrieve attendance data from db and store all into an array
async function getAttendanceRecords(uid, startDate, endDate) {
  const attendanceRecords = [];
  const userDocRef = db.collection("users").doc(uid);

  // Fetch the user document
  const docSnap = await userDocRef.get();

  if (docSnap.exists) {
    const userData = docSnap.data();

    // Get the attendance map from the document
    const attendanceMap = userData.attendance || {};

    // Filter attendance by date range
    Object.keys(attendanceMap).forEach((date) => {
      // Convert the date to a comparable format if necessary (e.g., Date object or ISO string)
      const recordDate = new Date(date);

      if (
        recordDate >= new Date(startDate) &&
        recordDate <= new Date(endDate)
      ) {
        // Add the record to the attendanceRecords array
        attendanceRecords.push({
          date: date, // or recordDate depending on how you want the output
          ...attendanceMap[date],
        });
      }
    });

    return attendanceRecords;
  } else {
    console.log("No such document!");
    return [];
  }
}
async function updateUserDetails(uid, newDetails) {
  try {
    const userDocRef = db.collection("users").doc(uid);
    await userDocRef.update(newDetails.details);
    return {
      message: "successfully updated the user-details on firebase",
    };
  } catch (error) {
    console.error(error);
    return { error };
  }
}
async function updateUserDetailsHandler(uid, newDetails) {
  let result = { credentials: {}, details: {} };
  if (Object.keys(newDetails.credentials).length !== 0) {
    result.credentials = await updateUserCredentials(uid, newDetails);
  }
  if (
    Object.keys(newDetails.details).length !== 0 &&
    !result.credentials.hasOwnProperty("error")
  ) {
    result.details = await updateUserDetails(uid, newDetails);
  }
  return result;
}
async function updateProfilePicHandler(file, uid) {
  try {
    const bucket = admin.storage().bucket(); // Or specify your bucket name if needed
    const fileName = uid; // Extract the file name from the file parameter
    const directoryPath = `profile-pics/`; // Change this to your desired directory
    // const fileObject = bucket.file(fileName); // Create a file object using the file name
    const fileObject = bucket.file(`${directoryPath}${fileName}`);
    //deleting the existing profile-pic(if it exists)
    const [exists] = await fileObject.exists();
    if (exists) {
      // If the file exists, delete it
      await fileObject.delete();
      console.log(`Deleted existing file of user with uid: ${fileName}`);
    }
    const metadata = {
      contentType: file.mimetype, // Set the content type
      metadata: {
        // Add any custom metadata you need
      },
    };

    // Use createWriteStream to upload the file
    const stream = fileObject.createWriteStream({
      metadata: metadata,
    });

    // Handle stream events
    stream.on("finish", async () => {
      console.log(`Uploaded file of user with uid: ${fileName}`);
      const bucketName = "gs://attendance-project-341bc.appspot.com";
      const fileLocation = `profile-pics/${uid}`;
      const fileRef = getStorage().bucket(bucketName).file(fileLocation);
      const fileURL = await getDownloadURL(fileRef);

      // Update Firestore with the new profile picture URL
      await admin.firestore().collection("users").doc(uid).update({
        photoURL: fileURL, // Field name in Firestore
      });
      console.log(`Updated Firestore with profile picture URL for uid: ${uid}`);
    });

    stream.on("error", (err) => {
      console.error("Error uploading file:", err);
    });

    // Pipe the buffer or stream from the uploaded file to the Google Cloud Storage stream
    stream.end(file.buffer); // Use file.buffer if using Multer and buffer uploads
    return {
      status: "success",
      fileURL: uid,
    };
  } catch (error) {
    console.error("Error handling the request:", error);
    return {
      status: "failed",
      fileURL: null,
    };
  }
}
async function getUserProfileInfo(uid) {
  try {
    const userDocRef = db.collection("users").doc(uid);

    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();

      // Exclude sensitive fields
      delete userData.attendance;
      delete userData.overalltotal;
      delete userData.overallattended;

      return userData;
    } else {
      console.log("No user found with this uid.");
      return { error: "No user found with this uid" };
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { error };
  }
}
module.exports = {
  getUserDetailsFromFirestore,
  todayandoverallBundle,
  updateTodayAttendance,
  getAttendanceRecords,
  updateUserDetailsHandler,
  getUserProfileInfo,
  renewFirebaseRefreshToken,
  updateUserDetails,
  updateUserCredentials,
  updateProfilePicHandler,
  createUserWithEmailandPassword,
};
