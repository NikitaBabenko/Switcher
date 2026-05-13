---
title: "Correcteur de disposition de clavier en 12 langues (russe, anglais, allemand)"
description: "Extension Chrome qui corrige le texte tapé dans la mauvaise disposition de clavier en une touche. 12 dispositions (russe, allemand, français, coréen), hors ligne, open source."
slug: switcher
locale: fr
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
canonical: https://vibenest.net/fr/switcher
og_image: /og/switcher-fr.png
schema:
  - SoftwareApplication
  - FAQPage
  - BreadcrumbList
keywords_primary: disposition de clavier
keywords_secondary:
  - changer disposition clavier
  - clavier russe extension chrome
  - mauvaise disposition clavier
  - correcteur clavier
last_updated: 2026-05-13
---

<!-- TODO: Web Store ID - remplacer `vibenest-switcher` dans les CTA après publication. -->

# Correcteur de disposition de clavier en 12 langues (russe, anglais, allemand)

Vous avez tapé `ghbdtn` au lieu de `привет`. **VibeNest Switcher** est une extension Chrome qui corrige le texte saisi dans la mauvaise disposition de clavier en une seule combinaison de touches. Pas de sélection, pas de copier-coller, pas de retape. La détection fonctionne hors ligne, le code source est sur GitHub, et le pack inclut 12 dispositions de clavier (anglais, russe, français, allemand, polonais, espagnol, coréen et six autres).

[**Installer depuis le Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

> **Open source · Hors ligne · 12 dispositions · Manifest V3 · Aucune télémétrie · Sans compte · Gratuit**

## Corriger une mauvaise disposition de clavier en une touche

Quand on écrit chaque jour en latin et en cyrillique (ou en français et en russe, ou en grec et en latin, bref dans toute paire où les touches se recouvrent), on connaît ce rythme. On oublie de basculer, on regarde l'écran, on sélectionne, on supprime, on retape. La bascule de disposition du système ne règle que la *prochaine* frappe, pas ce qui est déjà à l'écran. VibeNest Switcher est exactement le bouton qui manque : curseur dans le champ, **`Ctrl+Maj+L`**, et le champ est réécrit sur place dans la bonne disposition. Fonctionne dans n'importe quel champ texte du web ouvert : Twitter/X, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, LinkedIn, Reddit.

### Avant / Après

| Vous avez tapé (mauvaise disposition) | Ce que vous vouliez écrire |
|---|---|
| `ghbdtn` | `привет` |
| `Руддщ` | `Hello` |
| `Lf, ds nfv;t!` | `Да, вы там же!` |
| `xfq c kbvjyjv` | `чай с лимоном` |
| `Bonjour` (tapé en cyrillique) | `Ивтрщгк` |

La même combinaison fonctionne dans les deux sens entre les 12 dispositions supportées. Vous pouvez aussi coller le texte erroné dans le popup de la barre d'outils et copier la version corrigée en un clic.

## Le problème de la mauvaise disposition dont personne ne parle

Bilingues français-russe, traducteurs entre source et cible, développeurs et IT dans des équipes internationales, équipes support, professeurs et étudiants en langues : tout le monde connaît ce micro-coût. Quelques secondes pour corriger, multipliées par des dizaines d'occurrences par jour, font des jours perdus dans l'année à cause d'une mauvaise habitude entre la main et le système.

La bascule de disposition au niveau de l'OS ne règle pas ça. Elle change la langue d'entrée active mais ne répare pas ce qui est déjà saisi. Les translittérateurs phonétiques (Translit, Cyrillatin) ne règlent pas ça non plus. Ils servent à taper en cyrillique sans avoir de clavier cyrillique, en écrivant `privet` pour `привет`. C'est une catégorie différente. **VibeNest Switcher résout précisément ce moment-là** : vous avez fini de taper, vous voyez que la disposition était fausse, et vous voulez corriger d'un geste sans sortir du champ.

La réponse historique sur le bureau a été une petite famille d'utilitaires de bascule de disposition. Tous closed-source, tous Windows-only, incapables d'atteindre les applications web modernes où se passe l'essentiel de la saisie aujourd'hui. VibeNest Switcher est l'alternative open source, navigateur-native, entièrement hors ligne : elle agit dans le champ où vous tapez réellement, sur tout OS où tourne Chrome ou Chromium.

## Fonctionnalités

- **Raccourci clavier** (`Ctrl+Maj+L`) et bouton popup dans la barre d'outils : correction instantanée du champ actif
- **Mode coller-et-corriger** : collez le texte erroné dans le popup, voyez la version corrigée, copiez-la en un clic
- **Menu contextuel clic droit** sur du texte sélectionné, sans lâcher la souris
- **Auto-correction à la frappe** : optionnelle, désactivée par défaut ; la touche Retour annule chaque auto-correction
- **Annulation par page** : annule la dernière correction sur la page courante en un clic
- **Adaptateurs de sites** pour Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon, plus un adaptateur générique pour tout le reste
- **Politique de sites** : bloquer des hôtes précis (banque, intranet) ou restreindre l'extension à une whitelist de sites de confiance
- **Réglages de langue intelligents** : à la première installation, l'extension lit la locale du navigateur et présélectionne les langues de saisie les plus probables ; modifiables à tout moment dans les Options
- **12 dispositions de clavier prêtes à l'emploi** : anglais (US QWERTY), russe (ЙЦУКЕН), ukrainien, biélorusse, allemand (QWERTZ), français (AZERTY), grec, hébreu, turc (Q), polonais (214), espagnol (QWERTY), coréen (Dubeolsik). Le coréen est un cas à part : le moteur décompose les syllabes Hangul en jamos de compatibilité avant la transposition, puis recompose le résultat
- **12 traductions d'interface** pour le popup et le panneau d'Options : en, ru, uk, be, de, fr, el, he, tr, pl, es, ko

Build Manifest V3 avec permissions minimales auditées, prêt pour la politique Chrome 2025 sans aucune migration de votre côté.

## Comment ça marche

Le moteur de détection transpose chaque caractère à travers chaque paire de dispositions activées, puis un modèle de langage à trigrammes de caractères, entraîné sur les 3000 mots les plus fréquents de chaque langue, note les deux directions et garde celle qui ressemble à du texte naturel. Une heuristique Verr Maj et un départage par "naturel de la casse" gèrent les cas limites (`hELLO` devient `Hello`, un CAPS LOCK volontaire reste intouché). Tout cela tourne dans votre navigateur : rien ne part vers un modèle distant, pas d'appel API, pas de latence réseau dans la boucle.

L'algorithme est **sans LLM**. C'est une table de transposition plus un petit scoring statistique. Le modèle embarqué pèse environ 270 Ko et la conversion s'effectue en sous-milliseconde, ce qu'il faut pour un usage inline dans n'importe quel champ texte. Le modèle est embarqué et figé, chaque installation se comporte identiquement, sans réentraînement silencieux côté serveur dans votre dos.

## Comment VibeNest Switcher se compare

La catégorie "correcteur multilingue de disposition de clavier" est étroitement bornée. Les alternatives sérieuses diffèrent sur quelques axes qui comptent pour la plupart des gens : code auditable, ce qui quitte (ou non) l'appareil, nombre de dispositions livrées par défaut, et lieu d'exécution (navigateur ou bureau).

| | **VibeNest Switcher** | EasyType Switcher | Caramba Switcher | Punto Switcher |
|---|---|---|---|---|
| Open source (auditable) | Oui, MIT, code sur GitHub | Non | Non | Non |
| Entièrement hors ligne / sans télémétrie | Oui, modèle embarqué, zéro réseau | Code fermé, non vérifiable | Bureau | Bureau |
| Nombre de dispositions | **12** | 2 (RU/EN) | 2-3 | 2 (RU/EN) |
| Manifest V3 / navigateur-natif | Oui, MV3, prêt pour la politique 2025 | Oui, MV3 | Non, bureau uniquement | Non, bureau uniquement |
| Multiplateforme | Oui, tout OS via Chrome / Chromium | Oui, tout OS via Chrome | Non, Windows uniquement | Non, Windows uniquement |
| Auto-correction à la frappe | Oui, optionnelle, ignore les mots de passe | Oui | Oui | Oui |
| Maintenu activement (2026) | Oui, tracker d'issues ouvert | Sporadique | Oui | Oui |

VibeNest Switcher est la seule ligne où open source, navigateur-natif et entièrement hors ligne tiennent en même temps. Si vous avez aimé l'idée d'un utilitaire de bascule de disposition à l'ancienne mais sans binaire fermé et sans que le texte quitte l'appareil, voilà la niche que ça remplit.

[**Installer depuis le Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

## Questions fréquentes

### Comment corriger du texte tapé dans la mauvaise disposition de clavier ?

Installez VibeNest Switcher, placez le curseur dans le champ qui contient le texte erroné et appuyez sur **`Ctrl+Maj+L`**. L'extension détecte dans quelle paire de dispositions le texte a été saisi, transpose les caractères et réécrit le champ sur place. Aucune sélection, aucun copier-coller, aucune retape. La même combinaison fonctionne dans Twitter, Slack, Telegram Web, WhatsApp Web, Discord, Gmail, Notion, Reddit, LinkedIn et tout autre champ texte du web ouvert. Si un champ ne peut pas être modifié directement (par exemple une vue d'export en lecture seule), l'extension copie le texte corrigé dans le presse-papiers et affiche une petite notification.

### Comment changer la disposition du clavier dans le navigateur ?

VibeNest Switcher ne remplace pas la bascule de disposition au niveau de l'OS. Pour passer entre les langues de saisie, continuez d'utiliser la combinaison habituelle de votre système. L'extension sert à autre chose : réparer le texte déjà tapé. Si vous avez commencé à écrire en anglais alors que le système était en russe (`Руддщ` au lieu de `Hello`), une touche réécrit le champ. Dans l'autre sens pareil : `ghbdtn` devient `привет` en une milliseconde, sans clics supplémentaires et sans sortir du champ.

### Est-ce un outil de clavier multilingue ?

Oui. VibeNest Switcher est un correcteur multilingue de disposition de clavier avec 12 dispositions (anglais, russe, ukrainien, biélorusse, allemand, français, grec, hébreu, turc, polonais, espagnol, coréen) et 12 traductions d'interface complètes. Contrairement aux outils à paire unique, VibeNest détecte et convertit entre toute paire activée. Activez seulement les langues que vous utilisez vraiment ; la détection se concentre sur votre ensemble actif, ce qui rend les résultats plus rapides et plus précis. Si vous écrivez dans trois alphabets ou plus chaque jour, c'est un saut net par rapport aux outils à paire unique.

### En quoi est-ce différent de Punto Switcher ?

C'est une application de bureau pour Windows. VibeNest Switcher est l'alternative open source, navigateur-native, qui tourne intégralement dans Chrome et tout navigateur Chromium, donc sur macOS, Linux, ChromeOS et Windows de la même façon. Et elle agit dans les champs web où l'essentiel de la saisie moderne se passe. L'idée de détection est la même (transposer puis noter), mais le modèle est embarqué dans l'extension et travaille hors ligne. Aucun caractère de votre texte ne quitte le navigateur. Le code source est sur [GitHub](https://github.com/NikitaBabenko/Switcher), donc la posture de confidentialité se vérifie dans les sources plutôt que sur parole.

### Est-ce que ça translittère le cyrillique vers le latin (ou inversement) ?

Non. C'est de la correction de disposition, pas de la saisie phonétique. Si vous cherchez un outil pour taper du russe sur un clavier US uniquement, en épelant les mots phonétiquement (`privet` pour `привет`, `spasibo` pour `спасибо`), c'est une autre catégorie (Cyrillatin, Translit). VibeNest Switcher est pour le cas où les deux dispositions sont déjà là, où l'on a tapé dans la mauvaise par inadvertance, et où l'on veut le résultat corrigé sur place. Les deux catégories résolvent des problèmes voisins mais ne sont pas interchangeables.

### Ça marche hors ligne ? Qu'est-ce qui quitte mon navigateur ?

Entièrement hors ligne par défaut. Le modèle de langage à trigrammes embarqué vit dans le paquet de l'extension ; la détection s'exécute sur votre appareil. **Ni texte ni métadonnées ne partent où que ce soit.** Pas de SDK d'analytics, pas de télémétrie, pas de logging distant, pas de script tiers. Les Options proposent un fallback API distant optionnel, **désactivé par défaut**, avec champ URL vide ; si vous ne l'activez jamais, l'extension ne fait aucun appel réseau lié à la conversion de texte. Les permissions et leur justification sont détaillées ligne par ligne dans [PRIVACY.md](https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md), et le chemin du flux de données s'audite par rapport au code sur GitHub.

### Quelles sont les 12 dispositions de clavier supportées ?

Anglais (US QWERTY), russe (ЙЦУКЕН), ukrainien, biélorusse, allemand (QWERTZ), français (AZERTY), grec, hébreu, turc (Q), polonais (214), espagnol (QWERTY) et coréen (Dubeolsik / 두벌식). Toute paire activée est disponible pour la détection. Le coréen est le cas le plus intéressant : chaque syllabe Hangul à l'écran se décompose de façon réversible en sa séquence de jamos, pour que le même algorithme (transposer puis noter) fonctionne aussi là-bas. Besoin d'une autre disposition (italien, tchèque, hindi) ? Ajouter une disposition se résume à deux fichiers (table de 46 caractères plus liste des 3000 mots les plus fréquents) et nous les livrons aussi vite que nous pouvons les vérifier. Ouvrez une issue sur GitHub ou écrivez à **info@vibenest.net**.

### Est-ce gratuit ? Open source ?

Oui pour les deux. VibeNest Switcher est gratuit, sans compte, sans paiement, sans publicité. Le code source complet est sur GitHub à <https://github.com/NikitaBabenko/Switcher> sous licence open source permissive. Vous pouvez lire chaque ligne de code qui agit sur votre texte. C'est exactement le sens de l'engagement de confidentialité : vérifiable, pas déclaratif. Si vous trouvez un bug ou voulez une fonctionnalité, le tracker d'issues est le bon endroit pour commencer.

## Installer VibeNest Switcher

[**Installer depuis le Chrome Web Store →**](https://chrome.google.com/webstore/detail/vibenest-switcher/)

- **GitHub** : <https://github.com/NikitaBabenko/Switcher>
- **Politique de confidentialité** : <https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md>
- **E-mail** : **info@vibenest.net** pour suggestions, rapports de bugs et demandes de nouvelles langues

---

*Punto Switcher est une marque déposée de son propriétaire respectif. VibeNest Switcher est un projet open source indépendant, non affilié à Yandex et non approuvé par Yandex.*
