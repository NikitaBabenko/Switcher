# Detailed description — Français

Vous avez tapé **`ghbdtn`** alors que vous vouliez **`привет`** ? Appuyez sur **Ctrl+Maj+L** — et le charabia devient le texte correct. Sans retaper, sans quitter le champ et sans envoyer le moindre caractère à un serveur.

## Ce qui distingue VibeNest Switcher

- **100% open source** — code source complet sur GitHub : https://github.com/NikitaBabenko/Switcher
- **Entièrement hors ligne par défaut** — aucune télémétrie, aucune analytique, aucun appel cloud ; le modèle de langue est intégré dans l'extension (~270 Ko)
- **Aucun compte, aucune connexion, aucun paiement** — installez et utilisez
- **12 langues d'origine** — la plupart des alternatives n'en couvrent qu'une ou deux
- **Manifest V3** — permissions minimales, conforme aux règles Chrome 2025
- **Multi-navigateur** — fonctionne sur Chrome et les forks Chromium ; Edge et Firefox sont prévus

## Familier pour les utilisateurs de Punto

Si vous avez utilisé Punto Switcher sous Windows, c'est la même idée — mais dans votre navigateur, en open source, et sans qu'aucun texte ne quitte votre appareil. Fonctionne dans tous les champs de texte du web ouvert, pas seulement dans les chats.

## Fonctionnalités

- **Raccourci clavier** (Ctrl+Maj+L) et bouton dans le popup — correction immédiate du champ actif
- **Mode « coller et corriger »** — collez le texte erroné dans le popup, récupérez la version corrigée
- **Menu contextuel du clic droit** sur du texte sélectionné
- **Correction automatique pendant la frappe** dans le style Punto Switcher — opt-in ; Retour arrière annule
- **Annulation par page** — revient à la dernière correction sur la page courante en un clic
- **Adaptateurs de sites** : Twitter/X, Facebook, Messenger, VK, Instagram, Telegram Web, WhatsApp Web, Discord, Slack, Reddit, LinkedIn, Twitch, Mastodon — plus un adaptateur générique pour le reste
- **Politique de sites** — bloquez des hôtes précis (par ex. votre banque) ou limitez l'extension à une liste blanche
- **Détection automatique des langues** — à la première installation, les langues de saisie sont détectées via la locale du navigateur ; modifiable à tout moment

## Fonctionnement

Le détecteur transpose chaque caractère via toutes les paires de dispositions activées. Un modèle de langue à trigrammes, entraîné sur des listes de mots fréquents, note les deux directions et choisit celle qui ressemble à un texte naturel. Des heuristiques de Verr.Maj et de naturalité de la casse couvrent les cas limites. Tout s'exécute dans votre navigateur.

## Pour qui

- Auteurs bilingues qui basculent plusieurs fois par jour entre l'alphabet latin et un autre
- Traducteurs qui changent de langue source/cible en plein paragraphe
- Développeurs et équipes IT dans des environnements multilingues
- Helpdesks qui préfèrent éviter d'envoyer à un collègue « Уважаемые коллеги, ifkjvtt… »

## Confidentialité

Par défaut, l'extension fonctionne hors ligne. Le détecteur intégré tourne dans votre navigateur ; ni texte ni métadonnées ne sont envoyés. Les permissions sont minimales et chacune est justifiée dans la politique de confidentialité : https://github.com/NikitaBabenko/Switcher/blob/main/extension/PRIVACY.md

Il existe un repli API distant optionnel (désactivé par défaut), activable dans les Réglages si vous souhaitez pointer vers votre propre endpoint. L'installation par défaut n'effectue aucun appel réseau.

## Langues prises en charge

English, Русский, Українська, Беларуская, Deutsch, Français, Ελληνικά, עברית, Türkçe, Polski, Español, 한국어.

Besoin d'une autre ? Ouvrez une issue sur GitHub ou écrivez à info@vibenest.net — ajouter une disposition + une liste de mots prend quelques heures.

## Code source & contact

- GitHub : https://github.com/NikitaBabenko/Switcher
- Email pour suggestions, rapports de bug et demandes de nouvelles langues : **info@vibenest.net**

## Avertissement

Punto Switcher est une marque déposée de son propriétaire respectif. VibeNest Switcher est un projet open source indépendant, non affilié à Yandex et non approuvé par Yandex.
