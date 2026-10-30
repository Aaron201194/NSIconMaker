const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const DB_FILE = './reactions.json';

// Helper to read data
function getData() {
  if (!fs.existsSync(DB_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

// Helper to write data
function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Get reactions for a specific pack
app.get('/api/reactions/:id', (req, res) => {
  const data = getData();
  const packId = req.params.id;
  res.json(data[packId] || { yeah: 0, boo: 0 });
});

// Post a vote
app.post('/api/reactions/:id', (req, res) => {
  const data = getData();
  const packId = req.params.id;
  const { type, previousVote } = req.body; // type: 'yeah'/'boo' or null

  if (!data[packId]) {
    data[packId] = { yeah: 0, boo: 0 };
  }

  // Handle vote toggling / switching logic globally
  if (previousVote) {
    data[packId][previousVote] = Math.max(0, data[packId][previousVote] - 1);
  }
  if (type) {
    data[packId][type]++;
  }

  saveData(data);
  res.json(data[packId]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));