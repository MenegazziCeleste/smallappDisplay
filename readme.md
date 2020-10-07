# Smallapp by Celeste MENEGAZZI

Entrainement symfony & react

## Fonctionalités

Cette appli est un simple 'blog'.
Il y a un système d'authentification, une page pour modifier son nom d'utilisateur et une page pour consulter la liste des posts en base.
Le système d'authentification demande à l'utilisateur de valider son email en cliquant sur le lien envoyé par mail lors de la création du compte.
L'utilisateur peut aussi modifer son mot de passe, mais de façon similaire, il devra passer par un lien fourni par email. 
Les posts ont un titre, un texte, des images et des tags. 
Un utilisateur peut liker un post, le commenter et consulter les like et les commentaires des autres utilisateurs sur ce post. 
Il peut aussi filter les posts pour recuperer ceux qu'il a liké, commenté, les posts avec certains tags et les trier en focntion du nombre de like et de commentaires.
Il y a aussi tout un back office accessible uniquement aux utilisateurs admin.
Le back office, uniquement accessible aux admin permet de gerer toute les données.
Le back office users permet de voir tous les utilisateur, les filtrer et les trier, changer leur nom d'utilisateur et leurs autorisations et en créer de nouveaux. 
Le back office posts permet de voir, en filtrant ou ordonnant, les posts, les créer/modifer/supprimer, et supprimer leur leurs commentaires.  
Le back office tags permet de voir, en filtrant ou ordonnant, les tags et les créer/modifer/supprimer.  

## Choix des outils

### Back

J'ai choisi les dernières version de symfony et react pour m'entrainer.

Je voulais faire une SPA, j'ai donc choisi de faire une authentification avec jwt token. C'était pas forcément le meilleur choix pour mon appli mais je sais que ce type d'authentification est très courant et c'est donc un bon entrainement. 
J'ai utilisé le bundle LexikJWTAuthenticationBundle (https://github.com/lexik/LexikJWTAuthenticationBundle) avec le bundle JWTRefreshTokenBundle (https://github.com/markitosgv/JWTRefreshTokenBundle).
Les JWT tokens expirent après un temps déterminé et l'utilisateur doit s'authentifier à nouveau. Le bundle refresh token permet de recuperer un token sans se réauthentifier. 
Les tokens sont stockés dans des cookies httpOnly. (qui ne peuvent pas être lu avec du js).
Les refresh tokens étant stockés en base, il faudrait faire tourner un script régulièrement pour les supprimer.

Je n'avais pas envie de créer un serveur DNS ou d'utiliser un autre parti, j'ai donc créé une adresse mail google pour envoyer les mails. 

Pour la validation de l'adresse mail ou la modification du mot de passe, j'ai stocké le token dans une session. Il n'est donc valable que dans le navigateur utilisé pour créer l'adresse mail/renvoyer le token/demander la modification du mot de passe. Pour qu'il soit accessible en dehors, j'aurais pu stocker le token en base. 

J'ai trouvé des bundle pour créer des back office admin automatiquement. Aucun ne semblait "incontournable", et j'ai pensé que que ca serait un meilleur entrainement de le faire moi même.

L'application n'est pas vraiment une SPA. Je ne voulais pas que le code de l'admin soit accessible aux utilisateurs non admin. J'ai donc séparé les codes front office et back office. 

### Front

Pour le html de base, j'ai choisi matérialize car je l'avais déjà utilisé brievement. Je regrette pas mal mon choix et je pense que j'aurais du utiliser material-ui. 
Pour le routing : react-router,
Pour les requête, axios,
Pour les formulaires et validation front : formik/yup,
Pour les tables, je voulais faire des filtres/sort back, j'ai donc utilisé la table la plus lightweigh possible : rc-table.
Pour le select qui permet de creer un element, j'ai utilisé react-select.
Pour pouvoir cropper une image : react-image-crop et pour pouvoir les trier en grid react-sortable-hoc + array-move.


## Améliorations éventuelles

### Amélioration du code

* Vérifier les valeurs des filtres dans le back
* Gérer les erreurs d'envoi d'email
* Séparer le code react en composants et services (login/tags/favorites/comments ??)
* Créer des services Symfony pour le back
* Réécrire tous les composants en fonctionnel (J'ai commencé avec des classes parce que la logique était plus évidente et je suis passé à des composants fonctionnels ensuite, ca sera bien d'harmoniser le site)
* Soft delete pour les commentaires

### Nouvelles fonctionalités

* Stocker les données dans le front pour limiter le temps de chargement et pouvoir naviger sur le site sans perdre ses filtres ou les données des formulaires remplis.
* Pouvoir éditer ou supprimer ses commentaires en temps qu'utilisateur
* Pouvoir éditer son adresse email
* Pouvoir envoyer un message aux admin ou aux dev / Tickets ? 
* Choisir le nombre d'éléments dans les tableaux
* Pouvoir changer le thème
