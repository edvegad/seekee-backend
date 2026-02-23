const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

// SI VES ESTE MENSAJE EN EL NAVEGADOR, ES QUE YA SE ACTUALIZÓ
app.get('/', (req, res) => {
    res.send('<h1>Cerebro Online ✅</h1><p>Si ves esto, las rutas /trending y /search ya funcionan.</p>');
});

app.get('/search', async (req, res) => {
    const query = req.query.q || "";
    try {
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
        const results = response.data.map(item => ({
            title: item.show.name,
            poster: item.show.image ? item.show.image.original : "https://via.placeholder.com/300x450?text=No+Image",
            id: item.show.externals.imdb || item.show.name 
        }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

app.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`https://api.tvmaze.com/shows?page=1`);
        const results = response.data.slice(0, 15).map(show => ({
            title: show.name,
            poster: show.image ? show.image.original : "",
            id: show.externals.imdb || show.name
        }));
        res.json({ results });
    } catch (e) { res.json({ results: [] }); }
});

app.get('/get-video', (req, res) => {
    const id = req.query.imdb;
    if (id && id.startsWith('tt')) {
        res.json({ url: `https://vidsrc.to/embed/movie/${id}` });
    } else {
        res.json({ url: `https://vidsrc.to/embed/movie?imdb=${id}` });
    }
});

app.listen(PORT, () => console.log(`Puerto ${PORT}`));