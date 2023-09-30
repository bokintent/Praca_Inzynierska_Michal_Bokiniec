
const express = require('express');
const router = express.Router();
const Sound = require('../models/sound');


router.post('/sounds/saveAudioData', async (req, res) => {
  const { audioData } = req.body;

  try {
    await Promise.all(audioData.map(async ({ name, blob }) => {
      const sound = new Sound({ name, audioData: blob });
      await sound.save();
    }));

    res.json({ success: true });
  } catch (error) {
    console.error('Błąd podczas zapisywania danych audio:', error);
    res.json({ success: false });
  }
});

module.exports = router;