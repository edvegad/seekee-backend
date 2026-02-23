const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

// API KEY pública de TMDB (Usada para pruebas y desarrollo)
const TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// --- RUTA 1: BUSCADOR (100% ESPAÑOL LATINO) ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando en TMDB (Latino): ${query}`);

    try {
        // Buscamos películas y series en Español México/Latino
        const { data } = await axios.get(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        
        // Filtramos solo lo que tenga póster y sea Peli o Serie
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .map(item => ({
                id: item.id.toString(),
                title: item.title || item.name, // 'title' para peli, 'name' para serie
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type,
                // Si es película mandamos 'movie', si es serie mandamos 'tv'
            }));

        res.json({ results });
    } catch (e) {
        console.error("Error en búsqueda TMDB:", e.message);
        res.json({ results: [] });
    }
});

// --- RUTA 2: TENDENCIAS (ESTRENOS EN LATINO) ---
app.get('/trending', async (req, res) => {
    console.log(`🔥 Cargando estrenos de la semana...`);
    try {
        const { data } = await axios.get(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}&language=es-MX`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .slice(0, 18)
            .map(item => ({
                id: item.id.toString(),
                title: item.title || item.name,
                poster: `${IMG_BASE}${item.poster_path}`,
                type: item.media_type
            }));

        res.json({ results });
    } catch (e) { 
        res.json({ results: [] }); 
    }
});

// --- RUTA 3: EL REPRODUCTOR MULTI-IDIOMA ---
app.get('/get-video', (req, res) => {
    // TMDB nos da un ID numérico (ej: 12345)
    const tmdbId = req.query.imdb; 
    const type = req.query.type || "movie";
    
    // Usamos el servidor 'embed.su' o 'vidsrc.in' que son excelentes para TMDB y tienen Español
    // Este reproductor detecta tu ubicación y prioriza audios en Español / Latino
    let videoUrl = "";
    
    if (type === "tv") {
        // Serie: Temporada 1, Capitulo 1 por defecto
        videoUrl = `https://vidsrc.in/embed/tv?tmdb=${tmdbId}&season=1&episode=1`;
    } else {
        // Película
        videoUrl = `https://vidsrc.in/embed/movie?tmdb=${tmdbId}`;
    }

    res.json({ url: videoUrl });
});

app.listen(PORT, () => console.log(`Seekee Core V4 (Latino) Online ✅`));