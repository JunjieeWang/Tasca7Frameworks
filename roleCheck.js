/**
 * Middleware de Verificació de Rol (roleCheck)
 * Comprova que l'usuari autenticat tingui un dels rols permesos
 * 
 * S'utilitza després del middleware auth per protegir rutes per rol
 * 
 * Exemple d'ús: roleCheck(["admin"]) - només permet admins
 */

const ErrorResponse = require("../utils/errorResponse");

/**
 * Factory function que retorna un middleware de verificació de rol
 * 
 * @param {Array<string>} allowedRoles - Array de rols permesos (ex: ["admin"], ["user", "admin"])
 * @returns {Function} Middleware d'Express
 */
function roleCheck(allowedRoles) {
  return (req, res, next) => {
    // Verifiquem que l'usuari estigui autenticat (req.user existeix)
    if (!req.user) {
      return next(new ErrorResponse("No autorizado", 401));
    }
    
    // Comprovem si el rol de l'usuari està a la llista de rols permesos
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ErrorResponse("Prohibido: permisos insuficientes", 403));
    }
    
    // L'usuari té el rol adequat, continuem
    next();
  };
}

module.exports = roleCheck;