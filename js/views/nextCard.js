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

  function createQuestionNode(shown) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>Zobrazuje sa:</span>';
    node.appendChild(UI.cardGlyph(shown, 'large'));
    node.innerHTML += '<span>→ nasledujúca?</span>';
    return node;
  }

  function createErrorNode(shown, answer, wrong) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus kariet (od zobrazenej karty)';
    wrap.appendChild(cycTitle);
    wrap.appendChild(UI.createCycleView({
      startCard: shown,
      targetCard: answer,
      wrongCard: wrong,
      markStart: true
    }));

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> správna nasledujúca karta</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> východisková karta</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  window.Views = window.Views || {};

  window.Views.nextCard = {
    title: 'Nasledujúca karta',
    render: function (container) {
      container.innerHTML = '';

      var shown = randomCard();
      var answer = S.nextCard(shown);
      var handleSubmit = null;
      var shell = UI.createQuizShell({
        title: 'Nasledujúca karta',
        subtitle: 'Zadaj kartu, ktorá nasleduje (+3 hodnota, ďalšia farba CHaSeD).',
        hintText: 'Hodnota: A, 2–10, J, Q, K · Farby: S=srdcia, P=piky, Kr=križe, Ka=káry. Napr. 9P alebo 10Ka.',
        onSubmit: function () { handleSubmit(); }
      });

      container.appendChild(shell.card);
      shell.display.appendChild(createQuestionNode(shown));

      handleSubmit = function () {
        var parsed = S.parseCard(shell.input.value);
        if (parsed === null) {
          shell.showError();
          return;
        }

        if (parsed.rank === answer.rank && parsed.suit === answer.suit) {
          shell.resetInput();
          shell.result.className = 'answer-result correct';
          shell.result.textContent = 'Správne! ' + S.formatCard(shown) + ' → ' + S.formatCard(answer);
          shell.aux.innerHTML = '';
          shown = randomCard();
          answer = S.nextCard(shown);
          shell.display.replaceChildren(createQuestionNode(shown));
        } else {
          shell.result.className = 'answer-result wrong';
          shell.result.textContent = 'Chyba: ' + S.formatCard(shown) + ' → ' + S.formatCard(answer) + ', nie ' + S.formatCard(parsed) + '.';
          shell.aux.innerHTML = '';
          shell.aux.appendChild(createErrorNode(shown, answer, parsed));
        }
        shell.focusInput();
      };

      shell.submit.addEventListener('click', handleSubmit);
      shell.focusInput();
    }
  };
})();
