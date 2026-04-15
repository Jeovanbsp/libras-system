/**
 * Escapes special regex characters from user input to prevent ReDoS attacks.
 * Use this before passing user input to new RegExp().
 */
function escapeRegex(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
