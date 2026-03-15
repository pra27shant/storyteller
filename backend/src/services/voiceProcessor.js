/**
 * Parse a natural language voice command into a structured intent.
 * @param {string} text - The voice command text.
 * @returns {{ action: string, params: object }}
 */
function parseCommand(text) {
  const normalized = text.toLowerCase().trim();

  // "play something in [genre]" or "play [genre] stories"
  const genreMatch = normalized.match(
    /play\s+(?:something\s+in|(?:a|some|me)\s+(?:a\s+)?)\s*(\w[\w\s]*?)(?:\s+stor(?:y|ies))?$/
  );
  if (genreMatch) {
    return { action: 'play_genre', params: { genre: genreMatch[1].trim() } };
  }

  // "play [story name]"
  const playMatch = normalized.match(/^play\s+(.+)$/);
  if (playMatch) {
    const target = playMatch[1].trim();
    // Check if it looks like a genre request
    if (target.startsWith('something in ') || target.startsWith('me something in ')) {
      const genre = target.replace(/^(?:me )?something in /, '').trim();
      return { action: 'play_genre', params: { genre } };
    }
    return { action: 'play', params: { query: target } };
  }

  // "search for [query]" or "find [query]" or "look for [query]"
  const searchMatch = normalized.match(/^(?:search|find|look)\s+(?:for\s+)?(.+)$/);
  if (searchMatch) {
    return { action: 'search', params: { query: searchMatch[1].trim() } };
  }

  // Simple commands
  if (/^pause$/.test(normalized)) {
    return { action: 'pause', params: {} };
  }
  if (/^resume$/.test(normalized)) {
    return { action: 'resume', params: {} };
  }
  if (/^stop$/.test(normalized)) {
    return { action: 'stop', params: {} };
  }
  if (/^skip$/.test(normalized) || /^next$/.test(normalized)) {
    return { action: 'skip', params: {} };
  }
  if (/^repeat$/.test(normalized) || /^replay$/.test(normalized)) {
    return { action: 'repeat', params: {} };
  }

  // Fallback: treat as unknown command
  return { action: 'unknown', params: { text: normalized } };
}

/**
 * Generate a natural language response for a given action result.
 * @param {string} action - The parsed action type.
 * @param {object} data - Associated data or params.
 * @returns {string}
 */
function generateResponse(action, data = {}) {
  switch (action) {
    case 'play':
      return `Now searching for "${data.query}". Starting playback soon.`;
    case 'play_genre':
      return `Finding a great ${data.genre} story for you.`;
    case 'pause':
      return 'Playback paused.';
    case 'resume':
      return 'Resuming playback.';
    case 'stop':
      return 'Stopping playback.';
    case 'skip':
      return 'Skipping to the next story.';
    case 'repeat':
      return 'Replaying the current story from the beginning.';
    case 'search':
      return `Searching for stories about "${data.query}".`;
    case 'unknown':
    default:
      return "I'm sorry, I didn't understand that command. Try saying play, pause, skip, search, or stop.";
  }
}

module.exports = { parseCommand, generateResponse };
