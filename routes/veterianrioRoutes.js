import express from "express";
import { perfil, registrar, confirmar, autenticar, resetPassword, comprobarToken, nuevaPassword, actualizarPerfil, actualizarPassword } from "../controllers/veterinarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Area publica
router.post('/', registrar);
router.get('/confirmar/:token', confirmar);
router.post('/login', autenticar);
router.post('/reset-password', resetPassword);
//router.get('reset-password/:token', comprobarToken);
//router.post('reset-password/:token', nuevaPassword);
router.route('/reset-password/:token').get(comprobarToken).post(nuevaPassword);

// Area privada - necesita estar logeado
router.get('/perfil', checkAuth, perfil);
router.put('/perfil/:id', checkAuth, actualizarPerfil);
router.put('/actualizar-password', checkAuth, actualizarPassword);

export default router;