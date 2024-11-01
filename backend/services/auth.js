//this file contains only client firebase and not the admin firebase, thats why i had to create this separate file...
const {
  auth,
  signInWithEmailAndPassword,
  db,
  createUserWithEmailAndPassword,
} = require("../configs/firebase-config.js"); // Adjust the path as necessary

// Function for signing in with Firebase
async function signInWithFirebase(email, password) {
  try {
    // Use the 'auth' object passed from firebase-config.js
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log("user credentials are:", userCredential.user);
    return userCredential; // Return user credentials on success
  } catch (error) {
    throw new Error(error.message); // Throw error to be handled in server.js
  }
}

module.exports = { signInWithFirebase };
