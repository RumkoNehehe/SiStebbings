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

  function buildQuestion(settings) {
    if (settings.level === 'card') {
      var peek = randomCard();
      var n = randomInt(2, 52);
      return {
        level: 'card',
        side: settings.side,
        peek: peek,
        n: n,
        answer: settings.side === 'top' ? S.cardAtOffset(peek, n - 1) : S.cardAtOffset(peek, -(n - 1))
      };
    }
    var startIdx = randomInt(0, 12);
    var pos = randomInt(2, 13);
    var answerIdx = settings.side === 'top'
      ? (startIdx + pos - 1) % 13
      : ((startIdx - (pos - 1)) % 13 + 13) % 13;
    return {
      level: 'value',
      side: settings.side,
      startIdx: startIdx,
      pos: pos,
      answerIdx: answerIdx,
      answer: S.VALUE_CYCLE[answerIdx]
    };
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    if (q.level === 'card') {
      node.innerHTML = '<span>' + (q.side === 'top' ? 'Vrchná karta (1. zhora):' : 'Spodná karta (1. zdola):') + '</span>';
      node.appendChild(UI.cardGlyph(q.peek, 'large'));
      node.innerHTML += '<span>' + (q.side === 'top' ? '→ ktorá karta je ' + q.n + '. od vrchu?' : '→ ktorá karta je ' + q.n + '. od spodu?') + '</span>';
    } else {
      node.innerHTML = '<span>' + (q.side === 'top' ? 'Vrchná hodnota (1. zhora):' : 'Spodná hodnota (1. zdola):') + '</span>';
      node.appendChild(UI.cardGlyph({ rank: S.VALUE_CYCLE[q.startIdx], suit: 0 }, 'large'));
      node.innerHTML += '<span>' + (q.side === 'top' ? '→ ktorá hodnota je ' + q.pos + '. od vrchu?' : '→ ktorá hodnota je ' + q.pos + '. od spodu?') + '</span>';
    }
    return node;
  }

  function createCardErrorNode(q, wrong) {
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
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> hľadaná karta (' + q.n + '. ' + (q.side === 'top' ? 'zhora' : 'zdola') + ')</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> peek karta (1.)</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function createValueErrorNode(q, wrongRank) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus 13 hodnôt (pozície)';
    wrap.appendChild(cycTitle);

    var chipRow = document.createElement('div');
    chipRow.className = 'cycle-grid pos-cycle';
    for (var i = 0; i < 13; i++) {
      var idx = ((q.startIdx + (q.side === 'top' ? i : -i)) % 13 + 13) % 13;
      var cell = document.createElement('div');
      cell.className = 'cycle-cell';
      if (i === 0) cell.classList.add('ref');
      if (i === q.pos - 1) cell.classList.add('highlight');
      if (typeof wrongRank === 'number' && S.VALUE_CYCLE[idx] === wrongRank) cell.classList.add('wrong');

      var rankEl = document.createElement('span');
      rankEl.className = 'c-rank';
      rankEl.textContent = S.formatRank(S.VALUE_CYCLE[idx]);

      var posEl = document.createElement('span');
      posEl.className = 'c-pos';
      posEl.textContent = String(i + 1);

      cell.appendChild(rankEl);
      cell.appendChild(posEl);
      chipRow.appendChild(cell);
    }
    wrap.appendChild(chipRow);

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> hľadaná hodnota (poz. ' + q.pos + ')</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> ' + (q.side === 'top' ? 'vrchná' : 'spodná') + ' (poz. 1)</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function applyQuestion(shell, q) {
    shell.input.inputMode = 'text';
    if (q.level === 'card') {
      shell.input.placeholder = 'napr. 9P alebo 10Ka';
      shell.hint.textContent = 'Hodnota: A, 2–10, J, Q, K · Farby: S=srdcia, P=piky, Kr=križe, Ka=káry. Napr. 9P alebo 10Ka.';
    } else {
      shell.input.placeholder = 'napr. K';
      shell.hint.textContent = 'Zadaj hodnotu: A, 2–10, J, Q alebo K.';
    }
    shell.display.replaceChildren(createQuestionNode(q));
  }

  window.Views = window.Views || {};

  window.Views.positionAt = {
    title: 'Ktorá karta je na pozícii',
    render: function (container) {
      container.innerHTML = '';

      var settings = { side: 'top', level: 'value' };
      var q = buildQuestion(settings);
      var handleSubmit = null;
      var shell = UI.createQuizShell({
        title: 'Ktorá karta je na pozícii',
        subtitle: 'Urči kartu alebo hodnotu na danej pozícii od vrchu alebo od spodu.',
        onSubmit: function () { handleSubmit(); }
      });

      function clearState() {
        shell.resetInput();
        shell.result.className = 'answer-result hidden';
        shell.result.textContent = '';
        shell.aux.innerHTML = '';
      }

      var sideToggle = UI.createToggleGroup({
        name: 'Strana',
        initial: 'top',
        options: [
          { value: 'top', label: 'Zhora' },
          { value: 'bottom', label: 'Zospodu' }
        ],
        onChange: function (value) {
          settings.side = value;
          q = buildQuestion(settings);
          clearState();
          applyQuestion(shell, q);
        }
      });

      var levelToggle = UI.createToggleGroup({
        name: 'Obtiažnosť',
        initial: 'value',
        options: [
          { value: 'value', label: 'Len hodnota' },
          { value: 'card', label: 'Hodnota + farba' }
        ],
        onChange: function (value) {
          settings.level = value;
          q = buildQuestion(settings);
          clearState();
          applyQuestion(shell, q);
        }
      });

      var settingsRow = document.createElement('div');
      settingsRow.className = 'quiz-settings';
      settingsRow.appendChild(sideToggle.el);
      settingsRow.appendChild(levelToggle.el);
      shell.card.insertBefore(settingsRow, shell.display);

      container.appendChild(shell.card);
      applyQuestion(shell, q);

      handleSubmit = function () {
        if (q.level === 'card') {
          var parsed = S.parseCard(shell.input.value);
          if (parsed === null) {
            shell.showError();
            return;
          }
          if (parsed.rank === q.answer.rank && parsed.suit === q.answer.suit) {
            shell.resetInput();
            shell.result.className = 'answer-result correct';
            shell.result.textContent = 'Správne! ' + q.n + '. ' + (q.side === 'top' ? 'zhora' : 'zdola') + ' je ' + S.formatCard(q.answer) + '.';
            shell.aux.innerHTML = '';
            q = buildQuestion(settings);
            applyQuestion(shell, q);
          } else {
            shell.result.className = 'answer-result wrong';
            shell.result.textContent = 'Chyba: ' + q.n + '. ' + (q.side === 'top' ? 'zhora' : 'zdola') + ' je ' + S.formatCard(q.answer) + ', nie ' + S.formatCard(parsed) + '.';
            shell.aux.innerHTML = '';
            shell.aux.appendChild(createCardErrorNode(q, parsed));
          }
        } else {
          var rank = S.parseRank(shell.input.value);
          if (rank === null) {
            shell.showError();
            return;
          }
          if (rank === q.answer) {
            shell.resetInput();
            shell.result.className = 'answer-result correct';
            shell.result.textContent = 'Správne! ' + q.pos + '. ' + (q.side === 'top' ? 'zhora' : 'zdola') + ' je ' + S.formatRank(q.answer) + '.';
            shell.aux.innerHTML = '';
            q = buildQuestion(settings);
            applyQuestion(shell, q);
          } else {
            shell.result.className = 'answer-result wrong';
            shell.result.textContent = 'Chyba: ' + q.pos + '. ' + (q.side === 'top' ? 'zhora' : 'zdola') + ' je ' + S.formatRank(q.answer) + ', nie ' + S.formatRank(rank) + '.';
            shell.aux.innerHTML = '';
            shell.aux.appendChild(createValueErrorNode(q, rank));
          }
        }
        shell.focusInput();
      };

      shell.submit.addEventListener('click', handleSubmit);
      shell.focusInput();
    }
  };
})();
