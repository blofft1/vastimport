/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function isDMOpenAPIUrl(url) {
  return url.includes('adobeaemcloud.com/adobe/assets/');
}

function embedYoutube(url, autoplay, background) {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      mute: background ? '1' : '0',
      controls: background ? '0' : '1',
      disablekb: background ? '1' : '0',
      loop: background ? '1' : '0',
      playsinline: background ? '1' : '0',
    };
    suffix = `&${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedVimeo(url, autoplay, background) {
  const [, video] = url.pathname.split('/');
  let suffix = '';
  if (background || autoplay) {
    const suffixParams = {
      autoplay: autoplay ? '1' : '0',
      background: background ? '1' : '0',
    };
    suffix = `?${Object.entries(suffixParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  }
  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function embedDMVideo(link, autoplay, background) {
  // Ensure the URL ends with /play for the DM video player
  let playUrl = link.endsWith('/play') ? link : `${link}/play`;
  if (background || autoplay) {
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', 'true');
    if (background) {
      params.set('muted', 'true');
      params.set('loop', 'true');
    }
    playUrl += `?${params.toString()}`;
  }
  const temp = document.createElement('div');
  temp.innerHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="${playUrl}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; encrypted-media" allowfullscreen
      title="Dynamic Media Video" loading="lazy"></iframe>
    </div>`;
  return temp.children.item(0);
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', `video/${source.split('.').pop()}`);
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (block, link, autoplay, background) => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }
  const url = new URL(link);

  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  const isVimeo = link.includes('vimeo');
  const isDM = isDMOpenAPIUrl(link);

  if (isYoutube) {
    const embedWrapper = embedYoutube(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else if (isVimeo) {
    const embedWrapper = embedVimeo(url, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else if (isDM) {
    const embedWrapper = embedDMVideo(link, autoplay, background);
    block.append(embedWrapper);
    embedWrapper.querySelector('iframe').addEventListener('load', () => {
      block.dataset.embedLoaded = true;
    });
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = true;
    });
  }
};

function buildOverlayControls(block, videoLink) {
  const controls = document.createElement('div');
  controls.className = 'video-overlay-controls';

  // Play/Pause toggle
  const playPause = document.createElement('button');
  playPause.type = 'button';
  playPause.className = 'video-playpause';
  playPause.title = 'Pause';
  playPause.setAttribute('aria-label', 'Pause video');
  playPause.innerHTML = '<span class="video-playpause-icon"></span>';
  playPause.addEventListener('click', () => {
    const video = block.querySelector('video');
    if (!video) return;
    if (video.paused) {
      video.play();
      playPause.title = 'Pause';
      playPause.setAttribute('aria-label', 'Pause video');
      block.classList.remove('video-paused');
    } else {
      video.pause();
      playPause.title = 'Play';
      playPause.setAttribute('aria-label', 'Play video');
      block.classList.add('video-paused');
    }
  });
  controls.append(playPause);

  // CTA link (e.g. "Watch full video")
  if (videoLink) {
    const cta = document.createElement('a');
    cta.href = videoLink.href;
    cta.className = 'video-cta';
    cta.textContent = videoLink.textContent;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    controls.append(cta);
  }

  block.append(controls);
}

/**
 * Builds a hero-style text overlay from the second row of the block.
 * Supports headings, paragraphs, and CTA links.
 * @param {Element} overlayRow The row element containing overlay content
 * @returns {Element} The overlay element
 */
function buildHeroOverlay(overlayRow) {
  const overlay = document.createElement('div');
  overlay.className = 'video-hero-overlay';
  const content = overlayRow.querySelector('div');
  if (content) {
    overlay.append(...content.childNodes);
  }
  // Convert links to styled buttons
  overlay.querySelectorAll('a').forEach((a) => {
    a.classList.add('video-hero-cta');
  });
  return overlay;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const firstRow = rows[0];

  // Check for hero overlay content in row 2+
  const overlayRows = rows.slice(1);
  let heroOverlay = null;
  if (overlayRows.length) {
    // Check if any overlay row has text content (headings, paragraphs)
    const hasTextContent = overlayRows.some((row) => row.querySelector('h1, h2, h3, h4, h5, h6, p'));
    if (hasTextContent) {
      heroOverlay = buildHeroOverlay(overlayRows[0]);
      block.classList.add('hero');
    }
  }

  const placeholder = firstRow ? firstRow.querySelector('picture') : null;
  const allLinks = firstRow ? [...firstRow.querySelectorAll('a')] : [];

  // First link is the video source, any additional link is a CTA overlay
  const sourceLink = allLinks[0];
  const ctaLink = allLinks.length > 1 ? allLinks[1] : null;

  const link = sourceLink ? sourceLink.href : '';
  block.textContent = '';
  block.dataset.embedLoaded = false;

  const autoplay = block.classList.contains('autoplay');
  if (placeholder) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-placeholder';
    wrapper.append(placeholder);

    if (!autoplay) {
      wrapper.insertAdjacentHTML(
        'beforeend',
        '<div class="video-placeholder-play"><button type="button" title="Play"></button></div>',
      );
      wrapper.addEventListener('click', () => {
        wrapper.remove();
        loadVideoEmbed(block, link, true, false);
      });
    }
    block.append(wrapper);
  }

  if (!placeholder || autoplay) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        const playOnLoad = autoplay && !prefersReducedMotion.matches;
        loadVideoEmbed(block, link, playOnLoad, autoplay);
      }
    });
    observer.observe(block);
  }

  if (autoplay && (ctaLink || placeholder)) {
    buildOverlayControls(block, ctaLink);
  }

  // Append hero overlay last so it sits on top
  if (heroOverlay) {
    block.append(heroOverlay);
  }
}
