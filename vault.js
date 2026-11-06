const API_URL = 'https://nsiconmaker.onrender.com';

let currentItemKey = '';
let currentUserVote = null;
let reactionLoadSequence = 0;
const pendingVotes = new Set();
const reactionStatsCache = new Map();

function getVoteStorageKey(encodedItemKey) {
  return 'vote_' + encodedItemKey;
}

function normalizeReactionStats(stats) {
  return {
    yeah: Math.max(0, Number(stats?.yeah) || 0),
    boo: Math.max(0, Number(stats?.boo) || 0)
  };
}

async function fetchReactionStats(encodedItemKey) {
  const response = await fetch(`${API_URL}/api/reactions/${encodedItemKey}`);
  if (!response.ok) {
    throw new Error(`Reaction API returned HTTP ${response.status}`);
  }

  const stats = normalizeReactionStats(await response.json());
  reactionStatsCache.set(encodedItemKey, stats);
  return stats;
}

async function loadReactions(packId) {
  const encodedKey = encodeURIComponent(packId);
  const thisLoad = ++reactionLoadSequence;

  currentItemKey = encodedKey;
  currentUserVote = localStorage.getItem(getVoteStorageKey(encodedKey)) || null;

  // Reset the selected pack's UI immediately, then replace it with the
  // correct server counts. This prevents the previous pack's counts showing.
  const cachedStats = reactionStatsCache.get(encodedKey);
  updateReactionUI(cachedStats || { yeah: 0, boo: 0 }, currentUserVote);

  try {
    const stats = await fetchReactionStats(encodedKey);

    // Ignore late responses from a pack that is no longer selected.
    if (thisLoad !== reactionLoadSequence || currentItemKey !== encodedKey) return;

    // Re-read the vote in case local state changed while the request ran.
    currentUserVote = localStorage.getItem(getVoteStorageKey(encodedKey)) || null;
    updateReactionUI(stats, currentUserVote);
  } catch (err) {
    console.error('Failed to load reactions', err);
  }
}

async function react(type) {
  const encodedKey = currentItemKey;
  if (!encodedKey || pendingVotes.has(encodedKey)) return;

  const previousVote = localStorage.getItem(getVoteStorageKey(encodedKey)) || null;
  const newVote = previousVote === type ? null : type;

  pendingVotes.add(encodedKey);
  setReactionButtonsDisabled(true);

  try {
    const response = await fetch(`${API_URL}/api/reactions/${encodedKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newVote,
        previousVote
      })
    });

    if (!response.ok) {
      throw new Error(`Reaction API returned HTTP ${response.status}`);
    }

    const stats = normalizeReactionStats(await response.json());

    if (newVote) {
      localStorage.setItem(getVoteStorageKey(encodedKey), newVote);
    } else {
      localStorage.removeItem(getVoteStorageKey(encodedKey));
    }

    currentUserVote = newVote;
    reactionStatsCache.set(encodedKey, stats);

    // Only update the sidebar if the user is still viewing this pack.
    if (currentItemKey === encodedKey) {
      updateReactionUI(stats, newVote);
    }

    // Refresh the leaderboard after the server has accepted the vote.
    if (typeof renderTopYeahPacks === 'function') {
      renderTopYeahPacks();
    }
  } catch (err) {
    console.error('Failed to submit vote', err);
  } finally {
    pendingVotes.delete(encodedKey);
    if (currentItemKey === encodedKey) {
      setReactionButtonsDisabled(false);
    }
  }
}

function setReactionButtonsDisabled(disabled) {
  const yeahBtn = document.getElementById('yeah-btn');
  const booBtn = document.getElementById('boo-btn');

  if (yeahBtn) yeahBtn.disabled = disabled;
  if (booBtn) booBtn.disabled = disabled;
}

function updateReactionUI(stats, userVote) {
  const normalized = normalizeReactionStats(stats);

  const yeahCount = document.getElementById('yeah-count');
  const booCount = document.getElementById('boo-count');
  const yeahBtn = document.getElementById('yeah-btn');
  const booBtn = document.getElementById('boo-btn');

  if (yeahCount) yeahCount.innerText = normalized.yeah;
  if (booCount) booCount.innerText = normalized.boo;

  if (yeahBtn) yeahBtn.style.opacity = userVote === 'yeah' ? '1' : '0.6';
  if (booBtn) booBtn.style.opacity = userVote === 'boo' ? '1' : '0.6';
}
