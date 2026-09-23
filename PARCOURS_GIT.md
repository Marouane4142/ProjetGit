# Parcours pratique Git et GitHub

Ce dépôt est un bac à sable de formation. L'application TaskBoard est volontairement
simple : l'objectif principal est d'explorer son historique et de manipuler Git.

> Les exercices qui modifient l'historique utilisent des branches `atelier/*` et le
> remote local `formation`. Le remote `origin` reste réservé au véritable dépôt
> GitHub.

## 1. Carte du dépôt

| Branche | Rôle | État attendu |
| --- | --- | --- |
| `master` | version stable, assimilée à la production | uniquement des merges de `pre-prod` |
| `pre-prod` | intégration et validation avant production | contient le thème sombre |
| `feature/recherche` | recherche dans les tâches | publiée, basée sur `pre-prod` |
| `feature/priorites` | niveaux de priorité | publiée, basée sur `pre-prod` |
| `feature/export-csv` | export des tâches en CSV | publiée, basée sur `pre-prod` |
| `feature/refactor-stockage` | évolution du stockage local | publiée, basée sur `pre-prod` |
| `feature/theme-sombre` | préférence de thème système | publiée, basée sur `pre-prod` |

Afficher la carte réelle :

```bash
git log --graph --decorate --oneline --all
```

Conventions utilisées :

- aucun commit direct n'est créé sur `master` : elle reçoit uniquement des merges
  `--no-ff` provenant de `pre-prod` ;
- `pre-prod` rassemble les fonctionnalités avant leur mise en production ;
- toute branche `feature/*` est créée depuis `pre-prod`, jamais depuis `master` ;
- une branche `atelier/*` est jetable et sert uniquement aux exercices.

Vérifier qu'une branche actuelle descend bien de `pre-prod` :

```bash
git merge-base --is-ancestor pre-prod feature/recherche
echo $? # 0 signifie « oui » dans Bash
```

## 2. Diagnostic de départ

```bash
git status
git branch --all --verbose
git remote -v
git log --oneline --decorate -10
git tag --list
```

Commandes d'observation utiles :

```bash
git show master:README.md
git show feature/recherche
git diff master..pre-prod
git diff --stat pre-prod..feature/recherche
git log master..feature/recherche --oneline
git branch --contains feature/theme-sombre
```

`A..B` signifie ici « ce qui est dans B et pas dans A ». La commande `git show
branche:fichier` lit un fichier d'une autre branche sans changer la copie de travail.

## 3. Naviguer avec `switch` et `checkout`

La commande moderne pour changer de branche est `switch` :

```bash
git switch feature/recherche
git status
git switch master
```

`checkout` reste utile pour enseigner les anciens usages :

```bash
git checkout feature/recherche
git checkout master
git checkout --detach master~1
git switch master
```

En mode `detached HEAD`, aucun nom de branche ne pointe directement sur `HEAD`.
Pour conserver un commit créé dans cet état :

```bash
git switch -c atelier/sauvetage
```

Pour restaurer un fichier suivi, préférez la commande explicite :

```bash
git restore README.md
```

## 4. Créer une branche et des commits

Créez une branche de travail sans toucher aux branches préparées :

```bash
git switch master
git switch -c atelier/premier-commit
```

Modifiez ensuite `README.md`, puis observez chaque zone :

```bash
git status --short
git diff
git add README.md
git diff --staged
git commit -m "docs: ajouter une note de cours"
git show --stat HEAD
```

Pour séparer plusieurs modifications d'un même fichier en commits cohérents :

```bash
git add -p
git commit -m "docs: expliquer une première notion"
```

## 5. Mettre un travail de côté avec `stash`

Sur une branche d'atelier, modifiez `README.md` sans valider :

```bash
git switch -c atelier/stash master
git status --short
git stash push -m "WIP: notes du formateur"
git status
git stash list
git stash show --patch stash@{0}
```

Puis restaurez le travail :

```bash
git stash apply stash@{0}
git status --short
git stash drop stash@{0}
```

`apply` conserve le stash. `pop` applique puis supprime le stash si l'opération
réussit. Pour inclure les fichiers non suivis, utilisez `git stash push -u`.

Sous PowerShell, gardez les guillemets autour de `"stash@{0}"` si l'interpréteur
traite les accolades de manière inattendue.

## 6. Fusionner une fonctionnalité

Créez une branche d'intégration jetable à partir de `pre-prod` :

```bash
git switch -c atelier/merge pre-prod
git merge --no-ff feature/recherche
git log --graph --decorate --oneline -12
npm test
```

`--no-ff` crée un commit de fusion même si une avance rapide était possible. Cela
rend la fonctionnalité visible comme un groupe dans le graphe.

### Résoudre un conflit

La fonctionnalité de priorité modifie une zone proche de la recherche. Après la
fusion précédente, tentez :

```bash
git merge feature/priorites
git status
git diff --name-only --diff-filter=U
```

Ouvrez les fichiers signalés et cherchez ces marqueurs :

```text
<<<<<<< HEAD
version de la branche courante
=======
version de la branche fusionnée
>>>>>>> feature/priorites
```

Gardez une combinaison fonctionnelle des deux versions. Dans ce dépôt, les conflits
attendus concernent `css/style.css`, `js/app.js`, `js/tasks.js` et
`test/tasks.test.js` ; `index.html` est fusionné automatiquement. Puis :

```bash
git add css/style.css js/app.js js/tasks.js test/tasks.test.js
git commit
npm test
```

Pour abandonner la fusion tant qu'elle n'est pas validée :

```bash
git merge --abort
```

## 7. Rebaser une branche

Simulez d'abord une avancée de `pre-prod`, puis travaillez sur des copies pour
conserver les branches préparées :

```bash
git switch -c atelier/pre-prod-avance pre-prod
git commit --allow-empty -m "chore: simuler une avancée de pre-prod"
git switch -c atelier/rebase feature/refactor-stockage
git rebase atelier/pre-prod-avance
git log --graph --decorate --oneline -12
npm test
```

Le rebase rejoue les commits de la fonctionnalité au-dessus de la nouvelle base de
pré-production. En cas de conflit :

```bash
# Corriger les fichiers, puis :
git add <fichier-corrigé>
git rebase --continue

# Ou abandonner complètement :
git rebase --abort
```

Règle d'équipe : ne rebasez pas une branche partagée sans coordination, car les
identifiants de commits sont réécrits.

Pour une démonstration interactive :

```bash
git rebase -i HEAD~2
```

Dans l'éditeur, remplacez par exemple `pick` par `reword`, `squash` ou `fixup`.

## 8. Copier un commit avec `cherry-pick`

La branche d'export contient un commit autonome. Copiez-le sans fusionner toute la
branche :

```bash
git switch -c atelier/cherry-pick pre-prod
git log feature/export-csv --oneline -1
git cherry-pick feature/export-csv
git show --stat HEAD
npm test
```

`cherry-pick` crée un nouveau commit avec un nouvel identifiant. Pour annuler une
opération conflictuelle en cours :

```bash
git cherry-pick --abort
```

## 9. Annuler : `restore`, `reset`, `revert` et `reflog`

### Choisir le bon outil

| Besoin | Commande | Effet principal |
| --- | --- | --- |
| annuler une modification non indexée | `git restore fichier` | modifie la copie de travail |
| retirer de l'index sans perdre le fichier | `git restore --staged fichier` | modifie l'index |
| déplacer localement une branche | `git reset` | réécrit la position de la branche |
| annuler un commit déjà partagé | `git revert` | ajoute un commit inverse |
| retrouver un commit « perdu » | `git reflog` | montre les anciens mouvements de `HEAD` |

### Atelier `reset`

```bash
git switch -c atelier/reset master
git commit --allow-empty -m "demo: premier commit temporaire"
git commit --allow-empty -m "demo: second commit temporaire"
git log --oneline -4
```

Comparez les trois modes :

```bash
git reset --soft HEAD~1   # commit retiré, changements indexés
git reset --mixed HEAD~1  # commit retiré, changements non indexés
git reset --hard HEAD~1   # commit et changements supprimés de la copie de travail
```

> `reset --hard` détruit les modifications non validées. Ne l'utilisez ici que sur
> une branche `atelier/*` et après `git status`.

Retrouvez ensuite les anciens commits :

```bash
git reflog --oneline
git reset --hard HEAD@{1}
```

Sous PowerShell, utilisez `git reset --hard "HEAD@{1}"` si nécessaire.

### Atelier `revert`

```bash
git switch -c atelier/revert feature/export-csv
git revert HEAD
git log --oneline -3
```

Contrairement à `reset`, `revert` conserve l'histoire et convient à une branche
déjà partagée.

## 10. Travailler avec les remotes

Ce dépôt possède normalement deux remotes :

```bash
git remote -v
```

- `origin` : le dépôt GitHub réel avec `master`, `pre-prod` et les `feature/*` ;
- `formation` : un dépôt Git bare local, sans risque pour GitHub.

### `fetch`, branches distantes et `push`

```bash
git fetch formation --prune
git branch --remotes
git switch -c atelier/push master
git commit --allow-empty -m "demo: commit à pousser"
git push -u formation atelier/push
git status --short --branch
```

Après `-u`, `git push` et `git pull` savent quelle branche distante utiliser.

Les fonctionnalités sont publiées sur GitHub, mais doivent toujours avoir été
créées depuis `pre-prod` :

```bash
git switch pre-prod
git switch -c feature/nouvelle-fonction
git push -u origin feature/nouvelle-fonction
```

Une branche `feature/*` ne doit jamais être créée directement depuis `master`.

### Simuler `pull` avec un collègue

Depuis le dépôt principal :

```bash
git switch -c atelier/pull master
git push -u formation atelier/pull
```

Clonez ensuite le remote local dans un second dossier :

```bash
git clone .git-training-remote ../TaskBoard-collegue
cd ../TaskBoard-collegue
git switch atelier/pull
git config user.name "Collegue Demo"
git config user.email "collegue@example.test"
```

Modifiez `README.md`, puis simulez le travail du collègue :

```bash
git add README.md
git commit -m "docs: ajouter la note du collègue"
git push origin atelier/pull
```

Revenez dans le dépôt principal et récupérez ce commit :

```bash
git switch atelier/pull
git fetch formation
git log --oneline HEAD..formation/atelier/pull
git pull --rebase formation atelier/pull
```

`pull` est essentiellement un `fetch` suivi d'un `merge` ou d'un `rebase`, selon
l'option et la configuration.

## 11. Démontrer `push --force-with-lease`

`--force-with-lease` autorise une réécriture uniquement si le remote est encore
dans l'état connu localement. Le scénario suivant montre un succès puis un refus de
sécurité.

### Réécriture contrôlée

```bash
git switch -c atelier/force-with-lease master
git commit --allow-empty -m "demo: message imparfait"
git push -u formation atelier/force-with-lease
git commit --amend -m "demo: message corrigé"
git push --force-with-lease
```

Le second push non linéaire réussit, car personne n'a modifié le remote entre-temps.

### Protection contre l'écrasement du travail d'un collègue

Dans le clone `TaskBoard-collegue` :

```bash
git fetch origin
git switch --track origin/atelier/force-with-lease
git commit --allow-empty -m "demo: travail du collègue"
git push
```

Dans le dépôt principal, sans faire de `fetch` :

```bash
git commit --amend -m "demo: nouvelle réécriture locale"
git push --force-with-lease
```

Le push doit être refusé : la branche distante a avancé à votre insu. Inspectez avant
de décider :

```bash
git fetch formation
git log --graph --oneline --decorate --all -12
```

La résolution habituelle consiste à intégrer le travail distant :

```bash
git rebase formation/atelier/force-with-lease
git push
```

N'utilisez jamais `git push --force` par réflexe sur une branche partagée : il ne
vérifie pas ce garde-fou.

## 12. Mettre `pre-prod` en production

Après validation des fonctionnalités, la mise en production passe obligatoirement
par un commit de merge de `pre-prod`. Aucun fichier ne doit être modifié ou validé
directement sur `master` :

```bash
git switch master
git merge --no-ff pre-prod
npm test
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin master
git push origin v1.1.0
```

Ces commandes changent `master` et GitHub. Pour une démonstration sans effet réel,
remplacez `master` par une branche `atelier/release` et `origin` par `formation`.

## 13. Nettoyer les ateliers

Placez-vous d'abord sur une branche à conserver :

```bash
git switch master
git branch --list "atelier/*"
git branch -D atelier/premier-commit atelier/stash atelier/merge
git branch -D atelier/pre-prod-avance atelier/rebase atelier/cherry-pick
git branch -D atelier/reset atelier/revert
git branch -D atelier/push atelier/pull atelier/force-with-lease
git fetch formation --prune
```

Pour supprimer également une branche distante précise :

```bash
git push formation --delete atelier/push
```

Ne copiez pas une commande de suppression en bloc sans vérifier la liste affichée.

## 14. Aide-mémoire

```bash
# État et historique
git status --short --branch
git log --graph --decorate --oneline --all
git reflog

# Comparer
git diff
git diff --staged
git diff branche-a..branche-b

# Préparer et valider
git add <fichier>
git add -p
git commit -m "type: description précise"
git commit --amend

# Branches
git switch <branche>
git switch -c <nouvelle-branche>
git branch -d <branche-fusionnée>

# Intégration
git merge <branche>
git rebase <base>
git cherry-pick <commit-ou-branche>

# Travail temporaire
git stash push -u -m "description"
git stash list
git stash pop

# Synchronisation
git fetch <remote> --prune
git pull --rebase
git push -u <remote> <branche>
git push --force-with-lease

# Annulation
git restore <fichier>
git restore --staged <fichier>
git revert <commit>
git reset --soft|--mixed|--hard <commit>
```

## 15. Questions à poser pendant le cours

1. Quelle différence voyez-vous entre la copie de travail, l'index et `HEAD` ?
2. Pourquoi le hash change-t-il après un rebase ou un amendement ?
3. Quand choisir `merge`, `rebase` ou `cherry-pick` ?
4. Pourquoi `revert` est-il préférable à `reset` sur une branche partagée ?
5. Quelle protection supplémentaire apporte `--force-with-lease` ?
6. Que récupère `fetch` que `pull` fait ensuite automatiquement ?
7. Comment retrouver un commit après un mauvais `reset --hard` ?
