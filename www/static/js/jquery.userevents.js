// Author: Liu Chao

;(function ($) {

$.fn.userevents = function (options) {
  var $self = $('<ul class="user-event-list"/>');
  var $overlay = $(['<div class="overlay"><div class="spinner-box">',
                    '<i class="fa fa-spinner fa-spin"></i>',
                    '</div></div>'].join('') );
  var $this = $(this).css('position','relative').append($self, $overlay);
  var defaults = {
    num: 4,
    username: 'test',
    template: '<li><p class="header"><span class="time text-muted"></span> '+
              '<span class="title"></span></p><div class="body"></div></li>'
  };

  function setList(list) {
    var count = Math.min(list.length, options.num);
    for( var i=0; i<list.length && count > 0; ++i ) {
      var item = list[i];
      var $item = $(options.template);
      var $title = $item.find('.title');
      var $body = $item.find('.body');
      var $time = $item.find('.time');
      var repo_url = item.repo.url;
      repo_url = repo_url.replace('api.github.com/repos', 'github.com');
      switch(item.type) {
      case 'CommitCommentEvent':continue;
      case 'CreateEvent':
        var text;
        if( item.payload.ref_type == 'repository' ) {
          text = ['创建代码库 ', '<a href="', repo_url, 
                  '" target="_blank">', item.repo.name, '</a>'];
        } else {
          text = ['为 ', '<a href="', repo_url, '" target="_blank">', 
                  item.repo.name, '</a>', ' 创建 ', '<a href="', 
                  repo_url, '/tree/', item.payload.ref, '" target="_blank">', 
                  item.payload.ref, '</a> 分支'];
        }
        $title.html(text.join(''));
        break;
      case 'DeleteEvent':
      case 'DeploymentEvent':
      case 'DeploymentStatusEvent':
      case 'DownloadEvent':
      case 'FollowEvent':
      case 'ForkEvent':
      case 'ForkApplyEvent':
      case 'GistEvent':
      case 'GollumEvent': continue;
      case 'IssueCommentEvent':
        var issue = item.payload.issue;
        var comment = item.payload.comment;
        var text = ['发表评论在 ', '<a href="', issue.html_url, 
                    '" target="_blank" title="', issue.title,'">', 
                    item.repo.name, '#', issue.number, '</a>'];
        $title.html(text.join(''));
        var $comment = $('<p class="issue-comment"></p>');
        $comment.text(comment.body.split('\n')[0]);
        $body.append($comment);
        break;
      case 'IssuesEvent':
      case 'MemberEvent':
      case 'MembershipEvent':
      case 'PageBuildEvent':
      case 'PublicEvent':
      case 'PullRequestEvent':
      case 'PullRequestReviewCommentEvent':
        continue;
      case 'PushEvent':
        var commits = item.payload.commits;
        var text = ['推送 ', commits.length, ' 个提交至 ',
                    '<a href="', repo_url, '" target="_blank">', 
                    item.repo.name, '</a>'];
        $title.html(text.join(''));
        for( var j=0; j<commits.length; ++j ) {
          var cmt = commits[j];
          var url = cmt.url.replace('api.github.com/repos', 'github.com');
          var msg = cmt.message.split('\n');
          var $msg = $('<span />').text(msg);
          text = ['<p class="commit-message text-muted" title="',
                  cmt.message, '">', '<a class="commit-url"  href="', 
                  url, '" target="_blank">', cmt.sha.substr(0,7),
                  '</a> ', '</p>'];
          var $cmt = $(text.join('')).append($msg);
          $body.append($cmt);
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
