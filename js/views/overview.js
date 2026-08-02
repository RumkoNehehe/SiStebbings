(function () {
  'use strict';

  var S = window.Stack;
  var UI = window.UI;

  var DEFAULT_CARD = S.makeCard(1, 0);

  function buildCard() {
    var card = document.createElement('div');
    card.className = 'card';

    var title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = 'Prehľad stacku';

    var subtitle = document.createElement('div');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = 'Celých 52 kariet v 4 radoch po 13. Každá ďalšia karta je +3 hodnota a ďalšia farba (CHaSeD). Čísla v rohu = pozícia v cykle (1 = vrch, 52 = spodok).';

    var controlRow = document.createElement('div');
    controlRow.className = 'quiz-input-row';
    var input = UI.buildCardInput();
    input.placeholder = 'napr. AKr alebo 9P';
    var setBtn = document.createElement('button');
    setBtn.className = 'btn';
    setBtn.textContent = 'Nastaviť';
    controlRow.appendChild(input);
    controlRow.appendChild(setBtn);

    var hint = document.createElement('div');
    hint.className = 'input-hint hidden';
    hint.textContent = 'Neplatná karta. Hodnota: A, 2–10, J, Q, K · Farby: S, P, Kr, Ka. Napr. AKr alebo 10Ka.';

    var btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    var resetBtn = document.createElement('button');
    resetBtn.className = 'btn-secondary btn';
    resetBtn.textContent = 'Reset';
    var randomBtn = document.createElement('button');
    randomBtn.className = 'btn-secondary btn';
    randomBtn.textContent = 'Náhodná východisková karta';
    btnRow.appendChild(resetBtn);
    btnRow.appendChild(randomBtn);

    var cycleWrap = document.createElement('div');
    cycleWrap.id = 'overview-cycle';

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(controlRow);
    card.appendChild(hint);
    card.appendChild(btnRow);
    card.appendChild(cycleWrap);
    return { card: card, input: input, setBtn: setBtn, resetBtn: resetBtn, randomBtn: randomBtn, hint: hint, cycleWrap: cycleWrap };
  }

  window.Views = window.Views || {};

  window.Views.overview = {
    title: 'Prehľad stacku',
    render: function (container) {
      container.innerHTML = '';

      var el = buildCard();
      container.appendChild(el.card);

      function renderCycle(startCard) {
        el.cycleWrap.innerHTML = '';
        el.cycleWrap.appendChild(UI.createCycleView({
          startCard: startCard,
          markStart: true
        }));
      }

      function applyCard(value) {
        var parsed = S.parseCard(value);
        if (parsed === null) {
          el.hint.classList.remove('hidden');
          el.input.classList.add('invalid');
          return false;
        }
        el.hint.classList.add('hidden');
        el.input.classList.remove('invalid');
        renderCycle(parsed);
        return true;
      }

      el.input.addEventListener('input', function () {
        el.hint.classList.add('hidden');
        el.input.classList.remove('invalid');
      });
      el.input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCard(el.input.value);
        }
      });

      el.setBtn.addEventListener('click', function () {
        applyCard(el.input.value);
      });

      el.resetBtn.addEventListener('click', function () {
        el.input.value = '';
        el.hint.classList.add('hidden');
        el.input.classList.remove('invalid');
        renderCycle(DEFAULT_CARD);
      });

      el.randomBtn.addEventListener('click', function () {
        var idx = Math.floor(Math.random() * 52);
        var c = S.FULL_STACK[idx];
        renderCycle({ rank: c.rank, suit: c.suit });
      });

      renderCycle(DEFAULT_CARD);
    }
  };
})();
