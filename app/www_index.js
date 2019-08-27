import Vue from 'vue';
import timeago from 'timeago.js';
import UserEvents from './componets/user-events.vue';
import UserFollowers from './componets/user-followers.vue';

window.$ = window.jQuery = require('jquery/dist/jquery');
require('bootstrap/js/transition');
require('bootstrap/js/tooltip');
require('bootstrap/js/collapse');

Vue.filter('reltime', function (timestr) {
  var date = new timeago();
  return date.format(timestr, 'zh_CN');
});
Vue.component('user-events', UserEvents);
Vue.component('user-followers', UserFollowers);

new Vue({ el: '#app' });

$('.user-profile a[data-toggle="tooltip"]').tooltip();
