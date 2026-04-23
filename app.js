// Importamos express
import express from 'express'

// 1. Creamos una instancia de express de nuestra aplicación
const app = express()

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json())


app.get("/", (req, res) => {
    res.send("<h1>Hola mundo aaas</h1>")
})

app.get("/api", (req, res) => {
    res.json({ mensaje: "Hola mundo desde la API..." })
})



const PORT = 3001
// Ponemos a escuchar el servidor en el puerto 3001
app.listen(3001, () => {
    console.log('Servidor escuchando en el puerto 3001 en http://localhost:3001')
})