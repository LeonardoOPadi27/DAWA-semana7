import userRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcrypt';

class UserService {

    async getAll() {
        const users = await userRepository.getAll();

        return users.map(user => ({
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            url_profile: user.url_profile,
            address: user.address,
            createdAt: user.createdAt,
            roles: (user.roles || []).map(role => {
                if (typeof role === 'string') return role;
                return role && role.name ? role.name : '';
            }).filter(Boolean)
        }));
    }

    async update(id, data) {

        // ❗ proteger password
        if (data.password) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[#@$%&*]).{8,}$/;

            if (!passwordRegex.test(data.password)) {
                throw {
                    status: 400,
                    message: 'Password inválido'
                };
            }

            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await userRepository.update(id, data);

        if (!user) {
            throw { status: 404, message: 'Usuario no encontrado' };
        }

        // ✅ limpiar respuesta
        return {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            url_profile: user.url_profile,
            address: user.address,
            roles: user.roles
        };
    }

    async getById(id) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw { status: 404, message: 'Usuario no encontrado' };
        }

        return {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            url_profile: user.url_profile,
            address: user.address,
            roles: (user.roles || []).map(role => {
                if (typeof role === 'string') return role;
                return role && role.name ? role.name : '';
            }).filter(Boolean)
        };
    }
}

export default new UserService();