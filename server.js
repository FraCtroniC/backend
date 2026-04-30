import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import './src/config/bd.js'; // Asegúrate de que el archivo se llame bd.js o db.js

// Inicializamos la aplicación
const app = express();

// Middlewares
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ mensaje: '¡El backend de uptnt manuela saenz está vivo y funcionando!' });
});

// Definimos el puerto
const PORT = 3000;

// Encendemos el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});