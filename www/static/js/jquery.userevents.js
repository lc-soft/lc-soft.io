// Author: Liu Chao

;(function ($) {

$.fn.userevents = function (options) {
  var $self = $('<ul class="user-event-list"/>');
  var $overlay = $(['<div class="overlay">',
                    '<i class="fa fa-spinner fa-spin"></i>',
                    '</div>'].join('') );
  var $this = $(this).css('position','relative').append($self, $overlay);
  var defaults = {
    num: 4,
    username: 'test',
    template: '<li><span class="time text-muted"></span><p class="title"></p>'+
              '<div class="content"></div></li>'
  };

  function setList(list) {
    var count = list.length > options.num ? options.num:list.length;
    for( var i=0; i<list.length && count > 0; ++i ) {
      var item = list[i];
      var $item = $(options.template);
      var $title = $item.find('.title');
      var $content = $item.find('.content');
      var $time = $item.find('.time');
      console.log(item);
      switch(item.type) {
      case 'CommitCommentEvent':
      case 'CreateEvent':
      case 'DeleteEvent':
      case 'DeploymentEvent':
      case 'DeploymentStatusEvent':
      case 'DownloadEvent':
      case 'FollowEvent':
      case 'ForkEvent':
      case 'ForkApplyEvent':
      case 'GistEvent':
      case 'GollumEvent':
      case 'IssueCommentEvent':
      case 'IssuesEvent':
      case 'MemberEvent':
      case 'MembershipEvent':
      case 'PageBuildEvent':
      case 'PublicEvent':
      case 'PullRequestEvent':
      case 'PullRequestReviewCommentEvent':
        continue;
      case 'PushEvent':
        var url = item.repo.url;
        var commits = item.payload.commits;
        url = url.replace('api.github.com/repos', 'github.com');
        var text = ['推送 ', commits.length, ' 个提交至 ',
                    '<a href="', url, '" target="_blank">', 
                    item.repo.name, '</a>'];
        $title.html(text.join(''));
        for( var j=0; j<commits.length; ++j ) {
          var cmt = commits[j];
          url = cmt.url.replace('api.github.com/repos', 'github.com');
          text = ['<p class="commit-message text-muted">', 
                  '<a class="commit-url"  href="', url, 
                  '" target="_blank">', cmt.sha.substr(0,7),
                  '</a> ', cmt.message, '</p>'];
          $content.append(text.join(''));
        }
        break;
      case 'ReleaseEvent':
      case 'RepositoryEvent':
      case 'StatusEvent':
      case 'TeamAddEvent':
      case 'WatchEvent':
      default: continue;
      }
      $time.text(moment(item.created_at, 'YYYY-MM-DDThh:mm:ssZ').fromNow());
      $self.append($item);
      count -= 1;
    }
    $overlay.fadeOut();
  }

  function onError() {

  }

  var options = $.extend({}, defaults, options);
  var url = 'https://api.github.com/users/';
  url += options.username + '/events/public';
  $.ajax({
    type: 'GET',
    url: url,
    success: setList,
    error: onError
  });
  
}

})(jQuery);
