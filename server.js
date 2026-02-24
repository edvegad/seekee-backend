const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS abierto para evitar bloqueos
app.use(cors({ origin: '*' }));

// Llave de TMDB (Posters y títulos en Español)
const TMDB_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// ==========================================
// RUTA 1: BUSCADOR (ESPAÑOL LATINO)
// ==========================================
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando en TMDB: ${query}`);

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
    } catch (e) { 
        console.error("Error en búsqueda:", e.message);
        res.json({ results: [] }); 
    }
});

// ==========================================
// RUTA 2: TENDENCIAS (ESTRENOS)
// ==========================================
app.get('/trending', async (req, res) => {
    console.log(`🔥 Cargando estrenos...`);
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
// RUTA 3: SERVIDORES ANTI-BLOQUEO (El Fix de la TV)
// ==========================================
app.get('/get-video', (req, res) => {
    const tmdbId = req.query.imdb || req.query.id; 
    const type = req.query.type || "movie";
    
    let sources = [];

    // Hemos quitado "embed.su" porque la compañía de Internet (WiFi) de tu casa lo bloqueó.
    // Ahora usamos servidores más resistentes a bloqueos de operadoras:
    if (type === "tv") {
        sources = [
            { name: "Servidor 1 (Vidsrc)", url: `https://vidsrc.in/embed/tv?tmdb=${tmdbId}&season=1&episode=1` },
            { name: "Servidor 2 (Super)", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=1&e=1` },
            { name: "Servidor 3 (Auto)", url: `https://autoembed.co/tv/tmdb/${tmdbId}-1-1` }
        ];
    } else {
        sources = [
            { name: "Servidor 1 (Vidsrc)", url: `https://vidsrc.in/embed/movie?tmdb=${tmdbId}` },
            { name: "Servidor 2 (Super)", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
            { name: "Servidor 3 (Auto)", url: `https://autoembed.co/movie/tmdb/${tmdbId}` }
        ];
    }

    console.log(`🎬 Enviando 3 Servidores Anti-Bloqueo para: ${tmdbId}`);
    res.json({ sources: sources });
});

// ==========================================
// RUTA DE ESTADO (Para revisar que Render se actualizó)
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>Cerebro Seekee V10 Online ✅</h1>
            <p>Servidores Anti-Bloqueo (Error -105 solucionado) instalados correctamente.</p>
        </div>
    `);
});

app.listen(PORT, () => console.log(`Cerebro V10 Online en puerto ${PORT} ✅`));