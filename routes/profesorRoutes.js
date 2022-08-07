import express from 'express';

import {
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
} from '../controllers/profesorController.js';

import checkAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicas
router.post('/login', autenticar);
router.post('/registrar', registrar);
router.get('/confirmar/:token', confirmar);
router.post('/olvide-password', olvidePassword);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

// Privadas
router.get('/admin', checkAuth, admin); // Primera pagina al iniciar sesion
router.put('/perfil/:id', checkAuth, perfil); // Actualizar el perfil
router.put('/cambiar-password', checkAuth, actualizarPassword); // Actualizar la password

router.get('/obtener-alumnos', checkAuth, obtenerAlumnos)
router.get('/obtener-alumno/:id', obtenerAlumno)
router.delete('/eliminar-alumno/:id', checkAuth, eliminarAlumno)
router.route('/guardar-ejercicio/:id').get(comprobarId).post(guardarEjercicio)
router.put('/eliminar-ejercicio/:ejercicioId', checkAuth, eliminarEjercicio)

export default router;