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
        }
    },
    entityRules: {
        BLOOD_POOL_1: { rules: ['footstep_trail'] },
        BLOOD_POOL_2: { rules: ['footstep_trail'] },
        BLOOD_POOL_3: { rules: ['footstep_trail'] },
        BLOOD_POOL_4: { rules: ['footstep_trail'] },
        METAL_DOOR: { rules: ['door'] }
    }
    
}
export default configuration;