function buildCircleSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('class', 'station-overview-circle');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '100');
  circle.setAttribute('cy', '100');
  circle.setAttribute('r', '95');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', '#B3ABA3');
  circle.setAttribute('stroke-width', '0.5');
  circle.setAttribute('stroke-dasharray', '4 4');
  svg.append(circle);

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '100');
  line.setAttribute('y1', '0');
  line.setAttribute('x2', '100');
  line.setAttribute('y2', '40');
  line.setAttribute('stroke', '#FF5623');
  line.setAttribute('stroke-width', '1');
  svg.append(line);

  return svg;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 1) return;

  // First row has two columns: left (eyebrow + specs) and right (image + desc)
  const leftCol = rows[0]?.children[0];
  const rightCol = rows[0]?.children[1];

  if (!leftCol || !rightCol) return;

  // Parse left column: first paragraph is eyebrow, rest are specs
  const leftParagraphs = [...leftCol.querySelectorAll('p')];
  const eyebrowP = leftParagraphs[0];
  const specParagraphs = leftParagraphs.slice(1);

  // Parse right column: image, heading, link
  const img = rightCol.querySelector('picture') || rightCol.querySelector('img');
  const heading = rightCol.querySelector('h3');
  const ctaLink = rightCol.querySelector('a');

  // Extract station name from eyebrow (e.g. "HAVEN-1" from "HAVEN-1 — Launching 2027")
  const eyebrowText = eyebrowP?.textContent || '';
  const stationName = eyebrowText.split('—')[0].split('–')[0].trim().replace(/\s+/g, '-');

  // Parse eyebrow into title + subtitle
  const eyebrowParts = eyebrowText.split(/\s*[—–]\s*/);
  const eyebrowTitle = eyebrowParts[0]?.trim() || '';
  const eyebrowSub = eyebrowParts.slice(1).join(' — ').trim();

  // Parse specs into label:value pairs
  const specs = specParagraphs.map((p) => {
    const text = p.textContent;
    const strong = p.querySelector('strong');
    const value = strong?.textContent?.trim() || '';
    const label = text.replace(value, '').replace(/:?\s*$/, '').trim();
    return { label: label.replace(/:$/, ''), value };
  }).filter((s) => s.label && s.value);

  // Build new DOM structure
  block.textContent = '';

  // Watermark title
  const watermark = document.createElement('div');
  watermark.className = 'station-overview-watermark';
  watermark.textContent = stationName;
  block.append(watermark);

  // Content wrapper
  const content = document.createElement('div');
  content.className = 'station-overview-content';

  // Left specs (labels)
  const leftSpecs = document.createElement('div');
  leftSpecs.className = 'station-overview-specs-left';

  const eyebrowEl = document.createElement('div');
  eyebrowEl.className = 'station-overview-eyebrow';
  eyebrowEl.innerHTML = `<span class="station-overview-eyebrow-title">${eyebrowTitle}</span>`;
  if (eyebrowSub) {
    eyebrowEl.innerHTML += `<br><span class="station-overview-eyebrow-sub">${eyebrowSub}</span>`;
  }
  leftSpecs.append(eyebrowEl);

  const labelsUl = document.createElement('ul');
  labelsUl.className = 'station-overview-labels';
  specs.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = `${s.label}:`;
    labelsUl.append(li);
  });
  leftSpecs.append(labelsUl);
  content.append(leftSpecs);

  // Center area (circle + image)
  const center = document.createElement('div');
  center.className = 'station-overview-center';
  center.append(buildCircleSVG());

  const imgWrap = document.createElement('div');
  imgWrap.className = 'station-overview-image';
  if (img) imgWrap.append(img);
  center.append(imgWrap);
  content.append(center);

  // Right specs (values)
  const rightSpecs = document.createElement('div');
  rightSpecs.className = 'station-overview-specs-right';

  const valuesUl = document.createElement('ul');
  valuesUl.className = 'station-overview-values';
  specs.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = s.value;
    valuesUl.append(li);
  });
  rightSpecs.append(valuesUl);
  content.append(rightSpecs);

  block.append(content);

  // Bottom info row
  const info = document.createElement('div');
  info.className = 'station-overview-info';
  if (heading) info.append(heading);
  if (ctaLink) {
    const linkWrap = document.createElement('p');
    linkWrap.append(ctaLink);
    info.append(linkWrap);
  }
  block.append(info);

  // Additional rows (for any extra content)
  rows.slice(1).forEach((row) => {
    const extra = document.createElement('div');
    extra.className = 'station-overview-extra';
    extra.innerHTML = row.innerHTML;
    block.append(extra);
  });
}
