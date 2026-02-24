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
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type || "movie"
            }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// --- RUTA 3: SERVIDORES LATINOS (El Filtro) ---
app.get('/get-video', (req, res) => {
    const tmdbId = req.query.imdb || req.query.id; 
    const type = req.query.type || "movie";
    
    let sources = [];

    // Estos 3 servidores son los que más contenido en Español Latino guardan actualmente
    if (type === "tv") {
        sources = [
            { name: "Latino 1 (EmbedSU)", url: `https://embed.su/embed/tv/${tmdbId}/1/1` },
            { name: "Latino 2 (Vidsrc PRO)", url: `https://vidsrc.pro/embed/tv/${tmdbId}/1/1` },
            { name: "Global (AutoEmbed)", url: `https://autoembed.co/tv/tmdb/${tmdbId}-1-1` }
        ];
    } else {
        sources = [
            { name: "Latino 1 (EmbedSU)", url: `https://embed.su/embed/movie/${tmdbId}` },
            { name: "Latino 2 (Vidsrc PRO)", url: `https://vidsrc.pro/embed/movie/${tmdbId}` },
            { name: "Global (AutoEmbed)", url: `https://autoembed.co/movie/tmdb/${tmdbId}` }
        ];
    }

    console.log(`🎬 Enviando 3 Servidores HD para TMDB: ${tmdbId}`);
    res.json({ sources: sources });
});

app.listen(PORT, () => console.log(`Cerebro Multi-Latino Online ✅`));