const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- RUTA 1: BUSCADOR DE PELÍCULAS ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando Película: ${query}`);

    try {
        // Usamos YTS API (Es libre, rápida y no bloquea Render)
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}`);
        
        const movies = data.data.movies || [];
        const results = movies.map(movie => ({
            id: movie.id.toString(),
            title: movie.title_long,
            poster: movie.large_cover_image || movie.medium_cover_image,
            // GUARDAMOS EL CÓDIGO IMDb (Ej: tt1234567). Es la llave maestra para el video.
            page_url: movie.imdb_code 
        }));

        res.json({ results });
    } catch (error) {
        console.error("Error buscando:", error.message);
        res.json({ results: [] });
    }
});

// --- RUTA 2: TENDENCIAS (Lo que sale al abrir la app) ---
app.get('/trending', async (req, res) => {
    console.log(`🏠 Cargando estrenos...`);
    try {
        // Pedimos las películas más populares
        const { data } = await axios.get(`https://yts.mx/api/v2/list_movies.json?sort_by=download_count&limit=15`);
        
        const movies = data.data.movies || [];
        const results = movies.map(movie => ({
            id: movie.id.toString(),
            title: movie.title,
            poster: movie.large_cover_image || movie.medium_cover_image,
            page_url: movie.imdb_code
        }));

        res.json({ results });
    } catch (error) {
        res.json({ results: [] });
    }
});

// --- RUTA 3: EL GENERADOR DE VIDEO MAGICO ---
app.get('/get-video', (req, res) => {
    // La TV nos manda el código IMDb (ej: tt0111161)
    const imdbId = req.query.url; 
    console.log(`🍿 Generando reproductor para: ${imdbId}`);

    if (imdbId) {
        // Usamos un servicio Auto-Embed público. 
        // Este link genera automáticamente el reproductor de la película!
        const videoUrl = `https://vidsrc.cc/v2/embed/movie/${imdbId}`;
        res.json({ url: videoUrl });
    } else {
        res.status(500).json({ error: "No hay código IMDb" });
    }
});

app.get('/', (req, res) => res.send('Motor de Películas V2 Activo ✅'));

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));