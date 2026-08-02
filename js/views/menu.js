(function () {
  'use strict';

  var MENU_ITEMS = [
    {
      id: 'nextCard',
      title: 'Nasledujúca karta',
      desc: 'Prepínače: nasledujúca / predchádzajúca · len hodnota alebo hodnota + farba.'
    },
    {
      id: 'countRemoval',
      title: 'Koľko kariet dať prec',
      desc: 'Karta X je vrchná (alebo spodná). Koľko kariet dať prec, aby bola vrchná (posledná) karta Y? Prepínače: len hodnota alebo hodnota + farba.'
    },
    {
      id: 'positionAt',
      title: 'Ktorá karta je na pozícii',
      desc: 'Karta X je vrchná (1.). Ktorá karta je N. od vrchu alebo od spodu? Prepínače: len hodnota alebo hodnota + farba.'
    },
    {
      id: 'overview',
      title: 'Prehľad stacku',
      desc: 'Celých 52 kariet v 4 radoch po 13, začínajúc Ásom križe. Interaktívny cyklus.'
    },
    {
      id: 'cheatsheet',
      title: 'Cheat-sheet',
      desc: 'Pravidlá: CHaSeD, +3, cyklus 13 a návody na lokalizáciu.'
    }
  ];

  window.Views = window.Views || {};

  window.Views.menu = {
    title: 'Vyber si disciplínu',
    render: function (container) {
      container.innerHTML = '';

      var grid = document.createElement('div');
      grid.className = 'menu-grid';

      MENU_ITEMS.forEach(function (item) {
        var btn = document.createElement('button');
        btn.className = 'menu-item';
        btn.dataset.view = item.id;

        var title = document.createElement('span');
        title.className = 'menu-item-title';
        title.textContent = item.title;

        var desc = document.createElement('span');
        desc.className = 'menu-item-desc';
        desc.textContent = item.desc;

        btn.appendChild(title);
        btn.appendChild(desc);

        btn.addEventListener('click', function () {
          window.App.navigate(item.id);
        });

        grid.appendChild(btn);
      });

      container.appendChild(grid);
    }
  };
})();
