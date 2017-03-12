(function ($) {

$.fn.horizSplitBox = function() {
  var $box = $(this);
  var $cover = $box.find('.cover');
  var $toggle = $box.find('.toggle-handle');
  var mouseX, toggleLeft, draggable = false;

  $(document).on({
    mousemove: function (e) {
      if (!draggable) {
        return;
      }
      var left = toggleLeft + e.pageX - mouseX;
      var width = $toggle.parent().width() - $toggle.width();
      left = Math.max(Math.min(left, width), 0);
      $toggle.css('left', left);
      $cover.css('width', left);
    },
    mouseup: function (e) {
      draggable = false;
      $box.css('user-select', '');
    }
  });

  $toggle.on('mousedown', function (e) {
    mouseX = e.pageX;
    draggable = true;
    toggleLeft = $toggle.position().left;
    $box.css('user-select', 'none');
  });

  return $box;
}

})(jQuery);
