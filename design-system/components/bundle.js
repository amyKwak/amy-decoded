/* @ds-bundle: {"format":4,"namespace":"LuckyGoose","components":[{"name":"Button"},{"name":"ClassBadge"},{"name":"ClassPicker"},{"name":"HeroSlot"},{"name":"TextField"},{"name":"QuestCard"},{"name":"StoryLine"},{"name":"PartyBar"},{"name":"ChoiceCard"},{"name":"DiceRoll"},{"name":"EndScreen"}]} */
(function () {
  var React = window.React, h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }

  var CLASSES = {
    warrior: { name: 'Warrior', stat: 'STR', blurb: 'Hits hard, lifts heavy things' },
    rogue: { name: 'Rogue', stat: 'DEX', blurb: 'Sneaky, quick, a little sticky-fingered' },
    mage: { name: 'Mage', stat: 'INT', blurb: 'Knows spells, reads the fine print' },
    bard: { name: 'Bard', stat: 'CHA', blurb: 'Talks, sings and charms their way in' }
  };
  var STAT_CLASS = { STR: 'warrior', DEX: 'rogue', INT: 'mage', CHA: 'bard' };
  var BONUS = 3;

  function Button(p) {
    var variant = p.variant || 'primary';
    var rest = Object.assign({}, p); delete rest.variant; delete rest.size; delete rest.block; delete rest.className;
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('rt-btn', 'rt-btn-' + variant, p.size === 'lg' && 'rt-btn-lg', p.block && 'rt-btn-block', p.className)
    }), p.children);
  }

  function Monogram(p) {
    return h('span', { className: cx('rt-mono', p.large && 'rt-mono-lg', 'rt-c-' + p.heroClass), 'aria-hidden': true }, (p.name || CLASSES[p.heroClass].name).charAt(0).toUpperCase());
  }

  function ClassBadge(p) {
    var c = CLASSES[p.heroClass] || CLASSES.warrior;
    return h('span', { className: cx('rt-badge', 'rt-c-' + p.heroClass) },
      h(Monogram, { heroClass: p.heroClass }), c.name, h('span', { className: 'rt-tag' }, c.stat));
  }

  function ClassPicker(p) {
    var keys = ['warrior', 'rogue', 'mage', 'bard'];
    return h('div', { className: 'rt-picker', role: 'radiogroup', 'aria-label': p.label || 'Pick a class' },
      keys.map(function (k) {
        var c = CLASSES[k], on = p.value === k;
        return h('button', {
          key: k, type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false',
          className: cx('rt-tile', 'rt-c-' + k), onClick: function () { p.onChange && p.onChange(k); }
        },
          h('span', { className: 'rt-row', style: { gap: 8 } }, h(Monogram, { heroClass: k }), h('span', { className: 'rt-tile-name' }, c.name)),
          h('span', { className: 'rt-tag rt-tile-stat' }, '+' + BONUS + ' ' + c.stat),
          p.showBlurb ? h('span', { className: 'rt-tile-stat', style: { fontSize: 14, lineHeight: '20px', fontWeight: 600 } }, c.blurb) : null);
      }));
  }

  function HeroSlot(p) {
    if (!p.name && !p.heroClass) {
      return h('button', { type: 'button', className: 'rt-hero rt-hero-empty rt-btn', style: { width: '100%', boxShadow: 'none', color: 'var(--cream-muted)', fontSize: 16 }, onClick: p.onAdd }, p.addLabel || '+ Add a hero');
    }
    var c = CLASSES[p.heroClass];
    return h('div', { className: cx('rt-hero', 'rt-c-' + p.heroClass) },
      h(Monogram, { heroClass: p.heroClass, name: p.name, large: true }),
      h('div', { className: 'rt-hero-text' },
        h('span', { className: 'rt-hero-name' }, p.name),
        h('span', { className: 'rt-tag rt-hero-cls' }, c.name + ' · ' + c.stat)),
      p.onRemove ? h('button', { type: 'button', className: 'rt-x', 'aria-label': 'Remove ' + p.name, onClick: p.onRemove }, '×') : null);
  }

  function TextField(p) {
    var id = p.id || ('rt-f-' + (p.label || 'field').replace(/\W+/g, '-').toLowerCase());
    var input = h(p.multiline ? 'textarea' : 'input', {
      id: id, value: p.value, defaultValue: p.defaultValue, placeholder: p.placeholder, rows: p.multiline ? 2 : undefined,
      onChange: p.onChange, maxLength: p.maxLength
    });
    return h('div', { className: 'rt-field' }, p.label ? h('label', { htmlFor: id }, p.label) : null, input,
      p.hint ? h('span', { className: 'rt-field-hint' }, p.hint) : null);
  }

  function QuestCard(p) {
    return h('button', { type: 'button', className: 'rt-quest', 'aria-pressed': p.selected ? 'true' : 'false', onClick: p.onClick },
      h('div', { className: 'rt-quest-title' }, p.title),
      p.hint ? h('div', { className: 'rt-quest-hint' }, p.hint) : null);
  }

  function StoryLine(p) {
    var state = p.state || 'current';
    return h('div', { className: cx('rt-line', state === 'current' && 'rt-line-current', state === 'read' && 'rt-line-read', p.reader && p.reader.heroClass && 'rt-c-' + p.reader.heroClass) },
      p.reader && state !== 'read' ? h('div', { className: 'rt-reader' }, h('i'), (state === 'current' ? p.reader.name + ' reads' : p.reader.name)) : null,
      h('div', null, p.children, p.streaming ? h('span', { className: 'rt-caret', 'aria-hidden': true }) : null));
  }

  function PartyBar(p) {
    return h('div', { className: 'rt-party', role: 'list', 'aria-label': 'Party' },
      (p.heroes || []).map(function (hero, i) {
        var max = hero.maxHp || 10, hp = Math.max(0, Math.min(max, hero.hp)), out = hp === 0, low = !out && hp <= 3;
        return h('div', { key: i, role: 'listitem', className: cx('rt-member', 'rt-c-' + hero.heroClass, hero.active && 'rt-member-active', out && 'rt-member-out'), 'aria-current': hero.active ? 'true' : undefined },
          h('div', { className: 'rt-member-top' }, h(Monogram, { heroClass: hero.heroClass, name: hero.name }), h('span', { className: 'rt-member-name' }, hero.name)),
          h('div', { className: cx('rt-hp', low && 'rt-hp-low'), role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': hp, 'aria-label': hero.name + ' HP' }, h('i', { style: { width: (hp / max * 100) + '%' } })),
          h('span', { className: cx('rt-hp-num', low && 'rt-hp-num-low') }, out ? 'Knocked out' : hp + '/' + max + ' HP'));
      }));
  }

  function ChoiceCard(p) {
    var match = p.heroClass && STAT_CLASS[p.stat] === p.heroClass;
    return h('button', { type: 'button', className: cx('rt-choice', match && 'rt-c-' + p.heroClass), onClick: p.onClick },
      h('span', null, p.children),
      h('span', { className: 'rt-choice-tags' },
        h('span', { className: cx('rt-tag rt-chip', match && 'rt-chip-strong') }, p.stat + ' · DC ' + p.dc),
        match ? h('span', { className: 'rt-tag rt-chip rt-chip-plus' }, '+' + BONUS + ' ' + CLASSES[p.heroClass].name + ' bonus') : null));
  }

  function D20(p) {
    return h('svg', { className: 'rt-d20', viewBox: '0 0 100 100', role: 'img', 'aria-label': p.value != null ? 'd20 showing ' + p.value : 'd20' },
      h('polygon', { className: 'face', points: '50,4 90,27 90,73 50,96 10,73 10,27' }),
      h('polygon', { className: 'edge', points: '50,24 76,68 24,68' }),
      h('path', { className: 'edge', d: 'M50,4 L50,24 M90,27 L76,68 M90,73 L76,68 M50,96 L76,68 M50,96 L24,68 M10,73 L24,68 M10,27 L24,68 M10,27 L50,24 M90,27 L50,24' }),
      p.value != null ? h('text', { className: 'num', x: 50, y: 61, textAnchor: 'middle' }, String(p.value)) : null);
  }

  function Rays() {
    var lines = [];
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6, r1 = 80, r2 = 120;
      lines.push(h('line', { key: i, x1: 160 + Math.cos(a) * r1, y1: 160 + Math.sin(a) * r1, x2: 160 + Math.cos(a) * r2, y2: 160 + Math.sin(a) * r2 }));
    }
    return h('svg', { className: 'rt-rays', viewBox: '0 0 320 320', 'aria-hidden': true }, lines);
  }

  function DiceRoll(p) {
    if (p.rolling) {
      return h('div', { className: 'rt-dice rt-rolling', 'aria-live': 'polite' }, h(D20, {}), h('p', { className: 'rt-dice-sub' }, p.rollingText || 'Rolling…'));
    }
    var roll = p.value, mod = p.modifier || 0, total = roll + mod, nat20 = roll === 20, nat1 = roll === 1;
    var win = nat20 || (!nat1 && total >= p.dc);
    var head = nat20 ? 'Natural 20!' : nat1 ? 'Natural 1' : null;
    var sub = nat20 ? (p.nat20Text || 'Always a success. Everybody cheer!') : nat1 ? (p.nat1Text || 'Always a miss. It happens to the best of us.') : null;
    return h('div', { className: cx('rt-dice', nat20 && 'rt-nat20', nat1 && 'rt-nat1'), 'aria-live': 'polite' },
      nat20 ? h(Rays) : null,
      h(D20, { value: roll }),
      head ? h('h2', { className: 'rt-dice-head' }, head) : null,
      h('div', { className: 'rt-dice-math' }, roll + (mod ? ' + ' + mod : '') + ' = ' + total, h('span', { className: 'dim' }, '  vs DC ' + p.dc)),
      h('span', { className: cx('rt-verdict', win ? 'rt-verdict-win' : 'rt-verdict-lose') }, win ? 'Success!' : 'Miss'),
      sub ? h('p', { className: 'rt-dice-sub' }, sub) : null);
  }

  function EndScreen(p) {
    var victory = p.outcome !== 'defeat';
    return h('div', { className: cx('rt-end', victory ? 'rt-end-victory' : 'rt-end-defeat') },
      h('div', { className: 'rt-banner' }, h('h1', null, p.title || (victory ? 'Victory!' : 'Defeat'))),
      h('p', { className: 'rt-end-sub' }, p.subtitle || (victory ? 'The tavern roars. Drinks are on the house.' : 'The party is out cold. The tavern saves your seats.')),
      p.children ? h('div', { className: 'rt-recap' }, p.children) : null,
      h('div', { className: 'rt-end-actions' },
        h(Button, { variant: 'primary', size: 'lg', block: true, onClick: p.onNewQuest }, p.primaryLabel || (victory ? 'New quest' : 'Try again')),
        h(Button, { variant: 'secondary', block: true, onClick: p.onNewParty }, p.secondaryLabel || 'New party')));
  }

  window.LuckyGoose = Object.assign(window.LuckyGoose || {}, {
    Button: Button, ClassBadge: ClassBadge, ClassPicker: ClassPicker, HeroSlot: HeroSlot, TextField: TextField,
    QuestCard: QuestCard, StoryLine: StoryLine, PartyBar: PartyBar, ChoiceCard: ChoiceCard, DiceRoll: DiceRoll, EndScreen: EndScreen,
    CLASSES: CLASSES
  });
})();
