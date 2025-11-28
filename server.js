const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.RAWG_API_KEY;

if (!API_KEY) {
    console.error('Erro: A variável de ambiente RAWG_API_KEY não está definida.');
    process.exit(1); // Encerra o processo se a chave da API não estiver configurada
}

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, ' ')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, ' ', 'index.html'));
});

// Rota para buscar jogos
app.get('/api/games', async (req, res) => {
    try {
        const { search } = req.query;
        
        const response = await fetch(
            `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(search)}&page_size=10`
        );
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados da API: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Formatar os dados para retornar apenas o que precisamos
        const games = data.results.map(game => ({
            id: game.id,
            name: game.name,
            released: game.released,
            background_image: game.background_image,
            platforms: game.platforms ? game.platforms.map(p => p.platform.name) : []
        }));
        
        res.json({
            success: true,
            games: games
        });
        
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar jogos'
        });
    }
});

// Rota para buscar detalhes de um jogo específico
app.get('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const response = await fetch(
            `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados do jogo: ${response.statusText}`);
        }
        
        const game = await response.json();
        
        const gameData = {
            id: game.id,
            name: game.name,
            released: game.released,
            background_image: game.background_image,
            description: game.description_raw || '', // Garante que description seja sempre uma string
            platforms: game.platforms ? game.platforms.map(p => p.platform.name) : [],
            genres: game.genres.map(g => g.name),
            rating: game.rating,
            ratings_count: game.ratings_count
        };
        
        res.json({
            success: true,
            game: gameData
        });
        
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar detalhes do jogo'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});