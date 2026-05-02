import authService from '../services/AuthService.js';

class AuthController {

    async signUp(req, res, next) {
    try {
        const payload = req.body;

        const {
            email,
            password,
            name,
            lastName,
            phoneNumber,
            birthdate
        } = payload;

        if (!email || !password || !name || !lastName || !phoneNumber || !birthdate) {
            return res.status(400).json({
                message: 'Todos los campos obligatorios deben ser enviados'
            });
        }

        function passwordScore(pw) {
            if (!pw) return 0;
            let score = 0;
            if (pw.length >= 8) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^A-Za-z0-9]/.test(pw)) score++;
            return score;
        }

        if (passwordScore(password) < 2) {
            return res.status(400).json({ message: 'Contraseña demasiado débil. Usa al menos 8 caracteres y mezcla mayúsculas, números o símbolos.' });
        }

        const user = await authService.signUp(payload);
        return res.status(201).json(user);

    } catch (err) {
        next(err);
    }
}

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) 
                return res.status(400).json({ message: 'El email y password son requeridos' });
            
            const token = await authService.signIn({ email, password });
            return res.status(200).json(token);
        } catch (err) {
            next(err);
        }
    }
}

export default new AuthController();
