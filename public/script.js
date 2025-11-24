class GameExplorer {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.gamesGrid = document.getElementById('gamesGrid');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');

        this.initEvents();
        this.loadInitialGames();
    }

    initEvents() {
        this.searchBtn.addEventListener('click', () => this.searchGames());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchGames();
            }
        });
    }

    async loadInitialGames() {
        try {
            this.showLoading();
            const response = await fetch('/api/games?search=elden%20ring');
            
            if (!response.ok) throw new Error('Erro na requisição');
            
            const data = await response.json();
            
            if (data.success) {
                this.displayGames(data.games);
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    async searchGames() {
        const searchTerm = this.searchInput.value.trim();
        
        if (!searchTerm) {
            alert('Por favor, digite o nome de um jogo');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(`/api/games?search=${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) throw new Error('Erro na requisição');
            
            const data = await response.json();
            
            if (data.success && data.games.length > 0) {
                this.displayGames(data.games);
            } else {
                this.showError('Nenhum jogo encontrado. Tente outro nome.');
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    displayGames(games) {
        this.hideError();
        
        if (games.length === 0) {
            this.gamesGrid.innerHTML = `
                <div class="no-games">
                    <p>Nenhum jogo encontrado. Tente outra busca.</p>
                </div>
            `;
            return;
        }

        const gamesHTML = games.map(game => `
            <div class="game-card" onclick="gameExplorer.showGameDetails(${game.id})">
                <img 
                    src="${game.background_image || 'https://via.placeholder.com/300x200?text=Imagem+Não+Disponível'}" 
                    alt="${game.name}" 
                    class="game-image"
                    onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Não+Disponível'"
                >
                <div class="game-info">
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-detail">
                        <strong>📅 Lançamento:</strong> ${game.released ? new Date(game.released).toLocaleDateString('pt-BR') : 'Não informado'}
                    </div>
                    <div class="game-detail">
                        <strong>🎮 Plataformas:</strong>
                    </div>
                    <div class="platforms">
                        ${game.platforms && game.platforms.length > 0 
                            ? game.platforms.slice(0, 3).map(platform => 
                                `<span class="platform-tag">${platform}</span>`
                              ).join('')
                            : '<span class="platform-tag">Não informado</span>'
                        }
                        ${game.platforms && game.platforms.length > 3 
                            ? `<span class="platform-tag">+${game.platforms.length - 3}</span>`
                            : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');

        this.gamesGrid.innerHTML = gamesHTML;
    }

    async showGameDetails(gameId) {
        try {
            this.showLoading();
            const response = await fetch(`/api/games/${gameId}`);
            
            if (!response.ok) throw new Error('Erro na requisição');
            
            const data = await response.json();
            
            if (data.success) {
                this.displayGameModal(data.game);
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    displayGameModal(game) {
        const modalHTML = `
            <div class="modal-overlay" onclick="gameExplorer.closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="gameExplorer.closeModal()">×</button>
                    <img 
                        src="${game.background_image || 'https://via.placeholder.com/600x400?text=Imagem+Não+Disponível'}" 
                        alt="${game.name}" 
                        class="modal-image"
                    >
                    <div class="modal-info">
                        <h2>${game.name}</h2>
                        <div class="modal-details">
                            <p><strong>📅 Data de Lançamento:</strong> ${game.released ? new Date(game.released).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                            <p><strong>⭐ Avaliação:</strong> ${game.rating ? game.rating.toFixed(1) + '/5' : 'Não avaliado'} (${game.ratings_count || 0} votos)</p>
                            <p><strong>🎮 Plataformas:</strong> ${game.platforms ? game.platforms.join(', ') : 'Não informado'}</p>
                            <p><strong>🎨 Gêneros:</strong> ${game.genres ? game.genres.join(', ') : 'Não informado'}</p>
                        </div>
                        ${game.description ? `
                            <div class="modal-description">
                                <h3>Descrição</h3>
                                <p>${game.description.substring(0, 400)}${game.description.length > 400 ? '...' : ''}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos do modal se não existirem
        if (!document.querySelector('#modal-styles')) {
            const modalStyles = `
                <style id="modal-styles">
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                        padding: 20px;
                    }
                    .modal-content {
                        background: white;
                        border-radius: 15px;
                        max-width: 600px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                        position: relative;
                    }
                    .modal-close {
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: none;
                        border: none;
                        font-size: 2rem;
                        color: white;
                        cursor: pointer;
                        z-index: 1001;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .modal-image {
                        width: 100%;
                        height: 300px;
                        object-fit: cover;
                    }
                    .modal-info {
                        padding: 25px;
                    }
                    .modal-info h2 {
                        margin-bottom: 15px;
                        color: #2d3748;
                    }
                    .modal-details {
                        margin-bottom: 20px;
                    }
                    .modal-details p {
                        margin-bottom: 8px;
                    }
                    .modal-description h3 {
                        margin-bottom: 10px;
                        color: #2d3748;
                    }
                    .modal-description p {
                        line-height: 1.6;
                        color: #4a5568;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', modalStyles);
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.gamesGrid.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.gamesGrid.style.display = 'grid';
    }

    showError(message = 'Erro ao carregar jogos. Tente novamente.') {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.style.display = 'block';
        this.gamesGrid.style.display = 'none';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
        this.gamesGrid.style.display = 'grid';
    }
}

// Inicializar a aplicação
const gameExplorer = new GameExplorer();