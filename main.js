
function setPageMetadata() {
    document.title = "Light by Joseph Gefroh";

    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = '/assets/images/favicon.ico';
    document.head.appendChild(link);
}
setPageMetadata();
(function () {
    const ua = navigator.userAgent;
    const isChrome = /Chrome/.test(ua) &&
                     /Google Inc/.test(navigator.vendor) &&
                     !/Edg/.test(ua) &&
                     !/OPR/.test(ua) &&
                     !/Brave/.test(ua);
  
    if (!isChrome && window.location.href.indexOf('forceload') == -1) {
    document.body.style.margin = '0';
    document.body.style.backgroundColor = 'black';
    document.documentElement.style.backgroundColor = 'black';
      document.body.innerHTML = `
        <div style="color: white;font-family:sans-serif;padding:2rem;text-align:center;">
          <h1>Light by Joseph Gefroh</h1>
          <h3>Unsupported Browser</h3>
          <p>Light was designed to work in <b>Google Chrome</b>.</p>
          <p><a href="/?forceload" style="color: white;">Try playing anyways</p>
          <p><a href="https://github.com/jgefroh/core-light" style="color: white;">Github</a></p>
          <hr>
          <h2>Screenshots</h2>
          <hr>
          <img src="/screenshots/screenshot-3.jpg" width="100%"/>
          <hr>
          <img src="/screenshots/screenshot-4.jpg" width="100%"/>
          <hr>
          <img src="/screenshots/screenshot-5.jpg" width="100%"/>
        </div>
      `;
      return; 
    }
  
    runApp(); 
  })();
  
  function runApp() {
    import('@core/component');
    import('@core/tag');
    import('@game/title/font-loader.js');
    import('@game/title/title-screen');
  
  
    function defineCanvas() {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("id", "canvas");
      document.body.appendChild(canvas);
      document.body.style = 'margin: 0px;';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.cursor = 'none';
      canvas.onclick = () => {
        canvas.requestPointerLock();
      };
  
      const offScreenCanvas = document.createElement('canvas');
      offScreenCanvas.setAttribute("id", "canvas-offscreen");
      window.offScreenCanvas = offScreenCanvas;
      offScreenCanvas.width = window.innerWidth;
      offScreenCanvas.height = window.innerHeight;
    }
  
    setPageMetadata();
    defineCanvas();
  }
  