var IconsWall = require("./iconswall");

function initScreenshotsAnimation() {
  var index = 0;
  var $images = $('#screenshots .screenshot');
  var $image = $images.eq(0);

  function switchNext() {
    ++index;
    $image.removeClass('active');
    if (index >= $images.length) {
      $images.removeClass('visible');
      index = 0;
    } else if (index === $images.length - 1) {
      $image.siblings().removeClass('visible');
    }
    if(index > 0) {
      $image = $images.eq(index);
      $image.addClass('visible active');
    }
  }

  setTimeout(function () {
    setInterval(switchNext, 2000);  
  }, 2000);
  
}

function initLogoAnimation() {
  var options = {
    icons: [
      'sort',
      'translate',
      'folder-lock',
      'folder-multiple-outline',
      'tag-multiple',
      'image',
      'database',
      'gesture-double-tap',
      'magnify',
      'magnify-minus-outline',
      'magnify-plus-outline',
      'checkbox-multiple-marked-outline',
      'windows',
      'language-c',
      'github-circle',
      'star-outline',
      'cube-outline',
      'bug',
      'delete',
      'xml',
      'cake',
      'emoticon',
      'heart',
      'settings',
      'information-outline',
      'sync'
    ],
    colors: ['#f1c40f', '#88ca88', '#ccc', '#A04CF5', '#ea4c89', '#ccc', '#6388d5', '#ccc', '#ccc'],
    maxDistance: 256,
    maxRotation: 1800,
    container: document.getElementById('icons-wall')
  }
  var animation = new IconsWall(options);
  animation.start();
}

initLogoAnimation();
initScreenshotsAnimation();
