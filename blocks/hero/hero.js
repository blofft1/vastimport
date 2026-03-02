const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

function isDMOpenAPIUrl(url) {
  return url.includes('adobeaemcloud.com/adobe/assets/');
}

function isVideoLink(link) {
  const href = link?.href || '';
  return VIDEO_EXTENSIONS.some((ext) => href.toLowerCase().includes(ext))
    || isDMOpenAPIUrl(href);
}

function buildOverlayControls(block, ctaLink) {
  const controls = document.createElement('div');
  controls.className = 'hero-overlay-controls';

  // Play/Pause toggle
  const playPause = document.createElement('button');
  playPause.type = 'button';
  playPause.className = 'hero-playpause';
  playPause.title = 'Pause';
  playPause.setAttribute('aria-label', 'Pause video');
  playPause.innerHTML = '<span class="hero-playpause-icon"></span>';
  playPause.addEventListener('click', () => {
    const video = block.querySelector('video');
    if (!video) return;
    if (video.paused) {
      video.play();
      playPause.title = 'Pause';
      playPause.setAttribute('aria-label', 'Pause video');
      block.classList.remove('hero-paused');
    } else {
      video.pause();
      playPause.title = 'Play';
      playPause.setAttribute('aria-label', 'Play video');
      block.classList.add('hero-paused');
    }
  });
  controls.append(playPause);

  // CTA link (e.g. "Watch full video")
  if (ctaLink) {
    const cta = document.createElement('a');
    cta.href = ctaLink.href;
    cta.className = 'hero-cta';
    cta.textContent = ctaLink.textContent;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    controls.append(cta);
  }

  block.append(controls);
}

export default function decorate(block) {
  const allLinks = [...block.querySelectorAll('a')];
  const link = allLinks.find(isVideoLink);
  if (!link) return;

  // Find non-video CTA link for overlay
  const ctaLink = allLinks.find((a) => !isVideoLink(a));

  const videoSrc = link.href;
  const img = block.querySelector('img');
  const posterSrc = img?.src || '';

  // Remove the image/video-link row entirely
  const mediaRow = link.closest('.hero > div') || img?.closest('.hero > div');
  if (mediaRow) mediaRow.remove();

  // Remove CTA link from content (it will be in the overlay)
  if (ctaLink) {
    const wrapper = ctaLink.closest('.button-wrapper') || ctaLink.closest('p');
    if (wrapper) wrapper.remove();
  }

  const video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  if (posterSrc) video.setAttribute('poster', posterSrc);

  const source = document.createElement('source');
  source.src = videoSrc;
  if (isDMOpenAPIUrl(videoSrc)) {
    source.type = 'video/mp4';
  } else {
    source.type = `video/${videoSrc.split('.').pop().split('?')[0]}`;
  }
  video.append(source);

  block.prepend(video);
  block.classList.add('hero-video');

  // Add overlay controls (play/pause + CTA)
  buildOverlayControls(block, ctaLink);
}
