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

  function buildQuestion(mode) {
    var peek = randomCard();
    var n = randomInt(2, 52);
    var fromTop = mode === 'top';
    var answer = fromTop ? S.cardAtOffset(peek, n - 1) : S.cardAtOffset(peek, -(n - 1));
    return { peek: peek, n: n, answer: answer, fromTop: fromTop };
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>' + (q.fromTop ? 'Vrchná karta (1. zhora):' : 'Spodná karta (1. zdola):') + '</span>';
    node.appendChild(UI.cardGlyph(q.peek, 'large'));
    node.innerHTML += '<span>' + (q.fromTop ? '→ ktorá karta je ' + q.n + '. od vrchu?' : '→ ktorá karta je ' + q.n + '. od spodu?') + '</span>';
    return node;
  }

  function createErrorNode(q, wrong) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus kariet (od peek karty)';
    wrap.appendChild(cycTitle);
    wrap.appendChild(UI.createCycleView({
      startCard: q.peek,
      targetCard: q.answer,
      wrongCard: wrong,
      markStart: true
    }));

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> hľadaná karta (' + q.n + '. ' + (q.fromTop ? 'zhora' : 'zdola') + ')</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> peek karta (1.)</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function createView(mode, title) {
    return {
      title: title,
      render: function (container) {
        container.innerHTML = '';

        var q = buildQuestion(mode);
        var handleSubmit = null;
        var shell = UI.createQuizShell({
          title: title,
          subtitle: 'Peek karta je zvýraznená. Urči kartu na danej pozícii.',
          hintText: 'Hodnota: A, 2–10, J, Q, K · Farby: S=srdcia, P=piky, Kr=križe, Ka=káry. Napr. 9P alebo 10Ka.',
          onSubmit: function () { handleSubmit(); }
        });

        container.appendChild(shell.card);
        shell.display.appendChild(createQuestionNode(q));

        handleSubmit = function () {
          var parsed = S.parseCard(shell.input.value);
          if (parsed === null) {
            shell.showError();
            return;
          }

          if (parsed.rank === q.answer.rank && parsed.suit === q.answer.suit) {
            shell.resetInput();
            shell.result.className = 'answer-result correct';
            shell.result.textContent = 'Správne! ' + q.n + '. ' + (q.fromTop ? 'zhora' : 'zdola') + ' je ' + S.formatCard(q.answer) + '.';
            shell.aux.innerHTML = '';
            q = buildQuestion(mode);
            shell.display.replaceChildren(createQuestionNode(q));
          } else {
            shell.result.className = 'answer-result wrong';
            shell.result.textContent = 'Chyba: ' + q.n + '. ' + (q.fromTop ? 'zhora' : 'zdola') + ' je ' + S.formatCard(q.answer) + ', nie ' + S.formatCard(parsed) + '.';
            shell.aux.innerHTML = '';
            shell.aux.appendChild(createErrorNode(q, parsed));
          }
          shell.focusInput();
        };

        shell.submit.addEventListener('click', handleSubmit);
      }
    };
  }

  window.Views = window.Views || {};

  window.Views.positionTop = createView('top', 'Lokalizácia zhora');
  window.Views.positionBottom = createView('bottom', 'Lokalizácia zdola');
})();
