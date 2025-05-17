const prop = {
    type: 'CONE_TOP',
    width: 50,
    height: 50,
    parts: [
        { x: 0, y: 0, width: 49, height: 49, shape: 'rectangle', color: '#D9531E' }, // base
        { x: 0, y: 0, width: 35, height: 35, shape: 'circle', color: '#C74914', borderSize: 1 },          // cone body
        { x: 0, y: 0, width: 28, height: 28, shape: 'circle', color: '#EDEBE6', borderSize: 0 },          // white ring
        { x: 0, y: 0, width: 21, height: 21, shape: 'circle', color: '#C74914', borderSize: 0 },          // cone body
        { x: 0, y: 0, width: 15, height: 15, shape: 'circle', color: 'rgba(0,0,0,1)', borderSize: 0 },        // center hole
    ]
};

export default prop;
