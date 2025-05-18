const prop = {
    type: 'METAL_VENT_TOP',
    width: 100,
    height: 100,
    parts: [
        // Outer metal frame
        { x: 0, y: 0, width: 100, height: 80, color: '#888888' },

        // Interior cavity (darker)
        { x: 0, y: 0, width: 100, height: 60, color: '#555555' },

        // Diagonal bar: top-left to bottom-right (/)
        { x: 0, y: 0, width: 1, height: 100, color: '#888888', angleDegrees: 65, borderSize: 0 },

        // Diagonal bar: bottom-left to top-right (\)
        { x: 0, y: 0, width: 1, height: 100, color: '#888888', angleDegrees: -65, borderSize: 0 },
    ]
};
export default prop;