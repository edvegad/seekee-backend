const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS abierto para que tu Smart TV LG se conecte sin bloqueos
app.use(cors({ origin: '*' }));

// Llave pública de TheMovieDB (Posters y títulos en Español)
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
        const { data } = await axios.get(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=es-MX&query=${encodeURIComponent(query)}`);
        
        const results = data.results
            .filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'))
            .map(item => ({
                id: item.id.toString(),
                imdb: item.id.toString(), // Llave numérica de TMDB
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
            .slice(0, 18)
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
// RUTA 3: AGREGADOR DE SERVIDORES (Para buscar Latino)
// ==========================================
app.get('/get-video', (req, res) => {
    const tmdbId = req.query.imdb || req.query.id; 
    const type = req.query.type || "movie";
    
    let videoUrl = "";
    
    // multiembed.mov nos dará una lista de servidores a elegir.
    // El usuario podrá probar cuál servidor tiene el audio en Latino.
    if (type === "tv") {
        // Por defecto: Temporada 1, Episodio 1
        videoUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=1&e=1`;
    } else {
        videoUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
    }

    console.log(`🎬 Abriendo Agregador de Servidores: ${videoUrl}`);
    res.json({ url: videoUrl });
});

// ==========================================
// RUTA DE ESTADO (Para revisar que Render se actualizó)
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>Cerebro Seekee V9 Online ✅</h1>
            <p>Agregador de Múltiples Servidores Activado.</p>
            <p style="color: blue;">Si un video está en inglés, el usuario puede elegir otro servidor.</p>
        </div>
    `);
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Cerebro Online en puerto ${PORT} ✅`));