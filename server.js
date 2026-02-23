const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Puerto para Render o Local
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());

// Ruta de búsqueda para la TV
app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    console.log(`🔎 Buscando en la nube: ${query}`);

    try {
        // 1. Buscamos la info en TVMaze (Posters y Títulos reales)
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const data = response.data;

        // 2. Formateamos los resultados para nuestra App de LG
        const results = data.map(item => {
            const show = item.show;
            
            return {
                id: show.id.toString(),
                title: show.name,
                poster: show.image ? show.image.original : "https://via.placeholder.com/600x900/333333/ffffff?text=Sin+Poster",
                type: "serie",
                seasons: [{
                    number: 1,
                    episodes: [{
                        title: "Ver Ahora",
                        // AQUÍ IRÁ EL LINK DEL VIDEO REAL EN EL FUTURO
                        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    }]
                }]
            };
        });

        // Enviamos la respuesta a la TV
        res.json({ results });

    } catch (error) {
        console.error("Error en el servidor:", error.message);
        res.json({ results: [] });
    }
});

// Ruta de bienvenida (para probar en el navegador)
app.get('/', (req, res) => {
    res.send('<h1>¡Seekee API Online! 🚀</h1><p>El cerebro de la TV está funcionando perfectamente.</p>');
});

app.listen(PORT, () => {
    console.log(`✅ Servidor activo en puerto ${PORT}`);
});