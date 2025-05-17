import { default as System } from '@core/system';

export default class InstructionsSystem extends System {
    constructor() {
        super();

        setTimeout(() => {
            let height = 20;

            this.send('ADD_GUI_RENDERABLE', {
              key: `instructional-line-0`,
              width: 200,
              height: height,
              xPosition: 20,
              yPosition: 200,
              text: 'Instructions ',
              fontSize: 16
            });

            this.send('ADD_GUI_RENDERABLE', {
              key: `instructional-line-1`,
              width: 200,
              height: height,
              xPosition: 20,
              yPosition: 200 + height * 1,
              text: 'Move: W A S D ',
              fontSize: 16
            });

            this.send('ADD_GUI_RENDERABLE', {
              key: `instructional-line-2`,
              width: 200,
              height: height,
              xPosition: 20,
              yPosition: 200 + height * 2,
              text: 'Turn: Mouse',
              fontSize: 16
            });

            this.send('ADD_GUI_RENDERABLE', {
                key: `instructional-line-3`,
                width: 200,
                height: height,
                xPosition: 20,
                yPosition: 200 + height * 3,
                text: 'Shoot: Left Click',
                fontSize: 16
              });
              this.send('ADD_GUI_RENDERABLE', {
                  key: `instructional-line-3`,
                  width: 200,
                  height: height,
                  xPosition: 20,
                  yPosition: 200 + height * 4,
                  text: 'Reload: R',
                  fontSize: 16
                });
        }, 500)
    }
    
    work() {

    }
} 

