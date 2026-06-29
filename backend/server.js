const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const extractRoute = require('./routes/extract');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// All AI routes (extract, summarize, recommend, insights, nlsearch)
app.use('/api', extractRoute);

app.listen(PORT, () => {
    console.log(`🚀 DeadlinePilot AI Backend running on port ${PORT}`);
});
