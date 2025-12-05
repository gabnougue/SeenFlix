# Tests Backend

## 🚀 Lancer les tests

### Tous les tests
```bash
npm test
```

### Un seul fichier
```bash
npm test auth.service.test.js
```

### Un dossier spécifique
```bash
npm test tests/services
```

## 📁 Fichiers de tests

```
tests/
├── services/
│   ├── auth.service.test.js         # Tests authentification
│   └── favorites.service.test.js    # Tests favoris
└── middlewares/
    └── authenticateToken.test.js    # Tests JWT
```

## ✅ Résultat attendu

```bash
$ npm test

PASS tests/services/auth.service.test.js
  ✓ devrait créer un nouvel utilisateur (45ms)
  ✓ devrait rejeter si l'email existe déjà (12ms)
  ✓ devrait connecter un utilisateur (38ms)
  ...

Tests: 16 passed, 16 total
```
