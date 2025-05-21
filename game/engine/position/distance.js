export function calculateDistanceBetweenTags(tag1, tag2) {
    return calculateDistanceBetweenPositions(tag1.getXPosition(), tag1.getYPosition(), tag2.getXPosition(), tag2.getYPosition() )
}

export function calculateDistanceBetweenPositions(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
}

