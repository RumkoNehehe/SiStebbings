(function () {
  'use strict';

  var VIEW_ORDER = ['cycle13', 'nextCard', 'positionTop', 'positionBottom', 'positionQueryTop', 'positionQueryBottom', 'overview', 'cheatsheet'];

  var appEl = document.getElementById('app');
  var navEl = document.getElementById('topnav');
  var toggleBtn = document.getElementById('nav-toggle');

  function closeMenu() {
    if (navEl) navEl.classList.remove('open');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = '☰';
    }
  }

  function buildNav(activeId) {
    navEl.innerHTML = '';

    var home = document.createElement('button');
    home.className = 'nav-btn' + (activeId === 'menu' ? ' active' : '');
    home.textContent = 'Menu';
    home.addEventListener('click', function () { window.App.navigate('menu'); });
    navEl.appendChild(home);

    VIEW_ORDER.forEach(function (id) {
      var btn = document.createElement('button');
      btn.className = 'nav-btn' + (activeId === id ? ' active' : '');
      btn.textContent = window.Views[id].title;
      btn.addEventListener('click', function () { window.App.navigate(id); });
      navEl.appendChild(btn);
    });
  }

  function navigate(id) {
    var view = window.Views[id];
    if (!view) {
      id = 'menu';
      view = window.Views.menu;
    }

    var heading = document.createElement('div');
    heading.className = 'view-heading';
    var h2 = document.createElement('h2');
    h2.textContent = view.title;
    heading.appendChild(h2);

    appEl.innerHTML = '';
    appEl.appendChild(heading);

    view.render(appEl);
    buildNav(id);
    closeMenu();

    window.scrollTo(0, 0);
  }

  window.App = {
    navigate: navigate
  };

  document.addEventListener('DOMContentLoaded', function () {
    navigate('menu');

    if (toggleBtn && navEl) {
      toggleBtn.addEventListener('click', function () {
        var open = navEl.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggleBtn.textContent = open ? '✕' : '☰';
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  });
})();
