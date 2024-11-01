require("dotenv").config(); // Load environment variables
var admin = require("firebase-admin");
const private_key = process.env.firebase_admin_private_key;
const private_key_formatted = private_key.replace(/\\n/g, "\n");
var serviceAccount = {
  type: process.env.firebase_admin_type,
  project_id: process.env.firebase_admin_project_id,
  private_key_id: process.env.firebase_admin_private_key_id,
  private_key: private_key_formatted,
  client_email: process.env.firebase_admin_client_email,
  client_id: process.env.firebase_admin_client_id,
  auth_uri: process.env.firebase_admin_auth_uri,
  token_uri: process.env.firebase_admin_token_uri,
  auth_provider_x509_cert_url:
    process.env.firebase_admin_auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.firebase_admin_client_x509_cert_url,
  universe_domain: process.env.firebase_admin_universe_domain,
};
const { cert } = require("firebase-admin/app");
const {
  getStorage,
  storage,
  getDownloadURL,
} = require("firebase-admin/storage");
const { credential } = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.firebase_admin_storageBucket,
});
const db = admin.firestore();
const bucket = getStorage().bucket();
module.exports = {
  getStorage,
  admin,
  bucket,
  getAuth,
  credential,
  db,
  getDownloadURL,
};
