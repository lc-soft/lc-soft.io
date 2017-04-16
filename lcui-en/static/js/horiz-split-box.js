(function ($) {

$.fn.horizSplitBox = function() {
  var $box = $(this);
  var $cover = $box.find('.cover');
  var $toggle = $box.find('.toggle-handle');
  var mouseX, toggleLeft, draggable = false;

  function getPageX(e) {
    if (typeof e.pageX == 'undefined' ) {
      return e.touches[0].pageX;
    }
    return e.pageX;
  }
  
  $(document).on('mousemove touchmove', function (e) {
    if (!draggable) {
      return;
    }
    var left = toggleLeft + getPageX(e) - mouseX;
    var width = $toggle.parent().width() - $toggle.width();
    left = Math.max(Math.min(left, width), 0);
    $toggle.css('left', left);
    $cover.css('width', left);
  });

  $(document).on('mouseup touchend', function (e) {
    draggable = false;
    $box.css('user-select', '');
  });

  $toggle.on('mousedown touchstart', function (e) {
    draggable = true;
    mouseX = getPageX(e);
    toggleLeft = $toggle.position().left;
    $box.css('user-select', 'none');
  });

  return $box;
}

})(jQuery);
