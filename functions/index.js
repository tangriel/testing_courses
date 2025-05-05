const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

// Decode the Base64-encoded service account key from Firebase environment config
const serviceAccountKey = Buffer.from(
  functions.config().service_account.key,
  'base64'
).toString('utf8');

// Initialize Firebase Admin with the decoded key
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
});

// Initialize Firestore
const db = admin.firestore();

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Example route: POST /register
app.post('/register', async (req, res) => {
  try {
    const { userId, courseId, runId, moduleIds } = req.body;

    if (!userId || !courseId || !moduleIds || moduleIds.length === 0) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    const userRef = db.collection('users').doc(userId);

    await userRef.set(
      {
        enrollments: admin.firestore.FieldValue.arrayUnion({
          courseId,
          runId,
          modules: moduleIds,
        }),
      },
      { merge: true }
    );

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({ error: 'Error registering user' });
  }
});

// Export the Express app as a Firebase Cloud Function
exports.app = functions.https.onRequest(app);