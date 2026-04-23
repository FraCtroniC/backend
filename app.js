// Importamos express
import express from 'express'

// 1. Creamos una instancia de express de nuestra aplicación
const app = express()


app.get("/", (req, res) => {
    res.send("<h1>Hola mundo aaa</h1>")
})


const PORT = 3001
// Ponemos a escuchar el servidor en el puerto 3001
app.listen(3001, () => {
    console.log('Servidor escuchando en el puerto 3001 en http://localhost:3001')
})