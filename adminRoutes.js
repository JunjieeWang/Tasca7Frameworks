/**
 * Rutes d'Administració (adminRoutes)
 * Defineix els endpoints exclusius per administradors
 * 
 * TOTES les rutes requereixen:
 * 1. Autenticació (middleware auth)
 * 2. Rol d'administrador (middleware roleCheck)
 * 
 * Endpoints:
 * - GET /api/admin/users - Obtenir tots els usuaris
 * - GET /api/admin/tasks - Obtenir totes les tasques
 * - DELETE /api/admin/users/:id - Eliminar un usuari
 * - PUT /api/admin/users/:id/role - Canviar rol d'un usuari
 */

const express = require("express");
const router = express.Router();

// Middlewares
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Controladors
const { getAllUsers, getAllTasks, deleteUser, changeUserRole } = require("../controllers/adminController");

// ============================================
// APLICAR MIDDLEWARES A TOTES LES RUTES
// ============================================

// Primer verifiquem autenticació
router.use(auth);

// Després verifiquem que l'usuari sigui admin
router.use(roleCheck(["admin"]));

// ============================================
// DEFINICIÓ DE RUTES
// ============================================

/**
 * GET /api/admin/users
 * Retorna tots els usuaris del sistema
 */
router.get("/users", getAllUsers);

/**
 * GET /api/admin/tasks
 * Retorna totes les tasques del sistema (amb info dels usuaris)
 */
router.get("/tasks", getAllTasks);

/**
 * DELETE /api/admin/users/:id
 * Elimina un usuari i totes les seves tasques
 */
router.delete("/users/:id", deleteUser);

/**
 * PUT /api/admin/users/:id/role
 * Canvia el rol d'un usuari (user <-> admin)
 */
router.put("/users/:id/role", changeUserRole);

module.exports = router;