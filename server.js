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

// --- RUTA 3: EXTRACTOR DE ENLACE DIRECTO (.m3u8 / .mp4) ---
app.get('/get-video', (req, res) => {
    const tmdbId = req.query.imdb || req.query.id; 
    console.log(`🎬 Extrayendo link directo para: ${tmdbId}`);
    
    // Aquí es donde un Scraper Profesional (Puppeteer) extraería el .mp4 de Cuevana.
    // Por ahora, mandamos un link de transmisión HLS (.m3u8) real para probar el reproductor de la TV.
    let sources = [
        { 
            name: "Reproductor Nativo (TV)", 
            // Este es un video de prueba en formato HLS de Apple, perfecto para webOS
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" 
        }
    ];

    res.json({ sources: sources });
});

app.get('/', (req, res) => res.send('Cerebro Extractor V11 Online ✅'));
app.listen(PORT, () => console.log(`Cerebro Online en puerto ${PORT} ✅`));