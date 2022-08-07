import Profesor from '../models/Profesor.js';
import Alumno from '../models/Alumno.js';
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from '../helpers/emailOlvidePassword.js';

const autenticar = async (req, res) => {
    const {email, password} = req.body;

    const usuario = await Profesor.findOne({email});
    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    }
    if(!usuario.confirmado) {
        const error = new Error('La cuenta no esta confirmada');
        return res.status(403).json({msg: error.message});
    }

    if(await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            telefono: usuario.telefono,
            token: generarJWT(usuario._id)
        });
    } else {
        const error = new Error('Contraseña incorrecta');
        return res.status(403).json({msg: error.message});
    }
};

const registrar = async (req, res) => {
    const {email, nombre, apellido} = req.body;
    
    const existeUsuario = await Profesor.findOne({email});
    if(existeUsuario) {
        const error = new Error('El email ya está en uso');
        return res.status(400).json({msg: error.message});
    }

    try {
        const profesor = new Profesor(req.body);
        const profesorGuardado = await profesor.save();

        // Enviar email
        emailRegistro({
            email, 
            nombre,
            apellido,
            token: profesorGuardado.token
        });

        res.json(profesorGuardado);
    } catch (error) {
        console.log(error);
    }
}

const confirmar = async (req, res) => {
    const {token} = req.params;

    const usuarioConfirmado = await Profesor.findOne({token});
    if(!usuarioConfirmado) {
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.response});
    }

    try {
        usuarioConfirmado.token = null;
        usuarioConfirmado.confirmado = true;
        await usuarioConfirmado.save();

        res.json({msg: 'Usuario confirmado correctamente'});
    } catch (error) {
        console.log(error);
    }
};

const olvidePassword = async (req, res) => {
    const {email} = req.body;

    const existeUsuario = await Profesor.findOne({email});
    if(!existeUsuario) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeUsuario.token = generarId();
        await existeUsuario.save();

        // Enviar email
        emailOlvidePassword({
            email,
            nombre: existeUsuario.nombre,
            apellido: existeUsuario.apellido,
            token: existeUsuario.token
        });

        res.json({msg: 'Hemos enviado un email con las instrucciones'});
    } catch (error) {
        console.log(error);
    }
};

const comprobarToken = async (req, res) => {
    const {token} = req.params;

    const tokenValido = await Profesor.findOne({token});
    if(tokenValido) {
        res.json({msg: 'Usuario y token válidos'});
    } else {
        const error = new Error('Token no válido');
        return res.status(400).json({msg: error.message});
    }
};

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const profesor = await Profesor.findOne({token});
    if(!profesor) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    try {
        profesor.token = null;
        profesor.password = password

        await profesor.save();
        res.json({msg: 'Contraseña modificado correctamente'});
    } catch (error) {
        console.log(error);
    }
};

const admin = async (req, res) => {
    const {profesor} = req;
    res.json(profesor);
};

const perfil = async (req, res) => {
    const profesor = await Profesor.findById(req.params.id);
    if(!profesor) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    const {email} = req.body;
    if(profesor.email !== email) {
        const existeEmail = await profesor.findOne({email});
        if(existeEmail) {
            const error = new Error('El email ya está en uso');
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        profesor.nombre = req.body.nombre;
        profesor.apellido = req.body.apellido;
        profesor.email = req.body.email;
        profesor.telefono = req.body.telefono;

        const profesorActualizado = await profesor.save();
        res.json(profesorActualizado);
    } catch (error) {
        console.log(error);
    }
};

const actualizarPassword = async (req, res) => {
    const {_id} = req.profesor;
    const {passActual, passNuevo} = req.body;

    const profesor = await Profesor.findById(_id);
    if(!profesor) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    if(await profesor.comprobarPassword(passActual)) {
        profesor.password = passNuevo;
        await profesor.save();
        res.json({msg: 'Almacenado correctamente'});
    } else {
        const error = new Error('La contraseña actual es incorrecto');
        return res.status(400).json({msg: error.message});
    }
};

const obtenerAlumnos = async (req, res) => {
    const alumnos = await Alumno.find().where('confirmado').equals(true);
    res.json(alumnos);
};

const obtenerAlumno = async (req, res) => {
    const {id} = req.params;
    const alumno = await Alumno.findById(id);

    if(!alumno) {
        const error = new Error('Alumno no encontrado');
        return res.status(400).json({msg: error.message});
    }
    
    res.json(alumno);
};

const eliminarAlumno = async (req, res) => {
    const {id} = req.params;
    const alumno = await Alumno.findById(id);

    if(!alumno) {
        return res.status(404).json({msg: 'No enocntrado'});
    }
    
    try {
        await alumno.deleteOne();
        res.json({msg: 'Alumno eliminado'});
    } catch (error) {
        console.log(error);
    }
};

const comprobarId = async (req, res) => {
    const {id} = req.params;

    const idValido = await Alumno.findById({id});
    if(!idValido) {
        const error = new Error('Token no válido');
        return res.status(400).json({msg: error.message});
    }
};

const guardarEjercicio = async (req, res) => {
    const alumno = await Alumno.findById(req.params.id)

    if(alumno.rutina === null) {
        alumno.rutina = []
    }
    alumno.rutina.push(req.body)
    await alumno.save();
};

const eliminarEjercicio = async (req, res) => {
    const {_id} = req.body;

    const alumno = await Alumno.findById(_id);

    const {ejercicioId} = req.params;
    const {rutina} = alumno;

    alumno.rutina = rutina.filter(ejercicio => ejercicio.id !== ejercicioId);

    if(alumno.rutina.length === 0) {
        alumno.rutina = null;
    }
    
    await alumno.save();
};

export {
    autenticar,
    registrar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    admin,
    perfil,
    actualizarPassword,
    obtenerAlumnos,
    obtenerAlumno,
    eliminarAlumno,
    comprobarId,
    guardarEjercicio,
    eliminarEjercicio
}