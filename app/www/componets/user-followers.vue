<template>
  <div class="user-followers">
    <transition-group
      name="bounce"
      enter-active-class="animated bounceIn"
      leave-active-class="animated bounceOut"
    >
      <a
        v-for="follower in followers"
        :key="follower.html_url"
        :href="follower.html_url"
        :title="follower.login"
        :data-title="follower.login"
        stagger="100"
        target="_blank"
        class="user-follower animated"
        data-toggle="tooltip"
        data-placement="bottom"
      >
        <img class="avatar rounded-circle" :src="follower.avatar_url">
      </a>
    </transition-group>
    <a
      :href="followers_url"
      :data-title="followers_tip"
      target="_blank"
      class="btn-more-followers"
      data-toggle="tooltip"
      data-placement="bottom"
    >
      {{ followers_count > 0 ? '+' + (followers_count - followers.length) : '...' }}
    </a>
  </div>
</template>
<script>
function fetchUserAvatar(user, callback) {
  const img = document.createElement('img')

  img.onload = () => callback(user)
  img.src = user.avatar_url
}

export default {
  name: 'user-followers',
  data () {
    return {
        maxnum: 4,
        loaded: false,
        followers: [],
        followers_count: -1,
        followers_url: '',
        followers_tip: '',
        username: 'lc-soft'
    }
  },
  created () {
    const url = `https://api.github.com/users/${this.username}`

    this.followers_url = `https://github.com/${this.username}/followers`

    fetch(url)
      .then(res => res.json())
      .then((user) => {
        this.followers_count = user.followers
        this.followers_tip = `共有 ${user.followers} 位粉丝`
      })
      .then(() => {
        fetch(`${url}/followers?page=${Math.ceil(this.followers_count / 30)}`)
          .then(res => res.json())
          .then((followers) => {
            let count = 0
            const total = Math.min(followers.length, this.maxnum)

            followers.slice(followers.length - total).forEach((follower) => {
              fetchUserAvatar(follower, (data) => {
                ++count
                setTimeout(() => {
                  this.followers.push(data)
                  this.$nextTick(() => {
                    $('.user-followers a[data-toggle="tooltip"]').tooltip()
                  })
                }, count * 200)
              })
            })
            this.loaded = true
          })
      })
  }
}
</script>
