<template>
  <div class="user-events-wrapper">
    <div v-if="events.length < 1">加载中...</div>
    <ul v-else class="user-events">
      <li v-for="event in events" :key="event.id">
        <template v-if="event.type == 'IssueCommentEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title">
              发表评论在
              <a
                :href="event.payload.comment.html_url"
                :title="event.payload.issue.title"
                target="_blank"
              >
                {{ event.repo.name }} #{{ event.payload.issue.number }}
              </a>
            </span>
          </p>
          <div class="body">
            <p class="issue-comment" :title="event.payload.comment.body">
              {{ event.payload.comment.body }}
            </p>
          </div>
        </template>
        <template v-if="event.type == 'IssuesEvent'">
          <p class="header">
            <span class="time text-muted">
              {{ event.created_at | reltime }}
            </span>
            <span class="title">
              <span v-if="event.payload.action == 'opened'">反馈</span>
              <span v-if="event.payload.action == 'closed'">关闭</span>
              了一个问题在
              <a
                :href="'https://github.com/' + event.repo.name"
                :title="event.repo.name"
                target="_blank"
              >
                {{ event.repo.name }}
              </a>
            </span>
          </p>
          <div class="body">
            <p class="issue-title" :title="event.payload.issue.title">
              <a
                :href="event.payload.issue.html_url"
                :title="'#' + event.payload.issue.number"
                target="_blank"
              >
                #{{ event.payload.issue.number }}
              </a>
              {{ event.payload.issue.title }}
            </p>
          </div>
        </template>
        <template v-if="event.type == 'PullRequestEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title">
              <span v-if="event.payload.action == 'opened'">发起</span>
              <span v-if="event.payload.action == 'closed'">关闭</span>
              合并请求在
              <a
                :href="'https://github.com/' + event.repo.name"
                target="_blank" :title="event.repo.name"
              >
                {{ event.repo.name }}
              </a>
            </span>
          </p>
          <div class="body">
            <p class="pull-request-title" :title="event.payload.pull_request.title">
              <a
                :href="event.payload.pull_request.html_url"
                :title="'#' + event.payload.pull_request.number"
                target="_blank"
              >
                #{{ event.payload.pull_request.number }}
              </a>
              {{ event.payload.pull_request.title }}
            </p>
            <div class="pull-request-stats">
              包含 <em>{{ event.payload.pull_request.commits }}</em> 个提交，共新增
              <em>{{ event.payload.pull_request.additions }}</em> 行，删除
              <em>{{ event.payload.pull_request.deletions }}</em> 行
            </div>
          </div>
        </template>
        <template v-if="event.type == 'CreateEvent'">
          <span class="time text-muted">{{ event.created_at | reltime }}</span>
          <span v-if="event.payload.ref_type == 'repository'" class="title">
            创建代码库 <a :href="'https://github.com/' + event.repo.name" target="_blank">{{ event.repo.name }}</a>
          </span>
          <span v-else class="title">
            为 <a :href="'https://github.com/' + event.repo.name" target="_blank">{{ event.repo.name }}</a> 创建 <a :href="'https://github.com/' + event.repo.name + '/tree/' + event.payload.ref" target="_blank">{{ event.payload.ref }}</a> 分支
          </span>
        </template>
        <template v-if="event.type == 'PushEvent'">
          <p class="header">
            <span class="time text-muted">{{ event.created_at | reltime }}</span>
            <span class="title">
              推送 {{ event.payload.size }} 个提交至
              <a :href="'https://github.com/' + event.repo.name" target="_blank">
                {{ event.repo.name }}
              </a>
              的
              <a :href="'https://github.com/' + event.repo.name + '/tree/' + event.payload.ref.substr(11)" target="_blank">
                {{ event.payload.ref.substr(11) }}
              </a>
              分支
            </span>
          </p>
          <div class="body">
            <p
              v-for="cmt in event.payload.commits.slice(0,2)"
              :key="cmt.sha"
              :title="cmt.message"
              class="commit-message text-muted"
            >
              <a
                class="commit-url"
                :href="'https://github.com/' + event.repo.name + '/commit/' + cmt.sha" target="_blank"
              >
                {{ cmt.sha.substr(0,7) }}
              </a>
              <span>{{ cmt.message.split('\n')[0] }}</span>
            </p>
            <p v-if="event.payload.commits.length > 1" >
              <a :href="'https://github.com/'+ event.repo.name + '/compare/' + event.payload.before.substr(0,10) + '...' + event.payload.head.substr(0,10)" target="_blank">
                <template v-if="event.payload.commits.length > 2">
                  以及 {{ event.payload.size - 2 }} 个提交 »
                </template>
                <template v-else>比较这 2 个提交 »</template>
              </a>
            </p>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'user-events',
  data () {
    return {
        events: [],
        maxnum: 6,
        loaded: false,
        username: 'lc-soft'
    }
  },
  created () {
    fetch(`https://api.github.com/users/${this.username}/events/public`)
      .then(res => res.json())
      .then((list) => {
        const events = []
        let count = Math.min(list.length, this.maxnum)

        for (let i = 0; i < list.length && count > 0; ++i) {
          switch(list[i].type) {
          case 'PullRequestEvent':
          case 'IssueCommentEvent':
          case 'CreateEvent':
          case 'PushEvent':
          case 'IssuesEvent':
            events.push(list[i]);
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
        this.events = events
        this.loaded = true
      })
  }
}
</script>
