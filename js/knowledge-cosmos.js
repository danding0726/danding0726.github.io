(function () {
  const cosmos = document.querySelector('[data-knowledge-cosmos]');
  if (!cosmos) return;

  const planetNodes = Array.from(cosmos.querySelectorAll('[data-planet]'));
  const planetButtons = Array.from(cosmos.querySelectorAll('[data-planet-open]'));
  const panels = Array.from(cosmos.querySelectorAll('[data-planet-panel]'));
  const overviewLabel = cosmos.querySelector('[data-cosmos-location]');
  const backButton = cosmos.querySelector('[data-cosmos-back]');
  const stationLinks = Array.from(cosmos.querySelectorAll('[data-station]'));
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
      overviewLabel.textContent = target.getAttribute('data-planet-title') + ' / SURFACE VIEW';
    }
    if (backButton) backButton.hidden = false;

    try { sessionStorage.setItem('cosmosPlanet', id); } catch (error) {}
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
    if (overviewLabel) overviewLabel.textContent = 'GALAXY OVERVIEW / 03 ACTIVE WORLDS';
    if (backButton) backButton.hidden = true;

    try { sessionStorage.removeItem('cosmosPlanet'); } catch (error) {}
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

  let restored = null;
  try { restored = sessionStorage.getItem('cosmosPlanet'); } catch (error) {}
  if (restored && planetNodes.some(node => node.getAttribute('data-planet') === restored)) {
    setPlanet(restored, { focus: false });
  } else {
    setOverview({ focus: false });
  }
})();
