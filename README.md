# Task Manager API

API RESTful per a la gestió de tasques amb sistema d'autenticació i autorització mitjançant JWT (JSON Web Tokens).

## Taula de Continguts

- [Descripció](#descripció)
- [Tecnologies Utilitzades](#tecnologies-utilitzades)
- [Instruccions d'Instal·lació](#instruccions-dinstallació)
- [Variables d'Entorn](#variables-dentorn)
- [Estructura del Projecte](#estructura-del-projecte)
- [Sistema d'Autenticació](#sistema-dautenticació)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Exemples d'Ús](#exemples-dús)
- [Codis d'Error](#codis-derror)
- [Seguretat](#seguretat)

---

## Descripció

Aquesta API permet gestionar tasques personals amb les següents funcionalitats:

- **Autenticació d'usuaris**: Registre, login i gestió de perfil
- **Gestió de tasques**: CRUD complet (Crear, Llegir, Actualitzar, Eliminar)
- **Sistema de rols**: Usuaris normals i administradors
- **Protecció de rutes**: Cada usuari només pot accedir a les seves pròpies tasques
- **Estadístiques**: Resum de tasques per usuari

---

## Tecnologies Utilitzades

| Tecnologia | Versió | Descripció |
|------------|--------|------------|
| Node.js | 18+ | Entorn d'execució JavaScript |
| Express.js | 4.x | Framework web per Node.js |
| MongoDB | 6+ | Base de dades NoSQL |
| Mongoose | 8.x | ODM per MongoDB |
| JWT | - | JSON Web Tokens per autenticació |
| bcrypt | 5.x | Xifrat de contrasenyes |
| express-validator | 7.x | Validació de dades d'entrada |
| cors | 2.x | Gestió de Cross-Origin Resource Sharing |
| dotenv | 16.x | Gestió de variables d'entorn |

---

## Instruccions d'Instal·lació

### Requisits Previs

- Node.js v18 o superior
- MongoDB (local o Atlas)
- npm o yarn

### Pas 1: Clonar el Repositori

```bash
git clone https://github.com/el-teu-usuari/task-manager-api.git
cd task-manager-api
```

### Pas 2: Instal·lar Dependències

```bash
npm install
```

O si utilitzes yarn:

```bash
yarn install
```

### Pas 3: Configurar Variables d'Entorn

Crea un fitxer `.env` a l'arrel del projecte (pots copiar `.env.example`):

```bash
cp .env.example .env
```

Edita el fitxer `.env` amb les teves configuracions (veure secció Variables d'Entorn).

### Pas 4: Iniciar el Servidor

Mode desenvolupament:
```bash
npm run dev
```

Mode producció:
```bash
npm start
```

### Pas 5: Verificar la Instal·lació

Obre el navegador o Postman i accedeix a:

```
http://localhost:3000
```

Hauries de veure:
```json
{
  "ok": true,
  "service": "task-manager-api"
}
```

---

## Variables d'Entorn

Crea un fitxer `.env` a l'arrel del projecte amb les següents variables:

```bash
# CONFIGURACIÓ DEL SERVIDOR

# Port on s'executarà el servidor (opcional)
PORT=3000

# CONFIGURACIÓ DE MONGODB

# URI de connexió a MongoDB
# Exemple local:
MONGO_JJ=mongodb://localhost:27017/task-manager

# Exemple MongoDB Atlas:
# MONGO_JJ=mongodb+srv://usuari:contrasenya@cluster.xxxxx.mongodb.net/task-manager

# CONFIGURACIÓ DE JWT

# Clau secreta per signar els tokens JWT
# IMPORTANT: Utilitza una cadena llarga i aleatòria en producció
JWT_SECRET=la_teva_clau_secreta_super_segura_aqui_123456789

# Temps d'expiració dels tokens
# Formats vàlids: 60 (segons), "2 days", "10h", "7d"
JWT_EXPIRES_IN=7d
```

### Descripció de les Variables

| Variable | Obligatòria | Descripció | Exemple |
|----------|-------------|------------|---------|
| `PORT` | No | Port del servidor | `3000` |
| `MONGO_JJ` | Sí | URI de connexió a MongoDB | `mongodb://localhost:27017/task-manager` |
| `JWT_SECRET` | Sí | Clau secreta per signar tokens | `clau_molt_segura_123` |
| `JWT_EXPIRES_IN` | No | Temps d'expiració del token | `7d` |

### Advertències de Seguretat

- Mai pugis el fitxer `.env` al repositori
- Afegeix `.env` al `.gitignore`
- Utilitza claus secretes úniques i llargues (mínim 32 caràcters)
- En producció, utilitza variables d'entorn del servidor

---

## Estructura del Projecte

```
task-manager-api/
│
├── .env                          # Variables d'entorn (NO pujar a Git!)
├── .env.example                  # Exemple de variables d'entorn
├── .gitignore                    # Fitxers a ignorar per Git
├── package.json                  # Dependències i scripts
├── README.md                     # Documentació del projecte
│
├── app.js                        # Punt d'entrada de l'aplicació
│
├── models/                       # Models de Mongoose
│   ├── User.js                   # Model d'usuari
│   └── Task.js                   # Model de tasca
│
├── controllers/                  # Controladors (lògica de negoci)
│   ├── authController.js         # Controlador d'autenticació
│   ├── adminController.js        # Controlador d'administració
│   └── taskController.js         # Controlador de tasques
│
├── middleware/                   # Middlewares personalitzats
│   ├── auth.js                   # Middleware d'autenticació JWT
│   ├── roleCheck.js              # Middleware de verificació de rol
│   ├── errorHandler.js           # Middleware de gestió d'errors
│   └── validators/               # Validadors d'entrada
│       ├── _common.js            # Utilitats comunes de validació
│       ├── authValidators.js     # Validadors d'autenticació
│       └── taskValidators.js     # Validadors de tasques
│
├── routes/                       # Definició de rutes
│   ├── authRoutes.js             # Rutes d'autenticació
│   ├── adminRoutes.js            # Rutes d'administració
│   └── taskRoutes.js             # Rutes de tasques
│
└── utils/                        # Utilitats
    ├── errorResponse.js          # Classe d'error personalitzada
    └── generateToken.js          # Generador de tokens JWT
```

---

## Sistema d'Autenticació

### Què és JWT?

JWT (JSON Web Token) és un estàndard obert que defineix una forma compacta i autònoma de transmetre informació de forma segura entre parts com un objecte JSON.

### Estructura d'un Token JWT

Un token JWT consta de tres parts separades per punts (`.`):

```
xxxxx.yyyyy.zzzzz
  │      │      │
  │      │      └── Signature (Signatura)
  │      └── Payload (Dades)
  └── Header (Capçalera)
```

Exemple de payload del nostre sistema:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "usuari@example.com",
  "role": "user",
  "iat": 1699123456,
  "exp": 1699728256
}
```

### Flux d'Autenticació

```
1. REGISTRE
   Client  ------>  POST /api/auth/register  ------>  Servidor
           { email, password, name }
   Client  <------  { token, user }          <------  Servidor

2. LOGIN
   Client  ------>  POST /api/auth/login     ------>  Servidor
           { email, password }
   Client  <------  { token, user }          <------  Servidor

3. PETICIONS PROTEGIDES
   Client  ------>  GET /api/tasks           ------>  Servidor
           Header: Bearer <token>
   Client  <------  { tasks: [...] }         <------  Servidor
```

### Xifrat de Contrasenyes

Les contrasenyes mai s'emmagatzemen en text pla. Utilitzem bcrypt per xifrar-les:

```
Contrasenya original:  "MevaContrasenya123"
                              │
                              ▼
                         [ bcrypt ]
                              │
                              ▼
Contrasenya xifrada:   "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

### Sistema de Rols

El sistema implementa dos rols:

| Rol | Permisos |
|-----|----------|
| user | Gestionar les seves pròpies tasques |
| admin | Tot el que pot fer un user + gestionar tots els usuaris i tasques |

---

## Endpoints Disponibles

### Rutes Públiques (No requereixen autenticació)

| Mètode | Endpoint | Descripció |
|--------|----------|------------|
| GET | `/` | Health check de l'API |
| POST | `/api/auth/register` | Registrar nou usuari |
| POST | `/api/auth/login` | Iniciar sessió |

### Rutes d'Autenticació (Requereixen token)

| Mètode | Endpoint | Descripció |
|--------|----------|------------|
| GET | `/api/auth/me` | Obtenir perfil de l'usuari actual |
| PUT | `/api/auth/profile` | Actualitzar perfil |
| PUT | `/api/auth/change-password` | Canviar contrasenya |

### Rutes de Tasques (Requereixen token)

| Mètode | Endpoint | Descripció |
|--------|----------|------------|
| GET | `/api/tasks` | Obtenir totes les tasques de l'usuari |
| POST | `/api/tasks` | Crear nova tasca |
| GET | `/api/tasks/stats` | Obtenir estadístiques |
| GET | `/api/tasks/:id` | Obtenir tasca per ID |
| PUT | `/api/tasks/:id` | Actualitzar tasca |
| DELETE | `/api/tasks/:id` | Eliminar tasca |
| PUT | `/api/tasks/:id/image` | Actualitzar imatge de la tasca |
| PUT | `/api/tasks/:id/image/reset` | Eliminar imatge de la tasca |

### Rutes d'Administració (Requereixen token + rol admin)

| Mètode | Endpoint | Descripció |
|--------|----------|------------|
| GET | `/api/admin/users` | Obtenir tots els usuaris |
| GET | `/api/admin/tasks` | Obtenir totes les tasques |
| DELETE | `/api/admin/users/:id` | Eliminar usuari |
| PUT | `/api/admin/users/:id/role` | Canviar rol d'usuari |

---

## Exemples d'Ús

### Configuració de Postman

Per a totes les peticions protegides, afegeix el header:

```
Authorization: Bearer <el_teu_token>
```

---

### 1. Registre d'Usuari

Request:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Joan Garcia",
  "email": "joan@example.com",
  "password": "contrasenya123"
}
```

Response (201 Created):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Joan Garcia",
    "email": "joan@example.com",
    "role": "user"
  }
}
```

---

### 2. Inici de Sessió (Login)

Request:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joan@example.com",
  "password": "contrasenya123"
}
```

Response (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Joan Garcia",
    "email": "joan@example.com",
    "role": "user"
  }
}
```

---

### 3. Obtenir Perfil

Request:
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Joan Garcia",
    "email": "joan@example.com",
    "role": "user"
  }
}
```

---

### 4. Actualitzar Perfil

Request:
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Joan Garcia Martínez",
  "email": "joan.garcia@example.com"
}
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Joan Garcia Martínez",
    "email": "joan.garcia@example.com",
    "role": "user"
  }
}
```

---

### 5. Canviar Contrasenya

Request:
```http
PUT /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "contrasenya123",
  "newPassword": "novaContrasenya456"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password actualitzat"
}
```

---

### 6. Crear Tasca

Request:
```http
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Dissenyar logo corporatiu",
  "description": "Crear un logo modern per l'empresa",
  "cost": 300,
  "hours_estimated": 8,
  "completed": false
}
```

Response (201 Created):
```json
{
  "success": true,
  "task": {
    "_id": "657abc123def456789012345",
    "user": "507f1f77bcf86cd799439011",
    "title": "Dissenyar logo corporatiu",
    "description": "Crear un logo modern per l'empresa",
    "cost": 300,
    "hours_estimated": 8,
    "completed": false,
    "image": "",
    "createdAt": "2024-12-10T19:00:00.000Z",
    "updatedAt": "2024-12-10T19:00:00.000Z"
  }
}
```

---

### 7. Obtenir Totes les Tasques

Request:
```http
GET /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "count": 2,
  "tasks": [
    {
      "_id": "657abc123def456789012345",
      "user": "507f1f77bcf86cd799439011",
      "title": "Dissenyar logo corporatiu",
      "description": "Crear un logo modern per l'empresa",
      "cost": 300,
      "hours_estimated": 8,
      "completed": false,
      "image": "",
      "createdAt": "2024-12-10T19:00:00.000Z",
      "updatedAt": "2024-12-10T19:00:00.000Z"
    },
    {
      "_id": "657def456ghi789012345678",
      "user": "507f1f77bcf86cd799439011",
      "title": "Maquetar pàgina web",
      "description": "HTML i CSS responsive",
      "cost": 150,
      "hours_estimated": 4,
      "completed": true,
      "image": "",
      "createdAt": "2024-12-09T10:00:00.000Z",
      "updatedAt": "2024-12-10T15:00:00.000Z"
    }
  ]
}
```

---

### 8. Obtenir Estadístiques

Request:
```http
GET /api/tasks/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "completed": 6,
    "pending": 4,
    "totalCost": 2500,
    "totalHours": 45
  }
}
```

---

### 9. Obtenir Tasca per ID

Request:
```http
GET /api/tasks/657abc123def456789012345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "task": {
    "_id": "657abc123def456789012345",
    "user": "507f1f77bcf86cd799439011",
    "title": "Dissenyar logo corporatiu",
    "description": "Crear un logo modern per l'empresa",
    "cost": 300,
    "hours_estimated": 8,
    "completed": false,
    "image": "",
    "createdAt": "2024-12-10T19:00:00.000Z",
    "updatedAt": "2024-12-10T19:00:00.000Z"
  }
}
```

---

### 10. Actualitzar Tasca

Request:
```http
PUT /api/tasks/657abc123def456789012345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "completed": true,
  "cost": 350
}
```

Response (200 OK):
```json
{
  "success": true,
  "task": {
    "_id": "657abc123def456789012345",
    "user": "507f1f77bcf86cd799439011",
    "title": "Dissenyar logo corporatiu",
    "description": "Crear un logo modern per l'empresa",
    "cost": 350,
    "hours_estimated": 8,
    "completed": true,
    "image": "",
    "createdAt": "2024-12-10T19:00:00.000Z",
    "updatedAt": "2024-12-10T20:00:00.000Z"
  }
}
```

---

### 11. Eliminar Tasca

Request:
```http
DELETE /api/tasks/657abc123def456789012345
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Task eliminada"
}
```

---

### 12. Obtenir Tots els Usuaris (Admin)

Request:
```http
GET /api/admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (token d'admin)
```

Response (200 OK):
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Joan Garcia",
      "email": "joan@example.com",
      "role": "user",
      "createdAt": "2024-12-10T18:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

---

### 13. Canviar Rol d'Usuari (Admin)

Request:
```http
PUT /api/admin/users/507f1f77bcf86cd799439011/role
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (token d'admin)
Content-Type: application/json

{
  "role": "admin"
}
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Joan Garcia",
    "email": "joan@example.com",
    "role": "admin"
  }
}
```

---

### 14. Eliminar Usuari (Admin)

Request:
```http
DELETE /api/admin/users/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (token d'admin)
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Usuario y sus tareas eliminados"
}
```

---

## Codis d'Error

### Errors d'Autenticació (4xx)

| Codi | Error | Descripció |
|------|-------|------------|
| 400 | Bad Request | Dades invàlides o faltants |
| 401 | Unauthorized | Token invàlid, expirat o no proporcionat |
| 403 | Forbidden | Permisos insuficients (ex: no és admin) |
| 404 | Not Found | Recurs no trobat |

### Exemples de Respostes d'Error

Error de validació (400):
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "password",
      "message": "Password mínimo 6 caracteres"
    }
  ]
}
```

Error d'autenticació (401):
```json
{
  "success": false,
  "error": "No autoritzat: token invàlid o expirat"
}
```

Error de permisos (403):
```json
{
  "success": false,
  "error": "Prohibido: permisos insuficientes"
}
```

Error de recurs no trobat (404):
```json
{
  "success": false,
  "error": "Task no encontrada"
}
```

Error del servidor (500):
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

---

## Seguretat

### Bones Pràctiques Implementades

| Pràctica | Implementació |
|----------|---------------|
| Xifrat de contrasenyes | bcrypt amb salt rounds de 10 |
| Tokens JWT | Signats amb clau secreta i expiració |
| Validació d'entrada | express-validator a totes les rutes |
| Protecció de rutes | Middleware d'autenticació i autorització |
| Variables d'entorn | Secrets en fitxer .env (no versionat) |
| No exposar contrasenyes | `select: false` al model User |
| Control d'accés | Cada usuari només accedeix a les seves dades |

### Recomanacions per a Producció

1. Utilitza HTTPS per a totes les comunicacions
2. Configura CORS adequadament per restringir orígens
3. Implementa rate limiting per prevenir atacs de força bruta
4. Utilitza helmet.js per afegir headers de seguretat
5. Monitora i registra els intents d'accés fallits
6. Rota les claus JWT periòdicament
7. Utilitza tokens de curta durada amb refresh tokens
