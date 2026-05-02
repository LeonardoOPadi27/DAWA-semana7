import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

class AuthService {

    async signUp(data) {
        const {
            email,
            password,
            name,
            lastName,
            phoneNumber,
            birthdate,
            url_profile,
            address,
            roles = ['user']
        } = data;

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            throw { status: 400, message: 'El email ya está en uso' };
        }

        // 🔐 password fuerte — aceptar cualquier caracter no alfanumérico como "especial"
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw {
                status: 400,
                message: 'Password débil (mín 8, 1 mayúscula, 1 número, 1 caracter especial)'
            };
        }

        const hashed = await bcrypt.hash(password, 10);

        // roles
        const roleDocs = [];
        for (const r of roles) {
            let role = await roleRepository.findByName(r);
            if (!role) role = await roleRepository.create({ name: r });
            roleDocs.push(role._id);
        }

        const user = await userRepository.create({
            email,
            password: hashed,
            name,
            lastName,
            phoneNumber,
            birthdate,
            url_profile,
            address,
            roles: roleDocs
        });

        // ✅ NO devolver password
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName
        };
    }

    async signIn({ email, password }) {

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw { status: 401, message: 'Credenciales inválidas' };
        }

        // Blindaje extra: asegurar que roles venga poblado para login y token
        if (typeof user.populate === 'function') {
            await user.populate('roles');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw { status: 401, message: 'Credenciales inválidas' };
        }

        const roles = (user.roles || []).map(r => {
            if (typeof r === 'string') return r;
            return r && r.name ? r.name : '';
        }).filter(Boolean);

        const token = jwt.sign(
            {
                sub: user._id,
                roles
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

       
        return {
            token,
            roles,
            name: user.name
        };
    }
}

export default new AuthService();