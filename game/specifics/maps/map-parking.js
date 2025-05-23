const map = {
    floors: [
        {xPosition: 0, yPosition: 0, width: 620, height: 300, color: '#1A1A1A' }, // Main Parking Lot
        {xPosition: 260, yPosition: 185, width: 100, height: 500, color: '#1A1A1A' }, // Right Truck Filler
        {xPosition: -260, yPosition: 185, width: 100, height: 500, color: '#1A1A1A' }, // Left Truck Filler
        {xPosition: -660, yPosition: 150, width: 700, height: 600, color: '#1A1A1A' }, // Left Truck Aea
        {xPosition: 660, yPosition: 150, width: 700, height: 900, color: '#1A1A1A' }, // Right Truck Aea
    ],
    walls: [
        {from: [310,442], to: [310, 130]}, // Far left wall
        {from: [310,0], to: [310, -152]}, 
        {offset: [-620, 0]},
        {offset: [-620, 0]}, // Complex A Start
        {offset: [0, 250]},
        {offset: [620, 0]},
        {offset: [0, -250]}, // Complex A End
        {from: [-310,440], to: [-310, 190]}, 
        {offset: [-620, 0]},
        {offset: [0, 250]}, // Complex A End
        {offset: [620, 0]}, // Complex A End

    ],
    props: [
        {type: 'DUMPSTER_FRONT', xPosition: -300, yPosition: 145, width: 78, height: 78, angleDegrees: 90, collision: 'wall', shadow: true, hitscan: true }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: -250, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: -180, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: -105, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: -30, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: 45, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: 120, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: 195, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'PARKING_PAINT_LINE', xPosition: 270, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, // box
        {type: 'CAR_RANDOM', xPosition: 230, yPosition: -93, width: 50, height: 83, angleDegrees: 0, collision: 'wall', shadow: true, hitscan: true}, // box
        {type: 'CAR_RANDOM', xPosition: 10, yPosition: -93, width: 50, height: 83, angleDegrees: 0, collision: 'wall', shadow: true, hitscan: true}, // box
        {type: 'BARRIER_1', xPosition: 320, yPosition: 100, width: 78, height: 20, angleDegrees: 0, collision: 'wall',  angleDegrees: 70}, // box
        {type: 'BARRIER_1', xPosition: 320, yPosition: 20, width: 78, height: 20, angleDegrees: 0, collision: 'wall',  angleDegrees: -60}, // box

    ],
    lights: [
    ],
    enemies: [
    ]
}
export default map;