(function () {
  'use strict';

  var S = window.Stack;
  var UI = window.UI;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomCard() {
    var idx = randomInt(0, 51);
    var c = S.FULL_STACK[idx];
    return { rank: c.rank, suit: c.suit };
  }

  window.Views = window.Views || {};

  window.Views.randomCard = {
    title: 'Random karta',
    render: function (container) {
      container.innerHTML = '';

      var card = document.createElement('div');
      card.className = 'card';

      var title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = 'Random karta';

      var subtitle = document.createElement('div');
      subtitle.className = 'card-subtitle';
      subtitle.textContent = 'Náhodne vygenerovaná karta zo 52-kartového stacku.';

      var display = document.createElement('div');
      display.className = 'question-display';
      display.style.justifyContent = 'center';

      function showRandom() {
        display.innerHTML = '';
        display.appendChild(UI.cardGlyph(randomCard(), 'large'));
      }

      showRandom();

      var btnRow = document.createElement('div');
      btnRow.className = 'btn-row';
      btnRow.style.justifyContent = 'center';

      var nextBtn = document.createElement('button');
      nextBtn.className = 'btn';
      nextBtn.textContent = 'Ďalšia náhodná karta';

      nextBtn.addEventListener('click', function () {
        showRandom();
      });

      btnRow.appendChild(nextBtn);

      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(display);
      card.appendChild(btnRow);

      container.appendChild(card);
    }
  };
})();
