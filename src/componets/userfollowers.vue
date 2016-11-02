<template>
  <div class="user-followers">
    <a v-for="follower in followers" transition="bounce" stagger="100" v-bind:href="follower.html_url" target="_blank" class="user-follower animated" v-bind:title="follower.login" data-toggle="tooltip" data-placement="bottom" v-bind:data-title="follower.login">
      <img class="avatar img-circle" v-bind:src="follower.avatar_url">
    </a>
    <a v-bind:href="followers_url" target="_blank" class="btn-more-followers">
      +{{ followers_count - followers.length }}
    </a>
  </div>
</template>
<style lang="sass">
.user-followers {
  text-align: center;
  margin: 20px 0;
  transition: all, .2s;

  .user-follower {
    margin: 0 4px 4px 0;
    display: inline-block;

    .avatar {
      width: 40px;
      height: 40px;
    }
  }
  .btn-more-followers {
    color: #fff;
    padding: 10px;
    line-height: 20px;
    text-decoration: none;
    border-radius: 20px;
    background-color: #20a5fb;
    box-shadow: 0 2px 4px rgba(32,165,250,0.4);

    &:hover {
      box-shadow: 0 2px 8px rgba(32,165,250,0.5);
    }
    &:active {
      background-color: #1f90da;
    }
  }
}
</style>
<script>
export default {
  name: 'userfollowers',

  data () {
    return {
        maxnum: 4,
        loaded: false,
        followers: [],
        followers_count: 0,
        followers_url: '',
        username: 'lc-soft'
    }
  },

  created () {
    var ctx = this;
    var url = 'https://api.github.com/users/';
    var userUrl = url + ctx.username;
    Vue.transition('bounce', {
      enterClass: 'bounceIn',
      leaveClass: 'bounceOut'
    })
    ctx.followers_url = 'https://github.com/'+ ctx.username +'/followers';
    $.getJSON( userUrl, function (user) {
      ctx.followers_count = user.followers;
      var page = Math.ceil(user.followers / 30);
      $.getJSON( userUrl +'/followers?page=' + page, function (followers) {
        var count = Math.min(followers.length, ctx.maxnum);
        ctx.followers = followers.reverse().slice(0, count);
        ctx.loaded = true;
        Vue.nextTick(function () {
          $('.user-followers .user-follower').tooltip();
        });
      });
    });
  }
}
</script>