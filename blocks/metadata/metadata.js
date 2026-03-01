/**
 * Metadata block - hides itself as metadata is processed by the platform.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (section) section.remove();
}
