# Light

Light is a 2D top-down zombie shooter game that serves as a tech demo for my  [core-js](https://github.com/jgefroh/core-js) framework.

It is written in pure Javascript w/ Canvas and WebGL2 rendering and no other frameworks.

It's fully playable at http://light.jgefroh.com.

This is not intended to be used in a commercial or production environment - it was just a fun hobby project I wrote.

---

# Screenshots
<img width="2043" src="https://github.com/JGefroh/core-light/blob/main/static/screenshots/title.gif">
<img width="2043" src="https://github.com/JGefroh/core-light/blob/main/static/screenshots/action.gif">
<img width="2037" src="https://github.com/JGefroh/core-light/blob/main/static/screenshots/screenshot-4.jpg">
<img width="2037" src="https://github.com/JGefroh/core-light/blob/main/static/screenshots/screenshot-5.jpg">

-----

# Folder Structure

`/game/engine` contains generic mechanism implementations of generc systems like Rendering, AI, Audio, Collision, etc.
`/game/features` contains game-specific logic such as implementations of AI, weapons, map generation, and special effects.
`/game/specifics` contains a few configuration items.

---

`/main.js` bootstraps the game and primary rendering canvases.
`/game/title/start-game.js` contains the bootstrapping of Core, Systems, and Tags.
