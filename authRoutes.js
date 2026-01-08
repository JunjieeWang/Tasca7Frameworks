/**
 * Rutes d'Autenticació (authRoutes)
 * Defineix els endpoints per a l'autenticació d'usuaris
 * 
 * Endpoints:
 * - POST /api/auth/register - Registrar nou usuari
 * - POST /api/auth/login - Iniciar sessió
 * - GET /api/auth/me - Obtenir perfil (protegit)
 * - PUT /api/auth/profile - Actualitzar perfil (protegit)
 * - PUT /api/auth/change-password - Canviar contrasenya (protegit)
 */

const express = require("express");
const router = express.Router();

// Middleware d'autenticació
const auth = require("../middleware/auth");

// Validadors
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require("../middleware/validators/authValidators");

// Controladors
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

// ============================================
// RUTES PÚBLIQUES (no requereixen autenticació)
// ============================================

/**
 * POST /api/auth/register
 * Registra un nou usuari al sistema
 */
router.post("/register", registerValidation, (req, res, next) => register(req, res, next));

/**
 * POST /api/auth/login
 * Inicia sessió i retorna un token JWT
 */
router.post("/login", loginValidation, (req, res, next) => login(req, res, next));

// ============================================
// RUTES PROTEGIDES (requereixen autenticació)
// ============================================

/**
 * GET /api/auth/me
 * Retorna el perfil de l'usuari autenticat
 */
router.get("/me", auth, (req, res, next) => getMe(req, res, next));

/**
 * PUT /api/auth/profile
 * Actualitza el perfil de l'usuari autenticat
 */
router.put("/profile", auth, updateProfileValidation, (req, res, next) => updateProfile(req, res, next));

/**
 * PUT /api/auth/change-password
 * Canvia la contrasenya de l'usuari autenticat
 */
router.put("/change-password", auth, changePasswordValidation, (req, res, next) => changePassword(req, res, next));

module.exports = router;