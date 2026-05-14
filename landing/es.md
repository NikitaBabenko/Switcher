---
title: "Disposición de teclado: corrector de tipeo en 12 idiomas"
description: "Extensión de Chrome que corrige texto escrito en disposición de teclado incorrecta con un atajo. 12 disposiciones (español, ruso, alemán, coreano), sin conexión, código abierto."
slug: switcher
locale: es
hreflang:
  en: /switcher
  ru: /ru/switcher
  uk: /uk/switcher
  be: /be/switcher
  de: /de/switcher
  fr: /fr/switcher
  el: /el/switcher
  he: /he/switcher
  tr: /tr/switcher
  pl: /pl/switcher
  es: /es/switcher
  ko: /ko/switcher
canonical: https://vibenest.net/es/switcher
og_image: /og/switcher-es.png
schema:
  - SoftwareApplication
  - FAQPage
  - BreadcrumbList
keywords_primary: disposición de teclado
keywords_secondary:
  - cambiar idioma teclado
  - corrector de teclado
  - cambiar disposición teclado chrome
last_updated: 2026-05-13
---

<!-- TODO: Web Store ID - reemplaza `vibenest-switcher` en los CTA tras la publicación. -->

# Disposición de teclado: corrector de tipeo en 12 idiomas

Escribiste `ghbdtn` cuando querías escribir `привет`. **VibeNest Switcher** es una extensión de Chrome que corrige texto escrito con la disposición de teclado equivocada en una sola combinación de teclas. Sin selección, sin copiar y pegar, sin volver a escribir. La detección funciona sin conexión, el código está en GitHub, y el paquete incluye 12 disposiciones de teclado (inglés, ruso, alemán, francés, polaco, español, coreano y seis más).

[**Instalar desde Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

> **Código abierto · Sin conexión · 12 disposiciones · Manifest V3 · Sin telemetría · Sin cuenta · Gratis**

## Corregir disposición de teclado equivocada en un atajo

Cualquiera que escriba todos los días en dos alfabetos (latín y cirílico, español e inglés en teclados latinos compartidos, o cualquier otra pareja de disposiciones que se solapan) conoce el ritmo. Olvidaste cambiar la disposición, miraste la pantalla, seleccionaste, borraste, volviste a teclear. El cambio de disposición del sistema solo afecta a la *siguiente* tecla, no arregla lo que ya está en pantalla. VibeNest Switcher es exactamente el botón que falta: cursor en el campo, **`Ctrl+Shift+L`**, y el campo se reescribe en su sitio con la disposición correcta. Funciona en cualquier campo de texto de la web abierta: Twitter/X, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, LinkedIn, Reddit.

### Antes / Después

| Escribiste (disposición incorrecta) | Lo que querías escribir |
|---|---|
| `ghbdtn` | `привет` |
| `Руддщ` | `Hello` |
| `Hola` (en cirílico) | `Рщдф` |
| `Lf, ds nfv;t!` | `Да, вы там же!` |
| `xfq c kbvjyjv` | `чай с лимоном` |

El mismo atajo funciona en cualquier dirección entre las 12 disposiciones soportadas. También puedes pegar el texto erróneo en el popup de la barra de herramientas y copiar la versión corregida con un clic.

## El problema de la disposición equivocada del que nadie habla

Bilingües español-inglés con compañeros de equipo internacionales, hispanohablantes con familia rusa o ucraniana, traductores, programadores e ingenieros en equipos multiculturales, equipos de soporte, profesores y estudiantes de idiomas: todos conocen el micro-coste. Unos segundos por corrección multiplicados por decenas de veces al día. En un año son días de vida perdidos por una mala costumbre entre la mano y el sistema operativo.

El cambio de disposición del sistema operativo no resuelve esto. Cambia el idioma de entrada activo pero no arregla lo que ya tecleaste. Los transliteradores fonéticos (Translit, Cyrillatin) tampoco lo resuelven. Sirven para escribir en cirílico sin tener teclado cirílico, deletreando palabras fonéticamente (`privet` para `привет`). Es una categoría distinta. **VibeNest Switcher resuelve exactamente ese instante**: terminaste de escribir, viste que la disposición era la equivocada, y quieres corregir de un gesto sin salir del campo.

La respuesta histórica en escritorio fue una pequeña familia de utilidades de cambio de disposición. Todas de código cerrado, todas solo para Windows, incapaces de llegar a las aplicaciones web modernas donde hoy se escribe la mayor parte. VibeNest Switcher es la alternativa de código abierto, nativa de navegador, completamente sin conexión: actúa en el campo donde realmente escribes, en cualquier sistema operativo donde corra Chrome o Chromium.

## Características

- **Atajo de teclado** (`Ctrl+Shift+L`) y botón popup en la barra de herramientas: corrección instantánea del campo activo
- **Modo pegar-y-corregir**: pega el texto erróneo en el popup, ve la versión corregida, cópiala con un clic
- **Menú contextual con clic derecho** sobre texto seleccionado, sin soltar el ratón
- **Deshacer por página**: revierte la última corrección en la página actual con un solo clic
- **Adaptadores de sitios** para Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon, más un adaptador genérico para todo lo demás
- **Política de sitios**: bloquea hosts concretos (tu banco, tu intranet) o restringe la extensión a una whitelist de sitios de confianza
- **Idiomas inteligentes por defecto**: en la primera instalación, la extensión lee la configuración regional del navegador y preselecciona los idiomas de escritura más probables; modificables en Opciones cuando quieras
- **12 disposiciones de teclado de fábrica**: inglés (US QWERTY), ruso (ЙЦУКЕН), ucraniano, bielorruso, alemán (QWERTZ), francés (AZERTY), griego, hebreo, turco (Q), polaco (214), español (QWERTY), coreano (Dubeolsik). El coreano es un caso especial: el motor descompone las sílabas Hangul en jamos antes de la transposición y vuelve a componerlas después
- **12 traducciones de interfaz** para el popup y el panel de Opciones: en, ru, uk, be, de, fr, el, he, tr, pl, es, ko

Compilación Manifest V3 con permisos mínimos auditados, lista para la política de Chrome 2025 sin trabajo de migración por tu parte.

## Cómo funciona

El motor de detección transpone cada carácter por cada par de disposiciones activado, luego un modelo de lenguaje de trigramas de caracteres, entrenado con las 3000 palabras más frecuentes de cada idioma, puntúa ambas direcciones y se queda con la que parece texto natural. Una heurística de Bloq Mayús y un desempate de "naturalidad de mayúsculas" tratan los casos límite (`hELLO` se convierte en `Hello`, un CAPS LOCK intencional queda intacto). Todo esto corre en tu navegador: nada va a un modelo remoto, sin llamadas a API, sin latencia de red en el bucle.

El algoritmo es **sin LLM**. Es una tabla de transposición más un pequeño scorer estadístico. Por eso el modelo de lenguaje incluido pesa unos 270 KB y la conversión se ejecuta en menos de un milisegundo: justo el perfil que necesita el uso inline en cualquier campo de texto. Como el modelo está incluido y congelado, cada instalación se comporta igual. Sin reentrenamiento silencioso del lado del servidor a tus espaldas.

## Cómo se compara VibeNest Switcher

La categoría "corrector multilingüe de disposición de teclado" es estrecha. Las alternativas serias se diferencian en pocos ejes que importan a la mayoría: si el código se puede auditar, qué sale (o no) del dispositivo, cuántas disposiciones vienen de fábrica y dónde se ejecuta la herramienta (navegador o solo escritorio).

| | **VibeNest Switcher** | EasyType Switcher | Caramba Switcher | Punto Switcher |
|---|---|---|---|---|
| Código abierto (auditable) | Sí, MIT, código en GitHub | No | No | No |
| Sin conexión total / sin telemetría | Sí, modelo incluido, cero red | Código cerrado, no verificable | Escritorio | Escritorio |
| Número de disposiciones | **12** | 2 (RU/EN) | 2-3 | 2 (RU/EN) |
| Manifest V3 / nativo del navegador | Sí, MV3, listo para la política 2025 | Sí, MV3 | No, solo escritorio | No, solo escritorio |
| Multiplataforma | Sí, cualquier SO con Chrome / Chromium | Sí, cualquier SO con Chrome | No, solo Windows | No, solo Windows |
| Mantenido activamente (2026) | Sí, tracker de issues abierto | Esporádico | Sí | Sí |

VibeNest Switcher es la única fila en la que coinciden código abierto, ejecución nativa en el navegador y sin conexión completo. Si te gustaba la idea del "cambiador en vivo" de escritorio pero querías sin binario cerrado y sin que el texto saliese del dispositivo, esa es la franja que cubre.

[**Instalar desde Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

## Preguntas frecuentes

### ¿Cómo corrijo texto escrito con la disposición de teclado equivocada?

Instala VibeNest Switcher, coloca el cursor en el campo con el texto erróneo y pulsa **`Ctrl+Shift+L`**. La extensión detecta en qué par de disposiciones se escribió el texto, transpone los caracteres y reescribe el campo en su sitio. No tienes que seleccionar, copiar ni reescribir nada. El mismo atajo funciona en Twitter, Slack, Telegram Web, WhatsApp Web, Discord, Gmail, Notion, Reddit, LinkedIn y cualquier otro campo de texto de la web abierta. Si un campo no se puede modificar directamente (por ejemplo una vista de exportación de solo lectura), la extensión copia el texto corregido al portapapeles y muestra una pequeña notificación.

### ¿Cómo cambiar el idioma del teclado rápidamente en el navegador?

VibeNest Switcher no reemplaza el cambio de disposición a nivel del sistema operativo. Para cambiar entre idiomas de entrada sigue usando la combinación habitual de tu sistema. La extensión es para otra cosa: arreglar el texto ya escrito. Si empezaste a escribir en inglés mientras el sistema estaba en ruso (`Руддщ` en lugar de `Hello`), un atajo reescribe el campo. En el sentido contrario igual: `ghbdtn` se convierte en `привет` en un milisegundo, sin clics extra y sin salir del campo.

### ¿Es una herramienta de teclado multilingüe?

Sí. VibeNest Switcher es un corrector multilingüe de disposición de teclado con 12 disposiciones (inglés, ruso, ucraniano, bielorruso, alemán, francés, griego, hebreo, turco, polaco, español, coreano) y traducciones completas de la interfaz. A diferencia de las herramientas de pareja única, VibeNest detecta y convierte entre cualquier par de disposiciones activadas. Activa solo los idiomas que realmente uses; la detección se concentra en tu conjunto activo, lo que hace los resultados más rápidos y precisos. Si escribes en tres o más alfabetos al día, este es un salto evidente frente a las herramientas de un solo par.

### ¿En qué se diferencia de Punto Switcher?

Es una aplicación de escritorio para Windows. VibeNest Switcher es la alternativa de código abierto, nativa de navegador, que se ejecuta íntegramente dentro de Chrome y cualquier navegador Chromium, así que funciona en macOS, Linux, ChromeOS y Windows por igual. Y actúa en los campos web donde hoy se escribe la mayor parte. La idea de detección es la misma (transponer y luego puntuar), pero el modelo va incluido en la extensión y trabaja sin conexión. Ni un carácter de tu texto sale del navegador. El código fuente está en [GitHub](https://github.com/NikitaBabenko/Switcher), así que la postura de privacidad se puede verificar leyendo el código en vez de confiar en una declaración.

### ¿Translitera del cirílico al latino (o al revés)?

No. Esto es corrección de disposición, no escritura fonética. Si buscas una herramienta para escribir ruso en un teclado solo US deletreando las palabras fonéticamente (`privet` para `привет`, `spasibo` para `спасибо`), es otra categoría (Cyrillatin, Translit). VibeNest Switcher es para el caso en que las dos disposiciones ya están, escribiste en la equivocada por accidente, y quieres el resultado corregido en el sitio. Las dos categorías resuelven problemas vecinos pero no son intercambiables.

### ¿Funciona sin conexión? ¿Qué sale de mi navegador?

Totalmente sin conexión por defecto. El modelo de lenguaje de trigramas incluido vive dentro del paquete de la extensión; la detección corre en tu dispositivo. **Ni el texto ni los metadatos salen a ningún sitio.** Sin SDK de analítica, sin telemetría, sin logging remoto, sin scripts de terceros. En Opciones hay un fallback opcional a una API remota, **desactivado por defecto**, con el campo URL vacío; si nunca lo activas, la extensión no hace ni una sola petición de red relacionada con la conversión de texto. Los permisos y su justificación están detallados línea por línea en [PRIVACY.md](https://vibenest.net/switcher/privacy), y el flujo de datos se puede auditar contra el código fuente en GitHub.

### ¿Cuáles son las 12 disposiciones de teclado soportadas?

Inglés (US QWERTY), ruso (ЙЦУКЕН), ucraniano, bielorruso, alemán (QWERTZ), francés (AZERTY), griego, hebreo, turco (Q), polaco (214), español (QWERTY) y coreano (Dubeolsik / 두벌식). Cualquier pareja activada queda disponible para la detección. El coreano es el caso más interesante: cada sílaba Hangul de la pantalla se descompone de manera reversible en su secuencia de jamos, para que el mismo algoritmo de transponer-y-puntuar también funcione ahí. ¿Necesitas otra (italiano, checo, hindi)? Añadir una disposición son dos archivos (tabla de 46 caracteres más lista de las 3000 palabras más frecuentes) y las vamos sumando tan rápido como podamos verificarlas. Abre un issue en GitHub o escribe a **info@vibenest.net**.

### ¿Es gratis? ¿De código abierto?

Sí a ambas. VibeNest Switcher es gratis, sin cuenta, sin pago, sin anuncios. El código fuente completo está en GitHub en <https://github.com/NikitaBabenko/Switcher> bajo una licencia open source permisiva. Puedes leer cada línea de código que trabaja con tu texto. Justo ese es el sentido del compromiso de privacidad: verificable, no declarativo. Si encuentras un bug o quieres una función, el tracker de issues es el sitio correcto para empezar.

## Instalar VibeNest Switcher

[**Instalar desde Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

- **GitHub**: <https://github.com/NikitaBabenko/Switcher>
- **Política de privacidad**: <https://vibenest.net/switcher/privacy>
- **Correo**: **info@vibenest.net** para sugerencias, reportes de bugs y peticiones de nuevos idiomas

---

*Punto Switcher es marca registrada de su propietario respectivo. VibeNest Switcher es un proyecto open source independiente, no afiliado a Yandex ni aprobado por Yandex.*
