
import Vue from 'vue'
import $ from 'jquery'
import timeago from 'timeago.js'
import UserEvents from './componets/user-events.vue'
import UserFollowers from './componets/user-followers.vue'

require('bootstrap/js/dist/tooltip')
require('bootstrap/js/dist/collapse')

Vue.filter('reltime', function (timestr) {
  return new timeago().format(timestr, 'zh_CN')
});
Vue.component('user-events', UserEvents)
Vue.component('user-followers', UserFollowers)

new Vue({ el: '#app' })

$('[data-toggle="tooltip"]').tooltip()
