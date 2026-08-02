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
    var target;
    var answer;
    do {
      target = randomCard();
      answer = mode === 'top' ? S.offsetBetween(peek, target) : S.offsetBetween(target, peek);
    } while (answer < 1);
    return { peek: peek, target: target, answer: answer, fromTop: mode === 'top' };
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>' + (q.fromTop ? 'Prvá karta (zhora):' : 'Posledná karta (zdola):') + '</span>';
    node.appendChild(UI.cardGlyph(q.peek, 'large'));
    node.innerHTML += '<span>→ koľko kariet dať prec' + (q.fromTop ? '' : ' zospodu') + ', aby bola</span>';
    node.appendChild(UI.cardGlyph(q.target, 'large'));
    node.innerHTML += '<span>' + (q.fromTop ? 'prvá?' : 'posledná?') + '</span>';
    return node;
  }

  function createErrorNode(q, wrongCount) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus kariet (od ' + (q.fromTop ? 'prvej karty' : 'poslednej karty') + ')';
    wrap.appendChild(cycTitle);

    var wrongCard = null;
    if (typeof wrongCount === 'number') {
      wrongCard = q.fromTop
        ? S.cardAtOffset(q.peek, wrongCount)
        : S.cardAtOffset(q.peek, -wrongCount);
    }

    wrap.appendChild(UI.createCycleView({
      startCard: q.peek,
      targetCard: q.target,
      wrongCard: wrongCard,
      markStart: true,
      direction: q.fromTop ? 'forward' : 'backward',
      offsetNumbering: true
    }));

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> hľadaná karta</span>' +
      (wrongCard ? '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> karta po odobratí ' + wrongCount + ' kariet</span>' : '') +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> ' + (q.fromTop ? 'prvá karta' : 'posledná karta') + '</span>' +
      '<span class="legend-item">Čísla v bunkách = koľko kariet treba dať prec</span>';
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
          subtitle: 'Peek karta je zvýraznená. Urči, koľko kariet treba dať prec (1–51).',
          hintText: 'Zadaj počet kariet 1–51 (0 = cieľová je už prvá/posledná).',
          placeholder: 'napr. 13',
          numeric: true,
          onSubmit: function () { handleSubmit(); }
        });

        container.appendChild(shell.card);
        shell.display.appendChild(createQuestionNode(q));

        handleSubmit = function () {
          var raw = shell.input.value.trim();
          if (!/^\d+$/.test(raw)) {
            shell.showError();
            return;
          }
          var count = parseInt(raw, 10);
          if (count < 1 || count > 51) {
            shell.showError();
            return;
          }

          if (count === q.answer) {
            shell.resetInput();
            shell.result.className = 'answer-result correct';
            shell.result.textContent = 'Správne! Treba dať prec ' + q.answer + ' kariet' + (q.fromTop ? '' : ' zospodu') + '.';
            shell.aux.innerHTML = '';
            q = buildQuestion(mode);
            shell.display.replaceChildren(createQuestionNode(q));
          } else {
            shell.result.className = 'answer-result wrong';
            shell.result.textContent = 'Chyba: treba dať prec ' + q.answer + ' kariet' + (q.fromTop ? '' : ' zospodu') + ', nie ' + count + '.';
            shell.aux.innerHTML = '';
            shell.aux.appendChild(createErrorNode(q, count));
          }
          shell.focusInput();
        };

        shell.submit.addEventListener('click', handleSubmit);
      }
    };
  }

  window.Views = window.Views || {};

  window.Views.positionQueryTop = createView('top', 'Koľko kariet dať prec — zhora');
  window.Views.positionQueryBottom = createView('bottom', 'Koľko kariet dať prec — zdola');
})();
