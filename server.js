const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

// --- RUTA 1: BUSCADOR INTELIGENTE ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    try {
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const results = response.data.map(item => ({
            title: item.show.name,
            poster: item.show.image ? item.show.image.original : "https://via.placeholder.com/300x450",
            imdb: item.show.externals.imdb, // Código IMDB real
            type: item.show.type === "Scripted" ? "tv" : "movie" // Detecta si es serie o peli
        }));
        res.json({ results: results.filter(r => r.imdb) }); // Solo enviamos las que tienen link de video real
    } catch (e) { res.json({ results: [] }); }
});

// --- RUTA 2: TENDENCIAS ---
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.tvmaze.com/shows?page=1`);
        const results = response.data.slice(0, 15).map(show => ({
            title: show.name,
            poster: show.image ? show.image.original : "",
            imdb: show.externals.imdb,
            type: "tv"
        }));
        res.json({ results: results.filter(r => r.imdb) });
    } catch (e) { res.json({ results: [] }); }
});

// --- RUTA 3: REPRODUCTOR MULTI-FORMATO ---
app.get('/get-video', (req, res) => {
    const imdb = req.query.imdb;
    const type = req.query.type || "movie"; // Por defecto película

    if (type === "tv") {
        // Si es serie, le pedimos la Temporada 1, Episodio 1 por defecto
        res.json({ url: `https://vidsrc.me/embed/tv?imdb=${imdb}&season=1&episode=1` });
    } else {
        // Si es película
        res.json({ url: `https://vidsrc.me/embed/movie?imdb=${imdb}` });
    }
});

app.listen(PORT, () => console.log(`Cerebro Maestro Online ✅`));