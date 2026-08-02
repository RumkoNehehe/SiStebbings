(function () {
  'use strict';

  var SUITS = [
    { id: 0, key: 'Kr', name: 'križe', symbol: '♣', color: 'black' },
    { id: 1, key: 'S', name: 'srdcia', symbol: '♥', color: 'red' },
    { id: 2, key: 'P', name: 'piky', symbol: '♠', color: 'black' },
    { id: 3, key: 'Ka', name: 'káry', symbol: '♦', color: 'red' }
  ];

  var RANK_CHARS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  var RANK_VALUE = { A: 1, J: 11, Q: 12, K: 13, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10 };

  var TWO_LETTER_SUITS = { kr: 0, ka: 3 };
  var ONE_LETTER_SUITS = { s: 1, p: 2 };

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function rankToNumber(rankChar) {
    return RANK_VALUE[rankChar.toUpperCase()] || null;
  }

  function numberToRank(num) {
    return RANK_CHARS[mod(num - 1, 13)];
  }

  function suitKeyToId(key) {
    key = key.toLowerCase();
    if (TWO_LETTER_SUITS.hasOwnProperty(key)) return TWO_LETTER_SUITS[key];
    if (ONE_LETTER_SUITS.hasOwnProperty(key)) return ONE_LETTER_SUITS[key];
    return null;
  }

  function suitName(suitId) {
    return SUITS[mod(suitId, 4)].name;
  }

  function suitSymbol(suitId) {
    return SUITS[mod(suitId, 4)].symbol;
  }

  function suitColor(suitId) {
    return SUITS[mod(suitId, 4)].color;
  }

  function makeCard(rankNum, suitId) {
    return { rank: mod(rankNum - 1, 13) + 1, suit: mod(suitId, 4) };
  }

  function nextCard(card) {
    return {
      rank: mod(card.rank + 3 - 1, 13) + 1,
      suit: mod(card.suit + 1, 4)
    };
  }

  function prevCard(card) {
    return {
      rank: mod(card.rank - 3 - 1, 13) + 1,
      suit: mod(card.suit - 1, 4)
    };
  }

  function cardAtOffset(ref, n) {
    return {
      rank: mod(ref.rank + 3 * n - 1, 13) + 1,
      suit: mod(ref.suit + n, 4)
    };
  }

  function nextRank(rankNum) {
    return mod(rankNum + 3 - 1, 13) + 1;
  }

  function prevRank(rankNum) {
    return mod(rankNum - 3 - 1, 13) + 1;
  }

  function buildStack() {
    var stack = [];
    var card = makeCard(1, 0);
    for (var i = 0; i < 52; i++) {
      stack.push(card);
      card = nextCard(card);
    }
    return stack;
  }

  var FULL_STACK = buildStack();

  function offsetBetween(from, to) {
    for (var i = 0; i < 52; i++) {
      var c = cardAtOffset(from, i);
      if (c.rank === to.rank && c.suit === to.suit) return i;
    }
    return -1;
  }

  function rotateStack(startCard) {
    var idx = -1;
    for (var i = 0; i < FULL_STACK.length; i++) {
      if (FULL_STACK[i].rank === startCard.rank && FULL_STACK[i].suit === startCard.suit) {
        idx = i;
        break;
      }
    }
    if (idx < 0) return FULL_STACK.slice();
    return FULL_STACK.slice(idx).concat(FULL_STACK.slice(0, idx));
  }

  function parseCard(input) {
    if (typeof input !== 'string') return null;
    var s = input.trim();
    if (!s) return null;

    var lower = s.toLowerCase();
    var suitId = null;
    var rankPart = s;

    if (lower.length >= 2) {
      var lastTwo = lower.slice(-2);
      if (TWO_LETTER_SUITS.hasOwnProperty(lastTwo)) {
        suitId = TWO_LETTER_SUITS[lastTwo];
        rankPart = s.slice(0, -2);
      }
    }
    if (suitId === null && lower.length >= 1) {
      var lastOne = lower.slice(-1);
      if (ONE_LETTER_SUITS.hasOwnProperty(lastOne)) {
        suitId = ONE_LETTER_SUITS[lastOne];
        rankPart = s.slice(0, -1);
      }
    }

    if (suitId === null) return null;
    var rank = rankToNumber(rankPart);
    if (rank === null) return null;

    return { rank: rank, suit: suitId };
  }

  function formatCard(card) {
    return numberToRank(card.rank) + SUITS[card.suit].key;
  }

  function formatRank(rankNum) {
    return numberToRank(rankNum);
  }

  function parseRank(input) {
    return rankToNumber(String(input).trim());
  }

  var VALUE_CYCLE = [];
  var r = 1;
  for (var i = 0; i < 13; i++) {
    VALUE_CYCLE.push(r);
    r = nextRank(r);
  }

  window.Stack = {
    SUITS: SUITS,
    FULL_STACK: FULL_STACK,
    VALUE_CYCLE: VALUE_CYCLE,
    nextCard: nextCard,
    prevCard: prevCard,
    cardAtOffset: cardAtOffset,
    nextRank: nextRank,
    prevRank: prevRank,
    buildStack: buildStack,
    rotateStack: rotateStack,
    offsetBetween: offsetBetween,
    parseCard: parseCard,
    formatCard: formatCard,
    formatRank: formatRank,
    parseRank: parseRank,
    suitName: suitName,
    suitSymbol: suitSymbol,
    suitColor: suitColor,
    numberToRank: numberToRank,
    rankToNumber: rankToNumber,
    makeCard: makeCard,
    mod: mod,
    __runTests: __runTests
  };

  function __runTests() {
      var ok = true;
      function assert(cond, msg) {
        if (!cond) { ok = false; console.error('FAIL:', msg); }
      }

      var c = makeCard(1, 0);
      assert(c.rank === 1 && c.suit === 0, 'start card');
      var n = nextCard(c);
      assert(n.rank === 4 && n.suit === 1, 'next card is 4 of hearts');
      var p = prevCard(c);
      assert(p.rank === 11 && p.suit === 3, 'prev card is J of diamonds');

      assert(formatCard(makeCard(1, 0)) === 'AKr', 'format AKr');
      assert(formatCard(makeCard(10, 3)) === '10Ka', 'format 10Ka');

      assert(parseCard('AKr').rank === 1 && parseCard('AKr').suit === 0, 'parse AKr');
      assert(parseCard('10Ka').rank === 10 && parseCard('10Ka').suit === 3, 'parse 10Ka');
      assert(parseCard('7P').rank === 7 && parseCard('7P').suit === 2, 'parse 7P');
      assert(parseCard('QS').rank === 12 && parseCard('QS').suit === 1, 'parse QS');
      assert(parseCard('J') === null, 'reject J without suit');
      assert(parseRank('J') === 11, 'parseRank J');
      assert(parseCard('x') === null, 'reject junk');
      assert(parseCard('') === null, 'reject empty');

      var off = cardAtOffset(makeCard(1, 0), 7);
      assert(off.rank === 9 && off.suit === 3, 'offset +7 is 9 of diamonds');

      var stack = buildStack();
      assert(stack.length === 52, 'stack length 52');
      assert(stack[51].suit === 3 && stack[51].rank === 11, 'last card J of diamonds');
      assert(formatCard(stack[0]) === 'AKr' && formatCard(stack[51]) === 'JKa', 'stack start/end');

      var cyc = VALUE_CYCLE;
      assert(formatRank(cyc[0]) === 'A' && formatRank(cyc[12]) === 'J', 'cycle first/last');
      assert(cyc.length === 13, 'cycle length 13');

      var rot = rotateStack(makeCard(9, 2));
      assert(formatCard(rot[0]) === '9P', 'rotate start 9P');

      var offB = offsetBetween(makeCard(1, 0), makeCard(9, 3));
      assert(offB === 7, 'offsetBetween AKr -> 9Ka is 7');
      assert(offsetBetween(makeCard(9, 3), makeCard(1, 0)) === 45, 'offsetBetween reverse is 45');

      console.log(ok ? 'STACK TESTS: ALL PASS' : 'STACK TESTS: FAILURES');
      return ok;
  }
})();
