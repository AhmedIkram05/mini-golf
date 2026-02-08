// This module handles all game events and user interactions

import { ball } from './ball.js?v=20260208';
import { gameState, sounds } from './gameState.js?v=20260208';
import { loadLevel } from './levelManager.js?v=20260208';
import { renderLeaderboard } from './leaderboard.js?v=20260208';
import { renderStatsPanel } from './statistics.js?v=20260208';

const canvas = document.getElementById('gameCanvas');

export function setupEventListeners() {
    // Add mouse move event to show aim line
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);

    // Add touch support
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('click', handleClick);

    document.getElementById('resetButton').addEventListener('click', handleReset);
    document.getElementById('powerSlider').addEventListener('input', updatePowerSlider);
}

function handleMouseMove(event) {
    if (!gameState.isMoving && ball.visible) {
        const rect = canvas.getBoundingClientRect();
        gameState.aimLine.x = event.clientX - rect.left;
        gameState.aimLine.y = event.clientY - rect.top;
        gameState.aimLine.visible = true;
    }
}

function handleMouseOut() {
    gameState.aimLine.visible = false;
}

function handleTouchMove(event) {
    event.preventDefault();
    if (!gameState.isMoving && ball.visible) {
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        gameState.aimLine.x = touch.clientX - rect.left;
        gameState.aimLine.y = touch.clientY - rect.top;
        gameState.aimLine.visible = true;
    }
}

function handleTouchEnd(event) {
    if (!gameState.isMoving && ball.visible) {
        event.preventDefault();
        hitBall(event, true);
    }
}

function handleClick(event) {
    if (!gameState.isMoving && ball.visible) {
        hitBall(event, false);
    }
}

export function hitBall(event, isTouch) {
    // Play hit sound when ball is hit
    sounds.playSound(sounds.hitSound);
    
    // Reset any lingering spin from previous hits
    ball.spinFactor = 0;
    
    // Increment score
    gameState.score++;
    
    document.getElementById('score').textContent = 'Score: ' + gameState.score;
    const rect = canvas.getBoundingClientRect();
    
    let pointX, pointY;
    if (isTouch) {
        const lastTouch = event.changedTouches[0];
        pointX = lastTouch.clientX - rect.left;
        pointY = lastTouch.clientY - rect.top;
    } else {
        pointX = event.clientX - rect.left;
        pointY = event.clientY - rect.top;
    }
    
    const dx = pointX - ball.x;
    const dy = pointY - ball.y;
    ball.angle = Math.atan2(dy, dx);
    const power = parseFloat(document.getElementById('powerSlider').value);
    ball.speed = power * 2;
    gameState.isMoving = true;
    gameState.aimLine.visible = false;
}

function handleReset() {
    // Restart and re-prompt player name on reset
    gameState.promptPlayerName();
    gameState.resetGame();
    loadLevel();
    gameState.isMoving = false;
    renderLeaderboard('leaderboard');
    renderStatsPanel('stats');
}

function updatePowerSlider() {
    const val = parseInt(this.value, 10);
    const ratio = (val - 1) / 9; // Normalize value from 0 to 1 for slider values 1-10
    const red = Math.round(255 * (1 - ratio));    // Highest red at low power
    const green = Math.round(255 * ratio);        // Highest green at high power
    const fillColor = `rgb(${red}, ${green}, 0)`;
    // Compute fill percentage for gradient (e.g., value 1 => 10%, value 10 => 100%)
    const fillPercent = (val / 10) * 100;
    // Because the slider is rotated, use "to right" so that the gradient appears vertical.
    this.style.background = `linear-gradient(to right, ${fillColor} ${fillPercent}%, #ccc ${fillPercent}%, #ccc 100%)`;
}
