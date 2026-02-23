const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

const TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// --- RUTA 1: BUSCADOR LATINO ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    try {
        const { data } = await axios.get(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(), // TRUCO: Le mandamos la llave con los dos nombres para que la TV no falle
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type || "movie"
            }));

        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// --- RUTA 2: TENDENCIAS ---
app.get('/trending', async (req, res) => {
    try {
        const { data } = await axios.get(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=es-MX`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .slice(0, 18)
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(), // TRUCO APLICADO AQUÍ TAMBIÉN
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type || "movie"
            }));

        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// --- RUTA 3: REPRODUCTOR LATINO (embed.su) ---
app.get('/get-video', (req, res) => {
    // Recibimos la llave que manda la TV
    const tmdbId = req.query.imdb || req.query.id; 
    const type = req.query.type || "movie";
    
    let videoUrl = "";
    
    // Usamos el servidor embed.su (El mejor para TMDB en Latino)
    if (type === "tv") {
        // Temporada 1, Capitulo 1
        videoUrl = `https://embed.su/embed/tv/${tmdbId}/1/1`;
    } else {
        // Película
        videoUrl = `https://embed.su/embed/movie/${tmdbId}`;
    }

    console.log(`🎬 Abriendo reproductor: ${videoUrl}`);
    res.json({ url: videoUrl });
});

app.listen(PORT, () => console.log(`Cerebro Latino V5 Online ✅`));