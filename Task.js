/**
 * Model de Tasca (Task)
 * Defineix l'esquema de la col·lecció de tasques a MongoDB
 * Cada tasca està associada a un usuari mitjançant una referència
 */

const mongoose = require("mongoose");

// Definició de l'esquema de tasca
const taskSchema = new mongoose.Schema(
  {
    // Referència a l'usuari propietari de la tasca
    user: {
      type: mongoose.Schema.Types.ObjectId,  // Tipus ObjectId de MongoDB
      ref: "User",                            // Referència al model User
      required: [true, "user requerido"],     // Camp obligatori
      index: true,                            // Índex per millorar rendiment de cerques
    },
    
    // Títol de la tasca (obligatori)
    title: { 
      type: String, 
      required: [true, "title requerido"], 
      trim: true  // Elimina espais al principi i final
    },
    
    // Descripció de la tasca (opcional)
    description: { 
      type: String, 
      trim: true, 
      default: ""  // Valor per defecte buit
    },
    
    // Cost estimat de la tasca
    cost: { 
      type: Number, 
      default: 0  // Per defecte 0
    },
    
    // Hores estimades per completar la tasca
    hours_estimated: { 
      type: Number, 
      default: 0 
    },
    
    // Estat de la tasca (completada o no)
    completed: { 
      type: Boolean, 
      default: false  // Per defecte no completada
    },
    
    // Imatge associada a la tasca (URL o base64)
    image: { 
      type: String, 
      default: ""  // Per defecte sense imatge
    },
  },
  { 
    timestamps: true  // Afegeix automàticament createdAt i updatedAt
  }
);

// Exportem el model Task basat en l'esquema definit
module.exports = mongoose.model("Task", taskSchema);