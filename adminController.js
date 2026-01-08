/**
 * Controlador d'Administració (adminController)
 * Gestiona les operacions exclusives per administradors:
 * - Obtenir tots els usuaris
 * - Obtenir totes les tasques
 * - Eliminar usuaris
 * - Canviar rol d'usuaris
 * 
 * Totes les funcions requereixen rol d'administrador
 */

const User = require("../models/User");
const Task = require("../models/Task");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Obtenir tots els usuaris del sistema
 * GET /api/admin/users
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function getAllUsers(req, res, next) {
  try {
    // Obtenim tots els usuaris ordenats per data de creació (més recents primer)
    const users = await User.find({}).sort({ createdAt: -1 });
    
    // Retornem la llista d'usuaris (sense contrasenyes)
    res.json({
      success: true,
      count: users.length,
      users: users.map((u) => ({ 
        _id: u._id, 
        name: u.name, 
        email: u.email, 
        role: u.role, 
        createdAt: u.createdAt 
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtenir totes les tasques del sistema
 * GET /api/admin/tasks
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function getAllTasks(req, res, next) {
  try {
    // Obtenim totes les tasques amb informació de l'usuari propietari
    // populate() substitueix l'ObjectId per les dades de l'usuari
    const tasks = await Task.find({})
      .populate("user", "name email role")  // Només incloem name, email i role de l'usuari
      .sort({ createdAt: -1 });             // Ordenem per data de creació
    
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
}

/**
 * Eliminar un usuari i totes les seves tasques
 * DELETE /api/admin/users/:id
 * 
 * @param {Object} req - Objecte request d'Express (req.params.id conté l'ID)
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function deleteUser(req, res, next) {
  try {
    const targetId = req.params.id;

    // Comprovem que l'admin no s'intenti eliminar a si mateix
    if (String(targetId) === String(req.user._id)) {
      return next(new ErrorResponse("No puedes eliminarte a ti mismo", 400));
    }

    // Busquem l'usuari a eliminar
    const user = await User.findById(targetId);
    
    if (!user) {
      return next(new ErrorResponse("Usuario no encontrado", 404));
    }

    // Eliminem totes les tasques de l'usuari
    await Task.deleteMany({ user: user._id });
    
    // Eliminem l'usuari
    await user.deleteOne();

    res.json({ success: true, message: "Usuario y sus tareas eliminados" });
  } catch (err) {
    next(err);
  }
}

/**
 * Canviar el rol d'un usuari
 * PUT /api/admin/users/:id/role
 * Body: { role: "user" | "admin" }
 * 
 * @param {Object} req - Objecte request d'Express
 * @param {Object} res - Objecte response d'Express
 * @param {Function} next - Funció per passar al següent middleware
 */
async function changeUserRole(req, res, next) {
  try {
    const targetId = req.params.id;

    // Comprovem que l'admin no s'intenti canviar el rol a si mateix
    if (String(targetId) === String(req.user._id)) {
      return next(new ErrorResponse("No puedes cambiar tu propio rol", 400));
    }

    const { role } = req.body;
    
    // Validem que el rol sigui vàlid
    if (!["user", "admin"].includes(role)) {
      return next(new ErrorResponse("role debe ser 'user' o 'admin'", 400));
    }

    // Actualitzem el rol de l'usuari
    const user = await User.findByIdAndUpdate(
      targetId, 
      { role }, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return next(new ErrorResponse("Usuario no encontrado", 404));
    }

    res.json({ 
      success: true, 
      user: { 
        _id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    next(err);
  }
}

// Exportem totes les funcions del controlador
module.exports = { getAllUsers, getAllTasks, deleteUser, changeUserRole };