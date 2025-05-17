const prop = {
    type: 'LIGHT_FIXTURE',
    width: 80,
    height: 40,
    parts: [
        // Flat base of the D (mounted side)
        { x: -20, y: 0, width: 40, height: 40, shape: 'rect', color: '#2C2C2C' },      // dark housing
        
        // Rounded part of the D (simulated with a circle)
        { x: 20, y: 0, radius: 20, shape: 'circle', color: '#2C2C2C' },                // dark rounded end

        // Inner diffuser glow
        { x: -20, y: 0, width: 36, height: 30, shape: 'rect', color: '#F3F3F3' },      // inner light area
        { x: 20, y: 0, radius: 16, shape: 'circle', color: '#F3F3F3' },                // rounded light cap

        { x: -10, y: 0, width: 2, height: 30, shape: 'rect', color: '#000000' },
        { x: 0, y: 0, width: 2, height: 30, shape: 'rect', color: '#000000' },
        { x: 10, y: 0, width: 2, height: 30, shape: 'rect', color: '#000000' },
    ]
};

export default prop;