const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

function isVideoLink(link) {
  const href = link?.href || '';
  return VIDEO_EXTENSIONS.some((ext) => href.toLowerCase().includes(ext));
}

export default function decorate(block) {
  const link = [...block.querySelectorAll('a')].find(isVideoLink);
  if (!link) return;

  const videoSrc = link.href;
  const img = block.querySelector('img');
  const posterSrc = img?.src || '';

  // Remove the image/video-link row entirely
  const mediaRow = link.closest('.hero > div') || img?.closest('.hero > div');
  if (mediaRow) mediaRow.remove();

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
  source.type = `video/${videoSrc.split('.').pop().split('?')[0]}`;
  video.append(source);

  block.prepend(video);
  block.classList.add('hero-video');
}
