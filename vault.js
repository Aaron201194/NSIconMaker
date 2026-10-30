const API_URL = 'https://nsiconmaker.onrender.com'; // Replace with your actual deployed URL
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

function renderTopTenRow(packsArray) {
    // Sort packs by Yeah count descending and take top 10
    const topTen = [...packsArray].sort((a, b) => b.yeahs - a.yeahs).slice(0, 10);
    
    const scroller = document.getElementById('topTenScroller');
    scroller.innerHTML = '';

    topTen.forEach((pack, index) => {
        const rank = index + 1;
        const card = document.createElement('div');
        card.className = 'top-ten-card';
        card.onclick = () => openPackDetails(pack); // Hook into your existing drawer/sidebar function

        card.innerHTML = `
            <div class="rank-badge">#${rank}</div>
            <img src="${pack.thumbnail || pack.previewUrl}" alt="${pack.name}">
            <div class="top-ten-title">${pack.name}</div>
            <div class="top-ten-yeahs">👍 ${pack.yeahs || 0} Yeahs</div>
        `;
        scroller.appendChild(card);
    });
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
