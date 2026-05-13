# VibeNest Switcher: Description détaillée (Français)

Vous avez tapé `ghbdtn`, vous vouliez écrire `привет`. Appuyez sur `Ctrl+Maj+L`. Le charabia devient le bon texte, sans retape, sans sortir du champ, sans envoyer un seul caractère vers un serveur.

VibeNest Switcher est une extension Chrome qui corrige le texte saisi dans la mauvaise disposition de clavier en une seule combinaison de touches. Par défaut, tout fonctionne hors ligne. Le code source est sur GitHub. Le pack inclut 12 dispositions de clavier (anglais, russe, ukrainien, biélorusse, allemand, français, grec, hébreu, turc, polonais, espagnol, coréen) et 12 traductions d'interface.

============================================================

EN QUOI VIBENEST SWITCHER EST DIFFÉRENT

100% open source. Chaque ligne de code qui agit sur votre texte est publique sur GitHub : https://github.com/NikitaBabenko/Switcher. Lancez les tests localement, compilez à partir des sources, vérifiez dans votre propre navigateur.

Entièrement hors ligne par défaut. Le modèle de langue est embarqué dans le paquet, environ 270 Ko. Pas de télémétrie, pas d'analytics, pas d'appels cloud, pas de scripts tiers. La conversion ne quitte jamais l'appareil.

Sans compte, sans connexion, sans paiement, sans publicité. Installez et utilisez.

12 dispositions de clavier de série. La plupart des alternatives couvrent une ou deux paires (russe/anglais). VibeNest traite toute paire que vous activez.

Build Manifest V3 moderne. Permissions minimales auditées, prêt pour la politique Chrome 2025. Aucune migration de votre côté.

Compatible avec les navigateurs Chromium. Fonctionne dans Chrome et tout fork Chromium (Edge, Brave, Opera, Vivaldi). Portages autonomes pour Edge et Firefox dans la feuille de route.

============================================================

FONCTIONNALITÉS

Raccourci clavier (Ctrl+Maj+L) et bouton popup dans la barre d'outils. Le raccourci réécrit le champ texte actif en place. Le popup propose une vue à deux panneaux avec l'original et la version corrigée, utile pour les champs en lecture seule ou quand vous voulez inspecter la conversion avant de l'appliquer.

Mode coller-et-corriger. Collez le texte erroné dans le popup, voyez la version corrigée, copiez-la en un clic. Fonctionne pour du texte que vous avez déjà copié depuis la barre d'adresse, une vue d'export ou tout contexte en lecture seule.

Menu contextuel par clic droit. Texte sélectionné sur la page, clic droit, choisissez "Corriger la disposition", sans lâcher la souris.

Auto-correction à la frappe. Optionnelle, désactivée par défaut. Quand activée, l'extension surveille la frappe et corrige les mots manifestement issus de la mauvaise disposition après l'espace. La touche Retour rejette une auto-correction immédiatement après son apparition. Les champs qui ressemblent à des champs de mot de passe (input type=password, autocomplete=current-password), les codes OTP et les numéros de carte ne sont jamais touchés par l'auto-correction, c'est une exclusion forte dans le code.

Annulation par page. Le popup garde une annulation à un cran pour la dernière correction sur la page courante. Utile quand la conversion a pris la mauvaise direction (par exemple un nom propre à la frontière du cyrillique et du latin).

Adaptateurs de sites. Gestionnaires prêts à l'emploi pour les sites avec entrées non standard (wrappers contenteditable, inputs gérés par React, composeurs isolés en iframe) : Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon. Un adaptateur générique couvre tous les autres sites.

Politique de sites. Bloquez des hôtes spécifiques (banque, intranet, gestionnaire de mots de passe) ou restreignez l'extension à une whitelist d'hôtes de confiance. Les règles par hôte persistent entre les sessions.

Réglages de langue intelligents. À la première ouverture, l'extension lit la locale du navigateur et présélectionne les langues de saisie les plus probables. Modifiables à tout moment dans les Options. La détection ne tourne que contre les langues activées, ce qui maintient des résultats rapides et précis.

12 dispositions de clavier de série. Anglais (US QWERTY), russe (ЙЦУКЕН), ukrainien, biélorusse, allemand (QWERTZ), français (AZERTY), grec, hébreu, turc (Q), polonais (214), espagnol (QWERTY), coréen (Dubeolsik / 두벌식).

12 traductions d'interface. Popup et page d'Options localisés en en, ru, uk, be, de, fr, el, he, tr, pl, es, ko. Pour l'hébreu, le popup suit la direction de droite à gauche.

============================================================

COMMENT ÇA MARCHE

Le moteur de détection transpose chaque caractère par chaque paire de dispositions activée, puis un modèle de langage à trigrammes de caractères note les deux directions. Le modèle est entraîné sur les 3000 mots les plus fréquents de chaque langue. La direction avec la meilleure note (celle qui ressemble le plus à du texte naturel) est appliquée au champ.

Une heuristique Verr Maj et un départage par "naturel de la casse" gèrent les cas limites : `hELLO` devient `Hello`, un `CAPS LOCK` volontaire reste intact, une casse mixte en milieu de mot comme `JavaScript` est préservée.

L'algorithme est volontairement sans LLM. C'est une table de transposition plus un petit scoring statistique. Le modèle de langage embarqué pèse environ 270 Ko et la conversion s'effectue en sous-milliseconde, c'est le profil qu'il faut pour un usage inline dans un champ texte actif. Le modèle est embarqué et figé, chaque installation se comporte identiquement, sans réentraînement silencieux côté serveur dans votre dos.

Le coréen est le cas le plus intéressant dans le moteur. Chaque syllabe Hangul à l'écran est décomposée de façon réversible en sa séquence de jamos de compatibilité, pour que le même algorithme (transposer puis noter) fonctionne aussi là. Après le scoring, le résultat est recomposé en syllabes Hangul.

============================================================

POUR QUI

- Bilingues qui alternent plusieurs fois par jour entre français et un autre alphabet.
- Traducteurs et traductrices qui sautent entre langue source et langue cible en plein paragraphe.
- Développeurs et équipes IT dans des environnements multilingues (messages de commit, commentaires de tickets, revues de code interculturelles).
- Équipes support qui préfèrent ne pas envoyer un mail à un collègue commençant par "Уважаемые коллеги, ifkjvtt..."
- Étudiants et enseignants de langues.
- Toute personne dans un workflow multi-écritures : cyrillique plus latin, grec plus latin, hébreu plus latin, hangul plus latin.

============================================================

CONFIDENTIALITÉ

Par défaut l'extension fonctionne hors ligne. Le détecteur embarqué tourne dans le navigateur. Ni texte, ni métadonnées, ni événements ne sont envoyés où que ce soit. Aucun SDK d'analytics, aucune télémétrie, aucun logging distant, aucun script tiers dans l'extension. Le paquet est assez petit pour être lu de bout en bout sur GitHub.

Les permissions et leur justification sont détaillées ligne par ligne dans la politique de confidentialité : https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

Les Options proposent un fallback API distant optionnel, désactivé par défaut, avec champ URL vide. Si vous ne l'activez jamais, l'extension ne fait pas un seul appel réseau lié à la conversion de texte. Le fallback existe pour les personnes qui font tourner leur propre endpoint de conversion et veulent que le popup pointe dessus ; ce n'est pas un défaut et il ne touche jamais un service tiers.

============================================================

QUESTIONS FRÉQUENTES

Q : Comment corriger du texte tapé dans la mauvaise disposition ?
R : Placez le curseur dans le champ texte, appuyez sur Ctrl+Maj+L. L'extension détecte la paire de dispositions, transpose les caractères et réécrit le champ sur place. Fonctionne dans Twitter, Slack, Discord, Telegram Web, WhatsApp Web, Gmail, Notion, Reddit, LinkedIn et tout autre champ texte du web ouvert.

Q : Comment passer rapidement d'un clavier russe à un clavier anglais ?
R : VibeNest Switcher ne remplace pas la bascule de disposition de l'OS. Pour passer entre les langues de saisie, continuez d'utiliser la combinaison habituelle de votre système. L'extension sert à autre chose : réparer le texte déjà tapé.

Q : Translittère-t-il le cyrillique vers le latin ?
R : Non. C'est de la correction de disposition, pas de la saisie phonétique. Les outils de saisie phonétique servant à taper du russe sans clavier russe appartiennent à une catégorie différente.

Q : Fonctionne-t-il hors ligne ?
R : Oui. Entièrement hors ligne par défaut. Le modèle de trigrammes est dans le paquet de l'extension. Ni texte ni métadonnées ne partent où que ce soit.

Q : Quelles permissions sont nécessaires et pourquoi ?
R : Le minimum nécessaire pour réécrire du texte dans le navigateur : activeTab, scripting, storage, contextMenus. Chacune justifiée dans PRIVACY.md.

Q : Comment activer l'auto-correction à la frappe ?
R : Ouvrez le popup de l'extension, cliquez sur l'engrenage, activez l'Auto-correction. La touche Retour annule immédiatement toute auto-correction après son déclenchement.

Q : Fonctionne-t-il dans Edge, Brave, Opera ?
R : Oui, dans tout navigateur basé sur Chromium. Edge récupère les builds MV3 directement depuis le Chrome Web Store.

Q : Ajouterez-vous la disposition X (italien, tchèque, hindi) ?
R : Oui, demandez-la. Ajouter une disposition revient à deux fichiers (table de 46 caractères plus liste des 3000 mots les plus fréquents) plus une reconstruction du modèle.

============================================================

LANGUES PRISES EN CHARGE

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Besoin d'une autre ? Ouvrez une issue sur GitHub ou écrivez à info@vibenest.net.

============================================================

NOUVEAUTÉS

Version 1.0.1 (13 mai 2026)
- Tirets cadratins retirés des chaînes d'interface et des textes de landing pour une typographie cohérente.

Version 1.0.0 (12 mai 2026)
- Version stable. Fallback API distant optionnel caché dans les Réglages, désactivé par défaut avec champ URL vide ; l'installation par défaut ne touche jamais le réseau.
- Texte de confidentialité dans les Réglages rafraîchi pour refléter la posture hors-ligne d'abord.
- Composition et décomposition du Hangul coréen recommandées comme chemin principal pour la transposition 한영.

Les versions antérieures ont apporté les dispositions coréenne, polonaise et espagnole (v0.3.0), les adaptateurs Twitch et Mastodon ainsi que l'annulation par page.

============================================================

CODE SOURCE ET CONTACT

- GitHub : https://github.com/NikitaBabenko/Switcher
- Politique de confidentialité : https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md
- E-mail pour suggestions, rapports de bugs et demandes de nouvelles langues : info@vibenest.net

