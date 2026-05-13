# VibeNest Switcher: Descripción detallada (Español)

Escribiste `ghbdtn`, querías escribir `привет`. Pulsa `Ctrl+Shift+L`. La maraña se convierte en el texto correcto, sin volver a teclear, sin salir del campo, sin enviar ni un solo carácter a un servidor.

VibeNest Switcher es una extensión de Chrome que corrige texto escrito con la disposición de teclado equivocada en una sola combinación de teclas. Por defecto, todo funciona sin conexión. El código fuente está en GitHub. El paquete incluye 12 disposiciones de teclado (inglés, ruso, ucraniano, bielorruso, alemán, francés, griego, hebreo, turco, polaco, español, coreano) y 12 traducciones de interfaz.

============================================================

EN QUÉ SE DIFERENCIA VIBENEST SWITCHER

100% código abierto. Cada línea de código que trabaja con tu texto está disponible en GitHub: https://github.com/NikitaBabenko/Switcher. Ejecuta las pruebas localmente, compila desde la fuente, verifica en tu propio navegador.

Totalmente sin conexión por defecto. El modelo de lenguaje viene incluido dentro del paquete de la extensión, unos 270 KB. Sin telemetría, sin analítica, sin llamadas a la nube, sin scripts de terceros. La conversión nunca sale del dispositivo.

Sin cuenta, sin inicio de sesión, sin pago, sin anuncios. Instala y usa.

12 disposiciones de teclado de fábrica. La mayoría de alternativas cubren una o dos parejas (ruso/inglés). VibeNest maneja cualquier pareja que actives.

Compilación Manifest V3 moderna. Permisos mínimos auditados, lista para la política de Chrome 2025. Sin trabajo de migración por tu parte.

Multinavegador. Funciona en Chrome y cualquier fork de Chromium (Edge, Brave, Opera, Vivaldi). Compilaciones independientes para Edge y Firefox en la hoja de ruta.

============================================================

QUÉ HACE

Atajo de teclado (Ctrl+Shift+L) y botón popup en la barra de herramientas. El atajo reescribe el campo de texto activo en su sitio. El popup ofrece una vista de dos paneles con el original y la versión corregida, útil para campos de solo lectura o cuando quieres inspeccionar la conversión antes de aplicarla.

Modo pegar-y-corregir. Pega el texto erróneo en el popup, ve la versión corregida, cópiala con un clic. Funciona para texto que ya copiaste desde la barra de direcciones, una vista de exportación o cualquier contexto de solo lectura.

Menú contextual con clic derecho. Con texto seleccionado en la página, clic derecho, elige "Corregir disposición", sin soltar el ratón.

Autocorrección al escribir. Opcional, desactivada por defecto. Cuando se activa, la extensión vigila la entrada y corrige las palabras evidentes con disposición incorrecta después del espacio. La tecla Retroceso rechaza una autocorrección inmediatamente después de que ocurra. Los campos que parecen campos de contraseña (input type=password, autocomplete=current-password) y los campos de OTP y números de tarjeta están excluidos de la autocorrección por diseño.

Deshacer por página. El popup mantiene un paso de deshacer para la última corrección en la página actual.

Adaptadores de sitios. Manejadores preparados para sitios con entradas no estándar (envoltorios contenteditable, inputs gestionados por React, composers aislados en iframes): Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon. Un adaptador genérico cubre el resto.

Política de sitios. Bloquea hosts específicos (tu banco, tu intranet, tu gestor de contraseñas) o restringe la extensión a una whitelist de hosts de confianza. Las reglas por host persisten entre sesiones.

Idiomas inteligentes por defecto. La primera vez que abres la extensión, lee la configuración regional del navegador y preselecciona los idiomas de escritura más probables. Puedes cambiarlo en Opciones cuando quieras.

12 disposiciones de teclado de fábrica. Inglés (US QWERTY), ruso (ЙЦУКЕН), ucraniano, bielorruso, alemán (QWERTZ), francés (AZERTY), griego, hebreo, turco (Q), polaco (214), español (QWERTY), coreano (Dubeolsik / 두벌식).

12 traducciones de interfaz. Popup y página de Opciones localizadas a en, ru, uk, be, de, fr, el, he, tr, pl, es, ko. Para el hebreo, el popup sigue la dirección de derecha a izquierda.

============================================================

CÓMO FUNCIONA

El motor de detección transpone cada carácter por cada par de disposiciones activado, después un modelo de lenguaje de trigramas de caracteres puntúa ambas direcciones. El modelo está entrenado con las 3000 palabras más frecuentes de cada idioma. La dirección con mejor puntuación (la que más parece texto natural) es la que se aplica al campo.

Una heurística de Bloq Mayús y un desempate de "naturalidad de mayúsculas" tratan los casos límite: `hELLO` se convierte en `Hello`, un `CAPS LOCK` intencional queda intacto, mayúsculas mezcladas en el interior de la palabra como `JavaScript` se preservan.

El algoritmo es deliberadamente sin LLM. Es una tabla de transposición más un pequeño scorer estadístico. Por eso el modelo de lenguaje incluido pesa unos 270 KB y la conversión se ejecuta en menos de un milisegundo. Como el modelo está incluido y congelado, cada instalación se comporta igual. Sin reentrenamiento silencioso del lado del servidor a tus espaldas.

El coreano es el caso más interesante del motor. Cada sílaba Hangul de la pantalla se descompone de manera reversible en su secuencia de jamos de compatibilidad, para que el mismo algoritmo (transponer y luego puntuar) también funcione ahí. Tras el scoring, el resultado se recompone en sílabas Hangul.

============================================================

PARA QUIÉN ES

- Bilingües que alternan varias veces al día entre español y otro alfabeto.
- Traductores y traductoras que saltan entre lengua de origen y lengua de destino dentro del mismo párrafo.
- Programadores y equipos de TI en entornos multilingües.
- Equipos de soporte que prefieren no enviar un correo a un colega que empiece por "Уважаемые коллеги, ifkjvtt..."
- Estudiantes y profesores de idiomas que copian texto entre el diccionario, los apuntes y un chat con el profesor.
- Cualquiera que trabaje en un flujo multi-escritura.

============================================================

PRIVACIDAD

Por defecto la extensión funciona sin conexión. El detector incluido vive en el navegador. Ni texto, ni metadatos, ni eventos se envían a ningún sitio. En la extensión no hay SDK de analítica, no hay telemetría, no hay logging remoto, no hay scripts de terceros. El paquete es lo bastante pequeño para leerlo de principio a fin en GitHub.

Los permisos y su justificación están detallados línea por línea en la política de privacidad: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

En Opciones hay un fallback opcional a una API remota, desactivado por defecto, con el campo URL vacío. Si nunca lo activas, la extensión no hace ni una sola petición de red relacionada con la conversión de texto.

============================================================

PREGUNTAS FRECUENTES

P: ¿Cómo corrijo texto escrito con la disposición de teclado equivocada?
R: Coloca el cursor en el campo de texto, pulsa Ctrl+Shift+L. La extensión detecta la pareja de disposiciones, transpone los caracteres y reescribe el campo en su sitio. Funciona en Twitter, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, Reddit, LinkedIn y cualquier otro campo de texto de la web abierta.

P: ¿Cómo cambio rápidamente el idioma del teclado en el navegador?
R: VibeNest Switcher no reemplaza el cambio de disposición a nivel del sistema operativo. Para cambiar entre idiomas de entrada sigue usando la combinación habitual de tu sistema. La extensión es para otra cosa: arreglar el texto ya escrito.

P: ¿Translitera del cirílico al latino?
R: No. Esto es corrección de disposición, no escritura fonética. Las herramientas de escritura fonética para alfabetos sin teclado físico pertenecen a una categoría distinta.

P: ¿Funciona sin conexión?
R: Sí. Totalmente sin conexión por defecto. El modelo de trigramas dentro del paquete de la extensión.

P: ¿Qué permisos necesita y por qué?
R: Los mínimos necesarios para reescribir texto en el navegador: activeTab, scripting, storage, contextMenus. Cada uno justificado en PRIVACY.md.

P: ¿Cómo activo la autocorrección al escribir?
R: Abre el popup de la extensión, pulsa el engranaje, activa Autocorrección. La tecla Retroceso rechaza inmediatamente cualquier autocorrección tras dispararse.

P: ¿Funciona en Edge, Brave, Opera?
R: Sí, en cualquier navegador basado en Chromium. Edge recoge las compilaciones MV3 directamente desde Chrome Web Store.

P: ¿Añadiréis la disposición X (italiano, checo, hindi)?
R: Sí, pídela. Añadir una disposición son dos archivos (tabla de 46 caracteres más lista de las 3000 palabras más frecuentes) más una reconstrucción del modelo.

============================================================

IDIOMAS COMPATIBLES

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

¿Necesitas otro? Abre un issue en GitHub o escribe a info@vibenest.net.

============================================================

NOVEDADES

Versión 1.0.1 (13 de mayo de 2026)
- Retirados los guiones largos de las cadenas de interfaz y los textos de landings para una tipografía coherente.

Versión 1.0.0 (12 de mayo de 2026)
- Lanzamiento estable. Fallback opcional a una API remota oculto en Ajustes, desactivado por defecto con campo URL vacío; la instalación por defecto nunca toca la red.
- Texto de privacidad actualizado en Ajustes, refleja la postura sin-conexión por defecto.
- La composición y descomposición del Hangul coreano es la vía recomendada para la transposición 한영.

Versiones anteriores añadieron las disposiciones coreana, polaca y española (v0.3.0), los adaptadores de Twitch y Mastodon, así como el deshacer por página.

============================================================

CÓDIGO FUENTE Y CONTACTO

- GitHub: https://github.com/NikitaBabenko/Switcher
- Política de privacidad: https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md
- Correo para sugerencias, reportes de errores y peticiones de nuevos idiomas: info@vibenest.net

