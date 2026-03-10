/**
 * Wraps a variable name in Scene7 $...$ delimiters if not already wrapped.
 * @param {string} name The variable name
 * @returns {string} The Scene7-formatted variable name
 */
function formatVariable(name) {
  const trimmed = name.trim();
  if (trimmed.startsWith('$') && trimmed.endsWith('$')) return trimmed;
  return `$${trimmed}$`;
}

/**
 * Dynamic Media Template block — renders a Scene7 Dynamic Media template
 * with author-configurable variables.
 *
 * Content model (authored as a table in DA):
 *   Row 1: Base template URL (col 1), optional alt text (col 2)
 *   Row 2+: Variable name (col 1), variable value (col 2)
 *
 * The block constructs the final image URL by appending variables as
 * query parameters in Scene7 $variable$=value format.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Row 1: template URL and optional alt text
  const firstRow = rows[0];
  const cols = [...firstRow.children];
  const link = cols[0]?.querySelector('a');
  const baseUrl = link ? link.href : cols[0]?.textContent?.trim();
  const altText = cols[1]?.textContent?.trim() || 'Dynamic Media Template';

  if (!baseUrl) {
    block.innerHTML = '<p class="dm-template-error">No template URL provided.</p>';
    return;
  }

  // Row 2+: variable name/value pairs
  const params = [];
  rows.slice(1).forEach((row) => {
    const cells = [...row.children];
    const name = cells[0]?.textContent?.trim();
    const value = cells[1]?.textContent?.trim();
    if (name && value !== undefined) {
      params.push(`${formatVariable(name)}=${encodeURIComponent(value)}`);
    }
  });

  // Build the final URL
  const separator = baseUrl.includes('?') ? '&' : '?';
  const finalUrl = params.length ? `${baseUrl}${separator}${params.join('&')}` : baseUrl;

  // Render the image
  block.innerHTML = '';

  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = finalUrl;
  img.alt = altText;
  img.loading = 'lazy';
  img.width = 1920;
  img.height = 800;
  picture.append(img);

  block.append(picture);
}
