import bcrypt from 'bcrypt';
import userRepository from '../repositories/UserRepository.js';
import roleRepository from '../repositories/RoleRepository.js';

export default async function seedUsers() {

    const existing = await userRepository.findByEmail("admin@test.com");
    if (existing) return;

    const adminRole = await roleRepository.findByName("admin");

    const password = await bcrypt.hash("Admin123*", 10);

    await userRepository.create({
        email: "admin@test.com",
        password,
        name: "Admin",
        lastName: "Principal",
        phoneNumber: "999999999",
        birthdate: new Date("2000-01-01"),
        roles: [adminRole._id]
    });

    console.log("Admin creado");
}