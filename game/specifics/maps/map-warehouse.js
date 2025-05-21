const map = {
    floors: [
        {xPosition: 300, yPosition: -100, width: 630, height: 400, color: '#273746' }, // warehouse
        {xPosition: 130, yPosition: -370, width: 60, height: 150, color: '#808080' }, // truck
        {xPosition: 490, yPosition: -370, width: 60, height: 150, color: '#808080' }, // truck
        {xPosition: 490, yPosition: -295, width: 60, height: 5, color: '#1A1A1A' }, // truck entry
        {xPosition: 130, yPosition: -295, width: 60, height: 5, color: '#1A1A1A' }, // truck entry
        // INTRO AREA
        {xPosition: 310, yPosition: -450, width: 300, height: 300, color: '#1A1A1A' },
        {xPosition: 490, yPosition: -560, width: 75, height: 75, color: '#1A1A1A' },
        {xPosition: 130, yPosition: -560, width: 75, height: 75, color: '#1A1A1A' },

    ],
    walls: [
        {from: [0,0], to: [0, -300]},
        {offset: [100, 0]},
        {offset: [0, -150], color: '#808080', size: 8}, // Left truck
        {offset: [60, 0], color: '#808080', size: 8},
        {offset: [0, 150], color: '#808080', size: 8},
        {offset: [120, 0]}, // Center Top Wall
        {offset: [60, 0], clear: true}, // Center Top Wall
        {offset: [120, 0]}, // Center Top Wall
        {offset: [0, -150], color: '#808080', size: 8}, // Right truck
        {offset: [60, 0], color: '#808080', size: 8},
        {offset: [0, 150], color: '#808080', size: 8},
        {offset: [100, 0]},
        {offset: [0, 390]},
        {offset: [-620, 0]},
        {offset: [0, -90]},

        // INTRO AREA
        {from: [90, -449], to: [90, -600]},
        {offset: [440, 0]},
        {offset: [0, 150]},
    ],
    props: [
        {type: 'METAL_SHELF_TOP', xPosition: 130, yPosition: -100, width: 40, height: 150, shadow: true, collision: 'wall', hitscan: true }, //shelf
        {type: 'FLOOR_PAINT_CAUTION', xPosition: 80, yPosition: -270, width: 100, height: 80, },
        {type: 'FLOOR_PAINT_CAUTION', xPosition: 440, yPosition: -270, width: 100, height: 80, },

        // INTRO AREA
        {type: 'TRUCK_CABIN_TOP', xPosition: 490, yPosition: -490, width: 100, height: 80, collision: 'wall', hitscan: true},
        {type: 'TRUCK_CABIN_TOP', xPosition: 130, yPosition: -490, width: 100, height: 80, collision: 'wall', hitscan: true},
        {type: 'METAL_DOOR', xPosition: 310, yPosition: -300, width: 60, height: 4, collision: 'wall', hitscan: true, shadow: true},
        {type: 'BLOOD_POOL_1', xPosition: 310, yPosition: -270, width: 50, height: 50, angleDegrees: 'random'},

        // Intro - Right Truck Zone
        {type: 'CONE_TOP', xPosition: 430, yPosition: -450, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 442, yPosition: -410, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 436, yPosition: -373, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 430, yPosition: -333, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        
        // Intro - Left Truck Zone
        {type: 'CONE_TOP', xPosition: 180, yPosition: -440, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 187, yPosition: -410, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 190, yPosition: -365, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 205, yPosition: -323, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'BLOOD_POOL_1', xPosition: 210, yPosition: -200, width: 50, height: 50, angleDegrees: 'random'},

        {type: 'CARDBOARD_BOX', xPosition: 130, yPosition: -80, width: 20, height: 20, angleDegrees: 45, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX', xPosition: 130, yPosition: -120, width: 20, height: 20, angleDegrees: 98 }, // box
        {type: 'CONE_TOP', xPosition: 207, yPosition: -60, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'CONE_TOP', xPosition: 165, yPosition: -40, width: 20, height: 20, angleDegrees: 'random', collision: 'wall'}, // box
        {type: 'METAL_SHELF_TOP', xPosition: 240, yPosition: -100, width: 40, height: 150, shadow: true, collision: 'wall', hitscan: true }, //shelf
        {type: 'METAL_SHELF_TOP', xPosition: 240, yPosition: -260, width: 30, height: 70, shadow: true, collision: 'wall', hitscan: true }, //thin shelf
        {type: 'PALLET', xPosition: 340, yPosition: -100, width: 60, height: 60, angleDegrees: 'random' }, // pallet
        {type: 'PALLET', xPosition: 340, yPosition: -190, width: 60, height: 60, angleDegrees: 'random' }, //pallet
        {type: 'PALLET', xPosition: 340, yPosition: -10, width: 60, height: 60 }, // pallet
        {type: 'CARDBOARD_BOX', xPosition: 340, yPosition: 0, width: 20, height: 20, collision: 'wall' }, // box
        {type: 'CARDBOARD_BOX', xPosition: 340, yPosition: -20, width: 20, height: 20, collision: 'wall' }, // box
        {type: 'METAL_SHELF_TOP', xPosition: 450, yPosition: -200, width: 30, height: 100, shadow: true, collision: 'wall', hitscan: true }, //thin shelf
        {type: 'CARDBOARD_BOX', xPosition: 450, yPosition: -225, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX', xPosition: 450, yPosition: -200, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'METAL_SHELF_TOP', xPosition: 450, yPosition: -50, width: 30, height: 100, shadow: true, collision: 'wall', hitscan: true }, //thin shelf
        {type: 'METAL_SHELF_TOP', xPosition: 530, yPosition: -50, width: 30, height: 100, shadow: true, collision: 'wall', hitscan: true }, //thin shelf
        {type: 'CARDBOARD_BOX', xPosition: 530, yPosition: -20, width: 20, height: 20 }, // box
        {type: 'CARDBOARD_BOX', xPosition: 530, yPosition: -50, width: 20, height: 20 }, // box
        {type: 'CARDBOARD_BOX', xPosition: 530, yPosition: -80, width: 20, height: 20 }, // box
        {type: 'CONVEYOR_BELT_TOP', xPosition: 600, yPosition: -210, width: 160, height: 30, angleDegrees: 90, collision: 'wall' }, // box
        {type: 'CONVEYOR_BELT_TOP', xPosition: 600, yPosition: -50, width: 160, height: 30, angleDegrees: 90, collision: 'wall'}, // box
        {type: 'CARDBOARD_BOX', xPosition: 600, yPosition: 0, width: 20, height: 20 }, // box
        {type: 'PALLET', xPosition: 580, yPosition: 55, width: 60, height: 60, angleDegrees: 0 }, // pallet
        {type: 'CARDBOARD_BOX', xPosition: 575, yPosition: 55, width: 40, height: 20, angleDegrees: 'random', collision: 'wall' }, // box
        {type: 'LIGHT_FIXTURE', xPosition: 340, yPosition: 80, width: 30, height: 20, angleDegrees: -90, collision: 'wall' }, 
        {type: 'LIGHT_FIXTURE', xPosition: 20, yPosition: -288, width: 30, height: 20, angleDegrees: 45, collision: 'wall' }, 

        // Truck contents
        {type: 'CARDBOARD_BOX', xPosition: 505, yPosition: -370, width: 20, height: 20 }, // box
        {type: 'CARDBOARD_BOX', xPosition: 120, yPosition: -420, width: 30, height: 20, angleDegrees: 90, collision: 'wall' }, // box
        {type: 'CARDBOARD_BOX', xPosition: 140, yPosition: -420, width: 30, height: 20, angleDegrees: 90, collision: 'wall' }, // box
        {type: 'CARDBOARD_BOX', xPosition: 120, yPosition: -390, width: 20, height: 20, angleDegrees: 90, collision: 'wall' }, // box
        {type: 'CARDBOARD_BOX', xPosition: 140, yPosition: -390, width: 20, height: 20, angleDegrees: 90, collision: 'wall' }, // box
        {type: 'METAL_VENT_TOP', xPosition: 620, yPosition: -270, width: 16, height: 32, collision: 'wall' },

        {type: 'METAL_SHELF_FRONT', xPosition: 60, yPosition: 30, width: 80, height: 80, collision: 'wall', angleDegrees: 20 },

        // Litter
        {type: 'CARDBOARD_BOX_FLAT_RANDOM', xPosition: 30, yPosition: -40, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX_FLAT_RANDOM', xPosition: 45, yPosition: -200, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX_FLAT_RANDOM', xPosition: 140, yPosition: 50, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX_FLAT_RANDOM', xPosition: 140, yPosition: 60, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX_FLAT_RANDOM', xPosition: 400, yPosition: 60, width: 20, height: 20, angleDegrees: 'random' }, // box
        {type: 'CARDBOARD_BOX_FLAT_RANDOM', xPosition: 550, yPosition: -240, width: 20, height: 20, angleDegrees: 'random' }, // box
    ],
    lights: [
        {xPosition: 15, yPosition: -300, type: 'cone', radius: 300, angleDegrees: 45, coneDegrees: 50},
        {xPosition: 15, yPosition: -300, type: 'point', radius: 10, angleDegrees: 45},
        {xPosition: 340, yPosition: 80, type: 'cone', radius: 130, angleDegrees: -90, coneDegrees: 130},

        // INTRO AREA
        {xPosition: 300, yPosition: -600, type: 'point', radius: 400},
    ],
    enemies: [
        {xPosition: 40, yPosition: -50, type: 'normal'},
        {xPosition: 115, yPosition: -330, type: 'normal_fast'}, // Left Truck
        {xPosition: 130, yPosition: -330, type: 'normal_fast'}, // Left Truck
        {xPosition: 145, yPosition: -330, type: 'normal_fast'}, // Left Truck
        {xPosition: 115, yPosition: -310, type: 'normal_fast'}, // Left Truck
        {xPosition: 130, yPosition: -310, type: 'normal_fast'}, // Left Truck
        {xPosition: 145, yPosition: -310, type: 'normal_fast'}, // Left Truck
        {xPosition: 550, yPosition: 0, type: 'normal_fast'},
        {xPosition: 210, yPosition: -20, type: 'normal_fast'},
        {xPosition: 180, yPosition: -250},
        {xPosition: 500, yPosition: 20},
        {xPosition: 500, yPosition: -200},
        {xPosition: 300, yPosition: -30, type: 'normal'},
        {xPosition: 490, yPosition: -30},
        {xPosition: 300, yPosition: -150, type: 'normal'},
        {xPosition: 490, yPosition: -400, type: 'swarm'},
        {xPosition: 490, yPosition: -390, type: 'swarm'},
        {xPosition: 490, yPosition: -430, type: 'normal_fast'},
        {xPosition: 480, yPosition: -390, type: 'swarm_fast'},
        {xPosition: 480, yPosition: -360, type: 'swarm'},
        {xPosition: 470, yPosition: -400, type: 'swarm_fast'},
        {xPosition: 480, yPosition: -400, type: 'swarm'},
        {xPosition: 470, yPosition: -350, type: 'swarm_fast'},
        {xPosition: 480, yPosition: -330, type: 'armored'},
    ]
}
export default map;