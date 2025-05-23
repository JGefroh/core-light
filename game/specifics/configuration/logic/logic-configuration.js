const configuration = {
    rulesByName: {
        "footstep_trail": {
            conditions: [],
            effects: [
                {type: 'REGISTER_FOOTSTEP_TRAIL_FX', params: {}}
            ],
        },
        "door": {
            conditions: [],
            effects: [
                {type: 'REGISTER_DOOR', params: {}}
            ],
        },
        "dust": {
            conditions: [],
            effects: [
                {type: 'REQUEST_DUST_FX', params: { particleCount: 20, respectAngle: true, particleEmissionCyclesMax: 3}}
            ],
            frequency: 'once'
        }
    },
    entityRules: {
        BLOOD_POOL_1: { rules: ['footstep_trail'] },
        BLOOD_POOL_2: { rules: ['footstep_trail'] },
        BLOOD_POOL_3: { rules: ['footstep_trail'] },
        BLOOD_POOL_4: { rules: ['footstep_trail'] },
        METAL_DOOR: { rules: ['door'] },
        LIGHT_FIXTURE: { rules: ['dust'] }
    }
    
}
export default configuration;