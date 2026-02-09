// This module handles multiplayer UI components

import { ball } from './ball.js?v=20260208';
import { gameState } from './gameState.js?v=20260208';
import { multiplayer } from './multiplayer.js?v=20260208';

export function createMultiplayerUI() {
    // Create container for player turn display
    if (!document.getElementById('multiplayerStatus')) {
        const container = document.createElement('div');
        container.id = 'multiplayerStatus';
        container.className = 'fixed top-24 right-6 bg-white p-4 rounded shadow-lg z-10 w-64';
        container.innerHTML = `
            <div id="currentPlayer" class="text-xl font-bold mb-2">Current Turn: Player 1</div>
            <div id="multiplayerScoreboard" class="max-h-60 overflow-auto"></div>
        `;
        document.body.appendChild(container);
        
        // Hide regular leaderboard when in multiplayer mode
        const leaderboard = document.getElementById('leaderboard');
        if (leaderboard) leaderboard.style.display = 'none';
    }
}

export function updateMultiplayerUI() {
    if (!gameState.isMultiplayerMode) return;
    
    const currentPlayer = multiplayer.getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Update ball color to current player's color
    ball.color = currentPlayer.ballColor;
    
    // Show current player's turn
    document.getElementById('currentPlayer').textContent = `Current Turn: ${currentPlayer.name}`;
    
    // Update scoreboard
    const scoreboard = document.getElementById('multiplayerScoreboard');
    if (!scoreboard) return;
    
    let html = '<h2 class="font-bold mb-2">Players</h2>';
    
    multiplayer.players.forEach(player => {
        const isActive = player === currentPlayer;
        html += `
            <div class="flex items-center mb-1 ${isActive ? 'font-bold' : ''}">
                <div class="w-4 h-4 rounded-full mr-2" style="background-color: ${player.ballColor}"></div>
                <div>${player.name}: ${player.score}</div>
            </div>
        `;
    });
    
    scoreboard.innerHTML = html;
}

export function handleMultiplayerTurnEnd() {
    // Record current player's score for this level
    const levelScore = gameState.score - gameState.totalParScore;
    multiplayer.recordScore(levelScore);
    
    // Go to next player
    multiplayer.nextPlayer();
    
    // Reset ball position to starting position for next player
    const canvas = document.getElementById('gameCanvas');
    const config = window.levels[gameState.currentLevelIndex];
    ball.x = config.startXPercent * canvas.width;
    ball.y = config.startYPercent * canvas.height;
    ball.speed = 0;
    ball.spinFactor = 0; // Reset any lingering spin
    ball.visible = true; // Ensure ball is visible for next player
    gameState.hasWon = false; // Reset win state for next player
    
    // Update UI for next player
    updateMultiplayerUI();
    
    // If all players have finished the hole, go to next level
    if (multiplayer.currentPlayerIndex === 0) {
        if (gameState.currentLevelIndex < window.levels.length - 1) {
            gameState.currentLevelIndex++;
            window.loadLevel();
        } else {
            window.showMultiplayerGameSummary(multiplayer);
        }
    }
}
