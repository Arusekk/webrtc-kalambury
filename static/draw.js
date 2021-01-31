'use strict';
var picture;

window.addEventListener('load', () => {
  picture = new Picture('gameCanvas');
  drawingArea.prepend(picture.ctx.canvas);
  makeDrawable(picture);
  clearButton.addEventListener('click', _ => {
    picture.clear();
    broadcast(JSON.stringify({type: 'clear'}));
  });
});

function makeDrawable(picture) {
  picture.ctx.canvas.addEventListener('pointerdown', ev => {
    picture.pos = {x : ev.offsetX, y : ev.offsetY};
    picture.isPointerDown = true;
  });

  picture.ctx.canvas.addEventListener('pointermove', ev => {
    if (picture.isPointerDown) {
      handleDraw(ev);
    }
  });

  picture.ctx.canvas.addEventListener('pointerup', handlePointerDown);
  picture.ctx.canvas.addEventListener('pointerleave', handlePointerDown);

  function handleDraw(ev) {
    let line = [picture.pos.x, picture.pos.y, ev.offsetX, ev.offsetY];
    picture.draw(...line);
    picture.pos = {x : ev.offsetX, y : ev.offsetY};
    broadcastLine(line);
  }

  function handlePointerDown(ev) {
    if (picture.isPointerDown) {
      handleDraw(ev);
      picture.isPointerDown = false;
    }
  }

  function broadcastLine(line) {
    broadcast(JSON.stringify({
      type: 'line',
      line,
      color: picture.ctx.strokeStyle,
      size: picture.ctx.lineWidth,
      erase: picture.isErasing()
    }));
  }
}
