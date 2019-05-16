const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth,
	h = canvas.height = window.innerHeight;

const waves = ["rgba(0,0,0,1)",
           	   "rgba(0,0,0,.7)"]
let i = 0;

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame || 
          window.oRequestAnimationFrame || 
          window.msRequestAnimationFrame || 
          function(callback, element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function setSin(offset, divisor, rad = 0, normal = 0){
	return (Math.sin((offset/divisor) + rad)  + normal) / 2 * 200
}

function draw() {
  canvas.width = w;
  for(let j = waves.length - 1; j >= 0; j--) {
    const offset = i + j * Math.PI * 10;
    ctx.fillStyle = waves[j];

    const randomLeft            = setSin(offset, 700);
    const randomRight           = setSin(offset, 500, 1, 1);
    const randomLeftConstraint  = setSin(offset, 60, 2, 1);
    const randomRightConstraint = setSin(offset, 60, 1, 1);

    ctx.beginPath();

    ctx.moveTo(0, randomLeft + 100);

    ctx.bezierCurveTo(w / 3, randomLeftConstraint, w / 3 * 2, randomRightConstraint, w, randomRight + 100);

    ctx.lineTo(w , h);
    ctx.lineTo(0, h);
    ctx.lineTo(0, randomLeft + 100);

    ctx.closePath();
    ctx.fill();
  }
  i = i + 1;
}
(function animloop(){
    draw();
    requestAnimFrame(animloop, canvas);
})();