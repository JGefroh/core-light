const prop = {
    type: 'CONVEYOR_BELT_TOP',
    width: 160,
    height: 40,
    parts: [
        { x: 0, y: 0, width: 160, height: 40, shape: 'rect', color: '#2D2D2D' },   // belt base
        { x: -78, y: 0, width: 4, height: 40, shape: 'rect', color: '#444444' },      // left rail
        { x: 78, y: 0, width: 4, height: 40, shape: 'rect', color: '#444444' },       // right rail
        { x: -60, y: 0, width: 6, height: 40, shape: 'rect', color: '#555555' },      // roller 1
        { x: -30, y: 0, width: 6, height: 40, shape: 'rect', color: '#555555' },      // roller 2
        { x: 0, y: 0, width: 6, height: 40, shape: 'rect', color: '#555555' },        // roller 3
        { x: 30, y: 0, width: 6, height: 40, shape: 'rect', color: '#555555' },       // roller 4
        { x: 60, y: 0, width: 6, height: 40, shape: 'rect', color: '#555555' }        // roller 5
    ]
};

export default prop;