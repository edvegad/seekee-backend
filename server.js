const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

const TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// --- RUTA 1: BUSCADOR ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    try {
        const { data } = await axios.get(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(),
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
                imdb: item.id.toString(),
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type || "movie"
            }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// --- RUTA 3: SISTEMA MULTI-FUENTE (La solución al idioma) ---
app.get('/get-video', async (req, res) => {
    const tmdbId = req.query.imdb; 
    const type = req.query.type || "movie";
    
    // Necesitamos el código IMDB real (ej: tt12345) para el servidor Latino
    // Hacemos una pequeña consulta extra a TMDB para obtenerlo
    let imdbCode = tmdbId;
    try {
        const external = await axios.get(`${TMDB_BASE}/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
        if(external.data.imdb_id) imdbCode = external.data.imdb_id;
    } catch(e) { console.log("No se pudo obtener IMDB real"); }

    // Generamos 3 opciones de servidores
    let sources = [];

    if (type === "tv") {
        // SERIES
        sources = [
            { name: "Latino 1 (Warez)", url: `https://embed.warezcdn.link/serie/${imdbCode}/1/1` }, // Suele ser Latino
            { name: "Latino 2 (Smashy)", url: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=1&episode=1` },
            { name: "Global (Vidsrc)", url: `https://vidsrc.to/embed/tv/${imdbCode}/1/1` }
        ];
    } else {
        // PELICULAS
        sources = [
            { name: "Latino 1 (Warez)", url: `https://embed.warezcdn.link/filme/${imdbCode}` }, // La joya para latinos
            { name: "Latino 2 (Smashy)", url: `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}` },
            { name: "Global (Vidsrc)", url: `https://vidsrc.to/embed/movie/${imdbCode}` }
        ];
    }

    console.log(`🎬 Enviando ${sources.length} opciones para: ${imdbCode}`);
    res.json({ sources: sources });
});

app.listen(PORT, () => console.log(`Cerebro Multi-Fuente Online ✅`));