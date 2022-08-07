import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import generarId from "../helpers/generarId.js";

const alumnoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    rutina: {
        type: Array,
        defualt: null
    },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profesores'
    },
    token: {
        type: String,
        default: generarId()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hashear el password
alumnoSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Comprobar password
alumnoSchema.methods.comprobarPassword = async function(passForm) {
    return await bcrypt.compare(passForm, this.password);
};

const Alumno = mongoose.model('alumnos', alumnoSchema);
export default Alumno;