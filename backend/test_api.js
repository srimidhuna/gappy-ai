const axios = require('axios');

async function test() {
    const emailText = `
From: Professor Davis <davis@university.edu>
Date: Mon, Jun 28, 2026 at 4:30 PM
Subject: Update on the Midterm Paper

Dear students,

I know many of you are concerned about the upcoming deadline for the Midterm Paper.
Given the recent issues with the library databases, I am extending the deadline to next Friday at 11:59 PM.

Please make sure you submit via the Canvas portal. Do not email me your papers.

Best,
Professor Davis
    `;

    try {
        const res = await axios.post('http://localhost:5000/api/extract', {
            message: emailText
        });
        console.log("SUCCESS:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log("ERROR:", e.response?.data || e.message);
    }
}

test();
