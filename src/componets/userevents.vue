<template>
  <div class="user-event-list-box">
    <ul class="user-event-list">
      <li v-for="event in events">
        <template v-if="event.type == 'IssueCommentEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title">发表评论在 <a v-bind:href="event.payload.issue.html_url" target="_blank" v-bind:title="event.payload.issue.title">{{ event.repo.name }} #{{ event.payload.issue.number }}</a>
            </span>
          </p>
          <div class="body">
            <p class="issue-comment">{{ event.payload.comment.body.split('\n')[0]) }}</p>
          </div>
        </template>
        <template v-if="event.type == 'CreateEvent'">
          <span class="time text-muted">{{ event.created_at | reltime }}</span>
          <span v-if="event.payload.ref_type == 'repository'" class="title">
            创建代码库 <a v-bind:href="'https://github.com/' + event.repo.name" target="_blank">{{ event.repo.name }}</a>
          </span>
          <span v-else class="title">
            为 <a v-bind:href="'https://github.com/' + event.repo.name" target="_blank">{{ event.repo.name }}</a> 创建 <a v-bind:href="'https://github.com/' + event.repo.name + '/tree/' + event.payload.ref" target="_blank">{{ event.payload.ref }}</a> 分支
          </span>
        </template>
        <template v-if="event.type == 'PushEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title">推送 {{ event.payload.commits.length }} 个提交至 <a v-bind:href="'https://github.com/' + event.repo.name" target="_blank">{{ event.repo.name }}</a></span>
          </p>
          <div class="body">
            <p v-for="cmt in event.payload.commits" class="commit-message text-muted" v:title="cmt.message"><a class="commit-url" v-bind:href="'https://github.com/' + event.repo.name + '/commit/' + cmt.sha" target="_blank">{{ cmt.sha.substr(0,7) }}</a> <span>{{ cmt.message.split('\n')[0] }}</span></p>
          </div>
        </template>
      </li>
    </ul>
    <div class="overlay" v-show="!loaded" transition="fade"><div class="spinner-box"><i class="fa fa-spinner fa-spin"></i></div></div>
  </div>
</template>
<style lang="sass">
.fade-transition {
  transition: all .3s ease;
  opacity: 1.0;
}
.fade-enter {
  opacity: 1.0;
}
.fade-leave {
  opacity: 0;
}
.user-event-list-box {
  position: relative;
  .user-event-list {
      padding: 0;
      min-height: 128px;
      position: relative;
      list-style-type: none;
      li {
        margin-bottom: 10px;
      }
      .body {
        border-left: 2px solid #eee;
        padding-left: 8px;
          margin-top: 4px;
      }
      .header, .commit-message, .issue-comment {
        margin: 0;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .commit-url {
        font-family: Menlo, Monaco, Consolas, "Courier New", monospace;;
      }
  }
  .overlay {
      top: 0;
      left: 0;
      z-index: 10;
      width: 100%;
      height: 100%;
      text-align: center;
      position: absolute;
      background: rgba(255,255,255,0.8);
      .spinner-box {
        top: 50%;
        width: 100%;
        position: absolute;
        margin-top: -10px;
      }
      .fa {
        font-size: 18px;
      }
  }
}
</style>
<script>
export default {
  name: 'userevents',

  data () {
    return {
        events: [],
        maxnum: 6,
        loaded: false,
        username: 'lc-soft'
    }
  },

  created () {
    var ctx = this;
    var url = 'https://api.github.com/users/';
    $.ajax({
      type: 'GET',
      url: url + ctx.username +'/events/public',
      success: function (list) {
        var events = [];
        var count = Math.min(list.length, ctx.maxnum);
        for( var i = 0; i < list.length && count > 0; ++i ) {
          var e = list[i];
          switch(e.type) {
          case 'IssueCommentEvent':
          case 'CreateEvent':
          case 'PushEvent':
            events.push(e);
            --count;
            break;
          case 'CommitCommentEvent':
          case 'DeleteEvent':
          case 'DeploymentEvent':
          case 'DeploymentStatusEvent':
          case 'DownloadEvent':
          case 'FollowEvent':
          case 'ForkEvent':
          case 'ForkApplyEvent':
          case 'GistEvent':
          case 'GollumEvent':
          case 'IssuesEvent':
          case 'MemberEvent':
          case 'MembershipEvent':
          case 'PageBuildEvent':
          case 'PublicEvent':
          case 'PullRequestEvent':
          case 'PullRequestReviewCommentEvent':
          case 'ReleaseEvent':
          case 'RepositoryEvent':
          case 'StatusEvent':
          case 'TeamAddEvent':
          case 'WatchEvent':
          default: continue;
          }
        }
        ctx.events = events;
        ctx.loaded = true;
      }
    });
  }
}
</script>