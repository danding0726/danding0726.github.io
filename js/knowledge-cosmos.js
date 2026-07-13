(function () {
  const cosmos = document.querySelector('[data-knowledge-cosmos]');
  if (!cosmos) return;

  const planetNodes = Array.from(cosmos.querySelectorAll('[data-planet]'));
  const planetButtons = Array.from(cosmos.querySelectorAll('[data-planet-open]'));
  const panels = Array.from(cosmos.querySelectorAll('[data-planet-panel]'));
  const overviewLabel = cosmos.querySelector('[data-cosmos-location]');
  const backButton = cosmos.querySelector('[data-cosmos-back]');
  const stationLinks = Array.from(cosmos.querySelectorAll('[data-station]'));
  const particleCanvas = cosmos.querySelector('[data-cosmos-particles]');
  let activePlanet = null;

  function setPlanet(id, options) {
    const settings = options || {};
    const target = planetNodes.find(node => node.getAttribute('data-planet') === id);
    if (!target) return;

    activePlanet = id;
    cosmos.classList.add('is-planet-view');
    cosmos.setAttribute('data-active-planet', id);

    planetNodes.forEach(node => {
      const active = node === target;
      node.classList.toggle('is-active', active);
      const button = node.querySelector('[data-planet-open]');
      if (button) button.setAttribute('aria-expanded', active ? 'true' : 'false');
    });

    panels.forEach(panel => {
      const active = panel.getAttribute('data-planet-panel') === id;
      panel.hidden = !active;
    });

    if (overviewLabel) {
      overviewLabel.textContent = target.getAttribute('data-planet-title') + ' / 主题文章';
    }
    if (backButton) backButton.hidden = false;

    try { sessionStorage.setItem('cosmosPlanet', id); } catch (error) {}
    if (settings.updateUrl !== false && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('planet', id);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    if (settings.focus !== false) {
      const firstLink = cosmos.querySelector('[data-planet-panel="' + id + '"] a');
      if (firstLink) window.setTimeout(() => firstLink.focus(), 520);
    }
  }

  function setOverview(options) {
    const settings = options || {};
    const previous = activePlanet;
    activePlanet = null;
    cosmos.classList.remove('is-planet-view');
    cosmos.removeAttribute('data-active-planet');

    planetNodes.forEach(node => {
      node.classList.remove('is-active');
      const button = node.querySelector('[data-planet-open]');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
    panels.forEach(panel => { panel.hidden = true; });
    if (overviewLabel) overviewLabel.textContent = '博客星图 / 选择一个主题';
    if (backButton) backButton.hidden = true;

    try { sessionStorage.removeItem('cosmosPlanet'); } catch (error) {}
    if (settings.updateUrl !== false && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('planet');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    if (settings.focus !== false && previous) {
      const previousButton = cosmos.querySelector('[data-planet="' + previous + '"] [data-planet-open]');
      if (previousButton) window.setTimeout(() => previousButton.focus(), 420);
    }
  }

  planetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const planet = button.closest('[data-planet]');
      if (planet) setPlanet(planet.getAttribute('data-planet'));
    });
  });

  if (backButton) backButton.addEventListener('click', () => setOverview());

  stationLinks.forEach(link => {
    const sync = active => {
      const href = link.getAttribute('href');
      cosmos.querySelectorAll('[data-station][href="' + href + '"]').forEach(peer => {
        peer.classList.toggle('is-highlighted', active);
      });
    };
    link.addEventListener('mouseenter', () => sync(true));
    link.addEventListener('mouseleave', () => sync(false));
    link.addEventListener('focus', () => sync(true));
    link.addEventListener('blur', () => sync(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activePlanet) setOverview();
  });

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    cosmos.addEventListener('pointermove', event => {
      const rect = cosmos.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) - 0.5;
      const y = ((event.clientY - rect.top) / rect.height) - 0.5;
      planetNodes.forEach((node, index) => {
        const depth = 4 + (index * 1.8);
        node.style.setProperty('--drift-x', (x * depth).toFixed(2) + 'px');
        node.style.setProperty('--drift-y', (y * depth).toFixed(2) + 'px');
      });
      cosmos.style.setProperty('--nebula-x', (x * -12).toFixed(2) + 'px');
      cosmos.style.setProperty('--nebula-y', (y * -9).toFixed(2) + 'px');
    });
    cosmos.addEventListener('pointerleave', () => {
      planetNodes.forEach(node => {
        node.style.setProperty('--drift-x', '0px');
        node.style.setProperty('--drift-y', '0px');
      });
      cosmos.style.setProperty('--nebula-x', '0px');
      cosmos.style.setProperty('--nebula-y', '0px');
    });
  }

  if (particleCanvas) {
    const context = particleCanvas.getContext('2d');
    let stars = [];
    let width = 0;
    let height = 0;
    let ratio = 1;

    function resizeParticles() {
      const rect = cosmos.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      particleCanvas.width = Math.round(width * ratio);
      particleCanvas.height = Math.round(height * ratio);
      particleCanvas.style.width = width + 'px';
      particleCanvas.style.height = height + 'px';
      stars = Array.from({ length: Math.max(50, Math.min(120, Math.round(width / 16))) }, (_, index) => ({
        x: ((index * 73.37) % 100) / 100 * width,
        y: ((index * 41.91) % 100) / 100 * height,
        radius: 0.35 + ((index * 17) % 10) / 16,
        alpha: 0.18 + ((index * 29) % 10) / 18,
        phase: index * 0.71
      }));
    }

    function drawParticles(time) {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      stars.forEach((star, index) => {
        const pulse = reduceMotion ? 1 : 0.72 + Math.sin((time * 0.00045) + star.phase) * 0.28;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = index % 7 === 0
          ? 'rgba(210, 126, 72, ' + (star.alpha * pulse * 0.72).toFixed(3) + ')'
          : 'rgba(196, 203, 181, ' + (star.alpha * pulse).toFixed(3) + ')';
        context.fill();
      });
      if (!reduceMotion) window.requestAnimationFrame(drawParticles);
    }

    resizeParticles();
    drawParticles(0);
    window.addEventListener('resize', resizeParticles, { passive: true });
  }

  let restored = null;
  try { restored = sessionStorage.getItem('cosmosPlanet'); } catch (error) {}
  const requested = new URLSearchParams(window.location.search).get('planet');
  const initialPlanet = requested || restored;
  if (initialPlanet && planetNodes.some(node => node.getAttribute('data-planet') === initialPlanet)) {
    setPlanet(initialPlanet, { focus: false, updateUrl: false });
  } else {
    setOverview({ focus: false, updateUrl: false });
  }
})();
