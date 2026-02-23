const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS súper abierta para evitar bloqueos en la TV
app.use(cors({ origin: '*' }));

// RUTA 1: BUSCADOR (Usando un motor alternativo más estable)
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando: ${query}`);
    try {
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const results = response.data.map(item => ({
            title: item.show.name,
            poster: item.show.image ? item.show.image.original : "https://via.placeholder.com/300x450?text=No+Image",
            // Intentamos sacar el código IMDB si existe, si no, usamos el nombre
            id: item.show.externals.imdb || item.show.name 
        }));
        res.json({ results });
    } catch (e) {
        console.error("Error en búsqueda:", e.message);
        res.json({ results: [] });
    }
});

// RUTA 2: TENDENCIAS
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.tvmaze.com/shows?page=1`);
        const results = response.data.slice(0, 15).map(show => ({
            title: show.name,
            poster: show.image ? show.image.original : "",
            id: show.externals.imdb || show.name
        }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// RUTA 3: OBTENER VIDEO
app.get('/get-video', (req, res) => {
    const id = req.query.imdb;
    console.log(`🍿 Generando video para ID: ${id}`);
    
    // Si el ID empieza con "tt" es un código IMDB real
    if (id && id.startsWith('tt')) {
        res.json({ url: `https://vidsrc.to/embed/movie/${id}` });
    } else {
        // Si no tiene IMDB, buscamos por título en un buscador alternativo
        res.json({ url: `https://vidsrc.to/embed/movie?imdb=${id}` });
    }
});

app.listen(PORT, () => console.log(`Cerebro Online en puerto ${PORT} ✅`));