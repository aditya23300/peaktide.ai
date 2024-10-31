const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const { signInWithFirebase } = require("./backend/services/auth.js"); // Import Firebase auth
const {
  getUserDetailsFromFirestore,
  todayandoverallBundle,
  updateTodayAttendance,
  getAttendanceRecords,
  updateUserDetailsHandler,
  getUserProfileInfo,
  updateProfilePicHandler,
  createUserWithEmailandPassword,
  renewFirebaseRefreshToken,
} = require("./backend/services/dataservices.js");
const {
  geminiQueryEngine,
  AIWorkAssistantHandler,
} = require("./backend/services/geminiAI.js");
require("dotenv").config();
const { error } = require("console");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const upload = multer({ storage: multer.memoryStorage() });
const jwt = require("jsonwebtoken");
const authMiddleware = require("./backend/middlewares/authMiddleware.js");
// Serve static files for JS and CSS
app.use(express.static("views/js")); //to server all client side .js files
app.use(express.static("views/html")); //to server all client side .html files
app.use(express.static("views/css")); //to server all client side .css files
app.use(express.static("views"));
app.use(express.static(__dirname)); //to server firebase-config file
app.use(express.json()); // This is essential to parse JSON request bodies
app.set("view engine", "ejs");
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Apply the imported middleware to all routes starting with /api
app.use("/api", authMiddleware);
//route to handle queryEngine in dashbd.html page...
app.post("/api/queryEngine", async (req, res) => {
  const uid = req.user.uid;
  const result = await geminiQueryEngine(uid, req.body);
  res.json(result);
});
// Route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/html/index.html"));
});
// Route to handle the logout request
app.get("/api/logout", async (req, res) => {
  const uid = req.user.uid;
  try {
    res.clearCookie("token", { path: "/" }); // Clear cookie with path, if set
    const response = await renewFirebaseRefreshToken(uid);
    if (response === uid) {
      res.json({
        status: "success",
        message: "Log-out successful , redirecting to homepage...",
      });
    } else {
      res.json({
        status: "failed",
        message: "Failed to logout, pls try again later!!!",
      });
    }
  } catch {
    res.json({
      status: "failed",
      message: "Failed to logout, pls try again later!!!",
    });
  }
});
// POST route for sign-in
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Call the Firebase sign-in function from auth.js
    const userCredential = await signInWithFirebase(email, password);
    const token = jwt.sign(
      {
        uid: userCredential.user.uid,
      },
      process.env.JWT_SECRET
    );
    res.cookie("token", token);
    res.json({
      success: true,
      message: "Sign-in successful!",
    });
  } catch (error) {
    // Send an error response back to the client
    res.json({
      success: false,
      message: error.message,
    });
  }
});
// POST route for signup
app.post("/signup", async (req, res) => {
  const { username, email, phone, password } = req.body;

  // Call the signup function from sign-up-backend.js
  const result = await createUserWithEmailandPassword(
    username,
    email,
    phone,
    password
  );

  res.json(result);
});

app.get("/api/todayandoverallBundle", async (req, res) => {
  try {
    const uid = req.user.uid;
    const Bundle = await todayandoverallBundle(uid);
    // console.log("bundle is", Bundle);
    res.json(Bundle);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to handle attendance update POST request
app.post("/api/updateAttendance", async (req, res) => {
  const { todayAttended, todayTotal } = req.body;
  const uid = req.user.uid;
  try {
    await updateTodayAttendance(uid, todayAttended, todayTotal);
    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Route to handle getattendance POST request
app.post("/api/getAttendanceRecords", async (req, res) => {
  const { startDate, endDate } = req.body;
  const uid = req.user.uid;
  try {
    const attendanceRecords = await getAttendanceRecords(
      uid,
      startDate,
      endDate
    );
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error retrieving attendance records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/getUserDetails", async (req, res) => {
  try {
    const result = await getUserProfileInfo(req.user.uid);
    res.json(result);
  } catch (error) {
    console.error(error);
  }
});
// Handling POST request on /update-profile route
app.post("/api/update-profile", async (req, res) => {
  const uid = req.user.uid;
  const result = await updateUserDetailsHandler(uid, req.body);
  res.send(result);
});
// Handling POST request on /update-profile route
// Route to handle profile pic upload
app.post("/api/updateProfilePic", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const uid = req.user.uid;
    const response = await updateProfilePicHandler(file, uid);
    res.json(response);
  } catch (error) {
    res.status(500).json({ status: "failed", fileURL: null });
  }
});
//route to handle the work-assistant section
app.post("/api/ai-work-assistant", upload.single("file"), async (req, res) => {
  try {
    // console.log(req.file);
    const response = await AIWorkAssistantHandler(req.file, req.body.userQuery);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", fileURL: null });
  }
});

// Map of routes to their corresponding EJS files
const routes = {
  "/dashbd/home": "html/dashbd-home",
  "/dashbd/records": "html/dashbd-records",
  "/dashbd/ai-query-engine": "html/dashbd-ai-query-engine",
  "/dashbd/ai-work-assistant": "html/dashbd-ai-work-assistant",
  "/dashbd/notification-settings": "html/dashbd-notification-settings",
  "/dashbd/profile-settings": "html/dashbd-profile-settings",
};

// Route handler
Object.keys(routes).forEach((route) => {
  app.get(route, authMiddleware, async (req, res) => {
    try {
      const userDetails = await getUserDetailsFromFirestore(req.user.uid);
      res.render(routes[route], { userDetails }); // Render the corresponding EJS file
    } catch (error) {
      console.error("Error rendering dashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
