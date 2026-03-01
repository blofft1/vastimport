import { createOptimizedPicture } from '../../scripts/aem.js';

function buildCrosshairSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('class', 'cards-crosshair');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M8 0V16M16 8L0 8');
  path.setAttribute('stroke', 'currentColor');
  svg.append(path);
  return svg;
}

function decorateMissions(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'cards-missions-grid';

  rows.forEach((row) => {
    const cols = [...row.children];
    const imgCol = cols[0];
    const bodyCol = cols[1];

    const picture = imgCol?.querySelector('picture');
    const title = bodyCol?.querySelector('strong')?.textContent || bodyCol?.querySelector('p')?.textContent || '';
    const items = [...(bodyCol?.querySelectorAll('li') || [])].map((li) => li.textContent);

    const card = document.createElement('div');
    card.className = 'cards-mission-card';

    // Background layer with image + title
    const bg = document.createElement('div');
    bg.className = 'cards-mission-bg';
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
        bg.append(optimized);
      }
    }
    const hDiv = document.createElement('div');
    hDiv.className = 'cards-mission-title';
    const h4 = document.createElement('h4');
    h4.textContent = title;
    hDiv.append(h4);
    bg.append(hDiv);
    card.append(bg);

    // Overlay layer with title + list
    const overlay = document.createElement('div');
    overlay.className = 'cards-mission-overlay';
    const overlayInner = document.createElement('div');
    overlayInner.className = 'cards-mission-overlay-content';
    const h5 = document.createElement('h5');
    h5.textContent = title;
    overlayInner.append(h5);
    if (items.length) {
      const ul = document.createElement('ul');
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.append(li);
      });
      overlayInner.append(ul);
    }
    overlay.append(overlayInner);
    card.append(overlay);

    // Crosshair decorations at corners
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach((pos) => {
      const svg = buildCrosshairSVG();
      svg.classList.add(`cards-crosshair-${pos}`);
      card.append(svg);
    });

    container.append(card);
  });

  block.replaceChildren(container);
}

export default function decorate(block) {
  if (block.classList.contains('missions')) {
    decorateMissions(block);
    return;
  }

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
