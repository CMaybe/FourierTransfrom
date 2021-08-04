let points = [];
let time = 0;
let T = 0;
let dt = 0.01;
let points_wave = [];
let slider;
let points_idx=0;
let isReady = false;
let button;
let path = [];

let fourierX=[];
let fourierY=[];

let preX = -1;
let preY = -1;


var fourierBuffer; 
var graphBuffer; 

function getDistance(p1,p2){
  return Math.sqrt((p1.real-p2.real) * (p1.real-p2.real) + (p1.img-p2.img) * (p1.img-p2.img));
}




function setup() {
  slider = createSlider(1, 100,50,1);
  slider.style('width', '200px');
  slider.input(initFourier);
  createCanvas(900, 1200);
  fourierBuffer = createGraphics(900,700);
  graphBuffer = createGraphics(900,500);
  graphBuffer.translate( graphBuffer.width/2, graphBuffer.height/2);
  initGraph();
  initFourier();
  
}

function initFourier(){
  fourierBuffer.background(10);
  path = []
  time = 0;
}

function initGraph(){
  graphBuffer.background(0);
  graphBuffer.stroke(100,0 , 0);
  graphBuffer.strokeWeight(3);
  graphBuffer.drawingContext.setLineDash([5,5]);
  graphBuffer.line(0,-graphBuffer.height/2,0,graphBuffer.height/2);
  graphBuffer.line(-graphBuffer.width/2,0,graphBuffer.width/2,0);
  graphBuffer.fill(0,255,0);
  graphBuffer.ellipse(0, 0, 20);
}


function draw(){
  drawOrigin();
  if(isReady==true) drawFourier();
  image(graphBuffer,0,0);
  image(fourierBuffer,0,graphBuffer.height);
}

function drawFourier(){
  fourierBuffer.clear();
  fourierBuffer.background(0);
  let p = makeFourier();
  path.push({x:p.x, y:p.y});
  fourierBuffer.stroke(255, 150);
  
  fourierBuffer.stroke(255);
  fourierBuffer.beginShape();
  fourierBuffer.noFill();
  for (let v of path) {
    fourierBuffer.vertex(v.x, v.y);
  }
  fourierBuffer.endShape();
  time += TWO_PI / fourierY.length;
  if (time > TWO_PI) {
    time = 0;
    path.pop();
  }
  
}

function makeFourier() {
  if(isReady==false) return;
  let x = fourierBuffer.width / 2;
  let y = fourierBuffer.height / 2;
  for (let i = 0; i < Math.floor(fourierX.length/(101-slider.value())); i++) {
    let prevx = x;
    let prevy = y;
    let radius = fourierX[i].amp;
    
    let angleX = fourierX[i].phase + time * fourierX[i].freq;
    let angleY = fourierY[i].phase + time * fourierY[i].freq;
    x += radius * cos(angleX);
    y += radius * cos(angleY);

    fourierBuffer.stroke(255, 100);
    fourierBuffer.noFill();
    fourierBuffer.ellipse(prevx, prevy, radius * 2);

    fourierBuffer.stroke(255);
    fourierBuffer.line(prevx, prevy, x, y);
    //ellipse(x, y, 8);
  }
  return {x:x, y:y};
}

function fourierT(data) {
  let N = data.length;
  let fourier = [];
  
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      re += data[n] * cos((TWO_PI * k * n) / N);
      im -= data[n] * sin((TWO_PI * k * n) / N);
    }
    
    re = re / N;
    im = im / N;
    fourier[k] = {
      re: re,
      im: im,
      freq: k,
      amp: sqrt(re * re + im * im),
      phase: atan2(im, re)
    };
  }
  return fourier;
}

function drawOrigin(){
  graphBuffer.stroke(255);
  graphBuffer.strokeWeight(3);
  graphBuffer.drawingContext.setLineDash([0]);
  graphBuffer.beginShape();
  graphBuffer.noFill();
  for (let i = 0; i < points.length; i++) {
    graphBuffer.vertex(points[i].real, points[i].img);
  }
  graphBuffer.endShape();
  isReady = true;
}



function mousePressed() {
  if(mouseY>=graphBuffer.height || mouseX>graphBuffer.width) return true;
  saveFlag = true;
  isReady = false;
  points = []
  points_wave = [];
  points=[];
  path = [];
  x = [];
  y = [];
  fourierX=[];
  fourierY=[];
  fourier_idx = 0;
  clear();
  initGraph();
  initFourier();
  return true;
}

function mouseDragged() {
  if(mouseX <= 1 || mouseY <= 1 || mouseY>=graphBuffer.height || mouseX>graphBuffer.width) return;
  graphBuffer.noStroke()
  graphBuffer.fill(255);
  points.push({real:mouseX - graphBuffer.width/2, img:mouseY - graphBuffer.height/2}); 
}

function mouseReleased(){
  console.log(graphBuffer.height);
  console.log(mouseY);
  console.log(getDistance(points[0],points[points.length-1]));
  if(mouseX <= 1 || mouseY <= 1 || mouseY>=graphBuffer.height || mouseX>graphBuffer.width) return;
  if(points.length<3 || getDistance(points[0],points[points.length-1])<=5){
    let x = [];
    let y = [];
    for (let i = 0; i < points.length; i += 1) {
      x.push(points[i].real);
    }
    for (let i = 0; i < points.length; i += 1) {
      y.push(points[i].img);
    }
    fourierX = fourierT(x);
    fourierY = fourierT(y);
    fourierX.sort((a, b) => b.amp - a.amp);
    fourierY.sort((a, b) => b.amp - a.amp);

    points.push(points[0]); 
    drawOrigin();
    isReady = true;
    return;
  }
  clear();
  points=[];
  path=[];
  initFourier();
  initGraph();
}