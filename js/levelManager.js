// This module handles loading levels and everything related to level management

import { ball } from './ball.js?v=20260208';
import { hole } from './hole.js?v=20260208';
import { levels } from './levels.js?v=20260208';
import { gameState } from './gameState.js?v=20260208';
import { weatherEffects } from './weather.js?v=20260208';
import { renderLeaderboard } from './leaderboard.js?v=20260208';
import { renderStatsPanel } from './statistics.js?v=20260208';
import { updateMultiplayerUI } from './multiplayerUI.js?v=20260208';

const canvas = document.getElementById('gameCanvas');

export function loadLevel() {
    const config = levels[gameState.currentLevelIndex];
    
    // Set hole configuration
    hole.setConfig(canvas, {
        holeXPercent: config.holeXPercent,
        holeYPercent: config.holeYPercent,
        holeRadius: config.holeRadius,
        holeColor: config.holeColor
    });
    
    // Set ball's starting position
    ball.x = config.startXPercent * canvas.width;
    ball.y = config.startYPercent * canvas.height;
    ball.speed = 0;
    ball.visible = true;
    gameState.hasWon = false;
    
    // Reset camera position to focus on ball at start
    gameState.camera.x = Math.max(0, Math.min(ball.x - (gameState.camera.width / 2), canvas.width - gameState.camera.width));
    gameState.camera.y = Math.max(0, Math.min(ball.y - (gameState.camera.height / 2), canvas.height - gameState.camera.height));
    
    // Update UI
    updateLevelUI(config);
    
    // Build obstacles - convert relative percentages to absolute values
    gameState.currentObstacles = config.obstacles.map(obs => ({
        x: obs.xPercent * canvas.width,
        y: obs.yPercent * canvas.height,
        width: obs.widthPercent * canvas.width,
        height: obs.heightPercent * canvas.height,
        color: obs.color
    }));
    
    // Load water hazards if they exist
    gameState.currentWaterHazards = config.waterHazards ? config.waterHazards.map(hazard => ({
        x: hazard.xPercent * canvas.width,
        y: hazard.yPercent * canvas.height,
        width: hazard.widthPercent * canvas.width,
        height: hazard.heightPercent * canvas.height,
        color: hazard.color
    })) : [];
    
    // Load sand bunkers if they exist
    gameState.currentSandBunkers = config.sandBunkers ? config.sandBunkers.map(bunker => ({
        x: bunker.xPercent * canvas.width,
        y: bunker.yPercent * canvas.height,
        width: bunker.widthPercent * canvas.width,
        height: bunker.heightPercent * canvas.height,
        color: bunker.color
    })) : [];
    
    // Apply the theme to the course
    applyLevelTheme(config);
    
    // 30% chance of weather change on level load
    if (Math.random() < 0.3) {
        setRandomWeather();
    }

    // Initialize powerups for the level
    initializePowerupsForLevel();
}

function updateLevelUI(config) {
    document.getElementById('score').textContent = 'Score: ' + gameState.score;
    document.getElementById('currentHole').textContent = 'Hole: ' + (gameState.currentLevelIndex + 1);
    document.getElementById('par').textContent = 'Par: ' + config.par;
    
    // Update leaderboard and stats
    renderLeaderboard('leaderboard');
    renderStatsPanel('stats');
    
    // Update multiplayer UI if in multiplayer mode
    if (gameState.isMultiplayerMode) {
        updateMultiplayerUI();
    }
}

function applyLevelTheme(config) {
    const courseElement = document.getElementById('golf-course');
    if (config.theme) {
        courseElement.style.backgroundColor = config.theme.background;
        courseElement.style.borderColor = config.theme.borderColor;
    }
}

function setRandomWeather() {
    const weatherTypes = ['clear', 'rain', 'snow', 'storm'];
    const randomType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const windForce = Math.random() * 3;
    const windDirection = Math.random() * 360;
    
    weatherEffects.setWeather(randomType, windForce, windDirection);
}

function initializePowerupsForLevel() {
    // Implementation from the original file
    // This would be imported from a powerups module
    if (window.initializePowerups) {
        window.initializePowerups();
    }
}
