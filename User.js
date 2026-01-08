/**
 * Model d'Usuari (User)
 * Defineix l'esquema de la col·lecció d'usuaris a MongoDB
 * Inclou funcionalitats de xifrat de contrasenyes amb bcrypt
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Definició de l'esquema d'usuari
const userSchema = new mongoose.Schema(
  {
    // Nom de l'usuari (opcional)
    name: { 
      type: String, 
      trim: true,      // Elimina espais al principi i final
      default: ""      // Valor per defecte si no s'especifica
    },
    
    // Email de l'usuari (obligatori i únic)
    email: {
      type: String,
      required: [true, "Email requerido"],  // Missatge d'error si falta
      unique: true,                          // No permet emails duplicats
      lowercase: true,                       // Converteix a minúscules
      trim: true,                            // Elimina espais
    },
    
    // Contrasenya de l'usuari (obligatòria, mínim 6 caràcters)
    password: {
      type: String,
      required: [true, "Password requerido"],
      minlength: [6, "Password mínimo 6 caracteres"],
      select: false,  // No s'inclou per defecte a les consultes (seguretat)
    },
    
    // Rol de l'usuari (user o admin)
    role: {
      type: String,
      enum: ["user", "admin"],  // Només permet aquests valors
      default: "user",          // Per defecte és usuari normal
    },
  },
  { 
    timestamps: true  // Afegeix automàticament createdAt i updatedAt
  }
);

/**
 * Middleware pre-save: Xifra la contrasenya abans de guardar
 * S'executa automàticament abans de cada operació save()
 * IMPORTANT: Utilitzem async sense next per evitar errors amb Mongoose 5+
 */
userSchema.pre("save", async function () {
  // Si la contrasenya no s'ha modificat, no fem res
  if (!this.isModified("password")) return;
  
  // Nombre de rondes de sal per bcrypt (10 és un bon balanç seguretat/rendiment)
  const saltRounds = 10;
  
  // Xifrem la contrasenya amb bcrypt
  this.password = await bcrypt.hash(this.password, saltRounds);
});

/**
 * Mètode d'instància: Compara una contrasenya en text pla amb la xifrada
 * @param {string} plainPassword - Contrasenya en text pla a comparar
 * @returns {Promise<boolean>} - True si coincideixen, false si no
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

/**
 * Transformació toJSON: Elimina la contrasenya quan es serialitza l'usuari
 * Això evita que la contrasenya s'inclogui accidentalment a les respostes
 */
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;  // Elimina el camp password de l'objecte retornat
    return ret;
  },
});

// Exportem el model User basat en l'esquema definit
module.exports = mongoose.model("User", userSchema);