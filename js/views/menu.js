(function () {
  'use strict';

  var MENU_ITEMS = [
    {
      id: 'cycle13',
      title: 'Tréning 13ky cyklu',
      desc: 'Zobrazí sa hodnota, zadáš nasledujúcu v cykle A–4–7–10–K–3–6–9–Q–2–5–8–J. Bez farieb — len rámec hodnôt.'
    },
    {
      id: 'cyclePositions',
      title: 'Pozície v 13-ke',
      desc: 'Prvá (1.) je východisková. Urči, ktorá hodnota je N. v cykle, alebo na ktorej pozícii je hľadaná hodnota. Bez farieb.'
    },
    {
      id: 'nextCard',
      title: 'Nasledujúca karta',
      desc: 'Zobrazí sa karta, zadáš kompletnú nasledujúcu kartu (+3 hodnota, ďalšia farba CHaSeD).'
    },
    {
      id: 'positionTop',
      title: 'Lokalizácia zhora',
      desc: 'Poznáš vrchnú kartu (peek). Urči, ktorá karta je N. od vrchu.'
    },
    {
      id: 'positionBottom',
      title: 'Lokalizácia zdola',
      desc: 'Poznáš spodnú kartu. Urči, ktorá karta je N. od spodu.'
    },
    {
      id: 'positionQueryTop',
      title: 'Koľko kariet dať prec — zhora',
      desc: 'Prvá karta je X. Koľko kariet dať prec, aby bola divákova karta prvá?'
    },
    {
      id: 'positionQueryBottom',
      title: 'Koľko kariet dať prec — zdola',
      desc: 'Posledná karta je X. Koľko kariet dať prec zospodu, aby bola divákova karta posledná?'
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
