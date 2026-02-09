import { initGame, gameLoop, setMute, customizeBall, startMultiplayerGame } from './game.js?v=20260208';
import { achievements } from './achievements.js?v=20260208';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize game
    initGame();
    gameLoop();
    
    // Initialize UI
    setupPlayerSelectionUI();
    setupEventListeners();
    
    // Initialize achievements
    achievements.init();
    
    // Show the player setup section initially
    document.getElementById('playerSetup').style.display = 'block';
    document.getElementById('multiplayerStatus').style.display = 'none';
    
    // Hide the game course and power slider initially until players are set up
    document.getElementById('golf-course').style.display = 'none';
    document.getElementById('verticalPowerSlider').style.display = 'none';
});

function setupPlayerSelectionUI() {
    // Set up player count buttons
    const playerCountButtons = document.querySelectorAll('.player-count-btn');
    let selectedCount = 2; // Default to 2 players
    
    playerCountButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update button styles
            playerCountButtons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-800');
            });
            this.classList.remove('bg-gray-200', 'text-gray-800');
            this.classList.add('bg-blue-600', 'text-white');
            
            // Update player count and regenerate inputs
            selectedCount = parseInt(this.getAttribute('data-players'), 10);
            generatePlayerInputs(selectedCount);
        });
    });
    
    // Initial player inputs
    generatePlayerInputs(selectedCount);
    
    // Start multiplayer button
    document.getElementById('startMultiplayerBtn').addEventListener('click', function() {
        // Validate player names
        const playerNames = [];
        document.querySelectorAll('.player-name').forEach(input => {
            playerNames.push(input.value.trim());
        });
        
        // Check if any name is empty
        const emptyNames = playerNames.filter(name => name === '').length;
        if (emptyNames > 0) {
            // Show an error message
            const errorMessage = document.getElementById('playerSetupError');
            if (errorMessage) {
                errorMessage.textContent = 'Please enter a name for each player';
                errorMessage.classList.remove('hidden');
            }
            return;
        }
        
        // Hide error message if it exists
        const errorMessage = document.getElementById('playerSetupError');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
        
        // Start the game with the selected players
        startGame(selectedCount);
    });
}

function generatePlayerInputs(count) {
    const inputsContainer = document.getElementById('playerInputs');
    inputsContainer.innerHTML = '';
    
    const colorOptions = ['#ff0000', '#0000ff', '#00cc00', '#ffcc00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    
    for (let i = 0; i < count; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = "mt-4";
        playerDiv.innerHTML = `
            <label class="block text-sm font-medium mb-1">Player ${i + 1}</label>
            <div class="flex">
                <input type="text" placeholder="Player ${i + 1}" class="player-name border p-2 rounded flex-grow mr-2" required>
                <div class="flex space-x-1">
                    ${colorOptions.slice(0, 4).map((color, idx) => 
                        `<div class="w-8 h-8 rounded-full cursor-pointer player-color ${i === idx ? 'ring-2 ring-black' : ''}" 
                         style="background-color: ${color}" data-color="${color}"></div>`
                    ).join('')}
                </div>
            </div>
        `;
        inputsContainer.appendChild(playerDiv);
        
        // Add color selection functionality
        const colorDivs = playerDiv.querySelectorAll('.player-color');
        colorDivs.forEach(div => {
            div.addEventListener('click', function() {
                colorDivs.forEach(d => d.classList.remove('ring-2', 'ring-black'));
                this.classList.add('ring-2', 'ring-black');
            });
        });
    }
}

function startGame(playerCount) {
    // Get player names and colors
    const playerNames = [];
    const playerColors = [];
    
    document.querySelectorAll('.player-name').forEach(input => {
        playerNames.push(input.value || input.placeholder);
    });
    
    document.querySelectorAll('#playerInputs > div').forEach(div => {
        const selectedColor = div.querySelector('.player-color.ring-2')?.dataset.color;
        playerColors.push(selectedColor || '#ffffff');
    });
    
    // Initialize the multiplayer system
    multiplayer.init();
    
    // Add all the players to the multiplayer system
    for (let i = 0; i < playerNames.length; i++) {
        multiplayer.addPlayer(playerNames[i], playerColors[i]);
    }
    
    // Show game elements
    document.getElementById('golf-course').style.display = 'block';
    document.getElementById('verticalPowerSlider').style.display = 'flex';
    
    // Hide setup UI and show the game scoreboard
    document.getElementById('playerSetup').style.display = 'none';
    document.getElementById('multiplayerStatus').style.display = 'block';
    
    // Start multiplayer game
    startMultiplayerGame(playerCount);
    
    // Update the current player display
    const currentPlayer = multiplayer.getCurrentPlayer();
    if (currentPlayer) {
        document.getElementById('currentPlayer').textContent = `Current Turn: ${currentPlayer.name}`;
        
        // Update ball color to match first player
        customizeBall({ color: currentPlayer.ballColor });
    }
    
    // Update the scoreboard
    updateMultiplayerScoreboard();
}

function updateMultiplayerScoreboard() {
    const scoreboardContainer = document.getElementById('multiplayerScoreboard');
    if (!scoreboardContainer) return;
    
    let html = '<div class="font-bold mb-2">Players</div>';
    
    multiplayer.players.forEach((player, index) => {
        const isCurrent = index === multiplayer.currentPlayerIndex;
        const styleCurrent = isCurrent ? 'font-bold bg-blue-100 rounded px-2' : '';
        
        html += `
            <div class="flex items-center mb-2 ${styleCurrent}">
                <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${player.ballColor}"></div>
                <div class="flex-grow">${player.name}</div>
                <div>${player.score}</div>
            </div>
        `;
    });
    
    scoreboardContainer.innerHTML = html;
}

function setupEventListeners() {
    // Add event listener for mute button
    document.getElementById('muteBtn').addEventListener('click', function() {
        // Update the mute status and icon
        const isMuted = this.textContent === '🔊';
        this.textContent = isMuted ? '🔇' : '🔊';
        setMute(isMuted);
    });

    // Add event listener for rules button
    document.getElementById('rulesBtn').addEventListener('click', () => {
        const rulesModal = document.createElement('div');
        rulesModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-30';
        rulesModal.innerHTML = `
            <div class="bg-white p-6 rounded-lg max-w-md">
                <h2 class="text-2xl font-bold mb-4">Multiplayer Rules</h2>
                <ul class="list-disc pl-6 mb-4">
                    <li>Each player takes turns hitting the ball</li>
                    <li>After each player completes a hole, the next player starts</li>
                    <li>The goal is to complete all holes in the fewest strokes</li>
                    <li>The player with the lowest total score wins!</li>
                </ul>
                <div class="text-right">
                    <button id="closeRulesBtn" class="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(rulesModal);
        
        document.getElementById('closeRulesBtn').addEventListener('click', () => {
            document.body.removeChild(rulesModal);
        });
    });

    // Add event listener for customize button
    document.getElementById('customizeBtn').addEventListener('click', function() {
        const customizeModal = document.createElement('div');
        customizeModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-30';
        customizeModal.innerHTML = `
            <div class="bg-white p-6 rounded-lg max-w-md">
                <h2 class="text-2xl font-bold mb-4">Customize Your Ball</h2>
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Ball Color</label>
                    <div class="grid grid-cols-5 gap-2">
                        <div class="w-8 h-8 bg-white border border-gray-300 rounded-full cursor-pointer" data-color="#ffffff"></div>
                        <div class="w-8 h-8 bg-red-500 rounded-full cursor-pointer" data-color="#ef4444"></div>
                        <div class="w-8 h-8 bg-blue-500 rounded-full cursor-pointer" data-color="#3b82f6"></div>
                        <div class="w-8 h-8 bg-green-500 rounded-full cursor-pointer" data-color="#10b981"></div>
                        <div class="w-8 h-8 bg-yellow-400 rounded-full cursor-pointer" data-color="#facc15"></div>
                        <div class="w-8 h-8 bg-purple-500 rounded-full cursor-pointer" data-color="#8b5cf6"></div>
                        <div class="w-8 h-8 bg-pink-500 rounded-full cursor-pointer" data-color="#ec4899"></div>
                        <div class="w-8 h-8 bg-orange-500 rounded-full cursor-pointer" data-color="#f97316"></div>
                        <div class="w-8 h-8 bg-teal-500 rounded-full cursor-pointer" data-color="#14b8a6"></div>
                        <div class="w-8 h-8 bg-gray-800 rounded-full cursor-pointer" data-color="#1f2937"></div>
                    </div>
                </div>
                <div class="text-right">
                    <button id="closeCustomizeBtn" class="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 mr-2">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(customizeModal);
        
        // Add event listeners to color options
        customizeModal.querySelectorAll('[data-color]').forEach(colorEl => {
            colorEl.addEventListener('click', () => {
                const color = colorEl.getAttribute('data-color');
                customizeBall({ color });
                
                // Add selected indicator
                customizeModal.querySelectorAll('[data-color]').forEach(el => {
                    el.style.boxShadow = 'none';
                });
                colorEl.style.boxShadow = '0 0 0 3px #000, 0 0 0 5px white';
            });
        });
        
        // Close button functionality
        document.getElementById('closeCustomizeBtn').addEventListener('click', () => {
            document.body.removeChild(customizeModal);
        });
    });
}

// Create a simple local multiplayer system

export const multiplayer = {
    players: [],
    currentPlayerIndex: 0,
    maxPlayers: 4,
    levelStrokes: 0, // Track strokes for current level
    
    init() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.levelStrokes = 0;
    },
    
    addPlayer(name, ballColor) {
        if (this.players.length >= this.maxPlayers) {
            return false;
        }
        
        this.players.push({
            name: name,
            ballColor: ballColor || this.getDefaultColor(this.players.length),
            score: 0,
            totalScore: 0,
            levelScores: []
        });
        
        return true;
    },
    
    getDefaultColor(index) {
        const colors = ['#ff0000', '#0000ff', '#00cc00', '#ffcc00'];
        return colors[index % colors.length];
    },
    
    nextPlayer() {
        this.levelStrokes = 0; // Reset strokes counter for next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // Update the UI
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer) {
            document.getElementById('currentPlayer').textContent = `Current Turn: ${currentPlayer.name}`;
            customizeBall({ color: currentPlayer.ballColor });
        }
        
        updateMultiplayerScoreboard();
        
        return this.getCurrentPlayer();
    },
    
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    },
    
    recordScore(levelScore) {
        const player = this.getCurrentPlayer();
        player.score += levelScore;
        player.levelScores.push(levelScore);
    },
    
    getScoreboard() {
        return this.players.map(p => ({
            name: p.name,
            score: p.score,
            levelScores: p.levelScores
        })).sort((a, b) => a.score - b.score);
    },
    
    // New method to reset strokes for a new hole
    resetForNewHole() {
        this.currentPlayerIndex = 0;
        this.levelStrokes = 0;
    }
};
