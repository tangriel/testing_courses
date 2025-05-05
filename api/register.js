module.exports = async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { userId, courseId, runId, moduleIds } = req.body;
  
    if (!userId || !courseId || !Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    
    // Simulate handling user registration logic (e.g., saving to database)
    res.status(200).json({
      message: 'User registered successfully',
      data: {
        userId,
        courseId,
        runId,
        moduleIds,
      },
    });
  };