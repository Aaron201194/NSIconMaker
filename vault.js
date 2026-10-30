// Track reactions state (stored locally in memory or localStorage per item ID/Name)
let currentItemKey = '';

function react(type) {
  if (!currentItemKey) return;
  
  // Fetch current counts from localStorage or default to 0
  let stats = JSON.parse(localStorage.getItem(currentItemKey) || '{"yeah": 0, "boo": 0}');
  
  // Increment count
  stats[type]++;
  
  // Save back
  localStorage.setItem(currentItemKey, JSON.stringify(stats));
  
  // Update UI
  updateReactionUI(stats);
}

function updateReactionUI(stats) {
  document.getElementById('yeah-count').innerText = stats.yeah;
  document.getElementById('boo-count').innerText = stats.boo;
}

// NOTE: Call this function inside your existing item-selection/sidebar-open event listener:
// currentItemKey = 'pack_' + encodeURIComponent(item.name);
// let stats = JSON.parse(localStorage.getItem(currentItemKey) || '{"yeah": 0, "boo": 0}');
// updateReactionUI(stats);
