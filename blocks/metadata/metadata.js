/**
 * Metadata block - hidden via CSS as metadata is processed by the platform.
 * No JS decoration needed. The block is hidden by .metadata-wrapper { display: none; }
 * in metadata.css. Avoid removing the DOM here so the Sidekick Library can read it.
 * @param {Element} block The block element
 */
export default function decorate() {
  // intentionally empty — CSS handles visibility
}
