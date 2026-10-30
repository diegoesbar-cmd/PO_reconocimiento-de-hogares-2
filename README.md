# Levantamientos de campo · captura sin conexión (v2.1)

Cuestionario de campo que funciona **sin internet** una vez cargado una vez con conexión.
Guarda cada encuesta en el teléfono y la envía a Google Sheets cuando hay señal.
No usa librerías externas ni CDN: todo está en este repositorio.

La app tiene **dos instrumentos**: *Reconocimiento de hogares* e *Inventario de clínica* (equipamiento y medicamentos). Un selector en la parte superior cambia de uno a otro; cada uno conserva su propio borrador, y todo se guarda en el mismo teléfono y se envía a la misma hoja de Google (pestañas **Hogares** y **Clinicas**).

Cada instrumento se define en un **XLSForm** (`herramientas/cuestionario.xlsx`, `herramientas/clinica.xlsx`) y la app lo interpreta tal cual:
saltos (`relevant`), restricciones (`constraint`), cálculos (`calculate`), obligatorias (`required`),
listas de opciones, bloques repetidos (integrantes) y notas de urgencia.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La aplicación (motor que interpreta el cuestionario) |
| **`cuestionario.js`** | Cuestionario de hogares (generado desde su XLSForm) |
| **`clinica.js`** | Inventario de clínica (generado desde su XLSForm) |
| `sw.js` | Guarda la app en el teléfono para abrirla sin internet |
| `manifest.webmanifest`, `icons/` | Permiten «Agregar a pantalla de inicio» |
| `apps-script/Code.gs` | Receptor para Google Sheets (se pega en Google, no se publica con la app) |
| `herramientas/` | `cuestionario.xlsx` y `clinica.xlsx` (fuentes) y `convertir_xlsform.py` (genera los `.js`) |

## 1. Publicar en GitHub Pages

1. Sube **todo** el contenido de esta carpeta a la raíz del repositorio (reemplaza lo anterior).
2. **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. La app queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

El modo sin conexión requiere HTTPS (GitHub Pages ya lo tiene).

## 2. Conectar con Google Sheets

1. En Apps Script reemplaza el contenido de `Code.gs` por `apps-script/Code.gs`.
2. **Configuración del proyecto → Propiedades de la secuencia de comandos**:
   - `TOKEN` = la clave que compartes con el equipo (ya la tienes).
   - `SHEET_ID` = el ID de tu hoja de Google **solo si** el script no se creó desde la hoja
     (Extensiones → Apps Script). El ID es el texto largo de la URL de la hoja entre `/d/` y `/edit`.
3. **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar.**
   La URL no cambia, así que los teléfonos ya configurados siguen funcionando.
4. En la app: **Configurar envío → Probar conexión** debe decir «Conexión correcta (script v2.1.0)».

El script nuevo también acepta a las apps v2.0.0 que ya estén en los teléfonos, así que conviene actualizarlo **antes** de subir la app a GitHub.

El script crea solo las pestañas y columnas:

- **Hogares** y **Clinicas**: una fila por encuesta; una columna por pregunta, más `_id`, `_estado`, `_capturado_en`…
- **integrantes** (una pestaña por bloque repetido): una fila por persona, ligada al hogar por `_id_hogar` y `hogar_id`.

Si en la hoja había pestañas de la versión anterior, se renombran solas a `Hogares_anterior` e `Integrantes_anterior` (no se pierde nada).
Los textos se guardan como texto (no se pierden ceros a la izquierda en teléfonos o claves).

## 3. Cambiar el cuestionario

1. Edita `herramientas/cuestionario.xlsx` (sube `version` en la hoja `settings`).
2. Genera el archivo (el tercer dato es la clave del instrumento):
   `python3 herramientas/convertir_xlsform.py herramientas/cuestionario.xlsx cuestionario.js hogares`
   `python3 herramientas/convertir_xlsform.py herramientas/clinica.xlsx clinica.js clinica`
   (necesita `pip install openpyxl`). El conversor revisa que todas las `${variables}` y listas existan y avisa de errores.
3. Sube **solo el `.js` que cambió** a GitHub. Los teléfonos se actualizan solos la siguiente vez que abran la app con internet.
   No hay que tocar `sw.js`, `app.js` ni el script de Google (las columnas nuevas se crean automáticamente).

Si cambias el código de la app (`app.js`, `styles.css`, `index.html`), sube además `VERSION` en `sw.js` y `APP_VERSION` en `app.js`.

**Recomendación:** no cambies preguntas a mitad del levantamiento. Cada encuesta guarda con qué versión del cuestionario se capturó.

### Funciones de XLSForm que la app entiende

Tipos: `text`, `integer`, `decimal`, `date`, `time`, `select_one`, `select_multiple`, `note`, `calculate`, `start`, `end`, `begin/end group`, `begin/end repeat`.
Expresiones: `${campo}`, `= != > < >= <=`, `and or + - * div mod`, `if()`, `count-selected()`, `selected()`, `regex()`, `concat()`, `string-length()`, `today()`, `now()`, `int()`, `round()`, `not()`, `position(..)`.
No soportados: `choice_filter`, `repeat_count`, `jr:`, imágenes/audio, otros idiomas.

## 4. Probar sin internet

1. Abre la app **con internet**. Al pie debe decir **«✓ Lista para usarse sin conexión»**.
2. Activa el **modo avión**, cierra el navegador por completo y vuelve a abrir la dirección. Debe verse completa.
3. Captura una encuesta y guárdala: aparece en **Pendientes**. Al reconectar se envía sola.

## Inventario de clínica

- Una visita por clínica. Pide ID de la clínica (CLUES o clave corta), nombre, municipio, localidad, fecha e investigador, y después:
  infraestructura y mobiliario (A, B), equipo de diagnóstico (C), instrumental y material de curación (D, E) y los 27 medicamentos del Apéndice A de la NOM-005-SSA3-2010.
- Cada reactivo de equipamiento se responde con *Existe y opera / Existe pero no opera / No existe*; las observaciones aparecen solo si no existe o no opera. El negatoscopio tiene una cuarta opción, *No aplica*.
- Cada medicamento pide cantidad de cajas/unidades (0 si no hay); si hay, pide el % caducado (0 a 100) y deja observaciones.
- Para agregar un tercer instrumento: crea su XLSForm, conviértelo con una clave nueva, agrega su bloque en `FORM_CFG` (`app.js`), su `<script>` en `index.html` y su archivo en `sw.js`.

## Cómo se usa en campo

- Cada sección valida lo obligatorio antes de avanzar. Las respuestas que dependen de otras aparecen solas.
- Si una persona no acepta participar, la app cierra directo en la revisión.
- Las notas de **urgencia** salen en rojo, marcan la tarjeta de la persona y se repiten en la revisión final.
- La revisión final avisa si el total de integrantes declarado no coincide con los registrados y lista lo que falta con un botón **Ir**.
- **Guardar como incompleta** permite guardar una entrevista interrumpida; se marca `_estado = incompleta` en la hoja.
- Si se cierra el navegador a media entrevista, se recupera el borrador.
- La app recuerda investigador, municipio y localidad en ese teléfono para precargarlos.

## Datos y privacidad

El cuestionario captura nombres/iniciales, referencia del domicilio, teléfono y datos de salud (diagnósticos, embarazo, presión arterial).
Los datos quedan **sin cifrar** en el teléfono hasta enviarse. Conviene: bloqueo de pantalla en cada dispositivo, restringir quién puede abrir la hoja de Google,
borrar del teléfono las encuestas ya confirmadas en la hoja, y exportar el respaldo JSON periódicamente
(en iPhone, Safari puede borrar datos de sitios sin uso por ~7 días si la app no está instalada en la pantalla de inicio).

## Limitaciones conocidas

- Detecta ID de hogar repetido solo dentro del mismo teléfono (usa prefijos por encuestador).
- No hay edición de encuestas ya guardadas: se captura de nuevo y se borra la anterior.
- Las encuestas guardadas con la versión 1 de la app (formato distinto) no se envían: aparecen como «Formato anterior»; expórtalas con «Respaldo JSON».
