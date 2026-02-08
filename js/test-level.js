import { levels } from './levels.js';

(() => {
    const storedLevel = sessionStorage.getItem('testLevel');

    if (!storedLevel) {
        alert('Return to the editor and save or select a level to test.');
        window.location.href = 'editor.html';
        return;
    }

    let level;
    try {
        level = JSON.parse(storedLevel);
    } catch (error) {
        console.error('Failed to parse test level data:', error);
        alert('Failed to load test level data. Please return to the editor and select a valid level to test.');
        window.location.href = 'editor.html';
        return;
    }

    level.obstacles = level.obstacles || [];
    level.waterHazards = level.waterHazards || [];
    level.theme = level.theme || { background: '#69b578', borderColor: '#2d6a4f' };
    // Replace contents to preserve the shared levels array reference.
    levels.splice(0, levels.length, level);
})();
