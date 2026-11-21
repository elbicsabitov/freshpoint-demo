(function () {
  'use strict';
  var D = window.FP;
  var root = document.getElementById('app');
  var KEY = 'fp-order';
  var NB = String.fromCharCode(160);
  var DATE_CHIPS = 8;
  var WIDE = '(min-width: 900px)';

  var ICON = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    down: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 12l8 8 8-8"/></svg>',
    check: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16 3a13 13 0 110 26 13 13 0 010-26zm6.3 8.6l-8.2 8.3-4.3-4.2-1.9 1.9 6.2 6.1 10.1-10.2-1.9-1.9z"/></svg>'
  };
  var SQUIRCLE = '<svg class="hero-sq" viewBox="0 0 470 470" aria-hidden="true"><path d="M62.06 21.76C95.71 0 142.14 0 235 0s139.29 0 172.94 21.76a137 137 0 0140.3 40.3C470 95.7 470 142.14 470 235s0 139.29-21.76 172.94a137 137 0 01-40.3 40.3C374.29 470 327.86 470 235 470s-139.29 0-172.94-21.76a137 137 0 01-40.3-40.3C0 374.29 0 327.86 0 235S0 95.71 21.76 62.06a137 137 0 0140.3-40.3z"/></svg>';


  function blank() {
    return { program: null, term: null, date: '', first: '', last: '', phone: '', address: '', ex: ['', '', ''], comment: '', week: 1, day: 1, mode: '',
      orderId: '', rev: 0, sent: '', sentPrint: '', sentDate: '' };
  }
  function load() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (raw) { return tidy(Object.assign(blank(), JSON.parse(raw))); }
    } catch (e) {   }
    return blank();
  }
  function tidy(s) {
    if (!prog(s.program)) { s.program = null; }
    if (D.terms.indexOf(s.term) < 0) { s.term = null; }
    if (!Array.isArray(s.ex)) { s.ex = ['', '', '']; }
    ['date', 'first', 'last', 'phone', 'address', 'comment', 'orderId', 'sent', 'sentPrint', 'sentDate'].forEach(function (k) {
      if (typeof s[k] !== 'string') { s[k] = ''; }
    });
    if (s.mode !== 'day' && s.mode !== 'week') { s.mode = ''; }
    return s;
  }
  var S = load();
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {   }
  }


  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB); }
  function money(n) { return fmt(n) + NB + '₸'; }
  function prog(id) { return D.programs.filter(function (p) { return p.id === id; })[0] || null; }
  function price(id, term) { return D.prices[id][String(term)]; }
  function perDay(id, term) { return D.perDay[id][String(term)]; }
  function bju(v) { return 'Б' + NB + v[1] + ' · Ж' + NB + v[2] + ' · У' + NB + v[3]; }
  function kbju(v) { return fmt(v[0]) + NB + 'ккал · ' + bju(v); }
  var WD = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  var MO = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var WDS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MOS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) { return null; }
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  function iso(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function minDate() { var d = new Date(); d.setDate(d.getDate() + D.leadDays); return iso(d); }
  function maxDate() { var d = new Date(); d.setDate(d.getDate() + 365); return iso(d); }
  function dateOk(s) { return !!parseDate(s) && s >= minDate() && s <= maxDate(); }
  function dateText(s) { var d = parseDate(s); return d ? WD[d.getDay()] + ', ' + d.getDate() + NB + MO[d.getMonth()] : ''; }
  function dateLong(s) { var d = parseDate(s); return d ? d.getDate() + NB + MO[d.getMonth()] + NB + d.getFullYear() : ''; }
  var PLUS7 = /^\s*\+\s*7/;
  function phoneDigits(v) {
    var d = String(v).replace(PLUS7, '').replace(/\D/g, '');
    if (d.length > 10 && (d[0] === '7' || d[0] === '8')) { d = d.slice(1); }
    return d.slice(0, 10);
  }
  function phoneFmt(v) {
    var d = phoneDigits(v);
    if (!d) { return ''; }
    var s = '+7 (' + d.slice(0, 3);
    if (d.length > 3) { s += ') ' + d.slice(3, 6); }
    if (d.length > 6) { s += ' ' + d.slice(6, 10); }
    return s;
  }
  function digitsLeft(raw, caret) {
    var m = PLUS7.exec(raw), n = raw.slice(0, caret).replace(/\D/g, '').length;
    return m ? (caret >= m[0].length ? n - 1 : 0) : n;
  }
  function caretAfter(text, n) {
    var seen = 0, i;
    if (!n) { return Math.min(4, text.length); }
    for (i = 4; i < text.length; i++) {
      if (/\d/.test(text[i])) { seen += 1; if (seen === n) { return i + 1; } }
    }
    return text.length;
  }
  function lowerFirst(s) { s = String(s); return s.slice(0, 1).toLowerCase() + s.slice(1); }
  function upperFirst(s) { s = String(s); return s.slice(0, 1).toUpperCase() + s.slice(1); }
  function dateNote() {
    var min = minDate();
    if (!S.date) { return { text: 'Ближайшая доставка — ' + lowerFirst(dateText(min)), cls: ' hint' }; }
    if (!parseDate(S.date) || S.date > maxDate()) { return { text: 'Этот день не подходит: выберите дату в пределах года', cls: ' bad' }; }
    if (S.date < min) { return { text: 'Этот день не подходит: ближайшая доставка — ' + lowerFirst(dateText(min)), cls: ' bad' }; }
    return { text: dateText(S.date), cls: '' };
  }
  function weekById(id) { return D.weeks.filter(function (w) { return w.id === id; })[0] || null; }
  function mode() { return S.mode || (window.matchMedia && window.matchMedia(WIDE).matches ? 'week' : 'day'); }
  var MEALS = D.everyday.map(function (e) { return e.split(' — ')[0]; });
  function mealKind(name) { return MEALS.indexOf(name) + 1; }
  function defaults() {
    var was = JSON.stringify([S.program, S.term, S.date, S.week, S.day]);
    if (!S.program) { S.program = D.programs[0].id; }
    if (!S.term) { S.term = D.terms[D.terms.length - 1]; }
    if (!S.date) { S.date = minDate(); }
    if (!weekById(S.week)) { S.week = D.weeks[0].id; }
    if (!D.days[S.day - 1] || D.days[S.day - 1].week !== S.week) { S.day = weekById(S.week).days[0]; }
    if (JSON.stringify([S.program, S.term, S.date, S.week, S.day]) !== was) { save(); }
  }

  var T_SHORT = /(^|[^0-9A-Za-zА-Яа-яЁё_-])(в|и|с|к|о|у|а|я|на|по|из|со|за|от|до|не|ни|но|во|ко|об|для|без|при|под|над|про|или) /gi;
  var T_COMPOUND = /(^|[^0-9A-Za-zА-Яа-яЁё_-])((?:[А-Яа-яЁё]+|\d+)(?:-[А-Яа-яЁё]+)+)(?![0-9A-Za-zА-Яа-яЁё_-])/g;
  function tt(s) {
    return String(s).replace(/(\d) (?=\d{3}(?!\d))/g, '$1' + NB).replace(/(\d) (?=[А-Яа-яЁё₸%])/g, '$1' + NB)
      .replace(/(День|Дни|Неделя|Шаг|Продукт|№) (?=\d)/g, '$1' + NB)
      .replace(T_SHORT, '$1$2' + NB).replace(T_SHORT, '$1$2' + NB)
      .replace(/ ([—–·])(?= )/g, NB + '$1');
  }
  function typo(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) { nodes.push(n); }
    nodes.forEach(function (node) {
      var p = node.parentNode;
      if (!node.nodeValue.trim() || !p || !p.closest || p.closest('textarea, [data-raw], .nw')) { return; }
      var s = tt(node.nodeValue), last = 0, m;
      T_COMPOUND.lastIndex = 0;
      if (!T_COMPOUND.test(s)) { if (s !== node.nodeValue) { node.nodeValue = s; } return; }
      var frag = document.createDocumentFragment();
      T_COMPOUND.lastIndex = 0;
      while ((m = T_COMPOUND.exec(s))) {
        var start = m.index + m[1].length, span = document.createElement('span');
        frag.appendChild(document.createTextNode(s.slice(last, start)));
        span.className = 'nw';
        span.textContent = m[2];
        frag.appendChild(span);
        last = start + m[2].length;
      }
      frag.appendChild(document.createTextNode(s.slice(last)));
      p.replaceChild(frag, node);
    });
  }
  function paint(id, html) {
    var el = document.getElementById(id);
    if (el) { el.innerHTML = html; typo(el); }
    return el;
  }
  function logo(tag) { return '<' + tag + ' class="logo"' + (tag === 'a' ? ' href="#/"' : '') + '><img src="assets/img/logo-mark.svg" alt="" width="40" height="40">' + esc(D.brand.name) + '</' + tag + '>'; }


  function exList() { return S.ex.map(function (x) { return String(x || '').trim(); }).filter(Boolean); }
  function orderPrint() {
    return JSON.stringify([S.program, S.term, S.date, S.first.trim(), S.last.trim(), phoneDigits(S.phone), S.address.trim(), exList(), S.comment.trim()]);
  }
  function sentNow() { return !!S.sent && S.sentPrint === orderPrint(); }
  function newId() {
    var a = new Uint32Array(1);
    window.crypto.getRandomValues(a);
    return 'FP-' + ('000000' + (a[0] % 1000000)).slice(-6);
  }


  function termsHtml() {
    var h = '';
    D.terms.forEach(function (t) {
      var parts = String(D.termLabels[String(t)]).split(' ');
      h += '<button type="button" class="seg-o" role="radio" aria-checked="' + (S.term === t) + '" data-term="' + t + '" aria-label="' + esc(D.termLabels[String(t)]) + '"><b>' + esc(parts[0]) + '</b>' +
        '<span class="seg-unit">' + esc(parts.slice(1).join(' ')) + '</span><small>' + money(perDay(S.program, t)) + '</small></button>';
    });
    return h;
  }
  function datesHtml() {
    var h = '', d = parseDate(minDate()), i, v;
    for (i = 0; i < DATE_CHIPS; i++) {
      v = iso(d);
      h += '<button type="button" class="date-o" role="radio" aria-checked="' + (S.date === v) + '" data-date="' + v + '" aria-label="' + esc(dateText(v)) + '">' +
        '<small>' + WDS[d.getDay()] + '</small><b>' + d.getDate() + '</b><small>' + MOS[d.getMonth()] + '</small></button>';
      d.setDate(d.getDate() + 1);
    }
    return h;
  }
  function cfgHtml() {
    var p = prog(S.program), note = dateNote(), h;
    h = '<div class="cfg-row"><span class="cfg-label" id="lb-program">Рацион, ккал в' + NB + 'день</span><div class="cfg-ctl"><div class="seg" role="radiogroup" aria-labelledby="lb-program">';
    D.programs.forEach(function (x) {
      h += '<button type="button" class="seg-o" role="radio" aria-checked="' + (S.program === x.id) + '" data-program="' + x.id + '"><b>' + fmt(x.kcal) + '</b>' +
        '<small class="seg-name">' + esc(x.name) + '</small></button>';
    });
    h += '</div><p class="cfg-note" id="tile-desc">' + esc(p.name + ' — ' + lowerFirst(p.text)) + '</p></div></div>';
    h += '<div class="cfg-row"><span class="cfg-label" id="lb-term">Срок</span><div class="cfg-ctl"><div class="seg" role="radiogroup" aria-labelledby="lb-term" id="terms">' + termsHtml() + '</div>' +
      '<p class="cfg-note" id="term-hint">Цена за день. ' + esc(D.priceNote) + '</p></div></div>';
    h += '<div class="cfg-row"><span class="cfg-label" id="lb-date">Первая доставка</span><div class="cfg-ctl"><div class="dates" data-hscroll role="radiogroup" aria-labelledby="lb-date" id="dates">' + datesHtml() + '</div>' +
      '<div class="date-line"><label class="date-other"><span>или другая дата</span><input class="field field-date" type="date" id="date" min="' + minDate() + '" max="' + maxDate() + '" value="' + esc(S.date) + '" aria-describedby="date-read"' +
      (note.cls === ' bad' ? ' aria-invalid="true"' : '') + '></label><span class="date-read' + note.cls + '" id="date-read" role="status">' + esc(note.text) + '</span></div></div></div>';
    return h;
  }
  function mealGroups(d) {
    var g = [];
    d.items.forEach(function (it) {
      if (!g.length || g[g.length - 1].meal !== it.meal) { g.push({ meal: it.meal, items: [] }); }
      g[g.length - 1].items.push(it);
    });
    return g;
  }
  function dayCard(d, p) {
    var v = p ? d.kbju[p.id] : null;
    var h = '<section class="day" data-day="' + d.day + '" aria-label="День ' + d.day + '"><header class="day-head"><h3>День ' + d.day + '</h3>' +
      (v ? '<p class="day-kbju"><b>' + fmt(v[0]) + NB + 'ккал</b><span class="sep"> · </span><span>' + bju(v) + '</span></p>' : '') + '</header>';
    mealGroups(d).forEach(function (g) {
      h += '<div class="meal" data-kind="' + mealKind(g.meal) + '"><h4 class="meal-name">' + esc(g.meal) + '</h4><ul>';
      g.items.forEach(function (it) {
        h += '<li class="dish" data-meal="' + esc(it.meal) + '">' + (it.img ? '<img class="dish-photo" src="' + it.img + '" alt="" loading="lazy" width="48" height="48">' : '') +
          '<span class="card-name">' + esc(it.name) + '</span></li>';
      });
      h += '</ul></div>';
    });
    return h + '</section>';
  }
  function daysLabel(w) { return w.days.length > 1 ? 'Дни ' + w.days[0] + '–' + w.days[w.days.length - 1] : 'День ' + w.days[0]; }
  function menuHtml() {
    var p = prog(S.program), w = weekById(S.week), m = mode(), next = D.weeks[D.weeks.indexOf(w) + 1], h;
    h = '<div class="menu-head"><div class="menu-titles"><p class="eyebrow">Меню на 30 дней</p><h2 class="week-title">' + esc(w.title) + '</h2><p class="week-theme">' + esc(w.theme) + '</p></div>' +
      '<div class="mode" role="group" aria-label="Как показать меню">' +
      '<button type="button" class="mode-o" data-mode="day" aria-pressed="' + (m === 'day') + '">День</button>' +
      '<button type="button" class="mode-o" data-mode="week" aria-pressed="' + (m === 'week') + '">Неделя</button></div></div>' +
      '<p class="menu-avg">' + kbju(p.avg) + '<small>в среднем за день</small></p>';
    h += '<div class="wtabs" data-hscroll role="group" aria-label="Недели меню">';
    D.weeks.forEach(function (x) {
      h += '<button type="button" class="wtab" aria-pressed="' + (x.id === w.id) + '" data-week="' + x.id + '"><b>' + esc(x.title) + '</b><small>' + daysLabel(x) + '</small></button>';
    });
    h += '</div>';
    if (m === 'day') {
      h += '<div class="dchips" role="group" aria-label="Дни недели">';
      w.days.forEach(function (n) {
        h += '<button type="button" class="dchip" aria-pressed="' + (n === S.day) + '" data-pick-day="' + n + '" aria-label="День ' + n + '"><small>день</small><b>' + n + '</b></button>';
      });
      h += '</div><div class="dayview">' + dayCard(D.days[S.day - 1], p) + '</div>' +
        (S.day < D.days.length ? '<p class="day-more"><button type="button" class="link" data-pick-day="' + (S.day + 1) + '">Следующий день' + ICON.chev + '</button></p>' : '');
    } else {
      h += '<div class="board" data-count="' + w.days.length + '">';
      w.days.forEach(function (n) { h += dayCard(D.days[n - 1], p); });
      h += '</div>' + (next ? '<p class="week-next"><button type="button" class="link" data-week="' + next.id + '">Дальше: ' + esc(lowerFirst(next.title)) + ' — ' + esc(lowerFirst(next.theme)) + ICON.chev + '</button></p>' : '');
    }
    return h + '<p class="board-note">' + esc(upperFirst(D.unitsNote)) + '</p>';
  }
  var exOpen = false;
  function prefsHtml() {
    var ex = exList(), h, i;
    h = '<div class="card ex"><button type="button" class="ex-toggle" id="ex-toggle" aria-expanded="' + exOpen + '" aria-controls="ex-panel"><span class="ex-title">' + esc(D.exNote) + '</span>' +
      '<span class="ex-state" id="ex-state" data-raw>' + esc(ex.join(', ')) + '</span><span class="ex-act" id="ex-act">' + (ex.length ? 'Изменить' : 'Указать') + '</span>' + ICON.down + '</button>' +
      '<div class="ex-panel" id="ex-panel"' + (exOpen ? '' : ' hidden') + '><div class="fl-3" role="group" aria-label="Продукты, которые вы не едите">';
    for (i = 0; i < 3; i++) {
      h += '<input class="field" id="f-ex' + i + '" name="ex' + i + '" aria-label="Продукт ' + (i + 1) + '" placeholder="Продукт ' + (i + 1) + '" maxlength="60" value="' + esc(S.ex[i] || '') + '">';
    }
    h += '</div></div></div><ul class="gets">';
    D.benefits.forEach(function (b) { if (b !== D.exNote) { h += '<li class="get">' + ICON.check + '<span class="get-text">' + esc(b) + '</span></li>'; } });
    return h + '</ul>';
  }
  function barHtml() {
    var p = prog(S.program), t = S.term;
    return '<div class="bar-box"><div class="bar-in"><p class="bar-text"><span class="bar-main"><b id="bar-perday">' + money(perDay(p.id, t)) + '</b><small class="bar-unit">в' + NB + 'день</small></span>' +
      '<span class="bar-sub">' + esc(p.name) + ' · ' + esc(D.termLabels[String(t)]) + ' · <b id="bar-total">' + money(price(p.id, t)) + '</b></span></p>' +
      '<button type="button" class="btn btn-lg" id="next"' + (dateOk(S.date) ? '' : ' disabled') + '>Далее' + ICON.arrow + '</button></div>' +
      '<p class="bar-hint">Оплата после заказа: вы получите счёт.</p></div>';
  }
  function faq() {
    var h = '<section class="sec faq" id="faq"><h2 class="sec-title">Частые вопросы</h2><div class="faq-list">';
    D.faq.forEach(function (f, i) {
      h += '<div class="faq-item"><button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-' + i + '">' + esc(f.q) + ICON.down +
        '</button><p class="faq-a" id="faq-' + i + '" hidden>' + esc(f.a) + '</p></div>';
    });
    return h + '</div></section>';
  }
  function sumRows(totalLabel) {

    var p = prog(S.program), t = S.term, total = price(p.id, t);
    return '<ul class="sum-rows"><li><span>' + esc(D.termLabels[String(t)]) + (t > 1 ? '<small>' + money(perDay(p.id, t)) + ' в' + NB + 'день</small>' : '') +
      '</span><b>' + money(total) + '</b></li>' + '<li class="total"><span>' + totalLabel + '</span><b>' + money(total) + '</b></li></ul>';
  }
  function stepper(n) {
    var h = '<ol class="steps" aria-label="Шаги заказа">';
    ['Рацион', 'Доставка', 'Счёт'].forEach(function (x, i) {
      h += '<li class="step' + (i + 1 === n ? ' on' : (i + 1 < n ? ' was' : '')) + '"' + (i + 1 === n ? ' aria-current="step"' : '') + '><b>' + (i + 1) + '</b><span class="step-name">' + x + '</span></li>';
    });
    return h + '</ol>';
  }
  function back(href) { return '<a class="back" href="' + href + '">' + ICON.back + 'Назад</a>'; }


  function vHome() {
    var h = '<header class="top"><div class="top-in">' + logo('a') + '<nav class="top-nav" aria-label="Разделы страницы"><button type="button" class="nav-link" data-jump="menu">Меню</button>' +
      '<button type="button" class="nav-link nav-wide" data-jump="how">Как это работает</button><button type="button" class="nav-link" data-jump="faq">Вопросы</button></nav></div></header><main class="home">';
    h += '<section class="intro"><div class="intro-text"><p class="eyebrow">Правильное питание</p><h1 class="hero-title">' + esc(D.brand.slogan) + '</h1><p class="hero-lead">' + esc(D.lead) + '</p>' +
      '<p class="hero-price">от' + NB + money(D.fromPerDay) + ' в' + NB + 'день</p></div><div class="hero-plates" aria-hidden="true">' + SQUIRCLE;
    D.hero.forEach(function (src, i) { h += '<img class="plate plate-' + 'clr'[i] + '" src="' + src + '" alt="" width="380" height="380">'; });
    h += '<span class="sticker sticker-a">' + MEALS.length + ' приёмов пищи в' + NB + 'день</span><span class="sticker sticker-b">Меню на ' + D.days.length + ' дней</span></div></section>';
    h += '<section class="card cfg" id="cfg" aria-label="Ваш рацион">' + cfgHtml() + '</section>';
    h += '<section class="card menu" id="menu" aria-label="Меню"><div id="menu-body">' + menuHtml() + '</div></section>';
    h += '<section class="prefs" id="prefs" aria-label="Пожелания">' + prefsHtml() + '</section>';
    h += '<section class="sec how" id="how"><p class="eyebrow">Три шага</p><h2 class="sec-title">Как это работает?</h2><div class="how-grid">';
    D.how.forEach(function (x, i) {
      h += '<div class="card how-item"><img class="how-img" src="assets/img/how-' + (i + 1) + '.svg" alt="" width="180" height="180"><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div>';
    });
    h += '</div></section>' + faq() + '<footer class="foot">' + logo('div') + '<p class="foot-note">' + esc(D.brand.slogan) + '</p>' + '</footer>' + '</main>';
    return h + '<div class="bar" id="bar">' + barHtml() + '</div>';
  }

  function vDelivery() {
    var p = prog(S.program), ex = exList();
    var h = '<div class="flow"><header class="top"><div class="top-in">' + back('#/') + stepper(2) + '</div></header><form class="co" id="form" novalidate><div class="card co-form">' +
      '<h1>Адрес доставки</h1>' +
      '<label class="fl"><span class="fl-cap">Телефон</span><input class="field" id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___ ____" value="' + esc(phoneFmt(S.phone)) + '"><em class="err" id="e-phone"></em></label>' +
      '<div class="fl-row"><label class="fl"><span class="fl-cap">Имя</span><input class="field" id="f-first" name="first" autocomplete="given-name" maxlength="60" value="' + esc(S.first) + '"><em class="err" id="e-first"></em></label>' +
      '<label class="fl"><span class="fl-cap">Фамилия</span><input class="field" id="f-last" name="last" autocomplete="family-name" maxlength="60" value="' + esc(S.last) + '"><em class="err" id="e-last"></em></label></div>' +
      '<label class="fl"><span class="fl-cap">Адрес</span><textarea class="field field-2" id="f-address" name="address" rows="2" autocomplete="street-address" maxlength="300" placeholder="Улица, дом, квартира, подъезд, этаж, домофон">' + esc(S.address) + '</textarea><em class="err" id="e-address"></em></label>' +
      '<label class="fl"><span class="fl-cap">Комментарий (по желанию)</span><textarea class="field" id="f-comment" name="comment" maxlength="600" placeholder="Ваш комментарий">' + esc(S.comment) + '</textarea></label>' +
      '<div hidden><label>Не заполняйте это поле<input id="f-trap" name="fp_trap" tabindex="-1" autocomplete="off"></label></div>' +
      '<p class="consent">Нажимая «Оформить заказ», вы отправляете нам имя, телефон и адрес — они нужны, чтобы связаться с вами и привезти заказ.</p>' +
      '</div><aside class="card co-sum"><h2 class="col-title">Итог заказа</h2>' +
      '<div class="sum-block"><b>Программа</b><span class="sum-val" id="sum-program">' + esc(p.name) + ' · ' + fmt(p.kcal) + NB + 'ккал в' + NB + 'день</span></div>' +
      '<div class="sum-block"><b>Дата первой доставки</b><span class="sum-val" id="sum-date">' + esc(dateText(S.date)) + '</span></div>' +
      (ex.length ? '<div class="sum-block"><b>Продукты, которые вы не едите</b><span class="sum-val" id="sum-ex" data-raw>' + esc(ex.join(', ')) + '</span></div>' : '') + sumRows('К оплате') +
      '<div class="incl"><h3>Что входит</h3><p>' + esc(D.orderSteps[2]) + '</p><ul>';
    D.everyday.forEach(function (e) {
      var parts = e.split(' — ');
      h += '<li><span class="incl-name">' + esc(parts[0]) + (parts[1] ? '<small>' + esc(parts[1]) + '</small>' : '') + '</span></li>';
    });
    h += '</ul></div></aside></form><div class="bar" id="bar"><div class="bar-box"><div class="bar-in"><p class="bar-text"><span class="bar-main"><small class="bar-unit">К оплате</small><b id="pay-total">' + money(price(S.program, S.term)) + '</b></span>' +
      '<span class="bar-sub">Оплата после заказа: вы получите счёт.</span><span class="bar-err" id="send-err" role="alert"></span></p>' +
      '<button type="submit" form="form" class="btn btn-lg" id="send">Оформить заказ</button></div></div></div></div>';
    return h;
  }

  function vDone() {
    var p = prog(S.program), ex = exList(), ok = S.sent === 'ok';


    var h = '<main class="done"><div class="done-logo">' + logo('div') + '</div><h1 class="done-title"><span data-raw>' + esc(S.first.trim()) + '</span>,<br>' + (ok ? 'спасибо за ваш заказ!' : 'заказ не отправлен') + '</h1>' +
      (ok ? '<p class="done-status ok" id="done-status" role="status">' + ICON.check + '<span class="done-word">Заказ отправлен.</span></p>'
        : '<section class="payb payb-top"><p class="done-status warn" id="done-status" role="status">Мы не получили заказ. Отправьте его ещё раз.</p>' +
          '<button type="button" class="btn btn-lg" id="retry">Отправить ещё раз</button></section>') +
      '<section class="card inv" aria-labelledby="inv-title"><header class="inv-head"><h2 id="inv-title">Счёт №' + NB + '<span id="inv-id">' + esc(S.orderId) + '</span></h2>' +
      '<p id="inv-date">от ' + esc(dateLong(S.sentDate)) + '</p></header><div class="done-grid"><div>' +
      '<div class="sum-block"><b>Программа</b><span class="sum-val">' + esc(p.name) + ' · ' + fmt(p.kcal) + NB + 'ккал в' + NB + 'день</span></div>' +
      '<div class="sum-block"><b>Дата первой доставки</b><span class="sum-val">' + esc(dateText(S.date)) + '</span></div>' + sumRows('К оплате') + '</div><div>' +
      '<div class="sum-block"><b>Получатель</b><span class="sum-val" id="done-name" data-raw>' + esc(S.first.trim() + ' ' + S.last.trim()) + '</span></div>' +
      '<div class="sum-block"><b>Телефон</b><span class="sum-val" id="done-phone" data-raw>' + esc(phoneFmt(S.phone)) + '</span></div>' +
      '<div class="sum-block"><b>Адрес доставки</b><span class="sum-val" id="done-address" data-raw>' + esc(S.address.trim()) + '</span></div>' +
      (ex.length ? '<div class="sum-block"><b>Продукты, которые вы не едите</b><span class="sum-val" id="done-ex" data-raw>' + esc(ex.join(', ')) + '</span></div>' : '') +
      (S.comment.trim() ? '<div class="sum-block"><b>Комментарий</b><span class="sum-val" id="done-comment" data-raw>' + esc(S.comment.trim()) + '</span></div>' : '') +
      '</div></div></section>' +
      (ok ? '<section class="payb"><h2>Оплата</h2>' + '<p class="payb-text">' + esc(D.payNote) + '</p>' + '</section>' : '') +

      '<p class="done-actions"><a class="btn btn-ghost" id="edit" href="#/order/delivery">Изменить заказ</a>' +
      (ok ? '<button type="button" class="btn btn-ghost" id="print">Распечатать счёт</button><button type="button" class="btn btn-ghost" id="new">Новый заказ</button>' : '') +
      '<a class="btn btn-ghost" id="home" href="#/">На главную</a></p></main>';
    return h;
  }


  function formOk() { return phoneDigits(S.phone).length === 10 && S.first.trim() && S.last.trim() && S.address.trim(); }
  function guard(name) {
    if (name === 'order/done') { return (S.program && S.term && formOk() && sentNow()) ? name : ''; }
    if (!S.program || !S.term || !dateOk(S.date)) { return ''; }
    return 'order/delivery';
  }
  function route() {
    var h = location.hash.replace(/^#\/?/, ''), m = /^menu(?:\/(\d))?$/.exec(h);
    if (h === 'order/pay') { h = 'order/done'; }
    if (m || h === 'order/program' || h === 'order/term' || h === 'order/menu') {
      return { name: '', old: true, week: m && m[1] ? +m[1] : null };
    }
    return { name: h };
  }
  var lastName = null, trail = [], BASE_TITLE = document.title;
  var TITLES = { 'order/delivery': 'Адрес и счёт', 'order/done': 'Счёт' };
  function fitBar() {
    var bar = root.querySelector('.bar');
    document.documentElement.style.setProperty('--bar-h', (bar ? bar.offsetHeight : 0) + 'px');
  }
  window.addEventListener('resize', fitBar);
  function render() {
    var r = route(), name = r.name, html;
    if (r.old) {
      if (r.week && weekById(r.week)) { S.week = r.week; S.day = weekById(r.week).days[0]; save(); }
      location.replace('#/');
      return;
    }
    if (name.indexOf('order/') === 0) {
      var allowed = guard(name);
      if (allowed !== name) { location.replace('#/' + allowed); return; }
    }
    if (name === '') { defaults(); html = vHome(); }
    else if (name === 'order/delivery') { html = vDelivery(); }
    else if (name === 'order/done') { html = vDone(); }
    else { location.replace('#/'); return; }
    root.innerHTML = html;
    typo(root);
    root.classList.toggle('first', !root.hasAttribute('data-ready'));
    root.setAttribute('data-view', name || 'landing');
    document.body.setAttribute('data-view', name || 'landing');
    fitBar();
    document.title = TITLES[name] ? TITLES[name] + ' — ' + D.brand.name : BASE_TITLE;
    var here = '#/' + location.hash.replace(/^#\/?/, ''), seen = trail.lastIndexOf(here);
    if (seen >= 0) { trail.length = seen + 1; } else { trail.push(here); }
    if (lastName !== name) { window.scrollTo(0, 0); }
    lastName = name;
    root.setAttribute('data-ready', '1');
  }
  function go(name) {
    if (location.hash === '#/' + name) { render(); } else { location.hash = '#/' + name; }
  }


  function checkGroup(attr, value) {
    Array.prototype.forEach.call(root.querySelectorAll('[role="radio"][' + attr + ']'), function (b) {
      b.setAttribute('aria-checked', b.getAttribute(attr) === String(value) ? 'true' : 'false');
    });
  }
  function setProgram(id) {
    var p = prog(id);
    S.program = id; save();
    checkGroup('data-program', id);
    document.getElementById('tile-desc').textContent = tt(p.name + ' — ' + lowerFirst(p.text));
    paint('terms', termsHtml());
    paint('menu-body', menuHtml());
    paint('bar', barHtml());
  }
  function setTerm(t) {
    S.term = t; save();
    checkGroup('data-term', t);
    paint('bar', barHtml());
  }
  function setDate(v, typed) {
    var note, read = document.getElementById('date-read'), input = document.getElementById('date');
    S.date = v; save();
    note = dateNote();
    checkGroup('data-date', v);
    read.textContent = tt(note.text);
    read.className = 'date-read' + note.cls;
    input.setAttribute('aria-invalid', note.cls === ' bad' ? 'true' : 'false');
    if (!typed) { input.value = v; }
    paint('bar', barHtml());
  }
  function exPaint() {
    var ex = exList();
    document.getElementById('ex-state').textContent = ex.join(', ');
    document.getElementById('ex-act').textContent = ex.length ? 'Изменить' : 'Указать';
  }


  function validate() {
    var f = { phone: phoneDigits(S.phone).length === 10 ? '' : 'Укажите телефон: 10 цифр после +7', first: S.first.trim() ? '' : 'Укажите имя',
      last: S.last.trim() ? '' : 'Укажите фамилию', address: S.address.trim() ? '' : 'Укажите адрес доставки' };
    var firstBad = null;
    Object.keys(f).forEach(function (k) {
      var input = document.getElementById('f-' + k), err = document.getElementById('e-' + k);
      input.setAttribute('aria-invalid', f[k] ? 'true' : 'false');
      err.textContent = tt(f[k]);
      if (f[k] && !firstBad) { firstBad = input; }
    });
    if (firstBad) { firstBad.focus(); }
    return !firstBad;
  }


  var sending = false, trap = '';
  function sendError(msg) { var e = document.getElementById('send-err'); if (e) { e.textContent = tt(msg); } }
  function setSending(on) {
    sending = on;
    var b = document.getElementById('send') || document.getElementById('retry');
    if (b) { b.disabled = on; b.textContent = on ? 'Отправляем…' : (b.id === 'send' ? 'Оформить заказ' : 'Отправить ещё раз'); }
  }
  function payload() {
    return { id: S.orderId, rev: S.rev, catalog: D.catalog, program: S.program, term: S.term, date: S.date, first: S.first.trim(), last: S.last.trim(),
      phone: phoneDigits(S.phone), address: S.address.trim(), ex: exList(), comment: S.comment.trim(), total: price(S.program, S.term), website: trap };
  }
  function post(done) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) { ctl.abort(); } }, 15000);
    fetch(D.orderApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, ok: !!(j && j.ok) }; }, function () { return { status: r.status, ok: false }; }); })
      .then(function (res) { clearTimeout(timer); done(res.status === 200 && res.ok ? 'ok' : res.status === 409 ? 'stale' : res.status === 422 ? 'invalid' : 'fail'); },
        function () { clearTimeout(timer); done('fail'); });
  }
  function submitOrder() {
    if (sending) { return; }
    var fp = orderPrint();
    if (S.sent === 'ok' && S.sentPrint === fp) { go('order/done'); return; }
    if (S.sentPrint !== fp) {
      if (!S.orderId) { S.orderId = newId(); }
      S.rev = (S.rev || 0) + 1;
    }
    var hp = document.getElementById('f-trap');
    trap = hp ? hp.value : '';
    S.sentPrint = fp; S.sentDate = iso(new Date()); S.sent = ''; save();
    sendError(''); setSending(true);
    post(function (status) {
      setSending(false);
      if (status === 'stale' || status === 'invalid') {
        S.sentPrint = ''; S.rev -= 1; save();
        sendError(status === 'stale' ? 'Цены на сайте обновились. Обновите страницу и оформите заказ ещё раз.' : 'Заказ не принят: проверьте поля формы.');
        return;
      }
      S.sent = status; save(); go('order/done');
    });
  }
  function retryOrder() {
    if (sending) { return; }
    setSending(true);
    post(function (status) { setSending(false); if (status === 'ok') { S.sent = 'ok'; save(); } render(); });
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-program],[data-term],[data-date],[data-week],[data-pick-day],[data-mode],[data-jump],#ex-toggle,.faq-q,.back,#next,#retry,#print,#new');
    if (!t) { return; }
    if (t.classList.contains('back')) {
      e.preventDefault();
      var target = t.getAttribute('href');
      if (trail.length > 1 && trail[trail.length - 2] === target) { history.back(); } else { location.replace(target); }
      return;
    }
    if (t.hasAttribute('data-program')) { setProgram(t.getAttribute('data-program')); return; }
    if (t.hasAttribute('data-term')) { setTerm(+t.getAttribute('data-term')); return; }
    if (t.hasAttribute('data-date')) { setDate(t.getAttribute('data-date'), false); return; }
    if (t.hasAttribute('data-week')) {
      var y0 = window.scrollY;
      S.week = +t.getAttribute('data-week'); S.day = weekById(S.week).days[0]; save();
      paint('menu-body', menuHtml());
      var tabs = root.querySelector('.wtabs'), on = root.querySelector('.wtab[aria-pressed="true"]');
      if (tabs && on) {
        var top = Math.max(0, tabs.getBoundingClientRect().top + window.scrollY - 76);
        tabs.scrollLeft = Math.max(0, on.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2);
        window.scrollTo(0, y0 > top ? top : y0);
        on.focus({ preventScroll: true });
      }
      return;
    }
    if (t.hasAttribute('data-pick-day')) {
      S.day = +t.getAttribute('data-pick-day'); S.week = D.days[S.day - 1].week; save();
      paint('menu-body', menuHtml());
      var chip = root.querySelector('.dchip[aria-pressed="true"]'), head = root.querySelector('.dchips');
      if (head && head.getBoundingClientRect().top < 76) { window.scrollTo(0, Math.max(0, head.getBoundingClientRect().top + window.scrollY - 84)); }
      if (chip) { chip.focus({ preventScroll: true }); }
      return;
    }
    if (t.hasAttribute('data-mode')) {
      S.mode = t.getAttribute('data-mode'); save();
      paint('menu-body', menuHtml());
      var pressed = root.querySelector('.mode-o[aria-pressed="true"]');
      if (pressed) { pressed.focus({ preventScroll: true }); }
      return;
    }
    if (t.hasAttribute('data-jump')) {
      var sec = document.getElementById(t.getAttribute('data-jump'));
      if (sec) { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    if (t.id === 'ex-toggle') {
      exOpen = !exOpen;
      t.setAttribute('aria-expanded', exOpen ? 'true' : 'false');
      document.getElementById('ex-panel').hidden = !exOpen;
      if (exOpen) { document.getElementById('f-ex0').focus({ preventScroll: true }); }
      return;
    }
    if (t.classList.contains('faq-q')) {
      var open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', open ? 'false' : 'true');
      document.getElementById(t.getAttribute('aria-controls')).hidden = open;
      return;
    }
    if (t.id === 'next') { go('order/delivery'); return; }
    if (t.id === 'retry') { retryOrder(); return; }
    if (t.id === 'print') { window.print(); return; }
    if (t.id === 'new') { S = blank(); save(); go(''); }
  });

  root.addEventListener('keydown', function (e) {
    var t = e.target, order = ['f-phone', 'f-first', 'f-last', 'f-address', 'f-comment'], i;
    if (e.key === 'Enter' && !e.shiftKey && t.id && t.id !== 'f-comment' && order.indexOf(t.id) >= 0) {
      e.preventDefault();
      document.getElementById(order[order.indexOf(t.id) + 1]).focus();
      return;
    }
    if (e.key === 'Enter' && /^f-ex\d$/.test(t.id || '')) {
      e.preventDefault();
      var nextEx = document.getElementById('f-ex' + (+t.id.slice(4) + 1));
      if (nextEx) { nextEx.focus(); } else { t.blur(); }
      return;
    }
    if (/^Arrow/.test(e.key) && t.getAttribute && t.getAttribute('role') === 'radio') {
      var all = Array.prototype.slice.call(t.parentNode.querySelectorAll('[role="radio"]'));
      i = (all.indexOf(t) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length;
      e.preventDefault();
      all[i].click();
      all[i].focus({ preventScroll: true });
      if (all[i].scrollIntoView) { all[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    }
  });

  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'date') { setDate(t.value, true); return; }
    if (t.id === 'f-phone') {
      var raw = t.value, caret = t.selectionStart, all = raw.replace(PLUS7, '').replace(/\D/g, '');
      var n = caret === null ? 10 : digitsLeft(raw, caret);
      if (all.length > 10 && (all[0] === '7' || all[0] === '8') && n > 0) { n -= 1; }
      t.value = phoneFmt(raw);
      S.phone = phoneDigits(t.value);
      if (caret !== null && document.activeElement === t) {
        var pos = caretAfter(t.value, Math.min(n, S.phone.length));
        t.setSelectionRange(pos, pos);
      }
    } else if (t.id === 'f-first') { S.first = t.value; }
    else if (t.id === 'f-last') { S.last = t.value; }
    else if (t.id === 'f-address') { S.address = t.value; }
    else if (t.id === 'f-comment') { S.comment = t.value; }
    else if (/^f-ex\d$/.test(t.id)) { S.ex[+t.id.slice(4)] = t.value; save(); exPaint(); return; }
    else { return; }
    save();
    if (t.getAttribute('aria-invalid') === 'true' && t.value.trim()) {
      t.setAttribute('aria-invalid', 'false');
      var err = document.getElementById('e-' + t.id.slice(2));
      if (err) { err.textContent = ''; }
    }
  });

  root.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validate()) { submitOrder(); }
  });

  window.addEventListener('hashchange', render);


  window.app = {
    snapshot: function () { var s = JSON.parse(JSON.stringify(S)); s.view = root.getAttribute('data-view'); return s; },
    reset: function () { S = blank(); exOpen = false; save(); go(''); },
    go: go,
    set: function (patch) { Object.assign(S, patch); save(); render(); },
    mark: function (status) {
      if (!S.orderId) { S.orderId = newId(); }
      S.rev = S.rev || 1; S.sentPrint = orderPrint(); S.sentDate = iso(new Date()); S.sent = status; save(); render();
    }
  };

  render();
}());
