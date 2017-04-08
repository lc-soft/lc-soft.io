var IconsWall = require("./iconswall");

function initAnimation() {
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

initAnimation();
