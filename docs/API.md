# Documentation API VirtualSomm

## Vue d'ensemble

L'API VirtualSomm fournit les endpoints nécessaires pour la gestion des restaurants, vins, plats et recommandations intelligentes.

**Base URL** : `https://api.virtualsomm.ch`

## 🔐 Authentification

### OAuth2 Password Grant

L'API utilise OAuth2 avec le flow "password grant" pour l'authentification.

#### Obtenir un token d'accès

```http
POST /token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=admin
&password=admin123
&client_id=250684173847-7f1vs6bi5852mel1k2ddogijlrffemf8.apps.googleusercontent.com
&client_secret=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
```

**Réponse :**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### Utilisation du token

Inclure le token dans l'en-tête Authorization de toutes les requêtes :

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 👤 Endpoints Utilisateur

### Informations utilisateur

```http
GET /users_infos
Authorization: Bearer {token}
```

**Réponse :**
```json
{
  "username": "admin",
  "email": "admin@virtualsomm.ch",
  "role": "admin"
}
```

## 🍷 Endpoints Vins

### Récupérer les vins d'un restaurant

```http
POST /recommendations/restaurant_wines
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurant_id": 0
}
```

**Réponse :**
```json
[
  {
    "wine_id": 1,
    "wine_name": {
      "fr": "Château Margaux",
      "en-US": "Château Margaux"
    },
    "wine_type": {
      "fr": "Rouge",
      "en-US": "Red"
    },
    "domain": {
      "fr": "Château Margaux",
      "en-US": "Château Margaux"
    },
    "country": {
      "fr": "France",
      "en-US": "France"
    },
    "appellation": {
      "fr": "Margaux",
      "en-US": "Margaux"
    },
    "grapes_varieties": [
      {
        "variety_id": 1,
        "variety_name": {
          "fr": "Cabernet Sauvignon",
          "en-US": "Cabernet Sauvignon"
        },
        "variety_percent": 75
      }
    ],
    "year": 2018,
    "price": 450.00,
    "format_cl": 75,
    "global_score": "95/100",
    "internal_score": "A+"
  }
]
```

### Recommandations de vins

```http
POST /recommendations/wines
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurant_id": 0,
  "dish_ids": [1, 2, 3]
}
```

## 🍽️ Endpoints Plats

### Récupérer les plats d'un restaurant

```http
POST /recommendations/dishes
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurant_id": 0
}
```

**Réponse :**
```json
[
  {
    "dish_id": 1,
    "dish_name": {
      "fr": "Filet de bœuf Wellington",
      "en-US": "Beef Wellington"
    },
    "dish_type": {
      "fr": "Viande",
      "en-US": "Meat"
    },
    "dish_category": {
      "fr": "Plat principal",
      "en-US": "Main course"
    },
    "price": 45.00,
    "description": {
      "fr": "Filet de bœuf enrobé de pâte feuilletée",
      "en-US": "Beef fillet wrapped in puff pastry"
    },
    "aromas": [
      {
        "aroma_id": 1,
        "aroma_name": {
          "fr": "Viande rouge",
          "en-US": "Red meat"
        },
        "intensity": 8
      }
    ]
  }
]
```

## 📊 Types de données

### Wine (Vin)

```typescript
interface RestaurantWine {
  wine_id: number;
  wine_type: { [key: string]: string };
  domain: { [key: string]: string };
  country: { [key: string]: string };
  appellation: { [key: string]: string };
  wine_name: { [key: string]: string };
  grapes_varieties: Array<{
    variety_id: number;
    variety_name: { [key: string]: string };
    variety_percent: number;
  }>;
  year: number;
  price: number;
  format_cl: number;
  global_score: string;
  internal_score: string;
}
```

### Dish (Plat)

```typescript
interface Dish {
  dish_id: number;
  dish_name: { [key: string]: string };
  dish_type: { [key: string]: string };
  dish_category: { [key: string]: string };
  price: number;
  description: { [key: string]: string };
  aromas: Array<{
    aroma_id: number;
    aroma_name: { [key: string]: string };
    intensity: number;
  }>;
}
```

## ⚠️ Gestion des erreurs

### Codes d'erreur HTTP

- **200** : Succès
- **400** : Requête invalide
- **401** : Non autorisé (token manquant ou invalide)
- **403** : Accès interdit
- **404** : Ressource non trouvée
- **422** : Entité non traitable (données invalides)
- **500** : Erreur serveur interne

### Format des erreurs

```json
{
  "error": "invalid_request",
  "error_description": "The request is missing a required parameter",
  "status_code": 400
}
```

## 🔄 Stratégie de retry

En cas d'erreur temporaire, l'application implémente une stratégie de retry :

1. **Premier essai** : Requête standard
2. **Deuxième essai** : Avec paramètres dans le body
3. **Troisième essai** : Avec paramètres en query string
4. **Quatrième essai** : Méthode GET avec query params

## 📝 Exemples d'utilisation

### Récupération complète des données d'un restaurant

```javascript
// 1. Authentification
const authResponse = await fetch('/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'grant_type=password&username=admin&password=admin123&client_id=...'
});
const { access_token } = await authResponse.json();

// 2. Récupération des vins
const winesResponse = await fetch('/api/recommendations/restaurant_wines', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ restaurant_id: 0 })
});
const wines = await winesResponse.json();

// 3. Récupération des plats
const dishesResponse = await fetch('/api/recommendations/dishes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ restaurant_id: 0 })
});
const dishes = await dishesResponse.json();
```

## 🚀 Bonnes pratiques

1. **Réutiliser les tokens** : Stocker et réutiliser les tokens jusqu'à expiration
2. **Gestion des erreurs** : Implémenter une gestion robuste des erreurs
3. **Retry automatique** : Réessayer en cas d'erreur temporaire
4. **Cache intelligent** : Mettre en cache les données peu changeantes
5. **Pagination** : Gérer la pagination pour les grandes listes

## 🔍 Debug et monitoring

### Headers de debug

Ajouter ces headers pour faciliter le debug :

```http
X-Request-ID: unique-request-id
X-Debug-Mode: true
```

### Logs utiles

L'API retourne des informations de debug dans les headers de réponse :

- `X-Response-Time` : Temps de traitement
- `X-Rate-Limit-Remaining` : Requêtes restantes
- `X-Server-Version` : Version de l'API
