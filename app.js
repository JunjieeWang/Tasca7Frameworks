/**
 * Fitxer principal de l'aplicació (app.js)
 * Configura Express, connecta a MongoDB i inicia el servidor
 */

// Carreguem les variables d'entorn del fitxer .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Importem les rutes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Importem els middlewares de gestió d'errors
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Creem l'aplicació Express
const app = express();

// ============================================
// MIDDLEWARES GLOBALS
// ============================================

// Habilitem CORS per permetre peticions des d'altres dominis
app.use(cors());

// Parsejem el cos de les peticions com a JSON
app.use(express.json());

// ============================================
// RUTA PRINCIPAL (Health Check)
// ============================================

/**
 * GET /
 * Endpoint per verificar que l'API està funcionant
 */
app.get("/", (req, res) => {
  res.json({ ok: true, service: "task-manager-api" });
});

// ============================================
// RUTES DE L'API
// ============================================

// Rutes d'autenticació (públiques i protegides)
app.use("/api/auth", authRoutes);

// Rutes de tasques (totes protegides)
app.use("/api/tasks", taskRoutes);

// Rutes d'administració (només admins)
app.use("/api/admin", adminRoutes);

// ============================================
// MIDDLEWARES DE GESTIÓ D'ERRORS
// ============================================

// Middleware per gestionar rutes no trobades (404)
app.use(notFound);

// Middleware global de gestió d'errors
app.use(errorHandler);

// ============================================
// FUNCIÓ D'INICI DEL SERVIDOR
// ============================================

/**
 * Funció asíncrona per iniciar el servidor
 * Connecta a MongoDB i inicia Express
 */
async function start() {
  // Obtenim el port de les variables d'entorn (per defecte 3000)
  const port = process.env.PORT || 3000;
  
  // Obtenim la URI de MongoDB
  const mongoJJ = process.env.MONGO_JJ;

  // Validem que existeixi la connexió a MongoDB
  if (!mongoJJ) {
    throw new Error("MONGO_JJ no está configurado en .env");
  }

  // Connectem a MongoDB
  await mongoose.connect(mongoJJ);
  console.log("MongoDB conectado");

  // Iniciem el servidor Express
  app.listen(port, () => console.log(`API escuchando en puerto ${port}`));
}

// Executem la funció d'inici i gestionem errors
start().catch((err) => {
  console.error(err);
  process.exit(1);  // Sortim amb codi d'error
});