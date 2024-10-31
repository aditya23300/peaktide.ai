require("dotenv").config(); // Load environment variables
const { getAttendanceRecords } = require("./dataservices");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_AI_API_KEY);
const model1 = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "You are an AI assistant in a student/employee productivity app.Your name is 'Braddy'.You have to avoid any response which can be unsuitable for students. If the user calls you by any name other than Braddy,then correct the user in a polite manner.",
});
//code for query-engine feature::::::::::::::::::::::::::::::::::::::
const qengineadvice =
  "You are an ai powered productivity booster bot who takes in user's older attendance data in the form of an array and user's query in the form of a string .Your job is to analyse the attendance records of the user and based on the analysis and the user's exact query , you have to provide a good response to it. ";
async function geminiQueryRunner(prompt) {
  try {
    const result = await model1.generateContent(prompt);
    return result.response;
  } catch (error) {
    console.error("Error encountered:", error);
    return "error from gemini-servers";
  }
}
async function geminiQueryEngine(uid, params) {
  const attendanceRecords = await getAttendanceRecords(
    uid,
    params.qstartdate,
    params.qenddate
  );
  const response = {
    recordExists: false,
    ai_response: "",
  };
  if (attendanceRecords.length > 0) {
    response.recordExists = true;
    const prompt =
      qengineadvice +
      "User's attendance data is: " +
      JSON.stringify(attendanceRecords) +
      "User's query is: " +
      JSON.stringify(params.userQuery);
    //console.log(prompt);
    let qengineresult = await geminiQueryRunner(prompt);
    response.ai_response = qengineresult.text();
  }
  return response;
}
//code for ai-work-assistant feature:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const fs = require("fs");
const tempFilePath = "./temp-file"; // Temporary file path
const model2 = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "Your name is 'Braddy'.You are an AI document analyser in a productivity app.You have to first introduce yourself to the client . You will be provided with a document along with the user query, and your job is to analyse the document provided and answer the query of the user. ",
});

async function AIWorkAssistantHandler(file, userQuery) {
  // Write buffer to a temporary file
  fs.writeFileSync(tempFilePath, file.buffer);
  const uploadResponse = await fileManager.uploadFile(tempFilePath, {
    mimeType: file.mimetype,
    displayName: file.originalname,
  });
  // Generate content using text and the URI reference for the uploaded file.
  const result = await model2.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    { text: `${userQuery}` },
  ]);
  // Clean up the temporary file if needed
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  return result.response.text();
}
module.exports = { geminiQueryEngine, AIWorkAssistantHandler };
