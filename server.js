const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Configuración para parecer un navegador real (Chrome)
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const CUEVANA_URL = "https://cuevana.biz"; 

// --- RUTA 1: BUSCADOR ---
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando: ${query}`);

    try {
        // Buscamos en Cuevana
        const { data } = await axios.get(`${CUEVANA_URL}/search?q=${encodeURIComponent(query)}`, { headers });
        const $ = cheerio.load(data);
        const results = [];

        $('.xxx-list li').each((i, el) => {
            const title = $(el).find('h2').text().trim();
            const poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            const link = $(el).find('a').attr('href'); // Link a la ficha de la peli

            if (title && link) {
                results.push({
                    id: i.toString(),
                    title: title,
                    poster: poster.startsWith('http') ? poster : `https:${poster}`,
                    // AQUÍ ESTÁ LA CLAVE: Guardamos el link de la página, no el video aún
                    page_url: link 
                });
            }
        });

        res.json({ results });
    } catch (error) {
        console.error("Error buscando:", error.message);
        res.json({ results: [] });
    }
});

// --- RUTA 2: EXTRACTOR DE VIDEO (NUEVO) ---
// La TV llamará aquí cuando hagas clic en una película
app.get('/get-video', async (req, res) => {
    const pageUrl = req.query.url;
    console.log(`🍿 Extrayendo video de: ${pageUrl}`);

    try {
        const { data } = await axios.get(pageUrl, { headers });
        const $ = cheerio.load(data);
        
        // Buscamos el primer iframe (reproductor) disponible
        // Cuevana suele tener varios (Latino, Subtitulado, etc). Agarramos el primero.
        let videoUrl = $('iframe').first().attr('src') || $('iframe').first().attr('data-src');

        if (videoUrl) {
            // A veces el link viene sin "https:", se lo ponemos
            if (videoUrl.startsWith('//')) videoUrl = 'https:' + videoUrl;
            
            console.log(`✅ Video encontrado: ${videoUrl}`);
            res.json({ url: videoUrl });
        } else {
            // Si falla, mandamos un video de error genérico o el conejo
            res.json({ url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }); 
        }

    } catch (error) {
        console.error("Error extrayendo video:", error.message);
        res.status(500).json({ error: "No se pudo sacar el video" });
    }
});

// --- RUTA 3: TENDENCIAS ---
app.get('/trending', async (req, res) => {
    try {
        const { data } = await axios.get(CUEVANA_URL, { headers });
        const $ = cheerio.load(data);
        const results = [];

        $('.xxx-list li').each((i, el) => {
            if (i < 10) {
                const title = $(el).find('h2').text().trim();
                const poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
                const link = $(el).find('a').attr('href');

                if (title && link) {
                    results.push({
                        title: title,
                        poster: poster.startsWith('http') ? poster : `https:${poster}`,
                        page_url: link
                    });
                }
            }
        });
        res.json({ results });
    } catch (error) {
        res.json({ results: [] });
    }
});

app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));