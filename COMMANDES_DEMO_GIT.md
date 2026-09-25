# Conducteur de démonstration Git — TaskBoard

Ce document contient des séquences prêtes à copier-coller dans **PowerShell**.
Elles utilisent les branches existantes du projet et, autant que possible, des
branches jetables `demo/*` ainsi que le remote local `formation`.

> Exécutez une section à la fois. Avant chaque démonstration, vérifiez que
> `git status` ne signale aucun travail important non sauvegardé.

## Préparation avant le cours

```powershell
Set-Location C:\DEV\ProjetGit
git status --short --branch
git fetch origin --prune
git branch --all --verbose
git remote -v
node --test
```

Le dépôt utilise deux remotes :

- `origin` correspond au dépôt GitHub réel ;
- `formation` correspond au dépôt bare local `.git-training-remote` et sert aux
  démonstrations de `push`, `pull` et `--force-with-lease`.

Pour afficher le graphe à tout moment :

```powershell
git log --graph --decorate --oneline --all -25
```

## 1. Observer les trois zones de Git

```powershell
git status
git diff
git diff --staged
git log --oneline --decorate -10
git show HEAD
```

Les trois zones à expliquer sont la copie de travail, l'index (`staging area`) et
le dernier commit, appelé `HEAD`.

Comparer deux branches sans les modifier :

```powershell
git diff --stat master..pre-prod
git log master..pre-prod --oneline
git diff pre-prod...feature/recherche
git show feature/recherche:js/tasks.js
```

## 2. `checkout` et `switch` — naviguer

Commande moderne :

```powershell
git switch pre-prod
git switch feature/recherche
git switch -
```

Ancienne syntaxe encore très répandue :

```powershell
git checkout feature/recherche
git checkout pre-prod
```

Observer un ancien commit en mode `detached HEAD`, puis revenir :

```powershell
git checkout --detach v1.0.0
git status --short --branch
git log --oneline -3
git switch pre-prod
```

Créer une branche :

```powershell
git switch pre-prod
git switch -c demo/navigation
git branch --show-current
```

## 3. `fetch` — actualiser sans intégrer

```powershell
git fetch origin --prune
git branch --remotes
git log --oneline HEAD..origin/pre-prod
git diff --stat HEAD..origin/pre-prod
```

`fetch` met à jour les références `origin/*`, mais ne modifie ni la branche locale
ni les fichiers de travail.

## 4. `add` et `commit` — créer un commit

```powershell
git switch -c demo/commit pre-prod
Set-Content -Path .\note-demo.txt -Value "Première note du cours"
git status --short
git diff
git add .\note-demo.txt
git diff --staged
git commit -m "docs: ajouter une note de démonstration"
git show --stat HEAD
```

Pour sélectionner seulement certaines parties d'un fichier :

```powershell
git add -p
```

## 5. `stash` — mettre temporairement de côté

```powershell
git switch -c demo/stash pre-prod
Add-Content -Path .\README.md -Value "`nNote temporaire du formateur."
Set-Content -Path .\brouillon-demo.txt -Value "Fichier non suivi"
git status --short
git stash push -u -m "WIP: notes du formateur"
git status --short
git stash list
git stash show --patch "stash@{0}"
```

Restaurer sans supprimer le stash :

```powershell
git stash apply "stash@{0}"
git status --short
git restore .\README.md
Remove-Item -LiteralPath .\brouillon-demo.txt
git stash drop "stash@{0}"
```

Ou appliquer et supprimer en une commande :

```powershell
git stash pop
```

## 6. `commit --amend` — corriger le dernier commit

```powershell
git switch -c demo/amend pre-prod
git commit --allow-empty -m "doc: message volontairement incorrect"
git log --oneline -1
git commit --amend -m "docs: corriger le message du commit"
git log --oneline -1
```

Les deux commandes `log` montrent que le hash a changé. Pour ajouter un oubli au
dernier commit :

```powershell
Set-Content -Path .\oubli-demo.txt -Value "Contenu oublié"
git add .\oubli-demo.txt
git commit --amend --no-edit
git show --stat HEAD
```

## 7. `merge` — fusionner sans conflit

La branche d'export CSV se fusionne proprement dans une copie de `pre-prod` :

```powershell
git switch -c demo/merge pre-prod
git merge --no-ff feature/export-csv -m "demo: fusionner l'export CSV"
git log --graph --decorate --oneline -8
node --test
```

`--no-ff` force la création d'un commit de merge visible dans le graphe.

## 8. `merge` — provoquer et résoudre un conflit

Le conflit préparé pour le cours concerne `config/app-settings.json` :

```powershell
git switch -c demo/conflit pre-prod
git merge feature/message-accueil
git status
git diff --name-only --diff-filter=U
Get-Content .\config\app-settings.json
```

Git affiche les marqueurs suivants dans le fichier :

```text
<<<<<<< HEAD
version de pre-prod
=======
version de feature/message-accueil
>>>>>>> feature/message-accueil
```

Pour abandonner la démonstration sans rien conserver :

```powershell
git merge --abort
```

Pour la refaire et choisir entièrement un côté :

```powershell
git merge feature/message-accueil
git checkout --ours .\config\app-settings.json
# Remplacer --ours par --theirs pour choisir la version de la feature.
git add .\config\app-settings.json
git commit -m "demo: résoudre le conflit du message d'accueil"
```

La même situation est visible dans l'interface GitHub sur la
[Pull Request conflictuelle #2](https://github.com/Marouane4142/ProjetGit/pull/2).

## 9. `rebase` — rejouer des commits sur une nouvelle base

`feature/refactor-stockage` est volontairement restée sur une ancienne version de
`pre-prod`. Travaillez sur une copie pour préserver la branche originale :

```powershell
git switch -c demo/rebase feature/refactor-stockage
git log --graph --decorate --oneline --all -15
git rebase pre-prod
git log --graph --decorate --oneline --all -15
node --test
```

En cas de conflit pendant un rebase :

```powershell
# Corriger le fichier, puis :
git add <fichier-corrige>
git rebase --continue

# Ou annuler tout le rebase :
git rebase --abort
```

Rebase interactif pour modifier, fusionner ou réordonner les deux derniers commits :

```powershell
git rebase -i HEAD~2
```

Dans l'éditeur, remplacer `pick` par `reword`, `squash`, `fixup` ou `drop`.

## 10. `cherry-pick` — copier un commit précis

La branche d'export CSV contient un commit autonome :

```powershell
git switch -c demo/cherry-pick pre-prod
git log feature/export-csv --oneline -1
git cherry-pick feature/export-csv
git show --stat HEAD
node --test
```

Le commit obtenu a un nouveau hash. En cas de conflit :

```powershell
git cherry-pick --abort
```

## 11. `restore` — annuler avant le commit

Annuler une modification non indexée :

```powershell
git switch -c demo/restore pre-prod
Add-Content -Path .\README.md -Value "`nModification à annuler."
git diff
git restore .\README.md
git status --short
```

Retirer une modification de l'index sans perdre son contenu :

```powershell
Add-Content -Path .\README.md -Value "`nModification indexée."
git add .\README.md
git diff --staged
git restore --staged .\README.md
git status --short
git restore .\README.md
```

## 12. `reset` — comparer `soft`, `mixed` et `hard`

Cette démonstration doit rester sur une branche `demo/*` :

```powershell
git switch -c demo/reset pre-prod
Set-Content -Path .\demo-reset.txt -Value "Version 1"
git add .\demo-reset.txt
git commit -m "demo: première version"
Add-Content -Path .\demo-reset.txt -Value "Version 2"
git add .\demo-reset.txt
git commit -m "demo: deuxième version"
$DEMO_RESET_TIP = git rev-parse HEAD
git log --oneline -4
```

### Reset soft

Le commit disparaît, mais ses changements restent indexés :

```powershell
git reset --soft HEAD~1
git status --short
git diff --staged
git reset --hard $DEMO_RESET_TIP
```

### Reset mixed

Le commit disparaît et ses changements deviennent non indexés :

```powershell
git reset --mixed HEAD~1
git status --short
git diff
git reset --hard $DEMO_RESET_TIP
```

### Reset hard

Le commit et les changements de fichiers disparaissent de la copie de travail :

```powershell
git reset --hard HEAD~1
git status --short
git log --oneline -4
git reflog --oneline -6
git reset --hard $DEMO_RESET_TIP
```

> `reset --hard` détruit les modifications non commitées. Ici, le point de retour est
> conservé dans `$DEMO_RESET_TIP` et la branche est jetable.

## 13. `revert` — annuler sans réécrire l'historique

```powershell
git switch -c demo/revert feature/export-csv
git revert HEAD --no-edit
git log --oneline -3
git show --stat HEAD
```

`revert` ajoute un commit inverse. C'est généralement le bon choix pour annuler un
commit déjà partagé sur GitHub.

## 14. `push` — publier sans toucher GitHub

Le remote local `formation` permet une démonstration sans risque :

```powershell
git switch -c demo/push pre-prod
git commit --allow-empty -m "demo: commit à publier"
git push -u formation demo/push
git status --short --branch
git branch --remotes
```

Après `-u`, la branche locale connaît sa branche distante de suivi.

La vraie commande GitHub serait :

```powershell
git push -u origin nom-de-la-branche
```

## 15. `pull` — récupérer puis intégrer

Démonstration simple sur une branche déjà synchronisée :

```powershell
git switch pre-prod
git pull --ff-only origin pre-prod
```

Pour simuler réellement le travail d'un collègue avec deux terminaux :

### Terminal 1 — dépôt principal

```powershell
Set-Location C:\DEV\ProjetGit
git switch -c demo/pull pre-prod
git push -u formation demo/pull
git clone .\.git-training-remote ..\TaskBoard-collegue-demo
```

### Terminal 2 — clone du collègue

```powershell
Set-Location C:\DEV\TaskBoard-collegue-demo
git switch demo/pull
git config user.name "Collegue Demo"
git config user.email "collegue@example.test"
Add-Content -Path .\README.md -Value "`nModification du collègue."
git add .\README.md
git commit -m "docs: ajouter la note du collègue"
git push origin demo/pull
```

### Retour au terminal 1

```powershell
Set-Location C:\DEV\ProjetGit
git switch demo/pull
git fetch formation
git log --oneline HEAD..formation/demo/pull
git pull --rebase formation demo/pull
git log --oneline -3
```

`pull` réalise un `fetch`, puis un `merge` ou un `rebase` selon l'option choisie.

## 16. `push --force-with-lease` — réécriture protégée

### Cas où la réécriture réussit

```powershell
git switch -c demo/force-with-lease pre-prod
git commit --allow-empty -m "demo: message incorrect"
git push -u formation demo/force-with-lease
git commit --amend -m "demo: message corrigé"
git push --force-with-lease
```

Le push réussit parce que la branche distante n'a pas changé depuis le dernier
`fetch` ou `push` local.

### Cas où Git protège le travail d'un collègue

Dans le clone du collègue :

```powershell
Set-Location C:\DEV\TaskBoard-collegue-demo
git fetch origin
git switch --track origin/demo/force-with-lease
git commit --allow-empty -m "demo: commit du collègue"
git push
```

Dans le dépôt principal, sans faire de `fetch` :

```powershell
Set-Location C:\DEV\ProjetGit
git switch demo/force-with-lease
git commit --amend -m "demo: autre réécriture locale"
git push --force-with-lease
```

Le push doit être refusé. Git sait que la branche distante a changé à votre insu.

Inspecter puis préserver le travail distant :

```powershell
git fetch formation
git log --graph --decorate --oneline --all -12
git rebase formation/demo/force-with-lease
git push
```

Préférez toujours `--force-with-lease` à `--force` sur une branche publiée.

## 17. Commandes d'annulation pendant une opération

```powershell
git merge --abort
git rebase --abort
git cherry-pick --abort
git revert --abort
```

Utilisez seulement la commande correspondant à l'opération actuellement en cours.

## 18. Nettoyage après le cours

Vérifier les branches avant de les supprimer :

```powershell
git switch pre-prod
git branch --list "demo/*"
git status --short --branch
```

Puis supprimer uniquement les branches de démonstration effectivement créées :

```powershell
git branch -D demo/navigation demo/commit demo/stash demo/amend
git branch -D demo/merge demo/conflit demo/rebase demo/cherry-pick
git branch -D demo/restore demo/reset demo/revert
git branch -D demo/push demo/pull demo/force-with-lease
```

Supprimer les branches correspondantes du remote local :

```powershell
git push formation --delete demo/push demo/pull demo/force-with-lease
git fetch formation --prune
```

Le dossier `C:\DEV\TaskBoard-collegue-demo` peut ensuite être supprimé manuellement
après avoir vérifié qu'il ne contient aucun travail à conserver.

## 19. Parcours conseillé pour une démonstration de 45 minutes

1. `status`, `log`, `diff` et le graphe — 5 minutes.
2. `switch`, `checkout`, `add` et `commit` — 7 minutes.
3. `stash` et `amend` — 5 minutes.
4. `merge` propre puis conflit — 8 minutes.
5. `rebase` et `cherry-pick` — 7 minutes.
6. `restore`, `reset`, `revert` et `reflog` — 6 minutes.
7. `fetch`, `pull`, `push` et `--force-with-lease` — 7 minutes.

## 20. Aide-mémoire compact

```powershell
# Observer
git status --short --branch
git log --graph --decorate --oneline --all
git diff
git diff --staged

# Branches
git switch <branche>
git switch -c <nouvelle-branche>
git checkout <branche>

# Valider
git add <fichier>
git add -p
git commit -m "type: description"
git commit --amend

# Mettre de côté
git stash push -u -m "description"
git stash list
git stash pop

# Intégrer
git merge <branche>
git rebase <branche-de-base>
git cherry-pick <commit-ou-branche>

# Synchroniser
git fetch <remote> --prune
git pull --rebase
git push -u <remote> <branche>
git push --force-with-lease

# Annuler
git restore <fichier>
git restore --staged <fichier>
git revert <commit>
git reset --soft HEAD~1
git reset --mixed HEAD~1
git reset --hard HEAD~1
git reflog
```
