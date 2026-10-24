/**
 * Receptor de encuestas «Reconocimiento de Hogares» → Google Sheets.
 *
 * Qué hace:
 *  - Exige un token (propiedad de script TOKEN) para aceptar datos.
 *  - Es idempotente: si la app reintenta un envío, no duplica filas (clave: id).
 *  - Escribe dos hojas: «Hogares» (una fila por hogar) e «Integrantes» (una fila por persona).
 *
 * Configuración: ver README.md (Implementar > Nueva implementación > Aplicación web,
 * ejecutar como «Yo» y acceso «Cualquier persona»).
 */

var VERSION = '1.0.0';
var SHEET_HOGARES = 'Hogares';
var SHEET_INTEGRANTES = 'Integrantes';

var H_HEADERS = [
  'id', 'folio', 'fecha', 'encuestador', 'municipio', 'localidad', 'direccion', 'gps',
  'gps_precision_m', 'tipo_vivienda', 'tenencia', 'servicios', 'total_integrantes', 'menores',
  'adultos_mayores', 'con_discapacidad', 'observaciones', 'capturado_en', 'recibido_en'
];

var I_HEADERS = [
  'id_hogar', 'folio', 'num', 'nombre', 'sexo', 'edad', 'parentesco', 'escolaridad',
  'ocupacion', 'afiliacion_salud', 'discapacidad'
];

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
    if (!s || !s.id) {
      return json_({ status: 'error', message: 'Falta la encuesta o su id.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var shH = getSheet_(ss, SHEET_HOGARES, H_HEADERS);
    var shI = getSheet_(ss, SHEET_INTEGRANTES, I_HEADERS);

    // Idempotencia: la fila de «Hogares» es la marca de que el envío quedó completo.
    if (idExists_(shH, s.id)) {
      return json_({ status: 'duplicate', id: s.id });
    }

    // Si un intento anterior se cortó a la mitad, borra integrantes huérfanos de este id.
    deleteRowsById_(shI, s.id);

    var integrantes = s.integrantes || [];
    if (integrantes.length) {
      var rowsI = integrantes.map(function (m) {
        return [
          s.id, safe_(s.folio), m.num, safe_(m.nombre), safe_(m.sexo), m.edad, safe_(m.parentesco),
          safe_(m.escolaridad), safe_(m.ocupacion), safe_(m.salud), safe_(m.discapacidad)
        ];
      });
      shI.getRange(shI.getLastRow() + 1, 1, rowsI.length, I_HEADERS.length).setValues(rowsI);
    }

    shH.appendRow([
      s.id, safe_(s.folio), safe_(s.fecha), safe_(s.encuestador), safe_(s.municipio),
      safe_(s.localidad), safe_(s.direccion), safe_(s.gps), s.gpsPrecisionM || '',
      safe_(s.tipoVivienda), safe_(s.tenenciaVivienda), safe_((s.servicios || []).join('; ')),
      s.totalMiembros || 0, s.menores || 0, s.adultosMayores || 0, s.discapacidad || 0,
      safe_(s.observaciones), safe_(s.timestamp), new Date().toISOString()
    ]);

    return json_({ status: 'ok', id: s.id });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  } finally {
    if (locked) {
      try { lock.releaseLock(); } catch (_) { /* nada */ }
    }
  }
}

// ---------------------------------------------------------------- utilidades

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
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

/** Neutraliza texto que Sheets interpretaría como fórmula (=, +, -, @). */
function safe_(v) {
  if (v === null || v === undefined) return '';
  var s = String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
