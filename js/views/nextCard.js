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
      var shown = randomCard();
      return {
        level: 'card',
        direction: settings.direction,
        shown: shown,
        answer: settings.direction === 'next' ? S.nextCard(shown) : S.prevCard(shown)
      };
    }
    var shownIdx = randomInt(0, 12);
    return {
      level: 'value',
      direction: settings.direction,
      shownIdx: shownIdx,
      answer: settings.direction === 'next' ? S.nextRank(S.VALUE_CYCLE[shownIdx]) : S.prevRank(S.VALUE_CYCLE[shownIdx])
    };
  }

  function createQuestionNode(q) {
    var node = document.createElement('div');
    node.className = 'question-display';
    node.innerHTML = '<span>Zobrazuje sa:</span>';
    if (q.level === 'card') {
      node.appendChild(UI.cardGlyph(q.shown, 'large'));
    } else {
      node.appendChild(UI.cardGlyph({ rank: S.VALUE_CYCLE[q.shownIdx], suit: 0 }, 'large'));
    }
    var what = q.level === 'card' ? 'karta' : 'hodnota';
    node.innerHTML += '<span>→ ktorá ' + what + ' ' + (q.direction === 'next' ? 'nasleduje' : 'predchádza') + '?</span>';
    return node;
  }

  function createCardErrorNode(q, wrong) {
    var wrap = document.createElement('div');
    wrap.className = 'card';

    var cycTitle = document.createElement('div');
    cycTitle.className = 'card-title';
    cycTitle.textContent = 'Cyklus kariet (od zobrazenej karty)';
    wrap.appendChild(cycTitle);
    wrap.appendChild(UI.createCycleView({
      startCard: q.shown,
      targetCard: q.answer,
      wrongCard: wrong,
      markStart: true
    }));

    var legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML =
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> ' + (q.direction === 'next' ? 'správna nasledujúca karta' : 'správna predchádzajúca karta') + '</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="border-style:dashed;border-color:var(--color-primary);background:transparent"></span> východisková karta</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function createValueErrorNode(q, wrong) {
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
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-highlight)"></span> ' + (q.direction === 'next' ? 'správna nasledujúca hodnota' : 'správna predchádzajúca hodnota') + '</span>' +
      '<span class="legend-item"><span class="legend-swatch" style="background:var(--color-wrong)"></span> tvoja odpoveď</span>';
    wrap.appendChild(legend);

    return wrap;
  }

  function applyQuestion(shell, q) {
    shell.input.inputMode = 'text';
    if (q.level === 'card') {
      shell.input.placeholder = 'napr. 9P alebo 10Ka';
      shell.hint.textContent = 'Hodnota: A, 2–10, J, Q, K · Farby: S=srdcia, P=piky, Kr=križe, Ka=káry. Napr. 9P alebo 10Ka.';
    } else {
      shell.input.placeholder = 'napr. 10 alebo K';
      shell.hint.textContent = 'Zadaj hodnotu: A, 2–10, J, Q alebo K.';
    }
    shell.display.replaceChildren(createQuestionNode(q));
  }

  window.Views = window.Views || {};

  window.Views.nextCard = {
    title: 'Nasledujúca karta',
    render: function (container) {
      container.innerHTML = '';

      var settings = { direction: 'next', level: 'card' };
      var q = buildQuestion(settings);
      var handleSubmit = null;
      var shell = UI.createQuizShell({
        title: 'Nasledujúca karta',
        subtitle: 'Urči kartu alebo hodnotu, ktorá nasleduje (+3 hodnota, ďalšia farba CHaSeD) alebo predchádza.',
        onSubmit: function () { handleSubmit(); }
      });

      function clearState() {
        shell.resetInput();
        shell.result.className = 'answer-result hidden';
        shell.result.textContent = '';
        shell.aux.innerHTML = '';
      }

      var dirToggle = UI.createToggleGroup({
        name: 'Smer',
        initial: 'next',
        options: [
          { value: 'next', label: 'Nasledujúca' },
          { value: 'prev', label: 'Predchádzajúca' }
        ],
        onChange: function (value) {
          settings.direction = value;
          q = buildQuestion(settings);
          clearState();
          applyQuestion(shell, q);
        }
      });

      var levelToggle = UI.createToggleGroup({
        name: 'Obtiažnosť',
        initial: 'card',
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
      settingsRow.appendChild(dirToggle.el);
      settingsRow.appendChild(levelToggle.el);
      shell.card.insertBefore(settingsRow, shell.display);

      container.appendChild(shell.card);
      applyQuestion(shell, q);

      handleSubmit = function () {
        var parsed;
        if (q.level === 'card') {
          parsed = S.parseCard(shell.input.value);
          if (parsed === null) {
            shell.showError();
            return;
          }
        } else {
          var rank = S.parseRank(shell.input.value);
          if (rank === null) {
            shell.showError();
            return;
          }
          parsed = { rank: rank, suit: 0 };
        }

        var correct = q.level === 'value'
          ? parsed.rank === q.answer
          : parsed.rank === q.answer.rank && parsed.suit === q.answer.suit;

        if (correct) {
          shell.resetInput();
          shell.result.className = 'answer-result correct';
          if (q.level === 'card') {
            shell.result.textContent = 'Správne! ' + S.formatCard(q.shown) + ' → ' + S.formatCard(q.answer);
          } else {
            shell.result.textContent = 'Správne! ' + S.formatRank(S.VALUE_CYCLE[q.shownIdx]) + ' → ' + S.formatRank(q.answer);
          }
          shell.aux.innerHTML = '';
          q = buildQuestion(settings);
          applyQuestion(shell, q);
        } else {
          shell.result.className = 'answer-result wrong';
          if (q.level === 'card') {
            shell.result.textContent = 'Chyba: ' + S.formatCard(q.shown) + ' → ' + S.formatCard(q.answer) + ', nie ' + S.formatCard(parsed) + '.';
            shell.aux.innerHTML = '';
            shell.aux.appendChild(createCardErrorNode(q, parsed));
          } else {
            shell.result.textContent = 'Chyba: ' + S.formatRank(S.VALUE_CYCLE[q.shownIdx]) + ' → ' + S.formatRank(q.answer) + ', nie ' + S.formatRank(parsed.rank) + '.';
            shell.aux.innerHTML = '';
            shell.aux.appendChild(createValueErrorNode(q, parsed.rank));
          }
        }
        shell.focusInput();
      };

      shell.submit.addEventListener('click', handleSubmit);
      shell.focusInput();
    }
  };
})();
