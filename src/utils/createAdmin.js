import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Role from '../models/Role.js';

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/express-mongo-auth');
    console.log('✓ Conectado a MongoDB');

    // Datos del admin
    const adminData = {
      name: 'Leonardo',
      lastName: 'Olortegui Padilla',
      email: 'leonardoolorteguipadilla@gmail.com',
      password: 'Monoloco123+',
      phoneNumber: '999999999',
      birthdate: new Date('1990-01-01'),
      address: 'Admin Office'
    };

    // Si ya existía un usuario con este email, lo reemplazamos
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      await User.deleteOne({ _id: existingUser._id });
      console.log('→ Usuario anterior eliminado');
    }

    // Obtener o crear el rol admin
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('→ Creando rol admin...');
      adminRole = await Role.create({ name: 'admin' });
    }

    // Asegurar que exista también el rol user
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      console.log('→ Creando rol user...');
      userRole = await Role.create({ name: 'user' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Crear el usuario admin
    const admin = new User({
      ...adminData,
      password: hashedPassword,
      roles: [adminRole._id, userRole._id]
    });

    await admin.save();
    console.log('✓ Admin creado exitosamente');
    console.log('Email:', adminData.email);
    console.log('Contraseña:', adminData.password);

    await mongoose.disconnect();
    console.log('✓ Desconectado de MongoDB');
  } catch (err) {
    console.error('✗ Error:', err.message);
  }
};

createAdmin();
