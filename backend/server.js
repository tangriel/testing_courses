const express = require('express');
const app = express();

app.use(express.json());

// Example endpoint for `/api/register`
app.post('/api/register', (req, res) => {
    const { userId, courseId, runId, moduleIds } = req.body;

    if (!userId || !courseId || !Array.isArray(moduleIds) || moduleIds.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    res.status(200).json({
        message: 'User registered successfully',
        data: { userId, courseId, runId, moduleIds }
    });
});

// Default port for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));