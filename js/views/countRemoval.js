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
      var n = randomInt(1, 51);
      return {
        level: 'card',
        side: settings.side,
        peek: peek,
        target: settings.side === 'top' ? S.cardAtOffset(peek, n) : S.cardAtOffset(peek, -n),
        answer: n,
        max: 51
      };
    }
    var startIdx = randomInt(0, 12);
    var n = randomInt(0, 12);
    var targetIdx = settings.side === 'top'
      ? (startIdx + n) % 13
      : ((startIdx - n) % 13 + 13) % 13;
    return {
      level: 'value',
      side: settings.side,
      startIdx: startIdx,
      targetIdx: targetIdx,
      answer: n,
      max: 12
    };
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>' + (q.side === 'top' ? 'Zhora:' : 'Zospodu:') + '</span>';
    if (q.level === 'card') {
      node.appendChild(UI.cardGlyph(q.peek, 'large'));
      node.innerHTML += '<span>→ ? →</span>';
      node.appendChild(UI.cardGlyph(q.target, 'large'));
    } else {
      node.appendChild(UI.cardGlyph({ rank: S.VALUE_CYCLE[q.startIdx], suit: 0 }, 'large'));
      node.innerHTML += '<span>→ ? →</span>';
      node.appendChild(UI.cardGlyph({ rank: S.VALUE_CYCLE[q.targetIdx], suit: 0 }, 'large'));
    }
    return node;
  }

  function createCardErrorNode(q, wrongCount) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus kariet (od ' + (q.side === 'top' ? 'prvej karty' : 'poslednej karty') + ')';
    wrap.appendChild(cycTitle);

    var wrongCard = null;
    if (typeof wrongCount === 'number') {
      wrongCard = q.side === 'top' ? S.cardAtOffset(q.peek, wrongCount) : S.cardAtOffset(q.peek, -wrongCount);
    }

    wrap.appendChild(UI.createCycleView({
      startCard: q.peek,
      targetCard: q.target,
      wrongCard: wrongCard,
      markStart: true,
      direction: q.side === 'top' ? 'forward' : 'backward',
      offsetNumbering: true
    }));

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> hľadaná karta</span>' +
      (wrongCard ? '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> karta po odobratí ' + wrongCount + ' kariet</span>' : '') +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> ' + (q.side === 'top' ? 'vrchná karta' : 'spodná karta') + '</span>' +
      '<span class="legend-item">Čísla v bunkách = koľko kariet treba dať prec</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function createValueErrorNode(q, wrongCount) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus 13 hodnôt (od ' + (q.side === 'top' ? 'vrchnej' : 'spodnej') + ')';
    wrap.appendChild(cycTitle);

    var chipRow = document.createElement('div');
    chipRow.className = 'cycle-grid pos-cycle';
    for (var i = 0; i < 13; i++) {
      var idx = ((q.startIdx + (q.side === 'top' ? i : -i)) % 13 + 13) % 13;
      var cell = document.createElement('div');
      cell.className = 'cycle-cell';
      if (i === 0) cell.classList.add('ref');
      if (i === q.answer) cell.classList.add('highlight');
      if (typeof wrongCount === 'number' && i === wrongCount) cell.classList.add('wrong');

      var rankEl = document.createElement('span');
      rankEl.className = 'c-rank';
      rankEl.textContent = S.formatRank(S.VALUE_CYCLE[idx]);

      var posEl = document.createElement('span');
      posEl.className = 'c-pos';
      posEl.textContent = String(i);

      cell.appendChild(rankEl);
      cell.appendChild(posEl);
      chipRow.appendChild(cell);
    }
    wrap.appendChild(chipRow);

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> správny počet kariet (' + q.answer + ')</span>' +
      (typeof wrongCount === 'number' ? '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď (' + wrongCount + ')</span>' : '') +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> východisková hodnota (0 = vrchná/posledná)</span>' +
      '<span class="legend-item">Čísla v bunkách = koľko kariet treba dať prec</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function applyQuestion(shell, q) {
    shell.input.inputMode = 'numeric';
    shell.input.placeholder = q.level === 'card' ? 'napr. 13' : 'napr. 5';
    shell.hint.textContent = q.level === 'card'
      ? 'Zadaj počet kariet 0–51 (0 = cieľová karta je už vrchná/posledná).'
      : 'Zadaj počet kariet 0–12 (0 = cieľová hodnota je už vrchná/posledná).';
    shell.display.replaceChildren(createQuestionNode(q));
  }

  window.Views = window.Views || {};

  window.Views.countRemoval = {
    title: 'Koľko kariet dať prec',
    render: function (container) {
      container.innerHTML = '';

      var settings = { side: 'top', level: 'value' };
      var q = buildQuestion(settings);
      var handleSubmit = null;
      var shell = UI.createQuizShell({
        title: 'Koľko kariet dať prec',
        subtitle: 'Urči, koľko kariet treba dať prec, aby bola cieľová karta/hodnota vrchná (alebo posledná).',
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
        var raw = shell.input.value.trim();
        if (!/^\d+$/.test(raw)) {
          shell.showError();
          return;
        }
        var count = parseInt(raw, 10);
        if (count < 0 || count > q.max) {
          shell.showError();
          return;
        }

        if (count === q.answer) {
          shell.resetInput();
          shell.result.className = 'answer-result correct';
          shell.result.textContent = 'Správne! Treba dať prec ' + q.answer + ' kariet' + (q.side === 'top' ? '' : ' zospodu') + '.';
          shell.aux.innerHTML = '';
          q = buildQuestion(settings);
          applyQuestion(shell, q);
        } else {
          shell.result.className = 'answer-result wrong';
          shell.result.textContent = 'Chyba: treba dať prec ' + q.answer + ' kariet' + (q.side === 'top' ? '' : ' zospodu') + ', nie ' + count + '.';
          shell.aux.innerHTML = '';
          shell.aux.appendChild(q.level === 'card' ? createCardErrorNode(q, count) : createValueErrorNode(q, count));
        }
        shell.focusInput();
      };

      shell.submit.addEventListener('click', handleSubmit);
      shell.focusInput();
    }
  };
})();
