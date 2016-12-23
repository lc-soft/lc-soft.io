<template>
  <div class="user-event-list-box">
    <ul class="user-event-list">
      <li v-for="event in events">
        <template v-if="event.type == 'IssueCommentEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title">发表评论在 <a v-bind:href="event.payload.comment.html_url" target="_blank" v-bind:title="event.payload.issue.title">{{ event.repo.name }} #{{ event.payload.issue.number }}</a>
            </span>
          </p>
          <div class="body">
            <p class="issue-comment" v-bind:title="event.payload.comment.body">{{ event.payload.comment.body }}</p>
          </div>
        </template>
        <template v-if="event.type == 'IssuesEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title"><span v-if="event.payload.action == 'opened'">反馈</span><span v-if="event.payload.action == 'closed'">关闭</span>了一个问题在 <a v-bind:href="'https://github.com/' + event.repo.name" target="_blank" v-bind:title="event.repo.name">{{ event.repo.name }}</a>
            </span>
          </p>
          <div class="body">
            <p class="issue-title" v-bind:title="event.payload.issue.title">
              <a v-bind:href="event.payload.issue.html_url" target="_blank" v-bind:title="'#' + event.payload.issue.number">#{{ event.payload.issue.number }}</a> {{ event.payload.issue.title }}
            </p>
          </div>
        </template>
        <template v-if="event.type == 'PullRequestEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title"><span v-if="event.payload.action == 'opened'">发起</span><span v-if="event.payload.action == 'closed'">关闭</span>合并请求在 <a v-bind:href="'https://github.com/' + event.repo.name" target="_blank" v-bind:title="event.repo.name">{{ event.repo.name }}</a>
            </span>
          </p>
          <div class="body">
            <p class="pull-request-title" v-bind:title="event.payload.pull_request.title">
              <a v-bind:href="event.payload.pull_request.html_url" target="_blank" v-bind:title="'#' + event.payload.pull_request.number">#{{ event.payload.pull_request.number }}</a> {{ event.payload.pull_request.title }}
            </p>
            <div class="pull-request-stats">包含 <em>{{ event.payload.pull_request.commits }}</em> 个提交，共新增 <em>{{ event.payload.pull_request.additions }}</em> 行，删除 <em>{{ event.payload.pull_request.deletions }}</em> 行</div>
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
            <span class="title">推送 {{ event.payload.size }} 个提交至 <a v-bind:href="'https://github.com/' + event.repo.name" target="_blank">{{ event.repo.name }}</a></span>
          </p>
          <div class="body">
            <p v-for="cmt in event.payload.commits.slice(0,2)" class="commit-message text-muted" v-bind:title="cmt.message"><a class="commit-url" v-bind:href="'https://github.com/' + event.repo.name + '/commit/' + cmt.sha" target="_blank">{{ cmt.sha.substr(0,7) }}</a> <span>{{ cmt.message.split('\n')[0] }}</span></p>
            <p v-if="event.payload.commits.length > 1" ><a v-bind:href="'https://github.com/'+ event.repo.name + '/compare/' + event.payload.before.substr(0,10) + '...' + event.payload.head.substr(0,10)" target="_blank"><template v-if="event.payload.commits.length > 2">以及 {{ event.payload.size - 2 }} 个提交 »</template><template v-else>比较这 2 个提交 »</template></a></p>
          </div>
        </template>
      </li>
    </ul>
    <div class="overlay" v-show="!loaded" transition="fade"><div class="spinner-box"><i class="icon-spinner spin"></i></div></div>
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
      transition: height, .5s;
      list-style-type: none;
      li {
        margin-bottom: 10px;
      }
      .body {
        border-left: 2px solid #eee;
        padding-left: 8px;
          margin-top: 4px;
      }
      .header, .commit-message, .issue-comment, .pull-request-title {
        margin: 0;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .commit-url {
        font-family: Menlo, Monaco, Consolas, "Courier New", monospace;;
      }
      .pull-request-stats {
        padding: 2px 8px;
        border-radius: 3px;
        margin: 5px 0 2px 0;
        display: inline-block;
        color: rgba(0,0,0,0.5);
        background-color: #f0f0f0;
        em {
          font-style: normal;
          font-weight: bold;
        }
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
      .icon-spinner {
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
          case 'PullRequestEvent':
          case 'IssueCommentEvent':
          case 'CreateEvent':
          case 'PushEvent':
          case 'IssuesEvent':
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
          case 'MemberEvent':
          case 'MembershipEvent':
          case 'PageBuildEvent':
          case 'PublicEvent':
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