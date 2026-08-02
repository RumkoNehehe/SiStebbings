(function () {
  'use strict';

  var S = window.Stack;
  var UI = window.UI;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function buildQuestion() {
    var start = randomInt(0, 12);
    var type = Math.random() < 0.5 ? 'toValue' : 'toPosition';
    if (type === 'toValue') {
      var pos = randomInt(2, 13);
      return {
        type: 'toValue',
        start: start,
        pos: pos,
        answer: S.VALUE_CYCLE[(start + pos - 1) % 13]
      };
    }
    var target;
    do {
      target = randomInt(0, 12);
    } while (target === start);
    var pos = ((target - start) % 13 + 13) % 13 + 1;
    return {
      type: 'toPosition',
      start: start,
      target: target,
      answer: pos
    };
  }

  function cycleCardGlyph(idx) {
    return UI.cardGlyph({ rank: S.VALUE_CYCLE[idx], suit: 0 }, 'large');
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>Prvá (1.):</span>';
    node.appendChild(cycleCardGlyph(q.start));
    if (q.type === 'toValue') {
      node.innerHTML += '<span>→ ktorá hodnota je ' + q.pos + '. v cykle?</span>';
    } else {
      node.innerHTML += '<span>→ na ktorej pozícii je</span>';
      node.appendChild(cycleCardGlyph(q.target));
      node.innerHTML += '<span>?</span>';
    }
    return node;
  }

  function createErrorNode(q, wrong) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus 13 hodnôt (pozície)';
    wrap.appendChild(cycTitle);

    var chipRow = document.createElement('div');
    chipRow.className = 'cycle-grid pos-cycle';
    S.VALUE_CYCLE.forEach(function (val, i) {
      var cell = document.createElement('div');
      cell.className = 'cycle-cell';
      if (i === q.start) cell.classList.add('ref');
      if (q.type === 'toValue' && val === q.answer) cell.classList.add('highlight');
      if (q.type === 'toValue' && typeof wrong === 'number' && val === wrong) cell.classList.add('wrong');
      if (q.type === 'toPosition' && i === q.target) cell.classList.add('highlight');
      if (q.type === 'toPosition' && typeof wrong === 'number' && i === wrong - 1) cell.classList.add('wrong');

      var rankEl = document.createElement('span');
      rankEl.className = 'c-rank';
      rankEl.textContent = S.formatRank(val);

      var posEl = document.createElement('span');
      posEl.className = 'c-pos';
      posEl.textContent = String(i + 1);

      cell.appendChild(rankEl);
      cell.appendChild(posEl);
      chipRow.appendChild(cell);
    });
    wrap.appendChild(chipRow);

    var legend = document.createElement('div');
    legend.className = 'legend';
    var items;
    if (q.type === 'toValue') {
      items =
        '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> správna hodnota (poz. ' + q.pos + ')</span>' +
        '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>' +
        '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> prvá (poz. 1)</span>';
    } else {
      items =
        '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> hľadaná pozícia (' + S.formatRank(S.VALUE_CYCLE[q.target]) + ' = ' + q.answer + '.)</span>' +
        (typeof wrong === 'number' ? '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď (poz. ' + wrong + ')</span>' : '') +
        '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> prvá (poz. 1)</span>';
    }
    legend.innerHTML = items;
    wrap.appendChild(legend);

    return wrap;
  }

  function applyQuestion(shell, q) {
    shell.input.inputMode = q.type === 'toPosition' ? 'numeric' : 'text';
    shell.input.placeholder = q.type === 'toPosition' ? 'napr. 5' : 'napr. K';
    shell.hint.textContent = q.type === 'toPosition' ? 'Zadaj pozíciu 1–13.' : 'Zadaj hodnotu: A, 2–10, J, Q alebo K.';
    shell.display.replaceChildren(createQuestionNode(q));
  }

  window.Views = window.Views || {};

  window.Views.cyclePositions = {
    title: 'Pozície v 13-ke',
    render: function (container) {
      container.innerHTML = '';

      var q = buildQuestion();
      var handleSubmit = null;
      var shell = UI.createQuizShell({
        title: 'Pozície v 13-ke',
        subtitle: 'Urči pozície v 13-hodnotovom cykle: A → 4 → 7 → 10 → K → 3 → 6 → 9 → Q → 2 → 5 → 8 → J. Prvá (1.) je východisková hodnota.',
        onSubmit: function () { handleSubmit(); }
      });

      container.appendChild(shell.card);
      applyQuestion(shell, q);

      handleSubmit = function () {
        var correct = false;
        var wrong = null;

        if (q.type === 'toValue') {
          var rank = S.parseRank(shell.input.value);
          if (rank === null) {
            shell.showError();
            return;
          }
          wrong = rank;
          correct = rank === q.answer;
        } else {
          var raw = shell.input.value.trim();
          if (!/^\d+$/.test(raw)) {
            shell.showError();
            return;
          }
          var pos = parseInt(raw, 10);
          if (pos < 1 || pos > 13) {
            shell.showError();
            return;
          }
          wrong = pos;
          correct = pos === q.answer;
        }

        if (correct) {
          shell.resetInput();
          shell.result.className = 'answer-result correct';
          if (q.type === 'toValue') {
            shell.result.textContent = 'Správne! ' + S.formatRank(S.VALUE_CYCLE[q.start]) + ' (1.) → ' + q.pos + '. je ' + S.formatRank(q.answer) + '.';
          } else {
            shell.result.textContent = 'Správne! ' + S.formatRank(S.VALUE_CYCLE[q.target]) + ' je ' + q.answer + '. v cykle po ' + S.formatRank(S.VALUE_CYCLE[q.start]) + '.';
          }
          shell.aux.innerHTML = '';
          q = buildQuestion();
          applyQuestion(shell, q);
        } else {
          shell.result.className = 'answer-result wrong';
          if (q.type === 'toValue') {
            shell.result.textContent = 'Chyba: ' + S.formatRank(S.VALUE_CYCLE[q.start]) + ' (1.) → ' + q.pos + '. je ' + S.formatRank(q.answer) + ', nie ' + S.formatRank(wrong) + '.';
          } else {
            shell.result.textContent = 'Chyba: ' + S.formatRank(S.VALUE_CYCLE[q.target]) + ' je ' + q.answer + '. v cykle po ' + S.formatRank(S.VALUE_CYCLE[q.start]) + ', nie ' + wrong + '.';
          }
          shell.aux.innerHTML = '';
          shell.aux.appendChild(createErrorNode(q, wrong));
        }
        shell.focusInput();
      };

      shell.submit.addEventListener('click', handleSubmit);
      shell.focusInput();
    }
  };
})();
