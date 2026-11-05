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

document.getElementById('pack-filter').addEventListener('change', (e) => {
    // 1. Grab the custom data attributes from the selected <option>
    const selectedOption = e.target.options[e.target.selectedIndex];
    const requireStr = selectedOption.dataset.require;
    const isStrict = selectedOption.dataset.strict === "true";
    
    const requiredLayers = requireStr ? requireStr.split(',') : [];

    // 2. Filter your array of packs (assuming it's called packsData)
    const filteredPacks = packsData.filter(pack => {
        // If "All Packs" is selected (empty string)
        if (requiredLayers.length === 0) return true; 
        
        // Assuming your pack object has an array of its files/types called 'layers'
        // e.g., pack.layers = ['prev', 'BG', 'ICO']
        // Strip out 'prev' so it doesn't interfere with the strict count
        const coreLayers = pack.layers.filter(layer => layer !== 'prev' && layer !== 'preview');

        // Check if the pack contains EVERY layer required by the filter
        const hasRequired = requiredLayers.every(req => coreLayers.includes(req));

        if (isStrict) {
            // Strict match: Must have the required layers AND exactly that many core layers (no extras)
            return hasRequired && coreLayers.length === requiredLayers.length;
        }

        // Loose match (Combined filters like Basic/Advanced/Full)
        return hasRequired;
    });

    // 3. Re-draw your UI with the filtered list
    renderPacks(filteredPacks);
});
