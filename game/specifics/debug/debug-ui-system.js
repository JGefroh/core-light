import { default as System } from '@core/system';

export default class DebugUiSystem extends System {
    constructor() {
        super();
        if (window.location.href.indexOf('debug2') != -1) {
          setTimeout(() => {
              this.send('ADD_GUI_RENDERABLE', {
                  key: `debug-coordinates-viewport`,
                  xPosition: 450,
                  yPosition: 34,
                  text: 'v####x####',
                  fontSize: 10
              });
      
              this.send('ADD_GUI_RENDERABLE', {
                  key: `debug-coordinates-cursor`,
                  xPosition: 450,
                  yPosition: 22,
                  text: 'm####x####',
                  fontSize: 10
              });

              this.addHandler('DEBUG_DATA', (payload) => {
                  if (payload.type == 'cursor') {
                    this.send("GUI_UPDATE_TEXT", { key: 'debug-coordinates-cursor', value: `mc: x${(payload.canvas.xPosition || 0).toFixed(0)}, y${(payload.canvas.yPosition || 0).toFixed(0)}` + ` | mw: x${(payload.world.xPosition || 0).toFixed(0)}, y${(payload.world.yPosition || 0).toFixed(0)}`})
                  }
        
                  if (payload.type == 'viewport') {
                    this.send("GUI_UPDATE_TEXT", { key: 'debug-coordinates-viewport', value: `vw: x${payload.xPosition.toFixed(0)}, y${payload.yPosition.toFixed(0)} | ${payload.width}x${payload.height} | ${payload.scale}x`})
                  }
                }
              );


              let height = 20;

              for (let i = 0; i < 10; i++) {
                this.send('ADD_GUI_RENDERABLE', {
                  key: `debug-line-${i}`,
                  width: 200,
                  height: height,
                  xPosition: 20,
                  yPosition: height * i,
                  text: '',
                  fontSize: 16
                });
              }
              

              this.addHandler('DEBUG_DATA', (data) => {
                if (!data.slowestSystemTime) {
                  return;
                }
                this.send("GUI_UPDATE_TEXT", {
                  key: 'debug-line-1',
                  value: `${data.workTime.toFixed(2)}ms`
                })
                this.send("GUI_UPDATE_TEXT", {
                  key: 'debug-line-2',
                  value: `${data.slowestSystem} - ${data.slowestSystemTime.toFixed(2)}ms | ${data.lastAssignedId}`
                })
              })
          }, 500)
        }
    }
    
    work() {

    }
} 

