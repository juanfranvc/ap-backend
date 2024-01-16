import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarjwt.js";
import generarId from "../helpers/generarid.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvideContraseña from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    const { nombre, email } = req.body;

    // Prevenir correo duplicado
    const existeUsuario = await Veterinario.findOne({ email });
    if (existeUsuario) {
        console.log(existeUsuario);
        const error = new Error('Correo ya utilizado');
        return res.status(400).json({ msg: error.message });
    }

    try {
        // Guardar nuevo VET
        const veterinario = new Veterinario(req.body); // Instancia
        const veterinarioGuardado = await veterinario.save(); //guardado en la base de datos

        // enviar email para confirmacion de cuenta
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        res.json(veterinarioGuardado);
    } catch (error) {
        console.log(error);
    }


};

const perfil = (req, res) => {

    const { veterinario } = req;

    res.json(veterinario);
};

const confirmar = async (req, res) => {

    const { token } = req.params;

    const usuarioConfirmar = await Veterinario.findOne({ token });

    if (!usuarioConfirmar) {
        const error = new Error('TOKEN Inválido');
        return res.status(404).json({ msg: error.message });
    }

    try {

        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save()

        res.json({ msg: "Email Verificado" });
    } catch (error) {
        console.log(error);
    }

};

const autenticar = async (req, res) => {

    const { email, password } = req.body;

    // Comprobar existencia del usuario
    const usuario = await Veterinario.findOne({ email });

    if (!usuario) {
        const error = new Error('El email no corresponde a ningun usuario');
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar email verificado
    if (!usuario.confirmado) {
        const error = new Error('Email no verificado');
        return res.status(403).json({ msg: error.message });
    }

    // Comparar contraseña
    if (await usuario.comprobarPassword(password)) {
        // Autenticar
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)
        });
    } else {
        const error = new Error('Contraseña Incorrecta');
        return res.status(403).json({ msg: error.message });
    }

};

const resetPassword = async (req, res) => {

    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({ email });

    if (!existeVeterinario) { // Usuario no existe
        const error = new Error('El email no corresponde a ningun usuario');
        return res.status(400).json({ msg: error.message });
    }

    // Usuario existente
    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();
        // Enviar email
        emailOlvideContraseña({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })
        res.json({ msg: 'Hemos enviado un email con las instrucciones' });
    } catch (error) {
        console.log(error)
    }

}

const comprobarToken = async (req, res) => {

    const { token } = req.params

    const tokenValido = await Veterinario.findOne({ token });

    if (tokenValido) {
        res.json({ msg: "Token Válido" });
    } else {
        const error = new Error('Token Inálido');
        return res.status(400).json({ msg: error.message })
    }

}

const nuevaPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({ token });

    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.json(400).json({ msg: error.message });
    }

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({ msg: "Password modificado correctamente" });
    } catch (error) {
        console.log(error)
    }

}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({ msg: error.message })
    }
    // evitar email repetido
    const { email } = req.body
    if (veterinario.email !== req.body.email) {
        const emailUsado = await Veterinario.findOne({ email })
        if (emailUsado) {
            const error = new Error('El Email seleccionado ya se encuentra registrado')
            return res.status(400).json({ msg: error.message })
        }
    }
    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.telefono = req.body.telefono;
        veterinario.web = req.body.web;

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado)

    } catch (error) {
        console.log(error)
    }
}

const actualizarPassword = async (req, res) => {
    // Leer datos
    const { id } = req.veterinario
    const { pwd_actual, pwd_nuevo } = req.body

    // Comprobar veterinario
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
    }
    // Comprobar pwd
    if (await veterinario.comprobarPassword(pwd_actual)) {
        // cambiar pwd
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({ msg: 'Contraseña actualizada correctamente' })

    } else {
        const error = new Error('La contraseña actual ingresada es incorrecta');
        return res.status(400).json({ msg: error.message });
    }

}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    resetPassword,
    comprobarToken,
    nuevaPassword,
    actualizarPerfil,
    actualizarPassword
}