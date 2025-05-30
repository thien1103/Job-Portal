import express from 'express';
import RecombeeService from '../services/RecombeeService.js';

const router = express.Router();

router.post('/recommend', async (req, res) => {
  try {
    const { userId, skills, limit = 3 } = req.body;
    if (!userId || !skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'userId and skills array are required' });
    }

    await RecombeeService.addUser(userId, skills);
    await RecombeeService.syncJobs();
    const recommendations = await RecombeeService.getRecommendations(userId, limit);

    res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;