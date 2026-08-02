(function () {
  'use strict';

  var S = window.Stack;

  function cardGlyph(card, extraClass) {
    var el = document.createElement('span');
    el.className = 'card-glyph' + (S.suitColor(card.suit) === 'red' ? ' red' : ' black') + (extraClass ? ' ' + extraClass : '');
    el.innerHTML = S.numberToRank(card.rank) + '<span class="glyph-small">' + S.suitSymbol(card.suit) + '</span>';
    return el;
  }

  function createCycleView(opts) {
    var startCard = opts.startCard || S.makeCard(1, 0);
    var targetCard = opts.targetCard || null;
    var wrongCard = opts.wrongCard || null;
    var direction = opts.direction || 'forward';
    var offsetNumbering = !!opts.offsetNumbering;

    var stack = [];
    if (direction === 'backward') {
      var c = { rank: startCard.rank, suit: startCard.suit };
      for (var bi = 0; bi < 52; bi++) {
        stack.push(c);
        c = S.prevCard(c);
      }
    } else {
      stack = S.rotateStack(startCard);
    }

    var wrap = document.createElement('div');
    wrap.className = 'cycle-wrap';

    for (var row = 0; row < 4; row++) {
      var grid = document.createElement('div');
      grid.className = 'cycle-grid';
      for (var col = 0; col < 13; col++) {
        var idx = row * 13 + col;
        var card = stack[idx];
        var colorClass = S.suitColor(card.suit) === 'red' ? 'red' : 'black';
        var cell = document.createElement('div');
        cell.className = 'cycle-cell ' + colorClass;
        var isTarget = targetCard && card.rank === targetCard.rank && card.suit === targetCard.suit;
        var isWrong = wrongCard && card.rank === wrongCard.rank && card.suit === wrongCard.suit;
        if (isTarget) cell.classList.add('highlight');
        if (isWrong) cell.classList.add('wrong');
        if (opts.markStart && card.rank === startCard.rank && card.suit === startCard.suit) cell.classList.add('ref');

        var pos = document.createElement('span');
        pos.className = 'c-pos';
        pos.textContent = String(offsetNumbering ? idx : idx + 1);

        var rankEl = document.createElement('span');
        rankEl.className = 'c-rank ' + colorClass;
        rankEl.textContent = S.numberToRank(card.rank);

        var suitEl = document.createElement('span');
        suitEl.className = 'c-suit ' + colorClass;
        suitEl.textContent = S.suitSymbol(card.suit);

        cell.appendChild(pos);
        cell.appendChild(rankEl);
        cell.appendChild(suitEl);
        grid.appendChild(cell);
      }
      wrap.appendChild(grid);
    }
    return wrap;
  }

  function buildCardInput() {
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'quiz-input';
    input.autocomplete = 'off';
    input.autocorrect = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.readOnly = true;
    input.placeholder = 'napr. 9P alebo 10Ka';

    function unlock() {
      if (input.readOnly) input.readOnly = false;
    }
    input.addEventListener('pointerdown', unlock);
    input.addEventListener('touchstart', unlock);
    input.addEventListener('focus', unlock);

    return input;
  }

  function createQuizShell(opts) {
    opts = opts || {};
    var card = document.createElement('div');
    card.className = 'card';

    if (opts.title) {
      var title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = opts.title;
      card.appendChild(title);
    }
    if (opts.subtitle) {
      var subtitle = document.createElement('div');
      subtitle.className = 'card-subtitle';
      subtitle.textContent = opts.subtitle;
      card.appendChild(subtitle);
    }

    var display = document.createElement('div');
    display.className = 'question-display';
    card.appendChild(display);

    var inputRow = document.createElement('div');
    inputRow.className = 'quiz-input-row';
    var input = buildCardInput();
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.numeric) {
      input.inputMode = 'numeric';
      input.pattern = '[0-9]*';
    }
    inputRow.appendChild(input);
    card.appendChild(inputRow);

    var hint = document.createElement('div');
    hint.className = 'input-hint hidden';
    hint.textContent = opts.hintText || '';
    card.appendChild(hint);

    var result = document.createElement('div');
    result.className = 'answer-result hidden';
    card.appendChild(result);

    var btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    var submit = document.createElement('button');
    submit.className = 'btn';
    submit.textContent = 'Odpovedať';
    btnRow.appendChild(submit);
    card.appendChild(btnRow);

    var aux = document.createElement('div');
    card.appendChild(aux);

    function showError() {
      hint.classList.remove('hidden');
      input.classList.add('invalid');
    }

    function clearError() {
      hint.classList.add('hidden');
      input.classList.remove('invalid');
    }

    function resetInput() {
      input.value = '';
      clearError();
    }

    function focusInput() {
      input.readOnly = false;
      if (input.focus) input.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }

    input.addEventListener('input', clearError);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (opts.onSubmit) opts.onSubmit();
      }
    });

    return {
      card: card,
      display: display,
      input: input,
      submit: submit,
      hint: hint,
      result: result,
      aux: aux,
      showError: showError,
      clearError: clearError,
      resetInput: resetInput,
      focusInput: focusInput
    };
  }

  window.UI = {
    cardGlyph: cardGlyph,
    createCycleView: createCycleView,
    buildCardInput: buildCardInput,
    createQuizShell: createQuizShell
  };
})();
