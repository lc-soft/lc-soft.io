
var timeago = require("timeago.js");
var UserEvents = require('./componets/userevents.vue');
var UserFollowers = require('./componets/userfollowers.vue');

Vue.filter('reltime', function (timestr) {
  var date = new timeago();
  return date.format(timestr, 'zh_CN');
});

Vue.component('userevents', UserEvents);
Vue.component('userfollowers', UserFollowers);

new Vue({
  el: 'body'
});

$('.user-profile .links a[data-toggle="tooltip"]').tooltip();
$('.github-achievements a[data-toggle="tooltip"]').tooltip();
