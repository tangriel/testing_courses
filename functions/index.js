const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://testdesigncourse.firebaseio.com"
});

// Initialize Express.js
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/test-db', async (req, res) => {
  try {
    const testDoc = admin.firestore().collection('test').doc('example');
    await testDoc.set({ message: 'Hello, Firestore!' });
    const doc = await testDoc.get();
    res.send(doc.data());
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    res.status(500).send('Error accessing Firestore');
  }
});

// Export the Express app as a Firebase Function
exports.app = functions.https.onRequest(app);