;(function( $, window, document, undefined ){

var pluginName = 'morphing',
    defaults   = {
      numVert  : 6,
      spring   : 0.005,
      friction : 0.9,
      radius   : 90,
      fps      :45
    };

// コンストラクタ
function Morphing( el, opts ) {

  this.el        = el;
  this.settings  = $.extend( {}, defaults, opts );
  this._defaults = defaults;
  this._name     = pluginName;
  this.$el       = $(this.el); 
  this.circ      = null;
  this.numVert   = ~~ (Math.random() * 3) + this.settings.numVert;
  this.spring    = Math.random() * 0.015 + this.settings.spring;
  this.friction  = Math.random() * 0.05 + this.settings.friction;
  this.radius    = this.settings.radius;
  this.fps       = this.settings.fps;

  this.init();

}

// Canvas生成
function genCanvas() {
  var $img = $(this.$el).find('img');
  var canvas = document.createElement('canvas');
  if ($img.length > 0) {
    canvas.width  = $img.width();
    canvas.height = $img.height();
    this.$el
      .empty()
      .append( $(canvas) );
    return {
      img      : $img[0],
      canvas   : canvas,
      numVert  : this.numVert,
      spring   : this.spring,
      friction : this.friction,
      radius   : this.radius
    };
  }
  else {
    canvas.width  = $(this.$el).width();
    canvas.height = $(this.$el).height();
    var color = this.$el.css('backgroundColor');
    this.$el
      .css('backgroundColor', 'transparent')
      .append( $(canvas) );
    return {
      img      : false,
      canvas   : canvas,
      numVert  : this.numVert,
      spring   : this.spring,
      friction : this.friction,
      radius   : this.radius,
      color    : color
    };
  }
}

// Morphingクラス
function MorphingCircle(spec) {

  var canvas   = spec.canvas,
      ctx      = canvas.getContext('2d'),
      points   = [],
      x        = canvas.width * 0.5,
      y        = canvas.height * 0.5,
      pattern  = (spec.img) ? ctx.createPattern( spec.img, 'repeat' ) : false,
      mouseX   = 0,
      mouseY   = 0,
      radius   = spec.radius,
      numVert  = spec.numVert,
      spring   = spec.spring,
      friction = spec.friction,
      isImg    = spec.img,
      isMouseInCircle = false;

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
    this.addThetaX = Math.random() * 0.05;
    this.addThetaY = Math.random() * 0.05;
    this.yugami = Math.random() * 24 - 12;
  }

  function drawBall(offsetY) {
    var pt1   = points[numVert - 1],
        pos1X = pt1.posX,
        pos1Y = pt1.posY,
        pt2   = points[0],
        pos2X = pt2.posX,
        pos2Y = pt2.posY;
    ctx.moveTo( (pos1X + pos2X) * 0.5, ((pos1Y + pos2Y) * 0.5) + offsetY );
    for (var i = 0; i < numVert; i++) {
      pt1 = points[i];
      pt2 = points[(i < numVert - 1) ? (i + 1) : 0];
      pos1X = pt1.posX;
      pos1Y = pt1.posY;
      pos2X = pt2.posX;
      pos2Y = pt2.posY;
      ctx.quadraticCurveTo(pos1X, pos1Y + offsetY, (pos1X + pos2X) * 0.5, ((pos1Y + pos2Y) * 0.5) + offsetY);
    }
  }

  this.init = function() {
    var rot = 360 / numVert;
    for (var i = 0; i < numVert; i++) {
      var rad = Math.PI * rot * i / 180;
      points.push( new AnchorPoint2D( radius * Math.cos(rad) + x, radius * Math.sin(rad) + y ) );
    }
  };

  this.update = function() {
    var pt;
    for (var i = 0; i < numVert; i++) {
      pt = points[i];
      var aX = (pt.defX - pt.posX) * spring,
          aY = (pt.defY - pt.posY) * spring,
          vx = pt.vX = (pt.vX + aX) * friction,
          vy = pt.vY = (pt.vY + aY) * friction;
      pt.posX += vx;
      pt.posY += vy;
    }
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.beginPath();
    if (isImg) {
      ctx.fillStyle = pattern;
    }
    else {
      ctx.fillStyle = spec.color;
    }
    drawBall(0);
    ctx.closePath();
    ctx.fill();
  };

  this.addRandomMotion = function(fix) {
    for (var i = 0; i < numVert; i++) {
      var pt = points[i];
      pt.thetaX += pt.addThetaX;
      pt.thetaY += pt.addThetaY;
      pt.defX = pt.baseX + (pt.yugami * Math.sin(pt.thetaX) * fix);
      pt.defY = pt.baseY + (pt.yugami * Math.cos(pt.thetaY) * fix);
    }
  };

  // イベント
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

    isMouseInCircle = (Math.sqrt(dx * dx + dy * dy) <= (radius - 3));

    var oldMouseX = mouseX;
    var oldMouseY = mouseY;

    mouseX = tmpMouseX;
    mouseY = tmpMouseY;

    if (prevInCircle !== isMouseInCircle) {
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
        if (num === 2) {
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

        for (i = 0; i < numVert; i++) {
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

  function getDistance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getIntersection(a, b, c) {

    var vAngle = Math.atan2(b, a);
    var vLen   = Math.sqrt(a * a + b * b);
    var val    = -(a * x + b * y + c) / vLen;

    var vX = Math.cos(vAngle) * val;
    var vY = Math.sin(vAngle) * val;

    vLen = Math.sqrt(vX * vX + vY * vY);

    var r = radius - 5;
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
    } else if (vLen === r) {
      ptArry[0] = [];
      ptArry[0][0] = vX + x;
      ptArry[0][1] = vY + y;
    }

    return ptArry;

  }

}

Morphing.prototype = {

  init: function() {
    this.imgLoad( this.$el.find('img').attr('src') ).done( $.proxy(this.motion, this) );
  },

  imgLoad: function(src) {
    var defer = $.Deferred();
    if (this.$el.find('img').length > 0) {
      var img = document.createElement('img');
      img.src = src;
      img.onload = function() {
        return defer.resolve();
      };
    }
    else {
      return defer.resolve();
    }
    return defer.promise();
  },

  motion: function() {
    this.circ = new MorphingCircle( genCanvas.apply(this) );
    this.circ.init();
    this.circ.update();
    setInterval( $.proxy(this.render, this), 1000 / this.fps );
  },

  render: function() {
    this.circ.addRandomMotion( 0.5 );
    this.circ.update();
  }

};

// プラグイン化
$.fn[ pluginName ] = function ( options ) {
  this.each(function() {
    if ( !$.data(this, 'plugin_' + pluginName) ) {
      $.data( this, 'plugin_' + pluginName, new Morphing( this, options ) );
    }
  });
  return this;
};

})( jQuery, window, document );