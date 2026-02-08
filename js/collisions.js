import { achievements } from './achievements.js?v=20260208';

export function handleCollisions(ball, obstacles, playSound, hitSound) {
    let collision = false;
    
    obstacles.forEach(obstacle => {
        // Find the closest point on the obstacle to the ball
        const nearestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
        const nearestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));
        const deltaX = ball.x - nearestX;
        const deltaY = ball.y - nearestY;
        const distance = Math.hypot(deltaX, deltaY);
        
        if (distance < ball.radius) {
            collision = true;
            
            // Simple bounce: decide which way to reflect based on approach angle
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                ball.angle = Math.PI - ball.angle; // bounce horizontally
                
                // Push ball out of obstacle
                if (deltaX > 0) {
                    ball.x = obstacle.x + obstacle.width + ball.radius + 1;
                } else {
                    ball.x = obstacle.x - ball.radius - 1;
                }
            } else {
                ball.angle = -ball.angle; // bounce vertically
                
                // Push ball out of obstacle
                if (deltaY > 0) {
                    ball.y = obstacle.y + obstacle.height + ball.radius + 1;
                } else {
                    ball.y = obstacle.y - ball.radius - 1;
                }
            }
            
            // Reduce speed and add minimal spin on collision
            ball.speed *= 0.8;
            
            // Play hit sound
            playSound(hitSound);
            
            // We no longer manually add spin as it was causing issues
        }
    });
    
    return collision;
}

export function checkWaterHazards(ball, waterHazards, score, waterHazardHits, currentLevelIndex, levels, achievements) {
    if (!waterHazards || waterHazards.length === 0) return false;
    
    for (const hazard of waterHazards) {
        if (ball.x > hazard.x && ball.x < hazard.x + hazard.width && 
            ball.y > hazard.y && ball.y < hazard.y + hazard.height) {
            
            // Ball fell in water - penalty stroke
            score++;
            waterHazardHits++;
            document.getElementById('score').textContent = 'Score: ' + score;
            
            // Reset ball position to starting position of current level
            const config = levels[currentLevelIndex];
            const canvas = document.getElementById('gameCanvas');
            ball.x = config.startXPercent * canvas.width;
            ball.y = config.startYPercent * canvas.height;
            ball.speed = 0;
            ball.spinFactor = 0; // Also reset any spin
            
            // Check for water hazard achievement
            if (waterHazardHits === 1) {
                achievements.unlock('water_hazard');
            }
            
            // Show water hazard message with better visibility and animation
            const message = document.createElement('div');
            message.className = 'fixed left-1/2 transform -translate-x-1/2 bg-blue-800 text-white py-2 px-6 rounded-lg shadow-lg text-lg font-medium animate-bounce z-20';
            message.style.bottom = '90px'; // Position above the bottom buttons
            message.innerText = 'Water hazard! +1 stroke penalty';
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                setTimeout(() => document.body.removeChild(message), 500);
            }, 2000);
            
            return true; // Return true to indicate water hazard hit
        }
    }
    return false; // No water hazard hit
}

export function checkSandBunkers(ball, sandBunkers) {
    if (!sandBunkers || sandBunkers.length === 0) return;
    
    // Check if ball is in a sand bunker
    for (const bunker of sandBunkers) {
        if (ball.x > bunker.x && ball.x < bunker.x + bunker.width && 
            ball.y > bunker.y && ball.y < bunker.y + bunker.height) {
            
            // Apply heavy friction in sand - more realistic physics
            ball.speed *= 0.85; // Increased friction
            
            // Apply slight resistance to movement direction
            if (ball.speed > 0.5) {
                // Add some random drift to simulate uneven sand
                const drift = (Math.random() - 0.5) * 0.03;
                ball.angle += drift;
            }
            
            // Create sand particle effect if speed is sufficient
            if (ball.speed > 1 && window.createSandParticle) {
                for (let i = 0; i < 3; i++) {
                    window.createSandParticle(ball.x, ball.y, bunker.color);
                }
            }
            break;
        }
    }
}
