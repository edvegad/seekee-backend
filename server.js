const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));

// --- EL PROXY MÁGICO ---
// Esta ruta recibe una URL, la descarga, le quita los bloqueos y te la muestra
app.use('/proxy', (req, res) => {
    // La dirección que queremos visitar (ej. Cuevana)
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.send('Escribe una URL para navegar. Ej: /proxy?url=https://cuevana.biz');
    }

    // Le pedimos la página a internet
    request({ url: targetUrl, followAllRedirects: true }, (error, response, body) => {
        if (error) return res.send('Error cargando la página');

        // AQUÍ ESTÁ EL TRUCO:
        // Borramos la orden de "Prohibido Iframe" antes de enviarla a la TV
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        
        // Truco extra: Intentamos romper scripts de publicidad comunes reemplazando texto
        let cleanBody = body.replace(/window.open/g, 'console.log'); // Anula popups básicos

        // Corregimos los enlaces para que sigan pasando por nuestro proxy
        // (Esto es complejo, funciona para navegación básica)
        // cleanBody = cleanBody.replace(/href="https:\/\//g, `href="${req.protocol}://${req.get('host')}/proxy?url=https://`);

        res.send(cleanBody);
    });
});

app.get('/', (req, res) => res.send('<h1>Navegador Proxy Online 🛡️</h1>'));

app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));