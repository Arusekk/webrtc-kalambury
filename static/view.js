'use strict';
var picture;

window.addEventListener('load', () => {
  picture = new Picture('gameCanvas');
  drawingArea.prepend(picture.ctx.canvas);
});

function handleViewMessage(msg) {
  switch (msg.type) {
    case 'line':
      picture.setColor(msg.color);
      picture.setSize(msg.size);
      picture.setErase(msg.erase);
      picture.draw(...msg.line);
      break;
    case 'clear':
      picture.clear();
      break;
    case 'img':
      const img = new Image();
      img.onload = () => picture.ctx.drawImage(img, 0, 0);
      img.src = msg.dataurl;
      break;
    default:
      console.log('Unknown msg type: ', msg.type);
      break;
  }
}
