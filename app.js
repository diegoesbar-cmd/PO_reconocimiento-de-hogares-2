(() => {
  'use strict';

  // ======================================================================
  //  Configuración
  // ======================================================================
  const APP_VERSION = '2.0.0';
  const MAX_REPEAT = 25;                       // máximo de registros por bloque repetido
  const DB_NAME = 'OfflineSurveysDB';
  const DB_VERSION = 2;
  const LS_URL = 'gas_survey_endpoint';
  const LS_TOKEN = 'gas_survey_token';
  const LS_REMEMBER = 'hogares_recordar';

  // Nombres de campos del cuestionario que la app usa para comodidad (todos opcionales).
  const ID_FIELD = 'hogar_id';                 // identificador del hogar (aviso de duplicados)
  const DATE_FIELD = 'fecha_visita';           // se precarga con la fecha de hoy
  const TIME_FIELD = 'hora_visita';            // se precarga con la hora actual
  const REMEMBER = ['investigador', 'municipio', 'localidad']; // se recuerdan en este teléfono
  const DECLARED = { integrantes: 'numero_integrantes' };      // bloque repetido -> campo con el total declarado
  const SUMMARY_FIELDS = ['nombre_iniciales', 'parentesco', 'sexo', 'edad']; // resumen en cada tarjeta
  const URGENT_RE = /urgencia/i;               // las notas cuyo nombre coincide se muestran como alerta roja
  const PREFILLED = [DATE_FIELD, TIME_FIELD].concat(REMEMBER);

  const Q = window.CUESTIONARIO;
  const $ = (id) => document.getElementById(id);

  // ======================================================================
  //  Utilidades
  // ======================================================================
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function p2(n) { return String(n).padStart(2, '0'); }
  function todayLocal() { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; }
  function nowLocalTime() { const d = new Date(); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; }

  function uuid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  function toast(msg, type) {
    const t = el('div', 'toast' + (type ? ' ' + type : ''), msg);
    $('toasts').appendChild(t);
    setTimeout(() => t.remove(), type === 'err' ? 8000 : 4500);
  }

  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (_) { return false; } }

  function isEmpty(v) {
    return v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v));
  }

  // ======================================================================
  //  Índices del cuestionario
  // ======================================================================
  const qdef = {};                 // nombre -> definición
  const qtype = {};                // nombre -> tipo
  const repDefs = [];              // bloques repetidos
  const topFlat = [];              // preguntas/cálculos fuera de bloques repetidos
  const repFlat = {};              // bloque -> preguntas/cálculos dentro
  const urgentNotes = new Set();   // notas de urgencia

  function indexItems(items, repName) {
    items.forEach((q) => {
      qdef[q.name] = q;
      qtype[q.name] = q.type;
      if (q.type === 'group') { indexItems(q.items, repName); return; }
      if (q.type === 'repeat') {
        repDefs.push(q);
        repFlat[q.name] = [];
        indexItems(q.items, q.name);
        return;
      }
      if (q.type === 'note') { if (URGENT_RE.test(q.name)) urgentNotes.add(q.name); return; }
      (repName ? repFlat[repName] : topFlat).push(q);
    });
  }

  if (Q) Q.pasos.forEach((p) => indexItems(p.items, null));
  const REVIEW = Q ? Q.pasos.length : 0;     // índice del paso final (revisión)

  // ======================================================================
  //  Intérprete de expresiones XLSForm  (relevant / constraint / calculation)
  // ======================================================================
  const FN = {
    iff: (a, b, c) => (a ? b : c),
    cs: (s) => { s = String(s == null ? '' : s).trim(); return s ? s.split(/\s+/).length : 0; },
    sel: (s, v) => String(s == null ? '' : s).split(/\s+/).indexOf(String(v)) !== -1,
    rx: (s, p) => { try { return new RegExp(p).test(String(s == null ? '' : s)); } catch (_) { return true; } },
    concat: (...a) => a.map((x) => (x == null ? '' : x)).join(''),
    slen: (s) => String(s == null ? '' : s).length,
    today: () => todayLocal(),
    now: () => new Date().toISOString(),
    int: (n) => Math.trunc(Number(n)),
    round: (n, d) => { const f = Math.pow(10, d || 0); return Math.round(Number(n) * f) / f; },
    num: (n) => Number(n),
    str: (n) => String(n == null ? '' : n),
    not: (b) => !b,
    t: () => true,
    f: () => false
  };

  const FN_MAP = {
    'if': 'c.iff', 'count-selected': 'c.cs', 'selected': 'c.sel', 'regex': 'c.rx', 'concat': 'c.concat',
    'string-length': 'c.slen', 'today': 'c.today', 'now': 'c.now', 'int': 'c.int', 'round': 'c.round',
    'number': 'c.num', 'string': 'c.str', 'not': 'c.not', 'true': 'c.t', 'false': 'c.f'
  };

  function translate(src) {
    src = src.replace(/position\(\s*\.\.\s*\)/g, '__POS__');
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (/\s/.test(ch)) { out += ' '; i++; continue; }
      if (ch === '$' && src[i + 1] === '{') {
        const j = src.indexOf('}', i);
        if (j < 0) throw new Error('Falta } en ' + src);
        out += 'c.v(' + JSON.stringify(src.slice(i + 2, j).trim()) + ')';
        i = j + 1; continue;
      }
      if (ch === "'" || ch === '"') {
        const j = src.indexOf(ch, i + 1);
        if (j < 0) throw new Error('Texto sin cerrar en ' + src);
        out += JSON.stringify(src.slice(i + 1, j));
        i = j + 1; continue;
      }
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
        out += m[0]; i += m[0].length; continue;
      }
      if (ch === '.') {
        if (src[i + 1] === '.') throw new Error('«..» no soportado en ' + src);
        out += 'c.cur'; i++; continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        const m = /^[A-Za-z_][A-Za-z0-9_-]*/.exec(src.slice(i));
        let name = m[0];
        // un guion final pegado a un operador no es parte del nombre (p. ej. "a -")
        while (name.endsWith('-')) name = name.slice(0, -1);
        i += name.length;
        if (name === '__POS__') { out += 'c.pos()'; continue; }
        if (name === 'and') { out += ' && '; continue; }
        if (name === 'or') { out += ' || '; continue; }
        if (name === 'div') { out += ' / '; continue; }
        if (name === 'mod') { out += ' % '; continue; }
        if (/^\s*\(/.test(src.slice(i))) {
          if (!FN_MAP[name]) throw new Error('Función no soportada: ' + name + '()');
          out += FN_MAP[name]; continue;
        }
        throw new Error('Palabra no reconocida «' + name + '» en ' + src);
      }
      const two = src.slice(i, i + 2);
      if (two === '!=' || two === '>=' || two === '<=') { out += two; i += 2; continue; }
      if (ch === '=') { out += '=='; i++; continue; }
      if ('<>+-*(),'.indexOf(ch) >= 0) { out += ch; i++; continue; }
      throw new Error('Carácter no soportado «' + ch + '» en ' + src);
    }
    return out;
  }

  const exprCache = {};
  function compile(src) {
    if (exprCache[src]) return exprCache[src];
    let fn;
    try {
      fn = new Function('c', '"use strict"; return (' + translate(src) + ');');
    } catch (err) {
      console.error('Expresión inválida:', src, err);
      fn = () => { throw err; };
    }
    exprCache[src] = fn;
    return fn;
  }

  function run(src, ctx, dflt) {
    try { return compile(src)(ctx); } catch (err) { console.warn('Error evaluando', src, err); return dflt; }
  }

  function makeCtx(out, raw, parent, position) {
    const ctx = Object.assign({ out, raw, parent, cur: '' }, FN);
    ctx.pos = () => position;
    ctx.v = (n) => {
      let val;
      if (n in out.val) val = out.val[n];
      else if (parent && n in parent.out.val) val = parent.out.val[n];
      else if (n in raw) val = raw[n];
      else if (parent && n in parent.raw) val = parent.raw[n];
      if (val === undefined || val === null) val = '';
      const t = qtype[n];
      if (t === 'integer' || t === 'decimal') return val === '' ? NaN : Number(val);
      return val;
    };
    return ctx;
  }

  // ======================================================================
  //  Estado y evaluación (saltos, cálculos)
  // ======================================================================
  const state = { step: 0, answers: {}, reps: {}, nextUid: 1, ev: null };
  let db = null;
  let cfg = { url: '', token: '' };
  let syncing = false;
  let saving = false;
  let draftTimer = null;
  let suspendDraft = false;
  let lastTabsKey = '';

  function newMember() { return { uid: state.nextUid++ }; }

  function freshState() {
    state.step = 0;
    state.nextUid = 1;
    state.answers = {};
    state.reps = {};
    repDefs.forEach((r) => { state.reps[r.name] = [newMember()]; });
    if (Q.meta.inicio) state.answers[Q.meta.inicio] = new Date().toISOString();
    if (qdef[DATE_FIELD]) state.answers[DATE_FIELD] = todayLocal();
    if (qdef[TIME_FIELD]) state.answers[TIME_FIELD] = nowLocalTime();
    let mem = {};
    try { mem = JSON.parse(lsGet(LS_REMEMBER) || '{}') || {}; } catch (_) { mem = {}; }
    REMEMBER.forEach((k) => { if (qdef[k] && mem[k]) state.answers[k] = mem[k]; });
  }

  function truthy(v) { return !!v && !(typeof v === 'number' && isNaN(v)); }

  function evalItems(items, parentRel, ctx, ev, st) {
    items.forEach((q) => {
      const r = parentRel && (q.relevant ? truthy(run(q.relevant, ctx, true)) : true);
      ctx.out.rel[q.name] = r;
      if (q.type === 'group') { evalItems(q.items, r, ctx, ev, st); return; }
      if (q.type === 'repeat') {
        if (r && st) st.any = true;
        (state.reps[q.name] || []).forEach((m, idx) => {
          const out = { rel: {}, val: {} };
          const mctx = makeCtx(out, m, ctx, idx + 1);
          ev.rep[m.uid] = { out, ctx: mctx };
          evalItems(q.items, r, mctx, ev, null);
        });
        return;
      }
      if (q.type === 'calculate') {
        let val = '';
        if (r) {
          val = run(q.calc, ctx, '');
          if (typeof val === 'boolean') val = val ? 1 : 0;
          if (typeof val === 'number' && !isFinite(val)) val = '';
        }
        ctx.out.val[q.name] = val;
        return;
      }
      if (r && st) st.any = true;
      if (q.type === 'note') return;
      let val = r ? ctx.raw[q.name] : '';
      if (val === undefined || val === null) val = '';
      ctx.out.val[q.name] = val;
    });
  }

  function evaluate() {
    const out = { rel: {}, val: {} };
    const topCtx = makeCtx(out, state.answers, null, 0);
    const ev = { top: out, topCtx, rep: {}, steps: [] };
    Q.pasos.forEach((p) => {
      const st = { rel: p.relevant ? truthy(run(p.relevant, topCtx, true)) : true, any: false };
      evalItems(p.items, st.rel, topCtx, ev, st);
      ev.steps.push(st);
    });
    return ev;
  }

  function visibleSteps(ev) {
    const v = [];
    Q.pasos.forEach((p, i) => { if (ev.steps[i].rel && (i === 0 || ev.steps[i].any)) v.push(i); });
    v.push(REVIEW);
    return v;
  }

  function stepTitle(i) { return i === REVIEW ? 'Revisión y guardado' : Q.pasos[i].titulo; }

  // ======================================================================
  //  Validación
  // ======================================================================
  function validateQuestion(q, ctx, skipRequired) {
    const val = ctx.out.val[q.name];
    if (isEmpty(val)) return (q.required && !skipRequired) ? 'Esta pregunta es obligatoria.' : '';
    if (q.type === 'integer' && !Number.isInteger(Number(val))) return 'Ingrese un número entero.';
    if ((q.type === 'integer' || q.type === 'decimal') && isNaN(Number(val))) return 'Ingrese un número.';
    if (q.constraint) {
      ctx.cur = (q.type === 'integer' || q.type === 'decimal') ? Number(val) : val;
      const ok = truthy(run(q.constraint, ctx, true));
      ctx.cur = '';
      if (!ok) return q.constraintMsg || 'Respuesta no válida.';
    }
    return '';
  }

  function validateItems(items, si, ctx, ev, errs, repInfo) {
    items.forEach((q) => {
      if (!ctx.out.rel[q.name]) return;
      if (q.type === 'group') { validateItems(q.items, si, ctx, ev, errs, repInfo); return; }
      if (q.type === 'repeat') {
        const list = state.reps[q.name] || [];
        if (q.required && list.length === 0) {
          errs.push({ si, scope: 'top', name: q.name, label: q.label, msg: 'Agregue al menos un registro.' });
        }
        list.forEach((m, idx) => {
          validateItems(q.items, si, ev.rep[m.uid].ctx, ev, errs, { rep: q, uid: m.uid, idx });
        });
        return;
      }
      if (q.type === 'note' || q.type === 'calculate') return;
      const msg = validateQuestion(q, ctx, false);
      if (msg) {
        errs.push({
          si, scope: repInfo ? String(repInfo.uid) : 'top', name: q.name, label: q.label, msg,
          who: repInfo ? memberName(repInfo.rep, repInfo.idx, ev.rep[repInfo.uid].out.val) : ''
        });
      }
    });
  }

  function validateAll(ev) {
    const errs = [];
    Q.pasos.forEach((p, si) => {
      if (!ev.steps[si].rel) return;
      validateItems(p.items, si, ev.topCtx, ev, errs, null);
    });
    return errs;
  }

  function memberName(rep, idx, vals) {
    const nm = vals && vals.nombre_iniciales ? String(vals.nombre_iniciales).trim() : '';
    return `${rep.label} ${idx + 1}` + (nm ? ` (${nm})` : '');
  }

  // ======================================================================
  //  Construcción de la interfaz
  // ======================================================================
  const host = () => $('stepsHost');

  function rawFor(scope) {
    if (scope === 'top') return state.answers;
    for (const k of Object.keys(state.reps)) {
      const m = state.reps[k].find((x) => String(x.uid) === scope);
      if (m) return m;
    }
    return null;
  }

  function listaOpts(name) { return (Q.listas && Q.listas[name]) || []; }

  function buildQuestion(q, scope, raw) {
    const w = el('div', 'q');
    w.dataset.q = q.name; w.dataset.scope = scope; w.dataset.type = q.type;
    const base = `${scope}__${q.name}`;
    const grouped = q.type === 'select_one' || q.type === 'select_multiple';
    const lab = el(grouped ? 'span' : 'label', 'qlabel', q.label);
    lab.id = base + '_l';
    if (!grouped) lab.htmlFor = base;
    if (q.required) { const s = el('span', 'req', '*'); s.setAttribute('aria-hidden', 'true'); lab.appendChild(s); }
    w.appendChild(lab);
    if (q.hint) w.appendChild(el('p', 'qhint', q.hint));

    const val = raw[q.name];
    let ctl;
    switch (q.type) {
      case 'text': {
        if (q.multiline) { ctl = el('textarea'); ctl.rows = 3; }
        else {
          ctl = el('input'); ctl.type = 'text';
          if (/telefono/i.test(q.name)) ctl.setAttribute('inputmode', 'tel');
        }
        ctl.id = base; ctl.value = isEmpty(val) ? '' : String(val);
        break;
      }
      case 'integer': case 'decimal': {
        ctl = el('input'); ctl.type = 'number'; ctl.id = base;
        ctl.setAttribute('inputmode', q.type === 'integer' ? 'numeric' : 'decimal');
        ctl.step = q.type === 'integer' ? '1' : 'any';
        ctl.value = isEmpty(val) ? '' : String(val);
        break;
      }
      case 'date': { ctl = el('input'); ctl.type = 'date'; ctl.id = base; ctl.value = isEmpty(val) ? '' : String(val); break; }
      case 'time': { ctl = el('input'); ctl.type = 'time'; ctl.id = base; ctl.value = isEmpty(val) ? '' : String(val); break; }
      case 'select_one': {
        const opts = listaOpts(q.list);
        if (opts.length <= 6) {
          ctl = el('div', 'opts'); ctl.setAttribute('role', 'radiogroup'); ctl.setAttribute('aria-labelledby', lab.id);
          opts.forEach(([v, l]) => {
            const lb = el('label', 'opt'); const inp = el('input'); inp.type = 'radio'; inp.name = base; inp.value = v;
            inp.checked = String(val) === v; lb.appendChild(inp); lb.appendChild(el('span', null, l)); ctl.appendChild(lb);
          });
        } else {
          ctl = el('select'); ctl.id = base;
          const o0 = el('option', null, '-- Seleccionar --'); o0.value = ''; ctl.appendChild(o0);
          opts.forEach(([v, l]) => { const o = el('option', null, l); o.value = v; ctl.appendChild(o); });
          ctl.value = isEmpty(val) ? '' : String(val);
        }
        break;
      }
      case 'select_multiple': {
        const sel = new Set(String(isEmpty(val) ? '' : val).split(/\s+/).filter(Boolean));
        ctl = el('div', 'opts'); ctl.setAttribute('role', 'group'); ctl.setAttribute('aria-labelledby', lab.id);
        listaOpts(q.list).forEach(([v, l]) => {
          const lb = el('label', 'opt'); const inp = el('input'); inp.type = 'checkbox'; inp.value = v;
          inp.checked = sel.has(v); lb.appendChild(inp); lb.appendChild(el('span', null, l)); ctl.appendChild(lb);
        });
        break;
      }
      default: ctl = el('input'); ctl.type = 'text'; ctl.id = base;
    }
    w.appendChild(ctl);
    const err = el('p', 'qerr'); err.hidden = true; err.setAttribute('role', 'alert'); w.appendChild(err);
    return w;
  }

  function buildItem(q, scope, raw) {
    if (q.type === 'calculate') return null;
    if (q.type === 'note') {
      const n = el('div', 'q qnote' + (URGENT_RE.test(q.name) ? ' alert' : ''), q.label);
      n.dataset.q = q.name; n.dataset.scope = scope; n.dataset.type = 'note';
      if (URGENT_RE.test(q.name)) n.setAttribute('role', 'alert');
      return n;
    }
    if (q.type === 'group') {
      const f = el('fieldset', 'group'); f.dataset.q = q.name; f.dataset.scope = scope; f.dataset.type = 'group';
      f.appendChild(el('legend', null, q.label));
      if (q.hint) f.appendChild(el('p', 'qhint', q.hint));
      q.items.forEach((c) => { const x = buildItem(c, scope, raw); if (x) f.appendChild(x); });
      return f;
    }
    if (q.type === 'repeat') return buildRepeat(q);
    return buildQuestion(q, scope, raw);
  }

  function buildMember(rep, m) {
    const d = el('details', 'member'); d.dataset.uid = String(m.uid); d.dataset.rep = rep.name;
    const s = el('summary'); s.appendChild(el('span', 'member-title', rep.label)); s.appendChild(el('span', 'member-sum', ''));
    d.appendChild(s);
    const body = el('div', 'member-body');
    rep.items.forEach((c) => { const x = buildItem(c, String(m.uid), m); if (x) body.appendChild(x); });
    const foot = el('div', 'member-foot');
    const del = el('button', 'btn btn-danger', 'Eliminar este registro'); del.type = 'button';
    del.dataset.action = 'rm-member'; del.dataset.uid = String(m.uid); del.dataset.rep = rep.name;
    foot.appendChild(del); body.appendChild(foot);
    d.appendChild(body);
    return d;
  }

  function buildRepeat(rep) {
    const box = el('div', 'repeat'); box.dataset.q = rep.name; box.dataset.scope = 'top'; box.dataset.type = 'repeat';
    const head = el('div', 'rep-head');
    const cnt = el('span', 'rep-count'); cnt.dataset.count = rep.name; head.appendChild(cnt);
    box.appendChild(head);
    if (rep.hint) box.appendChild(el('p', 'qhint', rep.hint));
    const err = el('p', 'qerr'); err.hidden = true; err.dataset.repErr = rep.name; box.appendChild(err);
    const list = el('div', 'rep-list'); list.dataset.list = rep.name;
    (state.reps[rep.name] || []).forEach((m) => list.appendChild(buildMember(rep, m)));
    box.appendChild(list);
    const add = el('button', 'btn btn-dark', '+ Agregar ' + rep.label.toLowerCase()); add.type = 'button';
    add.dataset.action = 'add-member'; add.dataset.rep = rep.name; add.dataset.addbtn = rep.name;
    box.appendChild(add);
    return box;
  }

  function buildAll() {
    const h = host();
    h.innerHTML = '';
    Q.pasos.forEach((p, i) => {
      const sec = el('section', 'step card'); sec.dataset.step = String(i); sec.hidden = true;
      const head = el('div', 'card-head'); head.appendChild(el('h2', null, p.titulo));
      head.appendChild(el('span', 'tag', 'Sección ' + (i + 1)));
      sec.appendChild(head);
      if (p.hint) sec.appendChild(el('p', 'qhint', p.hint));
      p.items.forEach((q) => { const x = buildItem(q, 'top', state.answers); if (x) sec.appendChild(x); });
      h.appendChild(sec);
    });
    const rv = el('section', 'step card review'); rv.dataset.step = String(REVIEW); rv.hidden = true; rv.id = 'reviewSec';
    h.appendChild(rv);
  }

  // ======================================================================
  //  Aplicar el estado a la pantalla
  // ======================================================================
  function applyVisibility(ev) {
    host().querySelectorAll('[data-q]').forEach((e) => {
      const sc = e.dataset.scope;
      const out = sc === 'top' ? ev.top : (ev.rep[sc] && ev.rep[sc].out);
      if (!out) return;
      e.hidden = !out.rel[e.dataset.q];
    });
  }

  function labelOf(list, v) {
    const f = listaOpts(list).find((x) => x[0] === v);
    return f ? f[1] : v;
  }

  function updateRepeatUI(ev) {
    repDefs.forEach((rep) => {
      const list = state.reps[rep.name] || [];
      const cnt = host().querySelector(`[data-count="${rep.name}"]`);
      if (cnt) {
        const declared = ev.top.val[DECLARED[rep.name]];
        let txt = `Registrados: ${list.length}`;
        let warn = false;
        if (!isEmpty(declared) && !isNaN(Number(declared))) {
          txt += ` de ${declared} declarados`;
          warn = Number(declared) !== list.length;
        }
        cnt.textContent = txt; cnt.classList.toggle('warn', warn);
      }
      const add = host().querySelector(`[data-addbtn="${rep.name}"]`);
      if (add) add.disabled = list.length >= MAX_REPEAT;
      list.forEach((m, idx) => {
        const d = host().querySelector(`details.member[data-uid="${m.uid}"]`);
        if (!d) return;
        const out = ev.rep[m.uid].out;
        const t = d.querySelector('.member-title');
        t.textContent = `${rep.label} ${idx + 1}`;
        const parts = [];
        SUMMARY_FIELDS.forEach((f) => {
          const v = out.val[f];
          if (isEmpty(v) || !qdef[f]) return;
          const qq = qdef[f];
          let s = qq.list ? labelOf(qq.list, v) : String(v);
          if (f === 'edad') s += ' años';
          parts.push(s);
        });
        d.querySelector('.member-sum').textContent = parts.length ? '· ' + parts.join(' · ') : '';
        let alert = false;
        urgentNotes.forEach((nm) => { if (out.rel[nm]) alert = true; });
        d.classList.toggle('has-alert', alert);
      });
    });
  }

  function renderTabs(ev) {
    const vis = visibleSteps(ev);
    const key = vis.join(',') + '|' + state.step;
    if (key === lastTabsKey) return;
    lastTabsKey = key;
    const tabs = $('tabs');
    tabs.innerHTML = '';
    vis.forEach((si, n) => {
      const b = el('button', 'tab' + (si === state.step ? ' is-active' : ''), `${n + 1}. ${stepTitle(si)}`);
      b.type = 'button'; b.dataset.goto = String(si);
      tabs.appendChild(b);
    });
    const act = tabs.querySelector('.is-active');
    if (act && act.scrollIntoView) { try { act.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (_) { /* nada */ } }
  }

  function updateProgress(ev) {
    const vis = visibleSteps(ev);
    const idx = Math.max(0, vis.indexOf(state.step));
    const pct = Math.round(((idx + 1) / vis.length) * 100);
    $('progressBar').style.width = pct + '%';
    $('stepPercent').textContent = pct + '%';
    $('stepLabel').textContent = `Paso ${idx + 1} de ${vis.length}: ${stepTitle(state.step)}`;
    $('btnPrev').hidden = idx === 0;
    $('btnNext').hidden = state.step === REVIEW;
  }

  function refresh() {
    const ev = evaluate();
    state.ev = ev;
    applyVisibility(ev);
    updateRepeatUI(ev);
    renderTabs(ev);
    updateProgress(ev);
    return ev;
  }

  // ======================================================================
  //  Errores en pantalla
  // ======================================================================
  function widgetOf(scope, name) {
    return host().querySelector(`[data-q="${name}"][data-scope="${scope}"]`);
  }

  function setWidgetError(w, msg) {
    if (!w) return;
    const e = w.querySelector('.qerr');
    w.classList.toggle('has-error', !!msg);
    if (e) { e.textContent = msg || ''; e.hidden = !msg; }
  }

  function clearErrors() {
    host().querySelectorAll('.has-error').forEach((e) => e.classList.remove('has-error'));
    host().querySelectorAll('.qerr').forEach((e) => { e.hidden = true; e.textContent = ''; });
  }

  function showErrors(errs) {
    clearErrors();
    errs.forEach((er) => {
      if (er.scope === 'top' && qdef[er.name] && qdef[er.name].type === 'repeat') {
        const e = host().querySelector(`[data-rep-err="${er.name}"]`);
        if (e) { e.textContent = er.msg; e.hidden = false; }
        return;
      }
      const w = widgetOf(er.scope, er.name);
      setWidgetError(w, er.msg);
      if (er.scope !== 'top') {
        const d = host().querySelector(`details.member[data-uid="${er.scope}"]`);
        if (d) { d.open = true; d.classList.add('has-error'); }
      }
    });
    const first = errs[0];
    if (first) focusWidget(first.scope, first.name);
  }

  function focusWidget(scope, name) {
    const w = widgetOf(scope, name);
    if (!w) return;
    if (scope !== 'top') {
      const d = host().querySelector(`details.member[data-uid="${scope}"]`);
      if (d) d.open = true;
    }
    try { w.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) { /* nada */ }
    const i = w.querySelector('input,select,textarea');
    if (i) { try { i.focus({ preventScroll: true }); } catch (_) { /* nada */ } }
  }

  // ======================================================================
  //  Lectura de campos
  // ======================================================================
  function readWidget(w) {
    switch (w.dataset.type) {
      case 'select_one': {
        const r = w.querySelector('input[type=radio]:checked');
        if (r) return r.value;
        const s = w.querySelector('select');
        return s ? s.value : '';
      }
      case 'select_multiple':
        return Array.from(w.querySelectorAll('input[type=checkbox]:checked')).map((i) => i.value).join(' ');
      case 'integer': case 'decimal': {
        const i = w.querySelector('input');
        if (!i || i.value === '') return '';
        const n = Number(i.value);
        return isNaN(n) ? '' : n;
      }
      default: {
        const i = w.querySelector('input,textarea');
        return i ? i.value : '';
      }
    }
  }

  function onEdit(e) {
    const w = e.target.closest && e.target.closest('.q[data-q]');
    if (!w || w.dataset.type === 'note') return;
    const raw = rawFor(w.dataset.scope);
    if (!raw) return;
    raw[w.dataset.q] = readWidget(w);
    setWidgetError(w, '');
    const ev = refresh();
    if (e.type === 'change') {
      const ctx = w.dataset.scope === 'top' ? ev.topCtx : (ev.rep[w.dataset.scope] && ev.rep[w.dataset.scope].ctx);
      const q = qdef[w.dataset.q];
      if (ctx && q && ctx.out.rel[q.name]) setWidgetError(w, validateQuestion(q, ctx, true));
    }
    scheduleDraft();
  }

  // ======================================================================
  //  Navegación
  // ======================================================================
  function showStep(i, noScroll) {
    state.step = i;
    host().querySelectorAll('section.step').forEach((s) => { s.hidden = Number(s.dataset.step) !== i; });
    const ev = refresh();
    if (i === REVIEW) renderReview(ev);
    if (!noScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    scheduleDraft();
  }

  function goNext() {
    const ev = refresh();
    const errs = validateAll(ev).filter((x) => x.si === state.step);
    if (errs.length) { showErrors(errs); toast(`Faltan ${errs.length} respuesta(s) por completar o corregir.`, 'err'); return; }
    clearErrors();
    const vis = visibleSteps(ev);
    const nxt = vis.find((s) => s > state.step);
    if (nxt != null) showStep(nxt);
  }

  function goPrev() {
    clearErrors();
    const ev = refresh();
    const vis = visibleSteps(ev).filter((s) => s < state.step);
    if (vis.length) showStep(vis[vis.length - 1]);
  }

  function goTab(target) {
    if (target === state.step) return;
    if (target > state.step) {
      const ev = refresh();
      const errs = validateAll(ev).filter((x) => x.si === state.step);
      if (errs.length) { showErrors(errs); toast('Completa esta sección antes de avanzar.', 'err'); return; }
    }
    clearErrors();
    showStep(target);
  }

  // ======================================================================
  //  Integrantes (bloques repetidos)
  // ======================================================================
  function addMember(repName) {
    const rep = repDefs.find((r) => r.name === repName);
    if (!rep) return;
    if (state.reps[repName].length >= MAX_REPEAT) { toast(`Máximo ${MAX_REPEAT} registros.`, 'err'); return; }
    const m = newMember();
    state.reps[repName].push(m);
    const d = buildMember(rep, m);
    d.open = true;
    host().querySelector(`[data-list="${repName}"]`).appendChild(d);
    refresh();
    scheduleDraft();
    try { d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) { /* nada */ }
  }

  function removeMember(repName, uid) {
    const list = state.reps[repName];
    const idx = list.findIndex((m) => String(m.uid) === String(uid));
    if (idx < 0) return;
    const m = list[idx];
    const hasData = Object.keys(m).some((k) => k !== 'uid' && !isEmpty(m[k]));
    if (hasData && !confirm('¿Eliminar este registro con todo lo capturado?')) return;
    list.splice(idx, 1);
    const d = host().querySelector(`details.member[data-uid="${uid}"]`);
    if (d) d.remove();
    refresh();
    scheduleDraft();
  }

  // ======================================================================
  //  Revisión final
  // ======================================================================
  function renderReview(ev) {
    const errs = validateAll(ev);
    const sec = $('reviewSec');
    let h = '<div class="card-head"><h2>Revisión y guardado</h2><span class="tag">Cierre</span></div>';

    const idv = ev.top.val[ID_FIELD];
    const fv = ev.top.val[DATE_FIELD];
    h += `<p><strong>${esc(qdef[ID_FIELD] ? qdef[ID_FIELD].label : 'ID')}:</strong> ${esc(isEmpty(idv) ? '(sin capturar)' : idv)}`;
    if (!isEmpty(fv)) h += ` · ${esc(fv)}`;
    h += '</p>';

    // Alertas de urgencia (notas rojas visibles)
    const alerts = [];
    urgentNotes.forEach((nm) => {
      if (ev.top.rel[nm]) alerts.push({ who: '', text: qdef[nm].label });
    });
    repDefs.forEach((rep) => {
      (state.reps[rep.name] || []).forEach((m, idx) => {
        const out = ev.rep[m.uid].out;
        urgentNotes.forEach((nm) => {
          if (out.rel[nm]) alerts.push({ who: memberName(rep, idx, out.val), text: qdef[nm].label });
        });
      });
    });
    if (alerts.length) {
      h += '<div class="alertbox">⚠ Alertas de urgencia registradas:<ul>' +
        alerts.map((a) => `<li>${a.who ? '<strong>' + esc(a.who) + ':</strong> ' : ''}${esc(a.text)}</li>`).join('') + '</ul></div>';
    }

    // Resumen de integrantes y aviso de diferencia con el total declarado
    repDefs.forEach((rep) => {
      const list = state.reps[rep.name] || [];
      const declared = ev.top.val[DECLARED[rep.name]];
      if (ev.top.rel[rep.name]) {
        h += `<h3>${esc(rep.label)}: ${list.length} registrado(s)</h3>`;
        if (!isEmpty(declared) && Number(declared) !== list.length) {
          h += `<div class="warnbox">Declaraste ${esc(declared)} integrantes pero hay ${list.length} registrados. Verifica antes de guardar.</div>`;
        }
        h += '<ul>' + list.map((m, idx) => {
          const out = ev.rep[m.uid].out;
          const bits = SUMMARY_FIELDS.map((f) => {
            const v = out.val[f];
            if (isEmpty(v) || !qdef[f]) return '';
            return qdef[f].list ? labelOf(qdef[f].list, v) : (f === 'edad' ? v + ' años' : v);
          }).filter(Boolean);
          return `<li>${esc(memberName(rep, idx, out.val))}${bits.length ? ' · ' + esc(bits.join(' · ')) : ''}</li>`;
        }).join('') + '</ul>';
      }
    });

    if (errs.length) {
      h += `<h3>Faltan ${errs.length} respuesta(s) por completar o corregir</h3><ul>`;
      errs.forEach((er, n) => {
        h += `<li>${esc(er.label)}${er.who ? ' <small>(' + esc(er.who) + ')</small>' : ''} — ${esc(er.msg)}` +
          ` <button type="button" class="linkgo" data-action="go" data-n="${n}">Ir</button></li>`;
      });
      h += '</ul>';
    } else {
      h += '<div class="ok">✓ Todo completo. Puedes guardar la encuesta.</div>';
    }

    h += '<div class="review-actions">' +
      `<button type="button" class="btn btn-primary" data-action="save"${errs.length ? ' disabled' : ''}>Guardar encuesta</button>` +
      (errs.length ? '<button type="button" class="btn btn-soft" data-action="save-inc">Guardar como incompleta</button>' : '') +
      '</div>';
    sec.innerHTML = h;
    sec._errs = errs;
  }

  // ======================================================================
  //  Guardar encuesta
  // ======================================================================
  function cleanVal(v, q) {
    if (isEmpty(v)) return '';
    if (q && (q.type === 'integer' || q.type === 'decimal')) return Number(v);
    if (typeof v === 'string') return v.trim();
    return v;
  }

  function buildRecord(ev, estado) {
    const answers = {};
    if (Q.meta.inicio) answers[Q.meta.inicio] = state.answers[Q.meta.inicio] || '';
    if (Q.meta.fin) answers[Q.meta.fin] = new Date().toISOString();
    topFlat.forEach((q) => { answers[q.name] = cleanVal(ev.top.val[q.name], q); });
    const repeats = {};
    repDefs.forEach((rep) => {
      repeats[rep.name] = ev.top.rel[rep.name] === false ? [] : (state.reps[rep.name] || []).map((m) => {
        const o = {};
        repFlat[rep.name].forEach((q) => { o[q.name] = cleanVal(ev.rep[m.uid].out.val[q.name], q); });
        return o;
      });
    });
    return {
      id: uuid(),
      timestamp: new Date().toISOString(),
      appVersion: APP_VERSION,
      formId: Q.meta.formId,
      formVersion: Q.meta.version,
      estado,
      answers,
      repeats,
      synced: false
    };
  }

  async function saveSurvey(incomplete) {
    if (saving) return;
    saving = true;
    try {
      try { await ensureDB(); } catch (err) {
        toast('El almacenamiento local no está disponible; no se puede guardar. ' + (err && err.message ? err.message : ''), 'err');
        return;
      }
      const ev = refresh();
      const errs = validateAll(ev);
      if (!incomplete && errs.length) { renderReview(ev); toast('Aún hay respuestas pendientes.', 'err'); return; }
      if (incomplete && !confirm('Se guardará como INCOMPLETA y se enviará así a la hoja. ¿Continuar?')) return;

      const rec = buildRecord(ev, incomplete ? 'incompleta' : 'completa');
      const hid = String(rec.answers[ID_FIELD] || '').trim();
      try {
        const all = await getAllSurveys();
        if (hid && all.some((x) => x.answers && String(x.answers[ID_FIELD] || '') === hid) &&
            !confirm(`Ya hay una encuesta con el ID ${hid} en este dispositivo.\n\n¿Guardar de todos modos?`)) {
          return;
        }
        await addSurvey(rec);
      } catch (err) {
        console.error(err);
        toast('No se pudo guardar la encuesta: ' + (err && err.message ? err.message : err) +
          '. Tus datos siguen en pantalla: no cierres esta página, pulsa de nuevo «Guardar» o avisa al coordinador.', 'err');
        return;
      }

      const mem = {};
      REMEMBER.forEach((k) => { if (qdef[k] && !isEmpty(state.answers[k])) mem[k] = state.answers[k]; });
      lsSet(LS_REMEMBER, JSON.stringify(mem));
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

      await resetForm();
      await refreshPending();
      toast(`Encuesta ${hid || '(sin ID)'} guardada en este dispositivo${incomplete ? ' como incompleta' : ''}.`, 'ok');
      syncPending();
    } finally {
      saving = false;
    }
  }

  async function resetForm() {
    suspendDraft = true;
    clearTimeout(draftTimer);
    try {
      freshState();
      buildAll();
      lastTabsKey = '';
      showStep(0, false);
      try { await deleteMeta('draft'); } catch (_) { /* no crítico */ }
    } finally {
      suspendDraft = false;
    }
  }

  // ======================================================================
  //  IndexedDB (todas las operaciones esperan a que la transacción termine)
  // ======================================================================
  function openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('Este navegador no admite almacenamiento local (IndexedDB).')); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('surveys')) {
          const s = d.createObjectStore('surveys', { keyPath: 'id' });
          s.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('No se pudo abrir la base de datos local.'));
      req.onblocked = () => reject(new Error('La base de datos está bloqueada por otra pestaña. Ciérrala e intenta de nuevo.'));
    });
  }

  function attachDB(d) {
    d.onclose = () => { if (db === d) db = null; };
    d.onversionchange = () => { try { d.close(); } catch (_) { /* nada */ } if (db === d) db = null; };
    return d;
  }

  async function ensureDB() {
    if (!db) db = attachDB(await openDB());
    return db;
  }

  async function newTx(store, mode) {
    const d = await ensureDB();
    try {
      return d.transaction(store, mode);
    } catch (err) {
      if (err && err.name === 'InvalidStateError') {
        try { d.close(); } catch (_) { /* nada */ }
        if (db === d) db = null;
        const d2 = await ensureDB();
        return d2.transaction(store, mode);
      }
      throw err;
    }
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Error de transacción'));
      tx.onabort = () => reject(tx.error || new Error('Transacción cancelada'));
    });
  }

  function reqResult(req) {
    return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
  }

  async function addSurvey(rec) { const tx = await newTx('surveys', 'readwrite'); tx.objectStore('surveys').add(rec); await txDone(tx); }
  async function getAllSurveys() { const tx = await newTx('surveys', 'readonly'); return (await reqResult(tx.objectStore('surveys').getAll())) || []; }
  async function deleteSurvey(id) { const tx = await newTx('surveys', 'readwrite'); tx.objectStore('surveys').delete(id); await txDone(tx); }
  async function putMeta(rec) { const tx = await newTx('meta', 'readwrite'); tx.objectStore('meta').put(rec); await txDone(tx); }
  async function getMeta(key) { const tx = await newTx('meta', 'readonly'); return reqResult(tx.objectStore('meta').get(key)); }
  async function deleteMeta(key) { const tx = await newTx('meta', 'readwrite'); tx.objectStore('meta').delete(key); await txDone(tx); }

  async function markSynced(id) {
    const tx = await newTx('surveys', 'readwrite');
    const st = tx.objectStore('surveys');
    const g = st.get(id);
    g.onsuccess = () => {
      const rec = g.result;
      if (rec) { rec.synced = true; rec.syncedAt = new Date().toISOString(); st.put(rec); }
    };
    await txDone(tx);
  }

  // ======================================================================
  //  Borrador automático
  // ======================================================================
  function scheduleDraft() {
    if (suspendDraft) return;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 500);
  }

  async function saveDraft() {
    if (suspendDraft) return;
    try {
      await putMeta({
        key: 'draft', v: 2, formVersion: Q.meta.version, step: state.step,
        answers: state.answers, reps: state.reps, nextUid: state.nextUid, savedAt: Date.now()
      });
    } catch (e) { console.warn('No se pudo guardar el borrador', e); }
  }

  function draftHasContent(d) {
    if (!d || d.v !== 2 || !d.answers) return false;
    const skip = new Set([Q.meta.inicio, Q.meta.fin].concat(PREFILLED));
    const anyTop = Object.keys(d.answers).some((k) => !skip.has(k) && !isEmpty(d.answers[k]));
    const anyRep = Object.keys(d.reps || {}).some((k) => (d.reps[k] || []).some((m) => Object.keys(m).some((f) => f !== 'uid' && !isEmpty(m[f]))));
    return anyTop || anyRep;
  }

  async function restoreDraft() {
    let d;
    try { d = await getMeta('draft'); } catch (_) { return; }
    if (!draftHasContent(d)) return;
    state.answers = d.answers;
    state.reps = {};
    repDefs.forEach((r) => {
      const l = (d.reps && d.reps[r.name]) || [];
      state.reps[r.name] = l.length ? l : [{ uid: d.nextUid || 1 }];
    });
    const maxUid = Math.max(0, ...Object.values(state.reps).flat().map((m) => m.uid));
    state.nextUid = Math.max(d.nextUid || 1, maxUid + 1);
    suspendDraft = true;
    buildAll();
    lastTabsKey = '';
    const ev = refresh();
    const vis = visibleSteps(ev);
    showStep(vis.indexOf(d.step) >= 0 ? d.step : 0, true);
    suspendDraft = false;
    toast('Se recuperó la encuesta que tenías en curso.', 'ok');
  }

  // ======================================================================
  //  Sincronización con Google Sheets (Apps Script)
  // ======================================================================
  function setLog(id, msg, kind) {
    const e = $(id);
    e.hidden = !msg;
    e.textContent = msg || '';
    e.className = 'synclog' + (kind ? ' ' + kind : '');
  }

  function toPayload(s) {
    return {
      id: s.id, timestamp: s.timestamp, appVersion: s.appVersion, formId: s.formId,
      formVersion: s.formVersion, estado: s.estado, answers: s.answers, repeats: s.repeats
    };
  }

  async function postSurvey(survey) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 45000);
    try {
      // Sin cabecera Content-Type personalizada => "solicitud simple", sin preflight CORS
      const resp = await fetch(cfg.url, {
        method: 'POST',
        body: JSON.stringify({ token: cfg.token, survey: toPayload(survey) }),
        redirect: 'follow',
        signal: ctl.signal
      });
      const text = await resp.text();
      try { return JSON.parse(text); } catch (_) {
        throw new Error('Respuesta inesperada. Revisa la URL y que la app web esté publicada con acceso para «Cualquier persona».');
      }
    } finally {
      clearTimeout(timer);
    }
  }

  async function syncPending(manual) {
    if (syncing) return;
    if (!cfg.url) {
      if (manual) { toast('Primero configura la URL de envío.', 'err'); openModal('configModal'); }
      return;
    }
    if (!navigator.onLine) {
      if (manual) toast('Sin conexión a internet. Intenta de nuevo cuando tengas señal.', 'err');
      return;
    }
    syncing = true;
    let ok = 0, fail = 0, lastErr = '';
    try {
      const pending = (await getAllSurveys())
        .filter((s) => !s.synced && s.answers)
        .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
      if (!pending.length) {
        if (manual) setLog('syncLog', 'No hay encuestas pendientes por enviar.', 'ok');
        return;
      }
      setLog('syncLog', `Enviando ${pending.length} encuesta(s)…`);
      for (const s of pending) {
        try {
          const r = await postSurvey(s);
          if (r && (r.status === 'ok' || r.status === 'duplicate')) { await markSynced(s.id); ok++; }
          else {
            fail++;
            lastErr = (r && r.message) || (r && r.status) || 'Error desconocido';
            if (r && r.status === 'unauthorized') break;
          }
        } catch (err) {
          fail++;
          lastErr = err && err.name === 'AbortError' ? 'Tiempo de espera agotado' : (err && err.message) || String(err);
          if (!navigator.onLine) break;
        }
      }
      if (fail === 0) setLog('syncLog', `Listo: ${ok} encuesta(s) enviada(s) a Google Sheets.`, 'ok');
      else {
        setLog('syncLog', `Enviadas: ${ok}. Pendientes por error: ${fail}. Último error: ${lastErr}`, 'err');
        if (manual) toast('No se pudieron enviar todas las encuestas.', 'err');
      }
    } catch (err) {
      console.error(err);
      setLog('syncLog', 'Error al sincronizar: ' + ((err && err.message) || err), 'err');
    } finally {
      syncing = false;
      await refreshPending();
      if (!$('syncModal').hidden) renderSurveyTable();
    }
  }

  // ======================================================================
  //  Lista local
  // ======================================================================
  async function refreshPending() {
    try {
      const all = await getAllSurveys();
      const pend = all.filter((s) => !s.synced && s.answers).length;
      const b = $('pendingBadge');
      b.textContent = pend;
      b.classList.toggle('zero', pend === 0);
      $('syncSummary').textContent = `${all.length} en el dispositivo · ${pend} pendiente(s) de envío · ${all.filter((s) => s.synced).length} enviada(s).`;
    } catch (e) { console.warn(e); }
  }

  function surveyLabel(s) { return s.answers ? (s.answers[ID_FIELD] || '(sin ID)') : (s.folio || '(formato anterior)'); }

  async function renderSurveyTable() {
    const tbody = $('surveyTableBody');
    let rows = [];
    try { rows = await getAllSurveys(); } catch (_) { /* vacío */ }
    if (!rows.length) {
      tbody.innerHTML = '<tr><td class="empty" colspan="5">No hay encuestas guardadas en este dispositivo.</td></tr>';
      return;
    }
    rows.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    tbody.innerHTML = rows.map((s) => {
      const nrep = s.repeats ? Object.keys(s.repeats).reduce((n, k) => n + (s.repeats[k] || []).length, 0) : (s.totalMiembros || 0);
      let st;
      if (!s.answers) st = '<span class="state old">Formato anterior</span>';
      else if (s.synced) st = '<span class="state sent">Enviada</span>';
      else if (s.estado === 'incompleta') st = '<span class="state inc">Incompleta · pendiente</span>';
      else st = '<span class="state pend">Pendiente</span>';
      const fecha = s.answers ? (s.answers[DATE_FIELD] || '') : (s.fecha || '');
      return `<tr><td><strong>${esc(surveyLabel(s))}</strong></td><td>${esc(fecha)}</td><td>${esc(nrep)}</td><td>${st}</td>` +
        `<td><button type="button" class="btn btn-danger" data-action="delete" data-id="${esc(s.id)}">Borrar</button></td></tr>`;
    }).join('');
  }

  async function deleteLocal(id) {
    let rows = [];
    try { rows = await getAllSurveys(); } catch (_) { return; }
    const s = rows.find((x) => x.id === id);
    if (!s) return;
    const lbl = surveyLabel(s);
    const msg = s.synced
      ? `¿Borrar la encuesta ${lbl} de este dispositivo? (Ya fue enviada.)`
      : `⚠ La encuesta ${lbl} AÚN NO SE HA ENVIADO.\nSi la borras se perderá para siempre.\n\n¿Borrar de todos modos?`;
    if (!confirm(msg)) return;
    try { await deleteSurvey(id); toast('Encuesta borrada del dispositivo.'); }
    catch (e) { toast('No se pudo borrar: ' + e.message, 'err'); }
    await refreshPending();
    renderSurveyTable();
  }

  // ======================================================================
  //  Exportaciones
  // ======================================================================
  function csvCell(v) {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function toCSV(headers, rows) {
    const lines = [headers.map(csvCell).join(',')];
    rows.forEach((r) => lines.push(r.map(csvCell).join(',')));
    return '﻿' + lines.join('\r\n') + '\r\n';
  }

  function downloadFile(content, name, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function exportData(kind) {
    let data = [];
    try { data = await getAllSurveys(); } catch (e) { toast('No se pudieron leer los datos locales.', 'err'); return; }
    if (!data.length) { toast('No hay datos locales para exportar.', 'err'); return; }
    data.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
    const stamp = todayLocal();

    if (kind === 'json') {
      downloadFile(JSON.stringify(data, null, 2), `Respaldo_Hogares_${stamp}.json`, 'application/json');
      return;
    }
    const nuevos = data.filter((s) => s.answers);
    if (!nuevos.length) { toast('Solo hay encuestas en formato anterior: usa «Respaldo JSON».', 'err'); return; }

    if (kind === 'hogares') {
      const keys = [Q.meta.inicio, Q.meta.fin].filter(Boolean).concat(topFlat.map((q) => q.name));
      const headers = ['_id', '_estado', '_capturado_en', '_enviado'].concat(keys);
      const rows = nuevos.map((s) => [s.id, s.estado, s.timestamp, s.synced ? 'si' : 'no'].concat(keys.map((k) => s.answers[k])));
      downloadFile(toCSV(headers, rows), `Hogares_${stamp}.csv`, 'text/csv;charset=utf-8');
    } else {
      repDefs.forEach((rep) => {
        const keys = repFlat[rep.name].map((q) => q.name);
        const headers = ['_id_hogar', ID_FIELD, '_num'].concat(keys);
        const rows = [];
        nuevos.forEach((s) => ((s.repeats && s.repeats[rep.name]) || []).forEach((m, i) => {
          rows.push([s.id, s.answers[ID_FIELD], i + 1].concat(keys.map((k) => m[k])));
        }));
        downloadFile(toCSV(headers, rows), `${rep.name}_${stamp}.csv`, 'text/csv;charset=utf-8');
      });
    }
  }

  // ======================================================================
  //  Configuración de envío
  // ======================================================================
  function loadConfig() { cfg = { url: lsGet(LS_URL), token: lsGet(LS_TOKEN) }; }

  function openConfig() {
    $('cfgUrl').value = cfg.url;
    $('cfgToken').value = cfg.token;
    setLog('cfgLog', '');
    openModal('configModal');
  }

  function saveConfig() {
    const url = $('cfgUrl').value.trim();
    const token = $('cfgToken').value.trim();
    if (url && !/^https:\/\//i.test(url)) { setLog('cfgLog', 'La URL debe comenzar con https://', 'err'); return; }
    if (url && !token) { setLog('cfgLog', 'Falta el token de acceso.', 'err'); return; }
    const ok = lsSet(LS_URL, url) && lsSet(LS_TOKEN, token);
    loadConfig();
    updateNetwork();
    if (!ok) { setLog('cfgLog', 'No se pudo guardar en este navegador (¿modo privado?).', 'err'); return; }
    setLog('cfgLog', 'Configuración guardada.', 'ok');
    syncPending();
  }

  async function testConfig() {
    const url = $('cfgUrl').value.trim();
    if (!url) { setLog('cfgLog', 'Escribe primero la URL.', 'err'); return; }
    if (!navigator.onLine) { setLog('cfgLog', 'Sin conexión: no se puede probar ahora.', 'err'); return; }
    setLog('cfgLog', 'Probando conexión…');
    try {
      const resp = await fetch(url + (url.includes('?') ? '&' : '?') + 'ping=1', { redirect: 'follow' });
      const j = JSON.parse(await resp.text());
      if (j && j.status === 'ok') setLog('cfgLog', `Conexión correcta (script v${j.version || '?'}).`, 'ok');
      else setLog('cfgLog', 'El servidor respondió, pero no con el formato esperado.', 'err');
    } catch (e) {
      setLog('cfgLog', 'No se pudo conectar. Revisa la URL y que el acceso sea «Cualquier persona».', 'err');
    }
  }

  // ======================================================================
  //  Red, modales, service worker
  // ======================================================================
  function updateNetwork() {
    const online = navigator.onLine;
    const banner = $('banner');
    banner.classList.toggle('is-online', online);
    banner.classList.toggle('is-offline', !online);
    $('bannerText').textContent = !online
      ? 'Sin conexión · las encuestas se guardan en este dispositivo'
      : (cfg.url ? 'En línea · listo para sincronizar' : 'En línea · falta configurar el envío a Google Sheets');
  }

  function openModal(id) {
    $(id).hidden = false;
    if (id === 'syncModal') { setLog('syncLog', ''); refreshPending(); renderSurveyTable(); }
  }
  function closeModal(id) { $(id).hidden = true; }

  function registerSW() {
    const e = $('offlineState');
    const warn = (t) => { e.textContent = t; e.className = 'offline-state warn'; };
    if (!('serviceWorker' in navigator)) {
      warn(window.isSecureContext ? '⚠ Este navegador no admite el modo sin conexión'
        : '⚠ Abre la app desde una dirección HTTPS para habilitar el modo sin conexión');
      return;
    }
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => { e.textContent = '✓ Lista para usarse sin conexión'; e.className = 'offline-state ok'; })
      .catch((err) => { console.warn(err); warn('⚠ No se pudo activar el modo sin conexión'); });
  }

  // ======================================================================
  //  Arranque
  // ======================================================================
  function bindEvents() {
    $('btnPrev').addEventListener('click', goPrev);
    $('btnNext').addEventListener('click', goNext);
    $('btnPending').addEventListener('click', () => openModal('syncModal'));
    $('btnConfig').addEventListener('click', openConfig);
    $('btnSyncNow').addEventListener('click', () => syncPending(true));
    $('btnCsvHogares').addEventListener('click', () => exportData('hogares'));
    $('btnCsvIntegrantes').addEventListener('click', () => exportData('integrantes'));
    $('btnJson').addEventListener('click', () => exportData('json'));
    $('btnCfgSave').addEventListener('click', saveConfig);
    $('btnCfgTest').addEventListener('click', testConfig);

    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeModal(b.dataset.close)));
    document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeModal(m.id); }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') document.querySelectorAll('.modal:not([hidden])').forEach((m) => closeModal(m.id));
    });

    $('tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-goto]');
      if (b) goTab(Number(b.dataset.goto));
    });

    const form = $('surveyForm');
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      const a = b.dataset.action;
      if (a === 'add-member') addMember(b.dataset.rep);
      else if (a === 'rm-member') removeMember(b.dataset.rep, b.dataset.uid);
      else if (a === 'save') saveSurvey(false);
      else if (a === 'save-inc') saveSurvey(true);
      else if (a === 'go') {
        const er = ($('reviewSec')._errs || [])[Number(b.dataset.n)];
        if (!er) return;
        showStep(er.si, true);
        setTimeout(() => { showErrors([er]); }, 30);
      }
    });

    $('surveyTableBody').addEventListener('click', (e) => {
      const b = e.target.closest('[data-action="delete"]');
      if (b) deleteLocal(b.dataset.id);
    });

    window.addEventListener('online', () => { updateNetwork(); syncPending(); });
    window.addEventListener('offline', updateNetwork);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveDraft();
      else ensureDB().catch(() => {});
    });
    window.addEventListener('pageshow', () => { ensureDB().catch(() => {}); });
  }

  async function init() {
    $('appVersion').textContent = APP_VERSION;
    if (!Q) {
      $('stepLabel').textContent = 'Error: no se cargó cuestionario.js';
      toast('No se pudo cargar el cuestionario (cuestionario.js). Recarga la página con internet.', 'err');
      return;
    }
    $('formVersion').textContent = Q.meta.version;
    $('formTitle').textContent = Q.meta.titulo;
    loadConfig();
    bindEvents();

    suspendDraft = true;
    freshState();
    buildAll();
    showStep(0, true);
    suspendDraft = false;

    updateNetwork();
    registerSW();

    try { await ensureDB(); } catch (err) {
      console.error(err);
      toast('Almacenamiento local no disponible: ' + err.message, 'err');
      return;
    }
    await restoreDraft();
    await refreshPending();
    syncPending();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
