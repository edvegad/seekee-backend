const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS abierto para que tu TV y tu PC local puedan acceder sin problemas
app.use(cors({ origin: '*' }));

// API KEY pública de TMDB (Usada para obtener pósters e IDs)
const TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// --- RUTA 1: BUSCADOR LATINO ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando en TMDB (Latino): ${query}`);

    try {
        const { data } = await axios.get(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(), // Mandamos la llave con ambos nombres por seguridad
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type || "movie"
            }));

        res.json({ results });
    } catch (e) { 
        console.error("Error en búsqueda:", e.message);
        res.json({ results: [] }); 
    }
});

// --- RUTA 2: TENDENCIAS (ESTRENOS) ---
app.get('/trending', async (req, res) => {
    console.log(`🔥 Cargando estrenos de la semana...`);
    try {
        const { data } = await axios.get(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=es-MX`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .slice(0, 18) // Mostramos las primeras 18
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(),
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type || "movie"
            }));

        res.json({ results });
    } catch (e) { 
        console.error("Error en tendencias:", e.message);
        res.json({ results: [] }); 
    }
});

// --- RUTA 3: REPRODUCTOR UNIVERSAL (vidsrc.xyz) ---
// Este reproductor es más amigable con iframes y no suele dar error de nube
app.get('/get-video', (req, res) => {
    // Recibimos la llave que manda la TV
    const tmdbId = req.query.imdb || req.query.id; 
    const type = req.query.type || "movie";
    
    let videoUrl = "";
    
    // Usamos el servidor vidsrc.xyz
    if (type === "tv") {
        // Si es serie: Temporada 1, Capitulo 1 por defecto
        videoUrl = `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=1&episode=1`;
    } else {
        // Si es película
        videoUrl = `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
    }

    console.log(`🎬 Abriendo reproductor: ${videoUrl}`);
    res.json({ url: videoUrl });
});

// Ruta de comprobación de estado
app.get('/', (req, res) => {
    res.send('<h1>Cerebro Seekee V6 Online ✅</h1><p>Reproductor vidsrc.xyz activado.</p>');
});

app.listen(PORT, () => console.log(`Cerebro Online en puerto ${PORT} ✅`));