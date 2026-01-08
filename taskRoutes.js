/**
 * Rutes de Tasques (taskRoutes)
 * Defineix els endpoints per a la gestió de tasques
 * 
 * TOTES les rutes requereixen autenticació
 * Cada usuari només pot accedir a les seves pròpies tasques
 * 
 * Endpoints:
 * - GET /api/tasks/stats - Obtenir estadístiques
 * - POST /api/tasks - Crear nova tasca
 * - GET /api/tasks - Obtenir totes les tasques de l'usuari
 * - GET /api/tasks/:id - Obtenir una tasca per ID
 * - PUT /api/tasks/:id - Actualitzar una tasca
 * - DELETE /api/tasks/:id - Eliminar una tasca
 * - PUT /api/tasks/:id/image - Actualitzar imatge
 * - PUT /api/tasks/:id/image/reset - Eliminar imatge
 */

const express = require("express");
const router = express.Router();

// Middleware d'autenticació
const auth = require("../middleware/auth");

// Validadors
const { createTaskValidation, updateTaskValidation } = require("../middleware/validators/taskValidators");

// Controladors
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  uploadImage,
  resetImage,
  getTaskStats,
} = require("../controllers/taskController");

// ============================================
// APLICAR AUTENTICACIÓ A TOTES LES RUTES
// ============================================
router.use(auth);

// ============================================
// RUTA D'ESTADÍSTIQUES (abans de :id per evitar conflictes)
// ============================================

/**
 * GET /api/tasks/stats
 * Retorna estadístiques de les tasques de l'usuari
 */
router.get("/stats", getTaskStats);

// ============================================
// RUTES CRUD DE TASQUES
// ============================================

/**
 * POST /api/tasks
 * Crea una nova tasca per l'usuari autenticat
 */
router.post("/", createTaskValidation, createTask);

/**
 * GET /api/tasks
 * Retorna totes les tasques de l'usuari autenticat
 */
router.get("/", getAllTasks);

/**
 * GET /api/tasks/:id
 * Retorna una tasca específica per ID
 */
router.get("/:id", getTaskById);

/**
 * PUT /api/tasks/:id
 * Actualitza una tasca específica
 */
router.put("/:id", updateTaskValidation, updateTask);

/**
 * DELETE /api/tasks/:id
 * Elimina una tasca específica
 */
router.delete("/:id", deleteTask);

// ============================================
// RUTES DE GESTIÓ D'IMATGES
// ============================================

/**
 * PUT /api/tasks/:id/image
 * Actualitza la imatge d'una tasca
 */
router.put("/:id/image", updateTaskValidation, uploadImage);

/**
 * PUT /api/tasks/:id/image/reset
 * Elimina la imatge d'una tasca (la posa a buit)
 */
router.put("/:id/image/reset", resetImage);

module.exports = router;