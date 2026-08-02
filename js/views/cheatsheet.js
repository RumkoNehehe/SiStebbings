(function () {
  'use strict';

  var S = window.Stack;
  var UI = window.UI;

  function valueChips() {
    return S.VALUE_CYCLE.map(function (v) {
      return '<span class="value-chip">' + S.formatRank(v) + '</span>';
    }).join('');
  }

  window.Views = window.Views || {};

  window.Views.cheatsheet = {
    title: 'Cheat-sheet',
    render: function (container) {
      container.innerHTML = '';

      var wrap = document.createElement('div');

      function section(titleText) {
        var sec = document.createElement('section');
        sec.className = 'cheat-section card';
        var h = document.createElement('h3');
        h.textContent = titleText;
        sec.appendChild(h);
        return sec;
      }

      var s1 = section('Cyklus hodnôt 13 (CHaSeD rámec)');
      var p1 = document.createElement('p');
      p1.innerHTML = 'Hodnoty sa posúvajú o <strong>+3</strong> (mod 13). Prvý cyklus od Ása:';
      s1.appendChild(p1);
      var chips = document.createElement('p');
      chips.innerHTML = valueChips();
      s1.appendChild(chips);
      var p1b = document.createElement('p');
      p1b.textContent = 'Po J nasleduje späť A. Zapamätaj si tento rámec — je základom všetkých výpočtov.';
      s1.appendChild(p1b);

      var s2 = section('Poradie farieb CHaSeD');
      var p2 = document.createElement('p');
      p2.innerHTML = 'Farba každej ďalšej karty sa posúva o jednu v poradí: ' +
        '<strong>Križe (Kr) → Srdcia (S) → Piky (P) → Káry (Ka)</strong> → a späť na Križe. ' +
        'Mnemo-pomôcka: <strong>CHaSeD</strong> (Clubs, Hearts, Spades, Diamonds).';
      s2.appendChild(p2);

      var s3 = section('Kombinácia: nasledujúca karta');
      var p3 = document.createElement('p');
      p3.innerHTML = 'Ak je karta <strong>9 Piky</strong>, nasledujúca je: hodnota <strong>9 + 3 = Q</strong> (Dáma), ' +
        'farba <strong>Piky → Káry</strong>. Výsledok: <strong>Q Káry</strong>.';
      s3.appendChild(p3);

      var s4 = section('Lokalizácia zhora / zdola');
      var ul4 = document.createElement('ul');
      ul4.className = 'cheat-list';
      var li1 = document.createElement('li');
      li1.textContent = 'Zhora: vrchná karta = pozícia 1. Každá ďalšia pozícia = +3 hodnota, +1 farba.';
      var li2 = document.createElement('li');
      li2.textContent = 'Zdola: spodná karta = pozícia 1. Postupuj opačne: −3 hodnota, −1 farba.';
      var li3 = document.createElement('li');
      li3.textContent = 'Celý balíček je cyklus — pozícia 52 = 1 pozícia pred vrchom. Rezy nemenia poradie.';
      ul4.appendChild(li1);
      ul4.appendChild(li2);
      ul4.appendChild(li3);
      s4.appendChild(ul4);

      var s4b = section('Koľko kariet dať prec (cut)');
      var ul4b = document.createElement('ul');
      ul4b.className = 'cheat-list';
      var bl1 = document.createElement('li');
      bl1.textContent = 'Zhora: ak je prvá karta X, počet kariet nad cieľovou Y = koľko kariet treba dať prec, aby Y bola prvá.';
      var bl2 = document.createElement('li');
      bl2.textContent = 'Zdola: ak je posledná karta X, počet kariet pod cieľovou Y = koľko kariet treba dať prec zospodu, aby Y bola posledná.';
      var bl3 = document.createElement('li');
      bl3.textContent = 'Pozor: nepočíta sa pozícia (kolkatá), ale počet kariet nad/pod (0–51).';
      ul4b.appendChild(bl1);
      ul4b.appendChild(bl2);
      ul4b.appendChild(bl3);
      s4b.appendChild(ul4b);

      var s5 = section('Notácia zadávania');
      var p5 = document.createElement('p');
      p5.innerHTML = 'Hodnota: <strong>A</strong>, 2–10, <strong>J</strong>, <strong>Q</strong>, <strong>K</strong>. ' +
        'Farba (za hodnotou): <strong>S</strong>=srdcia, <strong>P</strong>=piky, <strong>Kr</strong>=križe, <strong>Ka</strong>=káry. ' +
        'Príklady: <strong>9P</strong>, <strong>10Ka</strong>, <strong>AKr</strong>, <strong>QS</strong>.';
      s5.appendChild(p5);

      var demo = section('Ukážka cyklu (od Ása križe)');
      demo.appendChild(UI.createCycleView({ startCard: S.makeCard(1, 0), markStart: true }));

      wrap.appendChild(s1);
      wrap.appendChild(s2);
      wrap.appendChild(s3);
      wrap.appendChild(s4);
      wrap.appendChild(s4b);
      wrap.appendChild(s5);
      wrap.appendChild(demo);
      container.appendChild(wrap);
    }
  };
})();
