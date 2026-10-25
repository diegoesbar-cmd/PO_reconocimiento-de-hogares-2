(() => {
  'use strict';

  // ======================================================================
  //  Constantes
  // ======================================================================
  const APP_VERSION = '1.0.1';
  const MAX_MEMBERS = 12;
  const DB_NAME = 'OfflineSurveysDB';
  const DB_VERSION = 2;
  const LS_URL = 'gas_survey_endpoint';
  const LS_TOKEN = 'gas_survey_token';

  const FIELD_IDS = [
    'fecha', 'folio', 'encuestador', 'municipio', 'localidad', 'direccion',
    'gps', 'tipoVivienda', 'tenenciaVivienda', 'observaciones'
  ];

  const STEP_LABELS = [
    'Paso 1 de 4: Identificación y ubicación',
    'Paso 2 de 4: Características de la vivienda',
    'Paso 3 de 4: Integrantes del hogar',
    'Paso 4 de 4: Resumen y cierre'
  ];

  // [valor guardado, texto visible]
  const OPT = {
    sexo: [['Hombre', 'Hombre'], ['Mujer', 'Mujer'], ['Otro', 'Otro / Prefiere no decir']],
    parentesco: [
      ['Cónyuge / Pareja', 'Cónyuge / Pareja'], ['Hijo(a)', 'Hijo(a)'], ['Padre / Madre', 'Padre / Madre'],
      ['Nieto(a)', 'Nieto(a)'], ['Yerno / Nuera', 'Yerno / Nuera'], ['Hermano(a)', 'Hermano(a)'],
      ['Otro familiar', 'Otro familiar'], ['Sin parentesco', 'Sin parentesco']
    ],
    escolaridad: [
      ['Sin escolaridad', 'Sin escolaridad'], ['Preescolar', 'Preescolar'], ['Primaria', 'Primaria'],
      ['Secundaria', 'Secundaria'], ['Preparatoria / Bachillerato', 'Preparatoria / Bachillerato'],
      ['Licenciatura / Técnico', 'Licenciatura / Técnico'], ['Posgrado', 'Posgrado']
    ],
    salud: [
      ['Ninguno', 'Ninguno / Sin afiliación'], ['IMSS / IMSS-Bienestar', 'IMSS / IMSS-Bienestar'],
      ['ISSSTE', 'ISSSTE'], ['Privado', 'Servicio privado'], ['Otro', 'Otro']
    ],
    discapacidad: [
      ['No', 'No presenta'], ['Motriz / Caminar', 'Motriz (caminar / moverse)'],
      ['Visual', 'Visual (aun usando lentes)'], ['Auditiva', 'Auditiva (oír)'],
      ['Intelectual / Lenguaje', 'Intelectual / comunicación'], ['Otra', 'Otra condición']
    ]
  };

  // ======================================================================
  //  Estado
  // ======================================================================
  const state = { step: 1, members: [], nextUid: 1, gpsAcc: '' };
  let db = null;
  let cfg = { url: '', token: '' };
  let syncing = false;
  let draftTimer = null;
  let suspendDraft = false;

  const $ = (id) => document.getElementById(id);

  // ======================================================================
  //  Utilidades
  // ======================================================================
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function todayLocal() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function uuid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    $('toasts').appendChild(el);
    setTimeout(() => el.remove(), type === 'err' ? 7000 : 4500);
  }

  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (_) { return false; } }

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
        if (!d.objectStoreNames.contains('meta')) {
          d.createObjectStore('meta', { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('No se pudo abrir la base de datos local.'));
      req.onblocked = () => reject(new Error('La base de datos está bloqueada por otra pestaña. Ciérrala e intenta de nuevo.'));
    });
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Error de transacción'));
      tx.onabort = () => reject(tx.error || new Error('Transacción cancelada'));
    });
  }

  function reqResult(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // El navegador puede cerrar la conexión (p. ej. al pasar la app a segundo plano
  // en iPhone o por falta de memoria). Estas funciones la reabren automáticamente.
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
        // Conexión cerrada por el navegador: reabrir y reintentar una vez
        try { d.close(); } catch (_) { /* nada */ }
        if (db === d) db = null;
        const d2 = await ensureDB();
        return d2.transaction(store, mode);
      }
      throw err;
    }
  }

  async function addSurvey(rec) {
    const tx = await newTx('surveys', 'readwrite');
    tx.objectStore('surveys').add(rec);
    await txDone(tx);
  }

  async function getAllSurveys() {
    const tx = await newTx('surveys', 'readonly');
    const rows = await reqResult(tx.objectStore('surveys').getAll());
    return rows || [];
  }

  async function markSynced(id) {
    const tx = await newTx('surveys', 'readwrite');
    const st = tx.objectStore('surveys');
    const g = st.get(id);
    g.onsuccess = () => {
      const rec = g.result;
      if (rec) {
        rec.synced = true;
        rec.syncedAt = new Date().toISOString();
        st.put(rec);
      }
    };
    await txDone(tx);
  }

  async function deleteSurvey(id) {
    const tx = await newTx('surveys', 'readwrite');
    tx.objectStore('surveys').delete(id);
    await txDone(tx);
  }

  async function putMeta(rec) {
    const tx = await newTx('meta', 'readwrite');
    tx.objectStore('meta').put(rec);
    await txDone(tx);
  }

  async function getMeta(key) {
    const tx = await newTx('meta', 'readonly');
    return reqResult(tx.objectStore('meta').get(key));
  }

  async function deleteMeta(key) {
    const tx = await newTx('meta', 'readwrite');
    tx.objectStore('meta').delete(key);
    await txDone(tx);
  }

  // ======================================================================
  //  Integrantes (estado + render)
  // ======================================================================
  function newMember(isHead) {
    return {
      uid: state.nextUid++,
      nombre: '',
      sexo: '',
      edad: '',
      parentesco: isHead ? 'Jefe(a) del hogar' : '',
      escolaridad: 'Sin escolaridad',
      ocupacion: '',
      salud: 'Ninguno',
      discapacidad: 'No'
    };
  }

  function selectHtml(field, m, list, placeholder) {
    const opts = list.map(([v, l]) =>
      `<option value="${esc(v)}"${v === m[field] ? ' selected' : ''}>${esc(l)}</option>`).join('');
    const ph = placeholder ? '<option value="">-- Seleccionar --</option>' : '';
    return `<select id="m${m.uid}_${field}" data-uid="${m.uid}" data-field="${field}">${ph}${opts}</select>`;
  }

  function memberCard(m, i) {
    const isHead = i === 0;
    const title = isHead ? 'Jefe(a) del hogar' : `Integrante #${i + 1}`;
    const right = isHead
      ? '<span class="tag tag-brand">Titular</span>'
      : `<button type="button" class="btn btn-danger" data-action="remove" data-uid="${m.uid}">Eliminar</button>`;
    const parentesco = isHead
      ? `<select id="m${m.uid}_parentesco" data-uid="${m.uid}" data-field="parentesco"><option value="Jefe(a) del hogar" selected>Jefe(a) del hogar</option></select>`
      : selectHtml('parentesco', m, OPT.parentesco, true);

    return `
      <div class="member" data-member="${m.uid}">
        <div class="member-head">
          <span class="member-title"><span class="num">${i + 1}</span>${esc(title)}</span>
          ${right}
        </div>
        <div class="grid">
          <div class="field">
            <label for="m${m.uid}_nombre">Nombre / iniciales *</label>
            <input type="text" id="m${m.uid}_nombre" data-uid="${m.uid}" data-field="nombre" value="${esc(m.nombre)}" placeholder="Nombre o iniciales">
          </div>
          <div class="field">
            <label for="m${m.uid}_sexo">Sexo *</label>
            ${selectHtml('sexo', m, OPT.sexo, true)}
          </div>
          <div class="field">
            <label for="m${m.uid}_edad">Edad (años) *</label>
            <input type="number" inputmode="numeric" min="0" max="115" step="1" id="m${m.uid}_edad" data-uid="${m.uid}" data-field="edad" value="${esc(m.edad)}" placeholder="Ej. 34">
          </div>
          <div class="field">
            <label for="m${m.uid}_parentesco">Parentesco con jefe(a) *</label>
            ${parentesco}
          </div>
          <div class="field">
            <label for="m${m.uid}_escolaridad">Escolaridad</label>
            ${selectHtml('escolaridad', m, OPT.escolaridad, false)}
          </div>
          <div class="field">
            <label for="m${m.uid}_ocupacion">Ocupación principal</label>
            <input type="text" id="m${m.uid}_ocupacion" data-uid="${m.uid}" data-field="ocupacion" value="${esc(m.ocupacion)}" placeholder="Ej. Estudiante, comercio, hogar">
          </div>
          <div class="field">
            <label for="m${m.uid}_salud">Afiliación a salud</label>
            ${selectHtml('salud', m, OPT.salud, false)}
          </div>
          <div class="field">
            <label for="m${m.uid}_discapacidad">¿Discapacidad o limitación?</label>
            ${selectHtml('discapacidad', m, OPT.discapacidad, false)}
          </div>
        </div>
      </div>`;
  }

  function renderMembers() {
    $('membersContainer').innerHTML = state.members.map(memberCard).join('');
    const n = state.members.length;
    $('memberCount').textContent = `${n} ${n === 1 ? 'integrante' : 'integrantes'}`;
    $('btnAddMember').disabled = n >= MAX_MEMBERS;
  }

  function addMember() {
    if (state.members.length >= MAX_MEMBERS) {
      toast(`Se alcanzó el límite de ${MAX_MEMBERS} integrantes por hogar.`, 'err');
      return;
    }
    const m = newMember(false);
    state.members.push(m);
    renderMembers();
    scheduleDraft();
    const el = $(`m${m.uid}_nombre`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
  }

  function removeMember(uid) {
    const idx = state.members.findIndex((m) => m.uid === uid);
    if (idx <= 0) return; // la jefatura no se elimina
    const m = state.members[idx];
    if ((m.nombre || m.edad !== '') && !confirm('¿Eliminar a este integrante?')) return;
    state.members.splice(idx, 1);
    renderMembers();
    scheduleDraft();
  }

  function computeStats(list) {
    let menores = 0, adultosMayores = 0, discapacidad = 0;
    list.forEach((m) => {
      const e = parseInt(m.edad, 10);
      if (!isNaN(e)) {
        if (e < 18) menores++;
        if (e >= 60) adultosMayores++;
      }
      if (m.discapacidad && m.discapacidad !== 'No') discapacidad++;
    });
    return { menores, adultosMayores, discapacidad };
  }

  function renderSummary() {
    const s = computeStats(state.members);
    $('sumTotal').textContent = state.members.length;
    $('sumMinors').textContent = s.menores;
    $('sumSeniors').textContent = s.adultosMayores;
    $('sumDisability').textContent = s.discapacidad;
  }

  // ======================================================================
  //  Formulario: lectura, validación, navegación
  // ======================================================================
  function collectForm() {
    const f = {};
    FIELD_IDS.forEach((id) => { f[id] = $(id).value; });
    f.servicios = Array.from(document.querySelectorAll('input[name="servicios"]:checked')).map((c) => c.value);
    return f;
  }

  function clearErrors() {
    document.querySelectorAll('.invalid').forEach((el) => {
      el.classList.remove('invalid');
      el.removeAttribute('aria-invalid');
    });
  }

  function markInvalid(el) {
    if (!el) return;
    el.classList.add('invalid');
    el.setAttribute('aria-invalid', 'true');
  }

  // Devuelve la lista de elementos con error (vacía = paso válido)
  function validateStep(step) {
    const bad = [];
    if (step === 1) {
      ['fecha', 'folio', 'encuestador', 'municipio', 'localidad', 'direccion'].forEach((id) => {
        if (!$(id).value.trim()) bad.push($(id));
      });
    } else if (step === 2) {
      ['tipoVivienda', 'tenenciaVivienda'].forEach((id) => {
        if (!$(id).value) bad.push($(id));
      });
    } else if (step === 3) {
      state.members.forEach((m) => {
        if (!m.nombre.trim()) bad.push($(`m${m.uid}_nombre`));
        if (!m.sexo) bad.push($(`m${m.uid}_sexo`));
        const e = Number(m.edad);
        if (m.edad === '' || !Number.isInteger(e) || e < 0 || e > 115) bad.push($(`m${m.uid}_edad`));
        if (!m.parentesco) bad.push($(`m${m.uid}_parentesco`));
      });
    }
    return bad.filter(Boolean);
  }

  function reportErrors(step, bad) {
    bad.forEach(markInvalid);
    const msg = step === 3
      ? `Revisa ${bad.length} dato(s) marcados en rojo (nombre, sexo, edad 0–115 y parentesco son obligatorios).`
      : `Completa ${bad.length} campo(s) obligatorio(s) marcados en rojo.`;
    toast(msg, 'err');
    if (bad[0]) { bad[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); bad[0].focus({ preventScroll: true }); }
  }

  function showStep(n) {
    state.step = n;
    for (let i = 1; i <= 4; i++) $(`step${i}`).hidden = i !== n;
    document.querySelectorAll('.tab').forEach((t) => {
      const on = Number(t.dataset.goto) === n;
      t.classList.toggle('is-active', on);
      if (on) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
    });
    const pct = n * 25;
    $('progressBar').style.width = pct + '%';
    $('stepPercent').textContent = pct + '%';
    $('stepLabel').textContent = STEP_LABELS[n - 1];
    $('btnPrev').hidden = n === 1;
    $('btnNext').hidden = n === 4;
    $('btnSave').hidden = n !== 4;
    if (n === 4) renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    scheduleDraft();
  }

  function goToStep(target) {
    if (target < 1 || target > 4 || target === state.step) return;
    if (target > state.step) {
      // No se puede saltar pasos: se validan todos los anteriores al destino
      for (let s = state.step; s < target; s++) {
        clearErrors();
        const bad = validateStep(s);
        if (bad.length) {
          if (s !== state.step) showStep(s);
          reportErrors(s, bad);
          return;
        }
      }
    }
    clearErrors();
    showStep(target);
  }

  // ======================================================================
  //  GPS
  // ======================================================================
  function getGPS() {
    const status = $('gpsStatus');
    if (!navigator.geolocation) {
      status.textContent = 'Este navegador no admite geolocalización.';
      status.className = 'hint err';
      return;
    }
    status.textContent = 'Obteniendo posición… (puede tardar unos segundos al aire libre)';
    status.className = 'hint';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        $('gps').value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        state.gpsAcc = Math.round(pos.coords.accuracy || 0);
        status.textContent = `Ubicación obtenida (precisión ≈ ${state.gpsAcc} m).`;
        status.className = 'hint ok';
        scheduleDraft();
      },
      (err) => {
        const msgs = {
          1: 'Permiso de ubicación denegado. Actívalo en los ajustes del navegador.',
          2: 'No se pudo determinar la posición. Prueba en un lugar abierto.',
          3: 'Se agotó el tiempo de espera. Intenta de nuevo.'
        };
        status.textContent = msgs[err.code] || 'No se pudo obtener la ubicación.';
        status.className = 'hint err';
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }

  // ======================================================================
  //  Guardar encuesta
  // ======================================================================
  function buildRecord() {
    const f = collectForm();
    const integrantes = state.members.map((m, i) => ({
      num: i + 1,
      nombre: m.nombre.trim(),
      sexo: m.sexo,
      edad: parseInt(m.edad, 10),
      parentesco: m.parentesco,
      escolaridad: m.escolaridad,
      ocupacion: m.ocupacion.trim(),
      salud: m.salud,
      discapacidad: m.discapacidad || 'No'
    }));
    const st = computeStats(integrantes);
    return {
      id: uuid(),
      timestamp: new Date().toISOString(),
      appVersion: APP_VERSION,
      fecha: f.fecha,
      folio: f.folio.trim().toUpperCase(),
      encuestador: f.encuestador.trim(),
      municipio: f.municipio.trim(),
      localidad: f.localidad.trim(),
      direccion: f.direccion.trim(),
      gps: f.gps,
      gpsPrecisionM: state.gpsAcc,
      tipoVivienda: f.tipoVivienda,
      tenenciaVivienda: f.tenenciaVivienda,
      servicios: f.servicios,
      totalMiembros: integrantes.length,
      menores: st.menores,
      adultosMayores: st.adultosMayores,
      discapacidad: st.discapacidad,
      integrantes,
      observaciones: f.observaciones.trim(),
      synced: false
    };
  }

  async function saveSurvey() {
    try { await ensureDB(); } catch (err) {
      toast('El almacenamiento local no está disponible; no se puede guardar. ' + (err && err.message ? err.message : ''), 'err');
      return;
    }
    for (let s = 1; s <= 3; s++) {
      clearErrors();
      const bad = validateStep(s);
      if (bad.length) {
        if (s !== state.step) showStep(s);
        reportErrors(s, bad);
        return;
      }
    }
    clearErrors();

    const rec = buildRecord();
    $('btnSave').disabled = true;
    try {
      const existing = await getAllSurveys();
      if (existing.some((x) => x.folio === rec.folio)) {
        if (!confirm(`Ya hay una encuesta con el folio ${rec.folio} en este dispositivo.\n\n¿Guardar de todos modos?`)) {
          return;
        }
      }
      await addSurvey(rec); // espera a que la transacción confirme
    } catch (err) {
      console.error(err);
      toast('No se pudo guardar la encuesta: ' + (err && err.message ? err.message : err) +
        '. Tus datos siguen en pantalla: no cierres esta página, pulsa de nuevo «Guardar encuesta» o avisa al coordinador.', 'err');
      return;
    } finally {
      $('btnSave').disabled = false;
    }

    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
    await resetForm();
    await refreshPending();
    toast(`Encuesta ${rec.folio} guardada en este dispositivo.`, 'ok');
    syncPending();
  }

  // ======================================================================
  //  Borrador automático (recupera datos si se cierra el navegador)
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
        key: 'draft',
        step: state.step,
        form: collectForm(),
        members: state.members,
        nextUid: state.nextUid,
        gpsAcc: state.gpsAcc,
        savedAt: Date.now()
      });
    } catch (e) { console.warn('No se pudo guardar el borrador', e); }
  }

  function draftHasContent(d) {
    if (!d || !d.form) return false;
    const f = d.form;
    const anyField = ['folio', 'encuestador', 'municipio', 'localidad', 'direccion', 'observaciones']
      .some((k) => (f[k] || '').trim());
    const anyMember = (d.members || []).some((m) => (m.nombre || '').trim() || m.edad !== '');
    return anyField || anyMember || (f.servicios || []).length > 0 || !!f.tipoVivienda || !!f.tenenciaVivienda;
  }

  function applyFormValues(f) {
    FIELD_IDS.forEach((id) => { if (f[id] != null) $(id).value = f[id]; });
    const set = new Set(f.servicios || []);
    document.querySelectorAll('input[name="servicios"]').forEach((c) => { c.checked = set.has(c.value); });
  }

  async function restoreDraft() {
    let d;
    try { d = await getMeta('draft'); } catch (_) { return; }
    if (!draftHasContent(d)) return;
    applyFormValues(d.form);
    state.members = (d.members && d.members.length) ? d.members : [newMember(true)];
    state.nextUid = d.nextUid || (Math.max(0, ...state.members.map((m) => m.uid)) + 1);
    state.gpsAcc = d.gpsAcc || '';
    renderMembers();
    showStep(d.step >= 1 && d.step <= 4 ? d.step : 1);
    toast('Se recuperó la encuesta que tenías en curso.', 'ok');
  }

  async function resetForm() {
    suspendDraft = true;
    clearTimeout(draftTimer);
    try {
      FIELD_IDS.forEach((id) => { $(id).value = ''; });
      $('fecha').value = todayLocal();
      document.querySelectorAll('input[name="servicios"]').forEach((c) => { c.checked = false; });
      $('gpsStatus').textContent = 'Funciona sin internet, pero requiere permiso de ubicación.';
      $('gpsStatus').className = 'hint';
      state.gpsAcc = '';
      state.nextUid = 1;
      state.members = [newMember(true)];
      renderMembers();
      clearErrors();
      showStep(1);
      try { await deleteMeta('draft'); } catch (_) { /* no crítico */ }
    } finally {
      suspendDraft = false;
    }
  }

  // ======================================================================
  //  Sincronización con Google Sheets (Apps Script)
  // ======================================================================
  function setLog(id, msg, kind) {
    const el = $(id);
    el.hidden = !msg;
    el.textContent = msg || '';
    el.className = 'synclog' + (kind ? ' ' + kind : '');
  }

  async function postSurvey(survey) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 30000);
    try {
      // Sin cabecera Content-Type personalizada => "solicitud simple", sin preflight CORS
      const resp = await fetch(cfg.url, {
        method: 'POST',
        body: JSON.stringify({ token: cfg.token, survey }),
        redirect: 'follow',
        signal: ctl.signal
      });
      const text = await resp.text();
      try { return JSON.parse(text); }
      catch (_) {
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
        .filter((s) => !s.synced)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      if (!pending.length) {
        if (manual) setLog('syncLog', 'No hay encuestas pendientes por enviar.', 'ok');
        return;
      }
      setLog('syncLog', `Enviando ${pending.length} encuesta(s)…`);
      for (const s of pending) {
        try {
          const r = await postSurvey(s);
          if (r && (r.status === 'ok' || r.status === 'duplicate')) {
            await markSynced(s.id);
            ok++;
          } else {
            fail++;
            lastErr = (r && r.message) || (r && r.status) || 'Error desconocido';
            if (r && r.status === 'unauthorized') break; // el token es incorrecto: no insistir
          }
        } catch (err) {
          fail++;
          lastErr = err && err.name === 'AbortError' ? 'Tiempo de espera agotado' : (err && err.message) || String(err);
          if (!navigator.onLine) break;
        }
      }
      if (fail === 0) {
        setLog('syncLog', `Listo: ${ok} encuesta(s) enviada(s) a Google Sheets.`, 'ok');
      } else {
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
  //  Lista local, conteo de pendientes
  // ======================================================================
  async function refreshPending() {
    try {
      const all = await getAllSurveys();
      const pend = all.filter((s) => !s.synced).length;
      const b = $('pendingBadge');
      b.textContent = pend;
      b.classList.toggle('zero', pend === 0);
      $('syncSummary').textContent = `${all.length} en el dispositivo · ${pend} pendiente(s) de envío · ${all.length - pend} enviada(s).`;
    } catch (e) { console.warn(e); }
  }

  async function renderSurveyTable() {
    const tbody = $('surveyTableBody');
    let rows = [];
    try { rows = await getAllSurveys(); } catch (_) { /* vacío */ }
    if (!rows.length) {
      tbody.innerHTML = '<tr><td class="empty" colspan="5">No hay encuestas guardadas en este dispositivo.</td></tr>';
      return;
    }
    rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    tbody.innerHTML = rows.map((s) => `
      <tr>
        <td><strong>${esc(s.folio)}</strong></td>
        <td>${esc(s.fecha)}</td>
        <td>${esc(s.totalMiembros)}</td>
        <td>${s.synced ? '<span class="state sent">Enviada</span>' : '<span class="state pend">Pendiente</span>'}</td>
        <td><button type="button" class="btn btn-danger" data-action="delete" data-id="${esc(s.id)}">Borrar</button></td>
      </tr>`).join('');
  }

  async function deleteLocal(id) {
    let rows = [];
    try { rows = await getAllSurveys(); } catch (_) { return; }
    const s = rows.find((x) => x.id === id);
    if (!s) return;
    const msg = s.synced
      ? `¿Borrar la encuesta ${s.folio} de este dispositivo? (Ya fue enviada.)`
      : `⚠ La encuesta ${s.folio} AÚN NO SE HA ENVIADO.\nSi la borras se perderá para siempre.\n\n¿Borrar de todos modos?`;
    if (!confirm(msg)) return;
    try {
      await deleteSurvey(id);
      toast('Encuesta borrada del dispositivo.');
    } catch (e) {
      toast('No se pudo borrar: ' + e.message, 'err');
    }
    await refreshPending();
    renderSurveyTable();
  }

  // ======================================================================
  //  Exportaciones
  // ======================================================================
  function csvCell(v) {
    let s = v == null ? '' : String(v);
    // Evita inyección de fórmulas al abrir en Excel/Sheets (se respetan números negativos)
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function toCSV(headers, rows) {
    const lines = [headers.map(csvCell).join(',')];
    rows.forEach((r) => lines.push(r.map(csvCell).join(',')));
    return '﻿' + lines.join('\r\n') + '\r\n'; // BOM para acentos en Excel
  }

  function downloadFile(content, name, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function exportData(kind) {
    let data = [];
    try { data = await getAllSurveys(); } catch (e) { toast('No se pudieron leer los datos locales.', 'err'); return; }
    if (!data.length) { toast('No hay datos locales para exportar.', 'err'); return; }
    data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const stamp = todayLocal();

    if (kind === 'json') {
      downloadFile(JSON.stringify(data, null, 2), `Respaldo_Hogares_${stamp}.json`, 'application/json');
    } else if (kind === 'hogares') {
      const headers = ['id', 'folio', 'fecha', 'encuestador', 'municipio', 'localidad', 'direccion', 'gps',
        'gps_precision_m', 'tipo_vivienda', 'tenencia', 'servicios', 'total_integrantes', 'menores',
        'adultos_mayores', 'con_discapacidad', 'observaciones', 'capturado_en', 'enviado'];
      const rows = data.map((s) => [s.id, s.folio, s.fecha, s.encuestador, s.municipio, s.localidad, s.direccion,
        s.gps, s.gpsPrecisionM, s.tipoVivienda, s.tenenciaVivienda, (s.servicios || []).join('; '),
        s.totalMiembros, s.menores, s.adultosMayores, s.discapacidad, s.observaciones, s.timestamp,
        s.synced ? 'si' : 'no']);
      downloadFile(toCSV(headers, rows), `Hogares_${stamp}.csv`, 'text/csv;charset=utf-8');
    } else {
      const headers = ['id_hogar', 'folio', 'num', 'nombre', 'sexo', 'edad', 'parentesco', 'escolaridad',
        'ocupacion', 'afiliacion_salud', 'discapacidad'];
      const rows = [];
      data.forEach((s) => (s.integrantes || []).forEach((m) => rows.push([
        s.id, s.folio, m.num, m.nombre, m.sexo, m.edad, m.parentesco, m.escolaridad, m.ocupacion, m.salud, m.discapacidad
      ])));
      downloadFile(toCSV(headers, rows), `Integrantes_${stamp}.csv`, 'text/csv;charset=utf-8');
    }
  }

  // ======================================================================
  //  Configuración de envío
  // ======================================================================
  function loadConfig() {
    cfg = { url: lsGet(LS_URL), token: lsGet(LS_TOKEN) };
  }

  function openConfig() {
    $('cfgUrl').value = cfg.url;
    $('cfgToken').value = cfg.token;
    setLog('cfgLog', '');
    openModal('configModal');
  }

  function saveConfig() {
    const url = $('cfgUrl').value.trim();
    const token = $('cfgToken').value.trim();
    if (url && !/^https:\/\//i.test(url)) {
      setLog('cfgLog', 'La URL debe comenzar con https://', 'err');
      return;
    }
    if (url && !token) {
      setLog('cfgLog', 'Falta el token de acceso.', 'err');
      return;
    }
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
    let txt;
    if (!online) txt = 'Sin conexión · las encuestas se guardan en este dispositivo';
    else if (cfg.url) txt = 'En línea · listo para sincronizar';
    else txt = 'En línea · falta configurar el envío a Google Sheets';
    $('bannerText').textContent = txt;
  }

  function openModal(id) {
    $(id).hidden = false;
    if (id === 'syncModal') { setLog('syncLog', ''); refreshPending(); renderSurveyTable(); }
  }
  function closeModal(id) { $(id).hidden = true; }

  function registerSW() {
    const el = $('offlineState');
    const warn = (t) => { el.textContent = t; el.className = 'offline-state warn'; };
    if (!('serviceWorker' in navigator)) {
      warn(window.isSecureContext
        ? '⚠ Este navegador no admite el modo sin conexión'
        : '⚠ Abre la app desde una dirección HTTPS para habilitar el modo sin conexión');
      return;
    }
    navigator.serviceWorker.register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => { el.textContent = '✓ Lista para usarse sin conexión'; el.className = 'offline-state ok'; })
      .catch((err) => { console.warn(err); warn('⚠ No se pudo activar el modo sin conexión'); });
  }

  // ======================================================================
  //  Arranque
  // ======================================================================
  function bindEvents() {
    document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => goToStep(Number(t.dataset.goto))));
    $('btnPrev').addEventListener('click', () => goToStep(state.step - 1));
    $('btnNext').addEventListener('click', () => goToStep(state.step + 1));
    $('btnSave').addEventListener('click', saveSurvey);
    $('btnAddMember').addEventListener('click', addMember);
    $('btnGps').addEventListener('click', getGPS);
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

    // Integrantes: actualizar estado al escribir, eliminar con delegación
    const mc = $('membersContainer');
    const onMemberInput = (e) => {
      const t = e.target;
      const uid = Number(t.dataset && t.dataset.uid);
      const field = t.dataset && t.dataset.field;
      if (!uid || !field) return;
      const m = state.members.find((x) => x.uid === uid);
      if (m) m[field] = t.value;
    };
    mc.addEventListener('input', onMemberInput);
    mc.addEventListener('change', onMemberInput);
    mc.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action="remove"]');
      if (b) removeMember(Number(b.dataset.uid));
    });

    $('surveyTableBody').addEventListener('click', (e) => {
      const b = e.target.closest('[data-action="delete"]');
      if (b) deleteLocal(b.dataset.id);
    });

    // Cualquier cambio del formulario: quita el rojo y programa el borrador
    const form = $('surveyForm');
    const onAnyInput = (e) => {
      if (e.target && e.target.classList) {
        e.target.classList.remove('invalid');
        e.target.removeAttribute('aria-invalid');
      }
      scheduleDraft();
    };
    form.addEventListener('input', onAnyInput);
    form.addEventListener('change', onAnyInput);
    form.addEventListener('submit', (e) => e.preventDefault());
    $('folio').addEventListener('blur', (e) => { e.target.value = e.target.value.trim().toUpperCase(); });

    window.addEventListener('online', () => { updateNetwork(); syncPending(); });
    window.addEventListener('offline', updateNetwork);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveDraft();
      else ensureDB().catch(() => {}); // al volver a la app, reabre la base si el sistema la cerró
    });
    window.addEventListener('pageshow', () => { ensureDB().catch(() => {}); });
  }

  async function init() {
    $('appVersion').textContent = APP_VERSION;
    loadConfig();
    bindEvents();

    // Estado inicial limpio (sin tocar el borrador guardado)
    suspendDraft = true;
    $('fecha').value = todayLocal();
    state.members = [newMember(true)];
    renderMembers();
    suspendDraft = false;

    updateNetwork();
    registerSW();

    try {
      await ensureDB();
    } catch (err) {
      console.error(err);
      toast('Almacenamiento local no disponible: ' + err.message, 'err');
      $('btnSave').disabled = true;
      return;
    }
    await restoreDraft();
    await refreshPending();
    syncPending();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
