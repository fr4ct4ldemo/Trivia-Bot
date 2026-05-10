const entities = {
  '&quot;': '"',
  '&#039;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&eacute;': 'é',
  '&rsquo;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&hellip;': '...',
}

export const decodeHtml = (str) => {
  return str.replace(/&[a-zA-Z0-9#]+;/g, (ent) => entities[ent] || ent)
}