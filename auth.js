/**
 * Middleware d'Autenticació (auth)
 * Verifica que la petició contingui un token JWT vàlid
 * Si és vàlid, afegeix l'usuari a req.user per a ús posterior
 * 
 * S'utilitza per protegir rutes que requereixen autenticació
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Middleware per verificar l'autenticació via JWT
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function auth(req, res, next) {
  try {
    // Obtenim el header Authorization
    const header = req.headers.authorization;

    // Verifiquem que existeixi i tingui el format correcte "Bearer <token>"
    if (!header || !header.startsWith("Bearer ")) {
      return next(new ErrorResponse("No autoritzat: falta token", 401));
    }

    // Extraiem el token (després de "Bearer ")
    const token = header.split(" ")[1];
    
    // Obtenim la clau secreta de les variables d'entorn
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return next(new ErrorResponse("JWT_SECRET no configurat", 500));
    }

    // Intentem verificar i decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      // Error si el token és invàlid o ha expirat
      return next(new ErrorResponse("No autoritzat: token invàlid o expirat", 401));
    }

    // Busquem l'usuari a la base de dades pel userId del token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new ErrorResponse("No autoritzat: usuari no existeix", 401));
    }

    // Afegim les dades de l'usuari a req.user per a ús en controladors
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Continuem al següent middleware o controlador
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = auth;