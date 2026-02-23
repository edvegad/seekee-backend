const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

// --- BUSCADOR REFORZADO ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando contenido real: ${query}`);
    try {
        // Buscamos en una base de datos más comercial
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        
        const results = response.data
            .filter(item => item.show.externals.imdb) // VITAL: Solo lo que tenga código IMDB
            .map(item => ({
                title: item.show.name,
                poster: item.show.image ? item.show.image.original : "https://via.placeholder.com/300x450",
                imdb: item.show.externals.imdb,
                type: item.show.type === "Scripted" ? "tv" : "movie"
            }));
        
        res.json({ results });
    } catch (e) {
        res.json({ results: [] });
    }
});

// --- TENDENCIAS ---
app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.tvmaze.com/shows?page=1`);
        const results = response.data
            .filter(show => show.externals.imdb) // Solo lo que tenga video
            .slice(0, 18)
            .map(show => ({
                title: show.name,
                poster: show.image ? show.image.original : "",
                imdb: show.externals.imdb,
                type: "tv"
            }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

// --- REPRODUCTOR CON DOS SERVIDORES (BACKUP) ---
app.get('/get-video', (req, res) => {
    const imdb = req.query.imdb;
    const type = req.query.type || "movie";
    
    // Si un servidor falla, el usuario puede intentar con el otro dentro del mismo reproductor
    // Usaremos vidsrc.to que suele tener mejor catálogo
    const baseUrl = type === "tv" 
        ? `https://vidsrc.to/embed/tv/${imdb}/1/1` 
        : `https://vidsrc.to/embed/movie/${imdb}`;
        
    res.json({ url: baseUrl });
});

app.listen(PORT, () => console.log(`Cerebro V3 Online ✅`));