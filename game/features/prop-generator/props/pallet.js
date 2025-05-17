const prop = {
    type: 'PALLET',
    width: 140,
    height: 140,
    parts: [
        // Vertical base beams (beneath slats)
        { x: -40, y: 0, width: 20, height: 100, color: '#3B2618' },
        { x: 0, y: 0, width: 20, height: 100, color: '#3B2618' },
        { x: 40, y: 0, width: 20, height: 100, color: '#3B2618' },

        // Top slats (3 total, evenly spaced)
        { x: 0, y: -30, width: 120, height: 30, color: '#5A3825' },
        { x: 0, y: 0, width: 120, height: 30, color: '#5A3825' },
        { x: 0, y: 30, width: 120, height: 30, color: '#5A3825' },

        // Gaps between slats (to simulate shadow depth)
        { x: 0, y: -15, width: 120, height: 10, color: '#2E1F15' },
        { x: 0, y: 15, width: 120, height: 10, color: '#2E1F15' },
    ]
}
export default prop;