const express = require('express');
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// ─── Helper: call Groq ──────────────────────────────────────────────────────
async function callGroq(systemPrompt, userPrompt, temperature = 0) {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) throw new Error('GROQ_API_KEY not configured');

    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature,
            response_format: { type: 'json_object' },  // Force JSON mode
        },
        {
            headers: {
                Authorization: `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.choices[0].message.content.trim();
}

// ─── Helper: parse JSON safely ──────────────────────────────────────────────
function parseJSON(raw) {
    let str = raw;
    // 1. Strip markdown fences
    str = str.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    // 2. Try direct parse
    try {
        return JSON.parse(str);
    } catch (_) {
        // 3. Extract first {...} block
        const match = str.match(/\{[\s\S]*\}/);
        if (match) {
            try { return JSON.parse(match[0]); } catch (__) { }
        }
        console.error('parseJSON failed on:', str.slice(0, 300));
        throw new Error('No valid JSON in response');
    }
}

// ── GET /api/assignments ───────────────────────────────────────────────────
router.get('/assignments', (req, res) => {
    const tempFile = path.join(__dirname, '..', `temp_assignments_${Date.now()}.json`);
    try {
        execSync(`lemma records export Assignments --file "${tempFile}"`, { stdio: 'pipe' });

        const data = fs.readFileSync(tempFile, 'utf8');
        let assignments = [];
        try {
            assignments = JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse Lemma output:', e);
            return res.status(500).json({ success: false, assignments: [], error: 'Unable to parse assignments' });
        }

        res.json({ success: true, assignments });
    } catch (error) {
        console.error('Assignments export error:', error.message);
        res.status(500).json({ success: false, assignments: [], error: 'Unable to fetch assignments' });
    } finally {
        if (fs.existsSync(tempFile)) {
            try {
                fs.unlinkSync(tempFile);
            } catch (cleanupError) {
                console.error('Failed to delete temp file:', cleanupError.message);
            }
        }
    }
});

// ── POST /api/extract ─────────────────────────────────────────────────────
router.post('/extract', async (req, res) => {
    const { message, source } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

    try {
        const currentDate = new Date().toISOString();

        const systemPrompt = `You are an expert academic assignment extraction AI. You must output only a single valid JSON object with no explanation, no markdown, no extra text.`;

        const userPrompt = `Today: ${currentDate}. Source channel: ${source || 'unknown'}.

Extract all assignment details from the message and return a single JSON object:
title (string, required), subject (string, required), description (string), professor (string or null), deadline (ISO-8601 string or null), dueTime (HH:MM string or null), priority (high/medium/low), submissionMode (online/offline/email/lms/other or null), submissionLink (URL string or null), notes (string or null), confidence (integer 0-100), source (string).

Priority: high=due within 2 days, medium=due within 7 days, low=otherwise.
Confidence: 90-100 if all key fields clear, 70-89 if deadline inferred, 50-69 if context-guessed, 0-49 if very ambiguous.
Resolve all relative dates (tomorrow, next Tuesday) to absolute ISO-8601 using today's date.

Message: "${message.replace(/"/g, "'")}"`;

        const raw = await callGroq(systemPrompt, userPrompt, 0);
        const assignment = parseJSON(raw);

        let lemmaMessageId = null;

        try {
            const lemmaData = JSON.stringify({
                rawMessage: message,
                source: source || 'unknown',
                processed: false
            });
            const safeData = lemmaData.replace(/'/g, "'\\''");
            const output = execSync(`lemma records create Messages '${safeData}'`, { encoding: 'utf-8' });

            try {
                const parsed = JSON.parse(output.trim());
                lemmaMessageId = parsed.id || parsed._id || parsed.recordId || null;
            } catch (e) {
                const match = output.match(/id["']?\s*[:=]\s*["']?([a-zA-Z0-9_-]+)["']?/i) || output.match(/ID\s*:\s*([a-zA-Z0-9_-]+)/i);
                if (match) {
                    lemmaMessageId = match[1];
                }
            }

            if (lemmaMessageId) {
                console.log(`Lemma Message ID: ${lemmaMessageId}`);
            }
        } catch (lemmaError) {
            console.error('Lemma CLI error:', lemmaError.message);
        }

        res.json({ success: true, assignment, lemmaMessageId });
    } catch (error) {
        console.error('Extract error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Failed to extract assignment' });
    }
});

// ── POST /api/summarize ───────────────────────────────────────────────────
router.post('/summarize', async (req, res) => {
    const { title, subject, description, dueDate, priority, professor } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'title is required' });

    try {
        const systemPrompt = `You are a concise academic assistant. Output only a single valid JSON object, no markdown, no extra text.`;

        const userPrompt = `Generate a summary for this assignment:
Title: ${title}
Subject: ${subject || 'N/A'}
Professor: ${professor || 'N/A'}
Due: ${dueDate || 'No deadline'}
Priority: ${priority || 'medium'}
Description: ${description || 'No description'}

Return a JSON object with: summary (2-3 sentence string), keyPoints (array of 2-3 strings), estimatedHours (number).`;

        const raw = await callGroq(systemPrompt, userPrompt, 0.3);
        const result = parseJSON(raw);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Summarize error:', error.message);
        // Fallback response so UI can still display a study plan
        const fallback = {
            summary: `Study plan for "${title}" could not be generated via AI; using placeholder.`,
            keyPoints: [],
            estimatedHours: 2,
        };
        res.json({ success: true, ...fallback });
    }
});

// ── POST /api/recommend ───────────────────────────────────────────────────
router.post('/recommend', async (req, res) => {
    const { assignments } = req.body;
    if (!assignments?.length) return res.status(400).json({ success: false, error: 'assignments array required' });

    try {
        const now = new Date();
        const pending = assignments
            .filter(a => a.status !== 'completed')
            .slice(0, 10)   // limit to 10 to keep prompt small
            .map(a => {
                const due = new Date(a.dueDate);
                const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                return `Title: ${a.title} | Subject: ${a.subject} | Priority: ${a.priority} | DaysLeft: ${daysLeft} | Status: ${a.status}`;
            })
            .join('\n');

        const systemPrompt = `You are an academic productivity coach. Output only a single valid JSON object, no markdown, no extra text.`;

        const userPrompt = `Based on these pending assignments, recommend the top 3 to work on next.
Prioritize by urgency (days left), priority level, and estimated difficulty.

Assignments:
${pending}

Return a JSON object with:
- recommendations: array of objects, each with title (string), reason (string), urgency (critical/high/medium/low), suggestedHours (number)
- insight: one motivational productivity tip string`;

        const raw = await callGroq(systemPrompt, userPrompt, 0.4);
        const result = parseJSON(raw);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Recommend error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
    }
});

// ── POST /api/insights ────────────────────────────────────────────────────
router.post('/insights', async (req, res) => {
    const { assignments } = req.body;
    if (!assignments?.length) return res.status(400).json({ success: false, error: 'assignments array required' });

    try {
        const total = assignments.length;
        const completed = assignments.filter(a => a.status === 'completed').length;
        const overdue = assignments.filter(a => a.status === 'overdue').length;
        const pending = assignments.filter(a => a.status === 'pending').length;
        const inProgress = assignments.filter(a => a.status === 'in-progress').length;
        const subjects = [...new Set(assignments.map(a => a.subject))].join(', ');
        const sources = [...new Set(assignments.map(a => a.source))].join(', ');
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const systemPrompt = `You are an academic performance analyst. Output only a single valid JSON object, no markdown, no extra text.`;

        const userPrompt = `Analyze this student's assignment data and generate weekly productivity insights.

Data: total=${total}, completed=${completed}, overdue=${overdue}, pending=${pending}, inProgress=${inProgress}, completionRate=${completionRate}%, subjects=[${subjects}], sources=[${sources}]

Return a JSON object with:
- weeklyScore: integer 0-100 productivity score
- headline: short punchy performance headline string
- insights: array of objects each with type (strength/warning/tip) and text (actionable string)
- focusArea: the subject or area needing most attention string`;

        const raw = await callGroq(systemPrompt, userPrompt, 0.5);
        const result = parseJSON(raw);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Insights error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to generate insights' });
    }
});

// ── POST /api/nlsearch ────────────────────────────────────────────────────
router.post('/nlsearch', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'query is required' });

    try {
        const systemPrompt = `You are a search query parser. Output only a single valid JSON object, no markdown, no extra text.`;

        const userPrompt = `Parse this natural language assignment search query and extract filter criteria.

Query: "${query.replace(/"/g, "'")}"

Return a JSON object with only the fields that are relevant (omit irrelevant ones):
- status: one of pending, in-progress, completed, overdue, needs-review (or omit)
- priority: one of high, medium, low (or omit)
- source: one of whatsapp, email, google-classroom, notes, manual, college-portal, lab, project (or omit)
- subject: subject keyword string (or omit)
- dueToday: boolean true if query means today (or omit)
- dueTomorrow: boolean true if query means tomorrow (or omit)
- dueSoon: boolean true if query means soon/urgent (or omit)
- searchTerms: array of keyword strings to search in title and description (or omit)
- intent: brief string describing what the user is looking for`;

        const raw = await callGroq(systemPrompt, userPrompt, 0);
        const result = parseJSON(raw);
        res.json({ success: true, filters: result });
    } catch (error) {
        console.error('NL Search error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to parse search query' });
    }
});

module.exports = router;
