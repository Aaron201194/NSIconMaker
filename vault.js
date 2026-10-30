const API_URL = 'https://your-render-app-url.onrender.com'; // Replace with your actual deployed URL
let currentItemKey = '';
let currentUserVote = null;

async function loadReactions(packName) {
  currentItemKey = encodeURIComponent(packName);
  currentUserVote = localStorage.getItem('vote_' + currentItemKey) || null;

  try {
    let response = await fetch(`${API_URL}/api/reactions/${currentItemKey}`);
    let stats = await response.json();
    updateReactionUI(stats, currentUserVote);
  } catch (err) {
    console.error('Failed to load reactions', err);
  }
}

async function react(type) {
  if (!currentItemKey) return;

  // Toggle off if clicking the same vote again
  let newVote = (currentUserVote === type) ? null : type;

  try {
    let response = await fetch(`${API_URL}/api/reactions/${currentItemKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newVote, previousVote: currentUserVote })
    });
    
    let stats = await response.json();
    currentUserVote = newVote;
    
    if (currentUserVote) {
      localStorage.setItem('vote_' + currentItemKey, currentUserVote);
    } else {
      localStorage.removeItem('vote_' + currentItemKey);
    }

    updateReactionUI(stats, currentUserVote);
  } catch (err) {
    console.error('Failed to submit vote', err);
  }
}

function updateReactionUI(stats, userVote) {
  document.getElementById('yeah-count').innerText = stats.yeah;
  document.getElementById('boo-count').innerText = stats.boo;
  
  const yeahBtn = document.getElementById('yeah-btn');
  const booBtn = document.getElementById('boo-btn');
  
  yeahBtn.style.opacity = userVote === 'yeah' ? '1' : '0.6';
  booBtn.style.opacity = userVote === 'boo' ? '1' : '0.6';
}
