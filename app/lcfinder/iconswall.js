module.exports = function (options) {
  var defaults = {
    container: null,
    icons: ['heart', 'heart-broken'],
    colors: ['#eee'],
    maxDistance: 200,
    maxRotation: 800,
    onCreateIcon: function (name) {
      var icon = document.createElement('i');
      icon.classList.add('mdi', 'mdi-' + name);
      icon.title = name;
      return icon;
    }
  };

  var extend = function (base, other) {
    for (var field in other) {
      base[field] = other[field];
    }
    return base;
  }

  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  var easeOutQuart = function (t, b, c, d) {
    return -c * ((t = t / d - 1) * Math.pow(t, 3) - 1) + b;
  };

  var interval = function (callback, delay) {
    var tick = function (now) {
      if (now - start >= delay) {
        start = now;
        callback();
      }
      requestAnimationFrame(tick);
    };
    var start = performance.now();
    requestAnimationFrame(tick);
  };

  var define = function (object, property, value) {
    return Object.defineProperty(object, property, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: true
    });
  };

  var getRandomIcon = function () {
    return ctx.icons[getRandomInt(0, ctx.icons.length)];
  };

  var getRandomY = function (x, min, max) {
    if (Math.abs(x) > min) {
      return getRandomInt(-max, max);
    }
    var minY = Math.sqrt(Math.pow(min, 2) - Math.pow(x, 2));
    var randomSign = Math.round(Math.random()) * 2 - 1;
    return randomSign * getRandomInt(minY, max);
  };

  var createIcon = function (name) {
    var icon = ctx.onCreateIcon(name);
    var i = getRandomInt(0, ctx.colors.length);
    icon.style.color = ctx.colors[i];
    ctx.container.appendChild(icon);
    return icon;
  };

  var animateIcon = function (icon) {
    var time = { total: 12000 };
    var maxDistance = ctx.maxDistance;
    var maxRotation = ctx.maxRotation;
    var transform = {};
    define(transform, "translateX", getRandomInt(-maxDistance, maxDistance));
    define(transform, "translateY", getRandomY(transform.translateX, 60, maxDistance));
    define(transform, "rotate", getRandomInt(-maxRotation, maxRotation));

    var tick = function (now) {
      if (time.start == null) {
        define(time, 'start', now);
      }
      define(time, 'elapsed', now - time.start);
      var progress = easeOutQuart(time.elapsed, 0, 1, time.total);

      icon.style.opacity = Math.abs(1 - progress);
      icon.style.transform = Object.keys(transform).map(function (key) {
        var value = transform[key] * progress;
        var unit = /rotate/.test(key) ? 'deg' : 'px';
        return key + '(' + value + unit + ')';
      }).join(' ');

      if (time.elapsed < time.total) {
        requestAnimationFrame(tick);
      } else {
        ctx.container.removeChild(icon);
      }
    };

    requestAnimationFrame(tick);
  };

  var ctx = this.context = extend(defaults, options);
  this.start = function (speed) {
    if (typeof speed == 'undefined')  {
      speed = 500;
    }
    interval(function () {
      animateIcon(createIcon(getRandomIcon()));
    }, speed);
  };
}
