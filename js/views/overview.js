(function () {
  'use strict';

  var S = window.Stack;
  var UI = window.UI;

  window.Views = window.Views || {};

  window.Views.overview = {
    title: 'Prehľad stacku',
    render: function (container) {
      container.innerHTML = '';

      var card = document.createElement('div');
      card.className = 'card';

      var title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = 'Prehľad stacku';

      var subtitle = document.createElement('div');
      subtitle.className = 'card-subtitle';
      subtitle.textContent = 'Celých 52 kariet v 4 radoch po 13. Každá ďalšia karta je +3 hodnota a ďalšia farba (CHaSeD). Čísla v rohu = pozícia v cykle (1 = vrch, 52 = spodok).';

      var btnRow = document.createElement('div');
      btnRow.className = 'btn-row';
      var focusBtn = document.createElement('button');
      focusBtn.className = 'btn-secondary btn';
      focusBtn.textContent = 'Náhodná východisková karta';
      btnRow.appendChild(focusBtn);

      var cycleWrap = document.createElement('div');
      cycleWrap.id = 'overview-cycle';

      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(btnRow);
      card.appendChild(cycleWrap);
      container.appendChild(card);

      function renderCycle(startCard) {
        cycleWrap.innerHTML = '';
        cycleWrap.appendChild(UI.createCycleView({
          startCard: startCard,
          markStart: true
        }));
      }

      focusBtn.addEventListener('click', function () {
        var idx = Math.floor(Math.random() * 52);
        var c = S.FULL_STACK[idx];
        renderCycle({ rank: c.rank, suit: c.suit });
      });

      renderCycle(S.makeCard(1, 0));
    }
  };
})();
