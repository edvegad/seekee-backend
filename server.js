const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// RUTA 1: BUSCADOR
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    try {
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}`);
        const movies = data.data.movies || [];
        const results = movies.map(movie => ({
            title: movie.title,
            poster: movie.medium_cover_image,
            imdb: movie.imdb_code // Usamos el código IMDB para el video
        }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// RUTA 2: TENDENCIAS
app.get('/trending', async (req, res) => {
    try {
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?sort_by=trending_score&limit=15`);
        const movies = data.data.movies || [];
        const results = movies.map(movie => ({
            title: movie.title,
            poster: movie.medium_cover_image,
            imdb: movie.imdb_code
        }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// RUTA 3: OBTENER VIDEO
app.get('/get-video', (req, res) => {
    const imdb = req.query.imdb;
    if (imdb) {
        // Este servidor de video es genial porque detecta el idioma
        res.json({ url: `https://vidsrc.to/embed/movie/${imdb}` });
    } else {
        res.json({ url: "" });
    }
});

app.listen(PORT, () => console.log("Cerebro Online ✅"));