let currentItemKey = '';

function react(type) {
  if (!currentItemKey) return;
  
  // Load current stats and user's current vote from localStorage
  let stats = JSON.parse(localStorage.getItem(currentItemKey + '_stats') || '{"yeah": 0, "boo": 0}');
  let userVote = localStorage.getItem(currentItemKey + '_userVote') || null;
  
  if (userVote === type) {
    // Clicking the same button again removes the vote (toggle off)
    stats[type]--;
    userVote = null;
  } else {
    // If they already had the opposite vote, decrement the old one
    if (userVote) {
      stats[userVote]--;
    }
    // Apply the new vote
    stats[type]++;
    userVote = type;
  }
  
  // Save back to localStorage
  localStorage.setItem(currentItemKey + '_stats', JSON.stringify(stats));
  if (userVote) {
    localStorage.setItem(currentItemKey + '_userVote', userVote);
  } else {
    localStorage.removeItem(currentItemKey + '_userVote');
  }
  
  // Update UI counts and active button styles
  updateReactionUI(stats, userVote);
}

function updateReactionUI(stats, userVote) {
  document.getElementById('yeah-count').innerText = stats.yeah;
  document.getElementById('boo-count').innerText = stats.boo;
  
  // Optional: Visual styling to show which button is active
  const yeahBtn = document.getElementById('yeah-btn');
  const booBtn = document.getElementById('boo-btn');
  
  yeahBtn.style.opacity = userVote === 'yeah' ? '1' : '0.6';
  booBtn.style.opacity = userVote === 'boo' ? '1' : '0.6';
}
