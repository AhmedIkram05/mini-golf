// This is the main game controller that coordinates all game modules

import { ball } from './ball.js?v=20260208';
import { hole } from './hole.js?v=20260208';
import { levels } from './levels.js?v=20260208';
import { gameState, sounds } from './gameState.js?v=20260208';
import { weatherEffects } from './weather.js?v=20260208';
import { achievements } from './achievements.js?v=20260208';
import { renderGame } from './rendering.js?v=20260208';
import { createModal } from './ui.js?v=20260208';
import { setupEventListeners } from './eventHandlers.js?v=20260208';
import { loadLevel } from './levelManager.js?v=20260208';
import { update } from './gameUpdate.js?v=20260208';
import { createMultiplayerUI, updateMultiplayerUI } from './multiplayerUI.js?v=20260208';
import { multiplayer } from './multiplayer.js?v=20260208';
import { powerups } from './powerups.js?v=20260208';

// Initialize values that other modules will need access to
window.levels = levels;

export function initGameCore() {
    // Initialize achievements
    achievements.init();
    
    // Initialize weather system
    weatherEffects.init(document.getElementById('gameCanvas'));
    
    // Ensure the player's name is obtained as soon as the game starts
    gameState.promptPlayerName();
    
    // Load ball customization from localStorage if available
    const savedBallColor = localStorage.getItem('ballColor');
    if (savedBallColor) {
        ball.color = savedBallColor;
    }
    
    // Load the first level
    loadLevel();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up references to needed functions for cross-module calls
    window.loadLevel = loadLevel;
    window.checkPowerups = checkPowerupCollection;
    window.showMultiplayerGameSummary = showMultiplayerGameSummary;
    window.initializePowerups = initializePowerupsForLevel;
}

export function gameLoop() {
    update();
    renderGame(
        document.getElementById('gameCanvas').getContext('2d'), 
        gameState.camera, 
        gameState.aimLine, 
        gameState.isMoving, 
        ball, 
        gameState.currentObstacles,
        gameState.currentWaterHazards, 
        gameState.currentSandBunkers, 
        hole, 
        weatherEffects,
        powerups.activePowerups || []
    );
    requestAnimationFrame(gameLoop);
}

// Export commonly used functions
export function setIsMuted(mute) {
    sounds.setMuted(mute);
}

export function getGameState() {
    return {
        camera: gameState.camera,
        currentObstacles: gameState.currentObstacles,
        currentWaterHazards: gameState.currentWaterHazards,
        currentSandBunkers: gameState.currentSandBunkers,
        hole,
        weatherEffects,
        aimLine: gameState.aimLine,
        isMoving: gameState.isMoving
    };
}

// Powerup collection moved from original file
function checkPowerupCollection() {
    if (!powerups.activePowerups || !ball.visible) return;
    
    for (let i = powerups.activePowerups.length - 1; i >= 0; i--) {
        const p = powerups.activePowerups[i];
        const dist = Math.hypot(p.x - ball.x, p.y - ball.y);
        
        if (dist < ball.radius + 15) {
            // Collect powerup
            const powerupDef = powerups.types[p.type];
            
            // Apply powerup effect
            powerupDef.effect(ball, { hole, gravitationalPull: false });
            
            // Show notification
            const message = document.createElement('div');
            message.className = 'fixed left-1/2 transform -translate-x-1/2 bg-purple-700 text-white py-2 px-6 rounded-lg shadow-lg text-lg font-medium animate-bounce z-20';
            message.style.bottom = '90px'; // Position above the bottom buttons
            message.innerHTML = `${p.icon} ${powerupDef.name} Activated!`;
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                setTimeout(() => document.body.removeChild(message), 500);
            }, 2000);
            
            // Remove powerup
            powerups.activePowerups.splice(i, 1);
            
            // Set timeout to remove effect
            setTimeout(() => {
                powerupDef.reset(ball, { hole, gravitationalPull: false });
            }, powerupDef.duration * 1000);
        }
    }
}

// Initialize powerups for level
function initializePowerupsForLevel() {
    const canvas = document.getElementById('gameCanvas');
    if (Math.random() < 0.5) { // 50% chance to add powerups to the level
        const powerupCount = Math.floor(Math.random() * 2) + 1; // 1-2 powerups
        powerups.activePowerups = [];
        
        for (let i = 0; i < powerupCount; i++) {
            const allTypes = Object.keys(powerups.types);
            const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
            const powerupDef = powerups.types[randomType];
            
            // Find valid position
            let x, y, valid;
            do {
                valid = true;
                x = Math.random() * (canvas.width - 40) + 20;
                y = Math.random() * (canvas.height - 40) + 20;
                
                // Check distance from hole and ball
                const distToHole = Math.hypot(x - hole.x, y - hole.y);
                const distToBall = Math.hypot(x - ball.x, y - ball.y);
                
                if (distToHole < 50 || distToBall < 50) {
                    valid = false;
                    continue;
                }
                
                // Check collision with obstacles
                for (const obs of gameState.currentObstacles) {
                    if (x > obs.x - 20 && x < obs.x + obs.width + 20 &&
                        y > obs.y - 20 && y < obs.y + obs.height + 20) {
                        valid = false;
                        break;
                    }
                }
                
                // Check collision with water
                for (const water of gameState.currentWaterHazards) {
                    if (x > water.x - 20 && x < water.x + water.width + 20 &&
                        y > water.y - 20 && y < water.y + water.height + 20) {
                        valid = false;
                        break;
                    }
                }
                
            } while (!valid);
            
            powerups.activePowerups.push({
                type: randomType,
                x,
                y,
                color: powerupDef.color,
                icon: powerupDef.icon
            });
        }
    } else {
        powerups.activePowerups = [];
    }
}

// Multiplayer setup
export function startMultiplayer(playerCount) {
    gameState.isMultiplayerMode = true;
    
    // Create multiplayer modal with player customization
    const modal = createModal(
        "Multiplayer Setup",
        `
        <div id="playerSetup" class="space-y-4">
            <p>Enter player names and choose ball colors:</p>
            <div id="playerInputs"></div>
        </div>
        `,
        [
            {
                id: "startMultiplayerBtn",
                text: "Start Game",
                classes: "bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            },
            {
                id: "cancelMultiplayerBtn",
                text: "Cancel",
                classes: "bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 ml-2"
            }
        ]
    );
    
    // Generate player inputs
    const playerInputs = document.getElementById('playerInputs');
    const colorOptions = ['#ff0000', '#0000ff', '#00cc00', '#ffcc00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    
    for (let i = 0; i < playerCount; i++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = "flex items-center space-x-2";
        playerDiv.innerHTML = `
            <input type="text" placeholder="Player ${i+1} name" class="player-name border p-2 rounded w-full" />
            <div class="flex space-x-1">
                ${colorOptions.map(color => 
                    `<div class="w-6 h-6 rounded-full cursor-pointer player-color" 
                     style="background-color: ${color}" 
                     data-color="${color}"></div>`
                ).join('')}
            </div>
        `;
        playerInputs.appendChild(playerDiv);
        
        // Add click handler for color selection
        const colorDivs = playerDiv.querySelectorAll('.player-color');
        colorDivs.forEach(div => {
            div.addEventListener('click', function() {
                // Remove selected class from all colors in this row
                colorDivs.forEach(d => d.classList.remove('ring-2', 'ring-black'));
                // Add selected class to clicked color
                this.classList.add('ring-2', 'ring-black');
            });
        });
        
        // Select first color by default
        colorDivs[0].classList.add('ring-2', 'ring-black');
    }
    
    // Handle start button click
    document.getElementById('startMultiplayerBtn').addEventListener('click', () => {
        // Initialize multiplayer system
        multiplayer.init();
        
        // Get player info from modal
        const playerNames = Array.from(document.querySelectorAll('.player-name')).map(input => 
            input.value.trim() || input.placeholder);
        
        // Get the selected colors
        const playerColors = [];
        document.querySelectorAll('#playerInputs > div').forEach(div => {
            const selectedColor = div.querySelector('.player-color.ring-2')?.dataset.color;
            playerColors.push(selectedColor || multiplayer.getDefaultColor(playerColors.length));
        });
        
        // Add players to multiplayer system
        playerNames.forEach((name, i) => {
            multiplayer.addPlayer(name, playerColors[i] || multiplayer.getDefaultColor(i));
        });
        
        // Remove modal
        document.body.removeChild(modal);
        
        // Reset game state for multiplayer
        gameState.currentLevelIndex = 0;
        gameState.score = 0;
        gameState.parScores = [];
        gameState.totalParScore = 0;
        gameState.waterHazardHits = 0;
        gameState.hasWon = false;
        
        loadLevel();
        
        // Update ball color to match first player
        const firstPlayer = multiplayer.getCurrentPlayer();
        if (firstPlayer) {
            ball.color = firstPlayer.ballColor;
        }
        
        // Create multiplayer UI
        createMultiplayerUI();
        updateMultiplayerUI();
    });
    
    // Handle cancel button click
    document.getElementById('cancelMultiplayerBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        gameState.isMultiplayerMode = false;
    });
}

// Utility function for showing multiplayer game summary
function showMultiplayerGameSummary(multiplayer) {
    const scoreboard = multiplayer.getScoreboard();
    const winner = scoreboard[0]; // Players are already sorted by score
    
    const summary = document.createElement('div');
    summary.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20';
    
    let playerRows = '';
    scoreboard.forEach((player, index) => {
        playerRows += `
            <tr class="${index === 0 ? 'font-bold bg-green-100' : ''}">
                <td class="px-4 py-2">${index + 1}</td>
                <td class="px-4 py-2">${player.name}</td>
                <td class="px-4 py-2">${player.score}</td>
            </tr>
        `;
    });
    
    summary.innerHTML = `
        <div class="bg-white p-8 rounded-lg text-center max-w-md">
            <h2 class="text-3xl font-bold mb-6">Game Complete!</h2>
            <p class="text-xl mb-4">${winner.name} Wins!</p>
            <div class="overflow-auto max-h-60 mb-6">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="px-4 py-2">Rank</th>
                            <th class="px-4 py-2">Name</th>
                            <th class="px-4 py-2">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${playerRows}
                    </tbody>
                </table>
            </div>
            <div class="flex justify-center space-x-4">
                <button id="playAgainBtn" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Play Again</button>
                <button id="closeBtn" class="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(summary);
    
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.body.removeChild(summary);
        window.location.reload(); // Simplest way to restart a multiplayer game
    });
    
    document.getElementById('closeBtn').addEventListener('click', () => {
        document.body.removeChild(summary);
        // Return to single player mode
        gameState.isMultiplayerMode = false;
        
        // Remove multiplayer UI
        const multiplayerStatus = document.getElementById('multiplayerStatus');
        if (multiplayerStatus) {
            document.body.removeChild(multiplayerStatus);
        }
        
        // Show leaderboard again
        const leaderboard = document.getElementById('leaderboard');
        if (leaderboard) {
            leaderboard.style.display = 'block';
        }
        
        // Reset game
        gameState.resetGame();
        loadLevel();
    });
}
