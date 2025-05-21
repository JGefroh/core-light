export function calculateDistanceBetweenTags(tag1, tag2) {
    let dx = tag1.getXPosition() - tag2.getXPosition();
    let dy = tag1.getYPosition() - tag2.getYPosition();

    return Math.sqrt(dx * dx + dy * dy);
}