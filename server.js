const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS abierto para que tu Smart TV LG se conecte sin bloqueos
app.use(cors({ origin: '*' }));

// Llave pública de TheMovieDB (La base de datos de películas más grande del mundo)
const TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// ==========================================
// RUTA 1: BUSCADOR (100% ESPAÑOL LATINO)
// ==========================================
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando en TMDB (Latino): ${query}`);

    try {
        // Pedimos a TMDB los resultados en Español México
        const { data } = await axios.get(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        
        // Filtramos: Solo películas/series que tengan póster
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(), // La llave maestra numérica de TMDB
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

// ==========================================
// RUTA 2: TENDENCIAS (ESTRENOS LATINOS)
// ==========================================
app.get('/trending', async (req, res) => {
    console.log(`🔥 Cargando estrenos de la semana...`);
    try {
        const { data } = await axios.get(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=es-MX`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .slice(0, 18) // Las 18 más populares
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

// ==========================================
// RUTA 3: REPRODUCTOR MULTI-AUDIO (VidLink PRO)
// ==========================================
app.get('/get-video', (req, res) => {
    // Recibimos la llave de la TV
    const tmdbId = req.query.imdb || req.query.id; 
    const type = req.query.type || "movie";
    
    let videoUrl = "";
    
    // VidLink PRO: Un solo reproductor inteligente.
    // Si la película tiene audio dual, mostrará un icono de "Auriculares" o "Engranaje" para cambiar a Español.
    if (type === "tv") {
        // Serie: Temporada 1, Capitulo 1 por defecto (Puedes mejorar esto luego añadiendo botones de capítulos en tu app)
        videoUrl = `https://vidlink.pro/tv/${tmdbId}/1/1`;
    } else {
        // Película
        videoUrl = `https://vidlink.pro/movie/${tmdbId}`;
    }

    console.log(`🎬 Abriendo Reproductor Multi-Audio: ${videoUrl}`);
    res.json({ url: videoUrl });
});

// ==========================================
// RUTA DE ESTADO (Para revisar que Render funciona)
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>Cerebro Seekee V8 Online ✅</h1>
            <p>Reproductor VidLink Multi-Audio Activado.</p>
            <p style="color: green;">Tu TV LG ya puede conectarse.</p>
        </div>
    `);
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Cerebro Online en puerto ${PORT} ✅`));