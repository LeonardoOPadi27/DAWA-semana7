import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import seedRoles from './utils/seedRoles.js';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets removed per user request — no public folder expected.
// If you later add static assets, re-enable this line.
// app.use(express.static(path.join(__dirname, 'public')));

// Habilitar CORS para todos
app.use(cors());

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/signIn', (req, res) => res.render('auth/login'));
// Provide several aliases for the register page in case users try different paths
app.get('/signUp', (req, res) => res.render('auth/register'));
app.get('/signup', (req, res) => res.render('auth/register'));
app.get('/register', (req, res) => res.render('auth/register'));

app.get('/dashboard/user', (req, res) => res.render('layouts/main', { title: 'Panel de usuario', bodyPartial: '../dashboard/user' }));
app.get('/dashboard/admin', (req, res) => res.render('layouts/main', { title: 'Panel admin', bodyPartial: '../dashboard/admin' }));
app.get('/profile', (req, res) => res.render('layouts/main', { title: 'Mi perfil', bodyPartial: '../profile' }));
app.get('/403', (req, res) => res.render('layouts/main', { title: '403', bodyPartial: '../403' }));

app.use((req, res) => res.status(404).render('404'));

// Validar estado del servidor
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

mongoose.connect(process.env.MONGODB_URI, { autoIndex: true })
    .then(async () => {
        console.log('Mongo connected');
        await seedRoles();
    })
    .catch(err => {
        console.error('Error al conectar con Mongo:', err);
    });
