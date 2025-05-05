const admin = require('firebase-admin');

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(
        Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
      )
    ),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, courseId, runId, moduleIds } = req.body;

    // Validate request body
    if (!userId || !courseId || !moduleIds || moduleIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRef = db.collection('users').doc(userId);

    // Add enrollment details to the user's document in Firestore
    await userRef.set(
      {
        enrollments: admin.firestore.FieldValue.arrayUnion({
          courseId,
          runId,
          modules: moduleIds,
        }),
      },
      { merge: true } // Merge with existing data to avoid overwriting
    );

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};