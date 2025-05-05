const express = require('express');
const admin = require('firebase-admin');
const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-key.json'); // Path to your key file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://testdesigncourse.firebaseio.com" // Replace <your-project-id> with your Firebase project ID
});

const db = admin.firestore();

// Test Firestore connection
app.get('/test-db', async (req, res) => {
    try {
        const testDoc = db.collection('test').doc('example');
        await testDoc.set({ message: 'Hello, Firestore!' });
        const doc = await testDoc.get();
        res.send(doc.data());
    } catch (error) {
        console.error('Error accessing Firestore:', error);
        res.status(500).send('Error accessing Firestore');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});