import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import seedRoles from './utils/seedRoles.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ========== CONFIGURACIÓN DOTENV ==========
// Forzar carga de .env desde la raíz del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Verificar variables de entorno (debug)
console.log('📦 Verificando .env:');
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Cargada' : '❌ No cargada');
console.log('   PORT:', process.env.PORT || '3000 (default)');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Cargado' : '❌ No cargado');

// ========== INICIALIZAR EXPRESS ==========
const app = express();

// ========== CONFIGURACIÓN DE VISTAS ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets (descomentar si tienes carpeta public)
// app.use(express.static(path.join(__dirname, 'public')));

// ========== MIDDLEWARES ==========
app.use(cors());
app.use(express.json());

// ========== RUTAS API ==========
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ========== RUTAS DE VISTAS ==========
app.get('/signIn', (req, res) => res.render('auth/login'));
app.get('/signUp', (req, res) => res.render('auth/register'));
app.get('/signup', (req, res) => res.render('auth/register'));
app.get('/register', (req, res) => res.render('auth/register'));

app.get('/dashboard/user', (req, res) => res.render('layouts/main', { 
    title: 'Panel de usuario', 
    bodyPartial: '../dashboard/user' 
}));

app.get('/dashboard/admin', (req, res) => res.render('layouts/main', { 
    title: 'Panel admin', 
    bodyPartial: '../dashboard/admin' 
}));

app.get('/profile', (req, res) => res.render('layouts/main', { 
    title: 'Mi perfil', 
    bodyPartial: '../profile' 
}));

app.get('/403', (req, res) => res.render('layouts/main', { 
    title: '403', 
    bodyPartial: '../403' 
}));

// Ruta 404 para vistas
app.use((req, res) => res.status(404).render('404'));

// ========== RUTAS DE UTILIDAD ==========
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// ========== MANEJADOR GLOBAL DE ERRORES ==========
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({ 
        message: err.message || 'Error interno del servidor' 
    });
});

// ========== CONEXIÓN A MONGODB ==========
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Validar que MONGO_URI existe
if (!MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI no está definida en el archivo .env');
    console.error('   Asegúrate de que el archivo .env existe en la raíz y contiene MONGO_URI=...');
    process.exit(1);
}

// Conectar a MongoDB y luego iniciar el servidor
mongoose.connect(MONGO_URI, { autoIndex: true })
    .then(async () => {
        console.log('✅ Conectado a MongoDB Atlas');
        console.log(`   Base de datos: ${mongoose.connection.name || 'desconocida'}`);
        
        // Sembrar roles si es necesario
        await seedRoles();
        console.log('✅ Roles inicializados');
        
        // Iniciar servidor SOLO después de conectar DB
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📡 API disponible en http://localhost:${PORT}/api`);
            console.log(`🔐 Auth endpoints:`);
            console.log(`   POST   /api/auth/register - Registro`);
            console.log(`   POST   /api/auth/login    - Login`);
            console.log(`   GET    /api/auth/profile  - Perfil (requiere token)`);
        });
    })
    .catch(err => {
        console.error('❌ Error al conectar con MongoDB:', err.message);
        console.error('   Verifica tu cadena de conexión y credenciales');
        process.exit(1);
    });