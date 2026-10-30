/**
 * Receptor de encuestas «Reconocimiento de Hogares» → Google Sheets  (v2.1, genérico, varios instrumentos).
 *
 * Qué hace:
 *  - Exige un token (propiedad de script TOKEN) para aceptar datos.
 *  - Es idempotente: si la app reintenta un envío, no duplica filas (clave: _id).
 *  - NO depende de las preguntas del cuestionario: crea solo las columnas que falten.
 *    Por eso, al cambiar el cuestionario NO hay que tocar ni volver a publicar este script.
 *  - Escribe una pestaña por instrumento (la app indica el nombre: «Hogares», «Clinicas»…) con una
 *    fila por encuesta, y una pestaña por cada bloque repetido (p. ej. «integrantes»: una fila por persona,
 *    ligada por _id_hogar).
 *
 * Configuración (ver README.md):
 *  - Propiedad de script TOKEN (obligatoria): la clave que se comparte con el equipo.
 *  - Propiedad de script SHEET_ID (solo si el script NO se creó desde la hoja con
 *    Extensiones > Apps Script): el ID de la hoja de cálculo de destino.
 */

var VERSION = '2.1.0';
var SHEET_MAIN = 'Hogares';
var FIXED_MAIN = ['_id', '_recibido_en', '_capturado_en', '_estado', '_version_app', '_version_cuestionario'];
var FIXED_REP = ['_id_hogar', 'hogar_id', '_num'];

/** Prueba de conexión desde la app («Probar conexión»). No expone datos. */
function doGet(e) {
  return json_({ status: 'ok', app: 'reconocimiento-hogares', version: VERSION });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    lock.waitLock(30000);
    locked = true;

    var expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!expected) {
      return json_({ status: 'error', message: 'Falta definir la propiedad de script TOKEN.' });
    }

    var body = JSON.parse(e.postData.contents);
    if (body.token !== expected) {
      return json_({ status: 'unauthorized', message: 'Token incorrecto.' });
    }

    var s = body.survey;
    if (!s || !s.id || !s.answers || typeof s.answers !== 'object') {
      return json_({ status: 'error', message: 'Falta la encuesta, su id o sus respuestas.' });
    }

    var ss = openSpreadsheet_();
    var shMain = getSheet_(ss, mainName_(s.hoja), FIXED_MAIN[0]);

    // Idempotencia: la fila de «Hogares» es la marca de que el envío quedó completo.
    if (idExists_(shMain, s.id)) {
      return json_({ status: 'duplicate', id: s.id });
    }

    // 1) Bloques repetidos (integrantes, etc.)
    var repeats = s.repeats || {};
    Object.keys(repeats).forEach(function (name) {
      var list = repeats[name] || [];
      var sh = getSheet_(ss, name, FIXED_REP[0]);
      // Si un intento anterior se cortó a la mitad, borra filas huérfanas de este hogar.
      deleteRowsById_(sh, s.id);
      if (!list.length) return;
      var rows = list.map(function (item, i) {
        var r = { _id_hogar: s.id, hogar_id: s.answers[s.idCampo || 'hogar_id'] || s.answers.hogar_id || '', _num: i + 1 };
        Object.keys(item).forEach(function (k) { r[k] = item[k]; });
        return r;
      });
      writeRows_(sh, FIXED_REP, rows);
    });

    // 2) Fila principal (al final: es lo que marca el envío como completo)
    var main = {
      _id: s.id,
      _recibido_en: new Date().toISOString(),
      _capturado_en: s.timestamp || '',
      _estado: s.estado || '',
      _version_app: s.appVersion || '',
      _version_cuestionario: s.formVersion || ''
    };
    Object.keys(s.answers).forEach(function (k) { main[k] = s.answers[k]; });
    writeRows_(shMain, FIXED_MAIN, [main]);

    return json_({ status: 'ok', id: s.id });
  } catch (err) {
    return json_({ status: 'error', message: String(err && err.message ? err.message : err) });
  } finally {
    if (locked) {
      try { lock.releaseLock(); } catch (_) { /* nada */ }
    }
  }
}

// ---------------------------------------------------------------- utilidades

/** Nombre de la pestaña principal que indica la app (solo letras, números, espacio y guion bajo). */
function mainName_(name) {
  var n = String(name || '').replace(/[^A-Za-z0-9 _\u00C0-\u017F]/g, '').trim().substring(0, 40);
  return n || SHEET_MAIN;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function openSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  throw new Error('No se encontró la hoja de destino. Agrega la propiedad de script SHEET_ID con el ID de tu hoja de Google.');
}

/**
 * Busca la pestaña sin distinguir mayúsculas. Si existe pero tiene el formato de una versión
 * anterior de la app (primera columna distinta), la renombra a «<nombre>_anterior» para no
 * mezclar datos ni perderlos, y crea una pestaña nueva.
 */
function getSheet_(ss, name, firstHeader) {
  var found = null;
  ss.getSheets().forEach(function (sh) {
    if (!found && sh.getName().toLowerCase() === name.toLowerCase()) found = sh;
  });
  if (found) {
    var lastCol = found.getLastColumn();
    var first = lastCol > 0 ? String(found.getRange(1, 1).getValue()) : firstHeader;
    if (first === firstHeader) return found;
    var base = found.getName() + '_anterior';
    var newName = base, n = 2;
    while (ss.getSheetByName(newName)) { newName = base + n; n++; }
    found.setName(newName);
  }
  return ss.insertSheet(name);
}

/** Devuelve el encabezado actual; agrega las columnas que falten. */
function ensureHeaders_(sh, fixed, keys) {
  var lastCol = sh.getLastColumn();
  var header = [];
  if (lastCol > 0) {
    header = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
    if (header[0] !== fixed[0]) {
      throw new Error('La pestaña «' + sh.getName() + '» tiene un formato anterior (su primera columna no es «' +
        fixed[0] + '»). Bórrala o cámbiale el nombre y vuelve a enviar.');
    }
  } else {
    header = fixed.slice();
  }
  var changed = lastCol === 0;
  keys.forEach(function (k) {
    if (header.indexOf(k) === -1) { header.push(k); changed = true; }
  });
  if (changed) {
    if (sh.getMaxColumns() < header.length) {
      sh.insertColumnsAfter(sh.getMaxColumns(), header.length - sh.getMaxColumns());
    }
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return header;
}

function colLetter_(n) {
  var s = '';
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * Escribe filas (objetos) al final de la pestaña.
 * Los textos se guardan como TEXTO (formato «@»): así no se pierden ceros a la izquierda en
 * teléfonos o claves, ni se interpretan fechas o fórmulas. Los números se guardan como números.
 */
function writeRows_(sh, fixed, rows) {
  var keys = [];
  rows.forEach(function (r) {
    Object.keys(r).forEach(function (k) { if (keys.indexOf(k) === -1) keys.push(k); });
  });
  var header = ensureHeaders_(sh, fixed, keys);

  var start = sh.getLastRow() + 1;
  var needRows = start + rows.length - 1;
  if (sh.getMaxRows() < needRows) {
    sh.insertRowsAfter(sh.getMaxRows(), needRows - sh.getMaxRows());
  }

  var values = [];
  var textCells = [];
  rows.forEach(function (r, i) {
    var line = header.map(function (h, c) {
      var v = Object.prototype.hasOwnProperty.call(r, h) ? r[h] : '';
      if (v === null || v === undefined) v = '';
      if (typeof v === 'boolean') v = v ? 1 : 0;
      if (typeof v === 'string' && v !== '') textCells.push(colLetter_(c + 1) + (start + i));
      return v;
    });
    values.push(line);
  });

  if (textCells.length) sh.getRangeList(textCells).setNumberFormat('@');
  sh.getRange(start, 1, values.length, header.length).setValues(values);
}

function idExists_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return false;
  var found = sh.getRange(2, 1, last - 1, 1)
    .createTextFinder(String(id)).matchEntireCell(true).findNext();
  return found !== null;
}

function deleteRowsById_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) sh.deleteRow(i + 2);
  }
}
