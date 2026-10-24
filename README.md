# Reconocimiento de Hogares · captura sin conexión

Cuestionario de campo (Oaxaca) que funciona **sin internet** una vez cargado una vez con conexión.
Guarda cada encuesta en el teléfono y la envía a Google Sheets cuando hay señal.

No tiene dependencias externas (ni CDN, ni librerías): todo está en este repositorio.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La aplicación |
| `sw.js` | Service worker: guarda la app en el teléfono para abrirla sin internet |
| `manifest.webmanifest`, `icons/` | Permiten «Agregar a pantalla de inicio» |
| `apps-script/Code.gs` | Receptor en Google Apps Script (no se publica con la app; se pega en Google) |

## 1. Publicar en GitHub Pages

1. Sube **todo** el contenido de esta carpeta a la raíz del repositorio (reemplaza el `index.html` anterior).
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Espera 1–2 minutos. La app quedará en `https://TU-USUARIO.github.io/PO_reconocimiento-de-hogares/`.

> El modo sin conexión **requiere HTTPS** (GitHub Pages ya lo tiene). No funciona abriendo el archivo con doble clic (`file://`).

## 2. Conectar con Google Sheets

1. Crea una hoja de cálculo de Google nueva.
2. **Extensiones → Apps Script**. Borra el contenido y pega `apps-script/Code.gs`.
3. **Configuración del proyecto (engrane) → Propiedades de la secuencia de comandos → Agregar propiedad**:
   nombre `TOKEN`, valor una clave larga que inventes (ej. 20+ caracteres al azar). Guárdala.
4. **Implementar → Nueva implementación → Tipo: Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - Autoriza los permisos y copia la **URL de la aplicación web** (termina en `/exec`).
5. En la app, toca **Configurar envío**, pega la URL y el token, **Guardar** y **Probar conexión**.

El script crea solas las hojas **Hogares** (una fila por hogar) e **Integrantes** (una fila por persona, ligada por `id_hogar`).
Si cambias `Code.gs` después, hay que hacer **Implementar → Administrar implementaciones → editar → Nueva versión**.

El token evita que cualquiera que encuentre la URL escriba en tu hoja. Compártelo solo con el equipo de campo.

## 3. Probar que realmente funciona sin internet

1. Abre la app **con internet** en el teléfono. Al pie debe aparecer **«✓ Lista para usarse sin conexión»**.
2. Activa el **modo avión**, cierra el navegador por completo y vuelve a abrir la dirección.
   Debe cargar con estilos completos y la barra en ámbar («Sin conexión»).
3. Captura una encuesta completa y guárdala: aparece en **Pendientes**.
4. Desactiva el modo avión: se envía sola. Revisa la hoja de Google.

Recomendado en cada teléfono: **Chrome → ⋮ → Instalar aplicación** (o en iPhone, Safari → Compartir → *Agregar a pantalla de inicio*).

## Qué cambió respecto a la primera versión

- **Modo sin conexión real**: service worker en archivo propio con precache; sin Tailwind/FontAwesome por CDN.
- **Guardado confiable**: el mensaje de éxito sale solo cuando IndexedDB confirmó la escritura.
- **Borrador automático**: si se cierra el navegador a media entrevista, se recupera.
- **Validación real** de todos los campos obligatorios de cada integrante (nombre, sexo, edad 0–115, parentesco) y no se pueden saltar pasos desde las pestañas.
- **Límite de 12 integrantes** calculado sobre los integrantes actuales (antes se acumulaba al eliminar).
- **Sincronización sin duplicados**: el script responde con un estado verificable; solo se marca «Enviada» si Google confirmó; reintentos seguros (clave `id`).
- **Token de acceso** y neutralización de fórmulas (`=`, `+`, `-`, `@`) en la hoja y en los CSV.
- **Exportación** de dos CSV (hogares e integrantes) y respaldo JSON; antes el CSV omitía a las personas.
- Fecha de entrevista en **hora local** (antes podía salir un día adelantada por la tarde-noche).
- Aviso al repetir un folio y confirmación reforzada al borrar encuestas aún no enviadas.

## Publicar una actualización

Cambia el número de versión en **dos** lugares (`VERSION` en `sw.js` y `APP_VERSION` en `app.js`), sube los cambios y
abre la app con internet; el teléfono descargará la versión nueva y la usará desde la siguiente apertura.

## Datos y privacidad

La app captura nombres, domicilio, ubicación y afiliación a salud. Los datos quedan **sin cifrar** en el navegador del teléfono
hasta que se envían, así que conviene: bloqueo de pantalla en cada dispositivo, borrar las encuestas del teléfono una vez
confirmadas en la hoja, y restringir quién puede abrir la hoja de Google.
Si el teléfono usa iPhone/Safari y no se instala en la pantalla de inicio, iOS puede limpiar datos de sitios que no se usan
por ~7 días: exporta el respaldo JSON periódicamente.

## Límites conocidos

- Un solo dispositivo por folio: la app avisa de folios repetidos solo dentro del mismo teléfono.
- No hay edición de encuestas ya guardadas (si hay error, se captura de nuevo y se borra la anterior).
