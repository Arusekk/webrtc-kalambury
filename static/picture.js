'use strict';
class Picture {
  constructor(canvasId, width = 800, height = 700) {
    let canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');
    this.isPointerDown = false;
    this.pos = {x : 0, y : 0};

    canvas.id = canvasId;
    canvas.width = width;
    canvas.height = height;
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';
  }

  draw(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  setColor(color) {
    this.ctx.strokeStyle = color;
  }

  setSize(size) {
    this.ctx.lineWidth = size;
  }

  setErase(state) {
    this.ctx.globalCompositeOperation = state
      ? 'destination-out'
      : 'source-over';
  }

  isErasing() {
    return this.ctx.globalCompositeOperation == 'destination-out';
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}
