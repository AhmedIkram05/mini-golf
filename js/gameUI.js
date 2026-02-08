// This module handles game UI components and screens

import { gameState } from './gameState.js?v=20260208';
import { handleMultiplayerTurnEnd } from './multiplayerUI.js?v=20260208';
import { loadLevel } from './levelManager.js?v=20260208';
import { multiplayer } from './multiplayer.js?v=20260208';
import { achievements } from './achievements.js?v=20260208';
import { saveScore, renderLeaderboard } from './leaderboard.js?v=20260208';
import { savePlayerStats, renderStatsPanel } from './statistics.js?v=20260208';
import { showGameSummary, showMultiplayerGameSummary } from './ui.js?v=20260208';

export function showHoleCompleteScreen(levelIndex, parScore, strokesUsed) {
    // Check for hole in one achievement
    if (strokesUsed === 1) {
        achievements.unlock('hole_in_one');
    }
    
    let scoreText = '';
    if (parScore < 0) scoreText = `${Math.abs(parScore)} under par!`;
    else if (parScore === 0) scoreText = 'Par';
    else scoreText = `${parScore} over par`;
    
    // Show par score message
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-20';
    
    const playerInfo = gameState.isMultiplayerMode ? 
        `<p class="text-lg mb-2">${multiplayer.getCurrentPlayer().name}'s turn</p>` : '';
    
    overlay.innerHTML = `
        <div class="bg-white p-8 rounded-lg text-center">
            <h2 class="text-2xl font-bold mb-4">Hole ${levelIndex + 1} Complete!</h2>
            ${playerInfo}
            <p class="text-xl mb-4">${scoreText}</p>
            <button id="continueBtn" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Continue</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('continueBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        
        if (gameState.isMultiplayerMode) {
            handleMultiplayerTurnEnd();
        } else {
            handleSinglePlayerHoleDone();
        }
    });
}

function handleSinglePlayerHoleDone() {
    // Single player mode
    if (gameState.currentLevelIndex < window.levels.length - 1) {
        gameState.currentLevelIndex++;
        loadLevel();
    } else {
        const totalScore = gameState.score;
        const totalPar = window.levels.reduce((sum, level) => sum + level.par, 0);
        const parDiff = totalScore - totalPar;
        
        // Check for achievements
        const gameStats = {
            totalScore: totalScore,
            coursePar: totalPar,
            holeInOnes: gameState.parScores.filter(score => score === -window.levels[0].par + 1).length,
            perfectScore: gameState.parScores.every(score => score <= 0),
            waterHazards: gameState.waterHazardHits
        };
        
        achievements.checkForAchievements(gameStats);
        
        saveScore(totalScore, gameState.playerName);
        savePlayerStats(gameState.playerName, totalScore, parDiff, gameState.parScores);
        renderLeaderboard('leaderboard');
        renderStatsPanel('stats');
        showGameSummary(totalScore, totalPar, resetGame);
    }
}

function resetGame() {
    gameState.promptPlayerName();
    gameState.resetGame();
    loadLevel();
    gameState.isMoving = false;
    renderLeaderboard('leaderboard');
    renderStatsPanel('stats');
}
