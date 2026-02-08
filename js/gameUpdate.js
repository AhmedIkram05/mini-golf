// This module handles game updates and the main game loop

import { ball } from './ball.js?v=20260208';
import { hole } from './hole.js?v=20260208';
import { gameState, sounds, updateParticles } from './gameState.js?v=20260208';
import { handleCollisions, checkWaterHazards, checkSandBunkers } from './collisions.js?v=20260208';
import { weatherEffects } from './weather.js?v=20260208';
import { showHoleCompleteScreen } from './gameUI.js?v=20260208';

export function update() {
    // Update particles
    updateParticles();
    
    if (gameState.isMoving) {
        // First update ball position and handle wall collisions
        ball.update(document.getElementById('gameCanvas'));
        
        // Then check for obstacle collisions
        if (handleCollisions(ball, gameState.currentObstacles, sounds.playSound, sounds.hitSound)) {
            // If collision occurred, apply a small speed reduction
            ball.speed *= 0.95;
        }
        
        // Handle water and sand collisions
        if (checkWaterHazards(ball, gameState.currentWaterHazards, gameState.score, gameState.waterHazardHits, gameState.currentLevelIndex)) {
            gameState.isMoving = false;
        } else {
            checkSandBunkers(ball, gameState.currentSandBunkers);
        }
        
        // Always follow ball with camera when it's moving
        gameState.camera.follow(ball);
        
        // Update and apply weather effects
        weatherEffects.update();
        weatherEffects.applyBallPhysics(ball);
        
        // Check for hole collision
        const dist = Math.hypot(ball.x - hole.x, ball.y - hole.y);
        
        // Check if ball fell in the hole
        if (!gameState.hasWon && dist < ball.radius + hole.radius * 0.8) {
            handleBallInHole();
            return;
        }
        
        // Stop ball if it's moving too slowly
        if (ball.speed < 0.05) {
            ball.speed = 0;
            ball.spinFactor = 0; // Reset any leftover spin
            gameState.isMoving = false;
        }
    } else {
        // Even when not moving, ensure camera is positioned on the ball properly
        if (ball.visible) {
            gameState.camera.follow(ball);
        }
    }
    
    // Check for powerup collection if the ball is moving
    if (gameState.isMoving && window.checkPowerups) {
        window.checkPowerups();
    }
}

function handleBallInHole() {
    gameState.hasWon = true;
    ball.visible = false;
    gameState.isMoving = false;
    
    // Play hole sound when ball falls into hole
    sounds.playSound(sounds.holeSound);
    
    // Calculate par score
    const levelPar = hole.getPar();
    const strokesUsed = gameState.score - gameState.totalParScore;
    const parScore = strokesUsed - levelPar;
    
    // Only store par scores in single-player mode
    if (!gameState.isMultiplayerMode) {
        gameState.parScores[gameState.currentLevelIndex] = parScore;
    }
    
    gameState.totalParScore = gameState.score;
    
    // Show hole complete screen
    showHoleCompleteScreen(gameState.currentLevelIndex, parScore, strokesUsed);
}
