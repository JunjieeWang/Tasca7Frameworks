/**
 * Controlador d'Autenticació (authController)
 * Gestiona totes les operacions relacionades amb l'autenticació d'usuaris:
 * - Registre de nous usuaris
 * - Inici de sessió (login)
 * - Obtenir perfil de l'usuari actual
 * - Actualitzar perfil
 * - Canviar contrasenya
 */

const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const generateToken = require("../utils/generateToken");

/**
 * Registre d'usuaris
 * POST /api/auth/register
 * Body: { name?, email, password }
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function register(req, res, next) {
  try {
    // Extraiem les dades del cos de la petició
    const { name, email, password } = req.body;

    // Comprovem si l'email ja existeix a la base de dades
    const exists = await User.findOne({ email });
    if (exists) {
      return next(new ErrorResponse("Email ja registrat", 400));
    }

    // Creem el nou usuari (la contrasenya es xifrarà automàticament pel hook pre-save)
    const user = await User.create({ name, email, password });

    // Generem el token JWT per l'usuari
    const token = generateToken(user);

    // Retornem la resposta amb èxit
    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    // Passem l'error al middleware de gestió d'errors
    return next(err);
  }
}

/**
 * Inici de sessió (Login)
 * POST /api/auth/login
 * Body: { email, password }
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function login(req, res, next) {
  try {
    // Extraiem email i contrasenya del cos de la petició
    const { email, password } = req.body;

    // Busquem l'usuari per email i incloem la contrasenya (normalment exclosa)
    const user = await User.findOne({ email }).select("+password");
    
    // Si no trobem l'usuari, retornem error de credencials
    if (!user) {
      return next(new ErrorResponse("Credencials invàlides", 401));
    }

    // Comparem la contrasenya proporcionada amb la guardada (xifrada)
    const ok = await user.comparePassword(password);
    
    // Si la contrasenya no coincideix, retornem error
    if (!ok) {
      return next(new ErrorResponse("Credencials invàlides", 401));
    }

    // Generem el token JWT
    const token = generateToken(user);

    // Retornem la resposta amb èxit
    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Obtenir perfil de l'usuari actual
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * 
 * Requereix autenticació prèvia (middleware auth)
 * 
 * @param {Object} req - Objecte request d'Express (inclou req.user)
 * @param {Object} res - Objecte response d'Express
 */
async function getMe(req, res) {
  // req.user ja està disponible gràcies al middleware auth
  return res.json({ success: true, user: req.user });
}

/**
 * Actualitzar perfil d'usuari
 * PUT /api/auth/profile
 * Header: Authorization: Bearer <token>
 * Body: { name?, email? }
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;

    // Si s'intenta canviar l'email, comprovem que no estigui en ús per un altre usuari
    if (email) {
      const exists = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (exists) {
        return next(new ErrorResponse("Email ja en ús", 400));
      }
    }

    // Preparem l'objecte amb els camps a actualitzar
    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;

    // Actualitzem l'usuari i retornem el document actualitzat
    const updated = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,           // Retorna el document actualitzat
      runValidators: true, // Executa les validacions de l'esquema
    });

    // Si no trobem l'usuari, retornem error
    if (!updated) {
      return next(new ErrorResponse("Usuari no trobat", 404));
    }

    // Retornem l'usuari actualitzat
    return res.json({
      success: true,
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Canviar contrasenya
 * PUT /api/auth/change-password
 * Header: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtenim l'usuari amb la contrasenya inclosa
    const user = await User.findById(req.user._id).select("+password");
    
    if (!user) {
      return next(new ErrorResponse("Usuari no trobat", 404));
    }

    // Verifiquem que la contrasenya actual sigui correcta
    const ok = await user.comparePassword(currentPassword);
    
    if (!ok) {
      return next(new ErrorResponse("currentPassword incorrecte", 401));
    }

    // Assignem la nova contrasenya (es xifrarà automàticament pel hook pre-save)
    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: "Password actualitzat" });
  } catch (err) {
    return next(err);
  }
}

// Exportem totes les funcions del controlador
module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};