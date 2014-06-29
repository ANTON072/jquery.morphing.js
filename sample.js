var theCanvas = document.querySelector('#canvasOne');

function AnchorPoint2D(x, y) {
  this.vX = 0;
  this.vY = 0;
  this.posX = x;
  this.posY = y;
  this.defX = x;
  this.defY = y;
  this.baseX = x;
  this.baseY = y;
  this.thetaX = 0;
  this.thetaY = 0;
  // this.addThetaX = Math.random() * 0.05 - 0.025;
  // this.addThetaY = Math.random() * 0.05 - 0.025;
  this.addThetaX = Math.random() * 0.05;
  this.addThetaY = Math.random() * 0.05;
  this.yugami = Math.random() * 24 - 12;
};

function MorfingCircle(canvas, w, h, r, numVertices, spring, friction, img) {

  var ctx = theCanvas.getContext('2d');
  var points = [];
  var x = w * 0.5;
  var y = h * 0.5;
  var pattern = ctx.createPattern(img, 'repeat');
  var mouseX = 0;
  var mouseY = 0;
  var isMouseInCircle = false;
  var _r = r;

  this.init = function() {
    var rot = 360 / numVertices;
    for (var i = 0; i < numVertices; i++) {
      var rad = Math.PI * rot * i / 180;
      points.push(new AnchorPoint2D(r * Math.cos(rad) + x, r * Math.sin(rad) + y));
    }
  };

  this.update = function() {
    var pt;
    for (var i = 0; i < numVertices; i++) {
      pt = points[i];
      var aX = (pt.defX - pt.posX) * spring;
      var aY = (pt.defY - pt.posY) * spring;
      var vx = pt.vX = (pt.vX + aX) * friction;
      var vy = pt.vY = (pt.vY + aY) * friction;
      pt.posX += vx;
      pt.posY += vy;
    }

    ctx.clearRect(0, 0, w, h);

    // ctx.fillStyle = ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.fillStyle = pattern;
    drawBall(0);
    ctx.closePath();
    ctx.fill();

  };

  function drawBall(offsetY) {
    var pt1 = points[numVertices - 1];
    var pos1X = pt1.posX;
    var pos1Y = pt1.posY;
    var pt2 = points[0];
    var pos2X = pt2.posX;
    var pos2Y = pt2.posY;
    ctx.moveTo((pos1X + pos2X) * 0.5, ((pos1Y + pos2Y) * 0.5) + offsetY);
    for (var i = 0; i < numVertices; i++) {
      pt1 = points[i];
      pt2 = points[(i < numVertices - 1) ? (i + 1) : 0];
      pos1X = pt1.posX;
      pos1Y = pt1.posY;
      pos2X = pt2.posX;
      pos2Y = pt2.posY;
      ctx.quadraticCurveTo(pos1X, pos1Y + offsetY, (pos1X + pos2X) * 0.5, ((pos1Y + pos2Y) * 0.5) + offsetY);
    }
  }

  this.addRandomMotion = function(fix) {
    for (i = 0; i < numVertices; i++) {
      var pt = points[i];
      pt.thetaX += pt.addThetaX;
      pt.thetaY += pt.addThetaY;
      pt.defX = pt.baseX + (pt.yugami * Math.sin(pt.thetaX) * fix);
      pt.defY = pt.baseY + (pt.yugami * Math.cos(pt.thetaY) * fix);
    }
  }

  function getDistance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  function getIntersection(a, b, c) {

    var vAngle = Math.atan2(b, a);
    var vLen   = Math.sqrt(a * a + b * b);
    var val    = -(a * x + b * y + c) / vLen;

    var vX = Math.cos(vAngle) * val;
    var vY = Math.sin(vAngle) * val;

    vLen = Math.sqrt(vX * vX + vY * vY);

    var r = _r - 5;
    var ptArry = [];


    if (vLen < r) {
      var drad;
      var irad;
      if (vLen > 0) {
        drad = Math.atan2(vY, vX);
        irad = Math.acos(vLen / r);
      } else {
        drad = Math.atan2(b, a);
        irad = Math.PI / 2;
      }

      ptArry[0] = [];
      ptArry[1] = [];

      ptArry[0][0] = x + r * Math.cos(drad + irad);
      ptArry[0][1] = y + r * Math.sin(drad + irad);

      ptArry[1][0] = x + r * Math.cos(drad - irad);
      ptArry[1][1] = y + r * Math.sin(drad - irad);
    } else if (vLen == r) {
      ptArry[0] = [];
      ptArry[0][0] = vX + x;
      ptArry[0][1] = vY + y;
    }

    return ptArry;

  }

  canvas.onmouseover = function(e) {
    var rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  };

  canvas.onmousemove = function(e) {

    var rect = e.target.getBoundingClientRect();
    var tmpMouseX = e.clientX - rect.left;
    var tmpMouseY = e.clientY - rect.top;

    var prevInCircle = isMouseInCircle;
    var dx = tmpMouseX - x;
    var dy = tmpMouseY - y;

    isMouseInCircle = (Math.sqrt(dx * dx + dy * dy) <= (r - 3));

    var oldMouseX = mouseX;
    var oldMouseY = mouseY;

    mouseX = tmpMouseX;
    mouseY = tmpMouseY;

    if (prevInCircle != isMouseInCircle) {
      var dist = getDistance(oldMouseX, oldMouseY, mouseX, mouseY);
      var mouseVecX = mouseX - oldMouseX;
      var mouseVecY = mouseY - oldMouseY;
      var mA = oldMouseY - mouseY;
      var mB = -(oldMouseX - mouseX);
      var mC = -mA * mouseX - mB * mouseY;
      var interSections = getIntersection(mA, mB, mC);
      if (interSections.length > 0) {
        var mCenterX = (mouseX + oldMouseX) * 0.5;
        var mCenterY = (mouseY + oldMouseY) * 0.5;
        var mDistList = [];
        for (var i = 0, num = interSections.length; i < num; i++) {
          dx = mCenterX - interSections[i][0];
          dy = mCenterY - interSections[i][1];
          mDistList[i] = dx * dx + dy * dy;
        }

        var crossPtX = 0;
        var crossPtY = 0;
        if (num == 2) {
          var index = (mDistList[0] < mDistList[1]) ? 0 : 1;
          crossPtX = interSections[index][0];
          crossPtY = interSections[index][1];
        } else {
          crossPtX = interSections[0][0];
          crossPtY = interSections[0][1];
        }

        var str = Math.sqrt(mouseVecX * mouseVecX + mouseVecY * mouseVecY);
        if (str < 2 || str > 3.5) {
          var angle = Math.atan2(mouseVecY, mouseVecX);
          var m = (str < 2) ? 2 : 3.5;
          mouseVecX = Math.cos(angle) * m;
          mouseVecY = Math.sin(angle) * m;
        }

        for (i = 0; i < numVertices; i++) {
          var pt = points[i];
          dx = crossPtX - pt.posX;
          dy = crossPtY - pt.posY;
          dist = Math.sqrt(dx * dx + dy * dy);

          var pow = 10 / dist;
          if (dist > 200) pow = 0.2;
          if (pow > 5) pow = 5;
          if (isNaN(dist)) pow = 0;

          pt.vX += pow * mouseVecX;
          pt.vY += pow * mouseVecY;
        }
      }
    }
  };

}

var circ;

function drawScreen() {
  var numVert = ~~ (Math.random() * 3) + 6;
  var spring = Math.random()*0.015 + 0.005;
  var friction = Math.random() * 0.05 + 0.90;
  var img = document.querySelector('.maccon');
  circ = new MorfingCircle(theCanvas, 200, 200, 78, numVert, spring, friction, img);
  circ.init();
  circ.update();

  var renderInterval = 1000 / 45;
  var renderTimer = window.setInterval(render, renderInterval);

}

function render() {
  circ.addRandomMotion(0.5);
  circ.update();
}

window.onload = function() {
  drawScreen();
};
