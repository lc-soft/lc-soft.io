import $ from 'jquery'
import 'timeago'
import 'timeago/locales/jquery.timeago.zh-CN'

function renderIssue(issue) {
  return `<div class="blog-post-issue media ${issue.state}">
  <div class="media-left">
    <a href="${issue.user.html_url}" target="_blank">
      <img
        src="${issue.user.avatar_url}"
        alt="${issue.user.login}"
        class="rounded avatar mr-2"
        width="48"
        height="48"
      >
    </a>
  </div>
  <div class="media-body">
    <h4 class="media-heading">
      <a
        href="${issue.html_url}"
        class="text-dark"
        title="${issue.title}"
        target="_blank"
      >
        ${issue.title}
      </a>
    </h4>
    <div class="text-small text-muted">
      #${issue.number} 由
      <strong>
        <a
          href="${issue.user.html_url}"
          target="_blank"
          class="text-muted"
        >
          ${issue.user.login}
        </a>
      </strong>
      在<span class="timeago" title="${issue.created_at}"></span>打开
    </div>
  </div>
  </div>`
}

$(() => {
  const page = window.page

  if (typeof page === 'undefined' || !page.repo) {
    return
  }

  const url = `https://api.github.com/repos/${page.repo}/issues?state=all`;

  if (page.milestone) {
    url += `&milestone=${page.milestone}`
  }
  fetch(url).then(res => res.json()).then((issues) => {
    $('#issues').append(issues.map(renderIssue).join(''))
    $('.timeago').timeago()
  })
})
