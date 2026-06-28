const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/extract', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }

    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return res.status(500).json({ success: false, error: 'GROQ_API_KEY is not configured' });
        }

        const currentDate = new Date().toISOString();
        const prompt = `You are an academic assignment extraction AI.
Your job is to convert messy academic announcements into structured JSON.
Extract only factual information.
Return ONLY valid JSON.
Never include markdown.
Never include explanations.

Today's current date and time is: ${currentDate}

Schema:
{
"subject":"",
"title":"",
"description":"",
"deadline":"",
"priority":"",
"source":"Manual Inbox",
"status":"Pending"
}

Rules:
* If deadline is missing use null.
* If a deadline is mentioned relatively (e.g. "tomorrow", "next Tuesday"), you MUST calculate the absolute correct ISO-8601 date string based on "Today's current date and time" provided above.
* The deadline field MUST absolutely be a valid ISO-8601 formatted string (e.g., 2026-06-30T17:00:00Z) or null.
* If the subject or title is not explicitly mentioned, synthesize a short, logical subject and concise title from the text context itself. DO NOT use null for subject or title.
* Never invent dates.
* Priority:
  High -> due within 2 days
  Medium -> due within 7 days
  Low -> otherwise
* Output must always be valid JSON.

Message to extract:
"${message}"`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that only outputs JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0,
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const aiText = response.data.choices[0].message.content.trim();

        // Ensure no markdown wrapper exists
        let jsonStr = aiText;
        if (jsonStr.startsWith('\`\`\`')) {
            jsonStr = jsonStr.replace(/^\`\`\`json/i, '').replace(/^\`\`\`/i, '').replace(/\`\`\`$/i, '').trim();
        }

        let assignment;
        try {
            assignment = JSON.parse(jsonStr);
        } catch (e) {
            console.error("JSON Parsing failed", aiText);
            return res.status(500).json({ success: false, error: 'Failed to parse AI response as JSON' });
        }

        res.json({
            success: true,
            assignment
        });
    } catch (error) {
        console.error('Error hitting Groq API:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Failed to extract assignment' });
    }
});

module.exports = router;
