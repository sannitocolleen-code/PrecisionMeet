const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/recommend-meeting', async (req, res) => {
  const { description } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Meeting description is required.' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `You are an expert meeting scheduler for PrecisionMeet, an AI-powered scheduling tool. A user is about to schedule a meeting and described it as:

"${description.trim()}"

Recommend the ideal meeting length — choose exactly one from: 15 minutes, 30 minutes, 45 minutes, or 60 minutes. Write a warm, confident 2–3 sentence response. Start with "I recommend [X] minutes" and briefly explain why based on the meeting type, complexity, and what needs to get done. Be specific to what they described.`,
        },
      ],
    });

    res.json({ recommendation: message.content[0].text });
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.status(500).json({ error: 'Failed to get a recommendation. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PrecisionMeet running at http://localhost:${PORT}`);
});
