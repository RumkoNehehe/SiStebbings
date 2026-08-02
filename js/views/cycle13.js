(function () {
  'use strict';

  var S = window.Stack;
  var UI = window.UI;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function buildQuestion() {
    var idx = randomInt(0, 12);
    return {
      shown: S.VALUE_CYCLE[idx],
      answer: S.VALUE_CYCLE[(idx + 1) % 13]
    };
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>Zobrazuje sa:</span>';
    node.appendChild(UI.cardGlyph({ rank: q.shown, suit: 0 }, 'large'));
    node.innerHTML += '<span>→ nasledujúca hodnota?</span>';
    return node;
  }

  function createErrorNode(q, wrong) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus 13 hodnôt';
    wrap.appendChild(cycTitle);

    var chipRow = document.createElement('div');
    chipRow.className = 'cycle-grid';
    chipRow.style.gridTemplateColumns = 'repeat(13, 1fr)';
    S.VALUE_CYCLE.forEach(function (val) {
      var chip = document.createElement('div');
      chip.className = 'cycle-cell';
      if (val === q.answer) chip.classList.add('highlight');
      if (val === wrong) chip.classList.add('wrong');
      chip.textContent = S.formatRank(val);
      chipRow.appendChild(chip);
    });
    wrap.appendChild(chipRow);

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> správna nasledujúca hodnota</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  window.Views = window.Views || {};

  window.Views.cycle13 = {
    title: 'Tréning 13ky cyklu',
    render: function (container) {
      container.innerHTML = '';

      var q = buildQuestion();
      var handleSubmit = null;
      var shell = UI.createQuizShell({
        title: 'Tréning 13ky cyklu',
        subtitle: 'Zadaj nasledujúcu hodnotu v cykle A → 4 → 7 → 10 → K → 3 → 6 → 9 → Q → 2 → 5 → 8 → J → A',
        hintText: 'Zadaj hodnotu: A, 2–10, J, Q alebo K',
        placeholder: 'napr. 10 alebo K',
        onSubmit: function () { handleSubmit(); }
      });

      container.appendChild(shell.card);
      shell.display.appendChild(createQuestionNode(q));

      handleSubmit = function () {
        var rank = S.parseRank(shell.input.value);
        if (rank === null) {
          shell.showError();
          return;
        }

        if (rank === q.answer) {
          shell.resetInput();
          shell.result.className = 'answer-result correct';
          shell.result.textContent = 'Správne! ' + S.formatRank(q.shown) + ' → ' + S.formatRank(q.answer);
          shell.aux.innerHTML = '';
          q = buildQuestion();
          shell.display.replaceChildren(createQuestionNode(q));
        } else {
          shell.result.className = 'answer-result wrong';
          shell.result.textContent = 'Chyba: za ' + S.formatRank(q.shown) + ' nasleduje ' + S.formatRank(q.answer) + ', nie ' + S.formatRank(rank) + '.';
          shell.aux.innerHTML = '';
          shell.aux.appendChild(createErrorNode(q, rank));
        }
        shell.focusInput();
      }

      shell.submit.addEventListener('click', handleSubmit);
    }
  };
})();
