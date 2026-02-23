const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// IMPORTANTE PARA LA NUBE: 
// Render nos dará un puerto aleatorio en la variable process.env.PORT
// Si estamos en local (tu PC), usará el 3000.
const PORT = process.env.PORT || 3000;

// Configuración de CORS para permitir que tu TV se conecte desde cualquier IP
app.use(cors({
    origin: '*', // Permitir todas las conexiones
    methods: ['GET', 'POST']
}));

// Ruta de búsqueda (Usando TVMaze como ejemplo seguro)
app.get('/search', async (req, res) => {
    const query = req.query.q || "Sin búsqueda";
    console.log(`\n☁️ Nube buscando: "${query}"...`);

    try {
        // Usamos TVMaze (API pública y segura)
        const urlBusqueda = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
        
        const respuesta = await axios.get(urlBusqueda);
        const showsEncontrados = respuesta.data; 
        
        console.log(`✅ ¡Se encontraron ${showsEncontrados.length} resultados!`);

        // Transformamos los datos
        const resultadosParaTV = showsEncontrados.map((item, index) => {
            const show = item.show; 
            
            let posterHD = "https://via.placeholder.com/600x900/333333/ffffff?text=Sin+Poster";
            if (show.image && show.image.original) {
                posterHD = show.image.original;
            }

            return {
                id: show.id.toString(),
                title: show.name || "Título Desconocido", 
                poster: posterHD,      
                type: "serie",
                seasons: [
                    {
                        number: 1,
                        episodes: [
                            { 
                                title: "Reproducir", 
                                // Video de prueba (Big Buck Bunny)
                                url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                            }
                        ]
                    }
                ]
            };
        });

        // Respuesta JSON a la TV
        res.json({
            "search_query": query,
            "results": resultadosParaTV
        });

    } catch (error) {
        console.error("❌ Error en la nube:", error.message);
        res.json({
            "search_query": query,
            "results": []
        });
    }
});

// Ruta base para saber si el servidor está vivo
app.get('/', (req, res) => {
    res.send('<h1>¡Seekee API está funcionando en la nube! 🚀</h1>');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en el puerto ${PORT}`);
});