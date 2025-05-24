const map = {
    floors: [
        {xPosition: 0, yPosition: 0, width: 620, height: 300, color: '#1A1A1A' }, // Main Parking Lot
        {xPosition: 260, yPosition: 185, width: 100, height: 500, color: '#1A1A1A' }, // Right Truck Filler
        {xPosition: -260, yPosition: 185, width: 100, height: 500, color: '#1A1A1A' }, // Left Truck Filler
        {xPosition: -360, yPosition: 150, width: 200, height: 600, color: '#1A1A1A' }, // Left Truck Aea
        {xPosition: 660, yPosition: 150, width: 700, height: 900, color: '#1A1A1A' }, // Right Truck Aea
    ],
    walls: [
        {from: [310,442], to: [310, 130]}, // Far left wall
        {from: [310,0], to: [310, -152]}, 
        {offset: [-620, 0]},
        {offset: [-120, 0]}, // Complex A Start
        {offset: [0, 250]},
        {offset: [120, 0]},
        {offset: [0, -250]}, // Complex A End
        {from: [-310,440], to: [-310, 190]}, 
        {offset: [-120, 0]},
        {offset: [0, 250]}, // Complex A End
        {offset: [120, 0]}, // Complex A End

    ],
    props: [
        {type: 'BLOOD_POOL_RANDOM', xPosition: -10, yPosition: 190, width: 50, height: 50, angleDegrees: 'random'},
        {type: 'DUMPSTER_FRONT', xPosition: -300, yPosition: 145, width: 78, height: 78, angleDegrees: 90, collision: 'wall', shadow: true, hitscan: true }, 
        {type: 'PARKING_PAINT_LINE', xPosition: -250, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: -180, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: -105, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: -30, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: 45, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: 120, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: 195, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'PARKING_PAINT_LINE', xPosition: 270, yPosition: -93, width: 100, height: 5, angleDegrees: 90 }, 
        {type: 'CAR_RANDOM', xPosition: 230, yPosition: -93, width: 50, height: 83, angleDegrees: 0, collision: 'wall', shadow: true, hitscan: true}, 
        {type: 'CAR_RANDOM', xPosition: 10, yPosition: -93, width: 50, height: 83, angleDegrees: 0, collision: 'wall', shadow: true, hitscan: true}, 
        {type: 'BARRIER_1', xPosition: 320, yPosition: 100, width: 78, height: 20, angleDegrees: 0, collision: 'wall',  angleDegrees: 70}, 
        {type: 'BARRIER_1', xPosition: 320, yPosition: 20, width: 78, height: 20, angleDegrees: 0, collision: 'wall',  angleDegrees: -60}, 
        {type: 'LIGHT_FIXTURE', xPosition: 70, yPosition: 430, width: 30, height: 32, angleDegrees: -90, collision: 'wall' }, //door light
        {type: 'LIGHT_FIXTURE', xPosition: 480, yPosition: 80, width: 30, height: 16, angleDegrees: 180, collision: 'wall' }, // car light
        {type: 'LIGHT_FIXTURE', xPosition: 480, yPosition: 40, width: 30, height: 16, angleDegrees: 180, collision: 'wall' }, // car light

    ],
    lights: [
        {xPosition: 500, yPosition: 30, type: 'cone', radius: 700, angleDegrees: 180, coneDegrees: 50}, 
        {xPosition: 500, yPosition: 70, type: 'cone', radius: 700, angleDegrees: 180, coneDegrees: 50}, 
        {xPosition: 70, yPosition: 422, type: 'cone', radius: 170, angleDegrees: -90, coneDegrees: 180},// door light
    ],
    enemies: [
        {xPosition: 50, yPosition: -50, type: 'normal'},
        {xPosition: -10, yPosition: 190, type: 'normal'},
        {xPosition: -200, yPosition: -50, type: 'normal'},
        {xPosition: -50, yPosition: 400, type: 'normal'},
        {xPosition: -270, yPosition: 80, type: 'normal_fast'},
    ]
}
export default map;