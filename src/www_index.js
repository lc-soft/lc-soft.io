var UserEvents = require('./componets/userevents.vue');
var UserFollowers = require('./componets/userfollowers.vue');

$('#home-jumbotron-particles').particleground({
  dotColor: '#555',
  lineColor: '#666',
  proximity: 80,
  density: 4000
});

Vue.filter('reltime', function (timestr) {
  return moment(timestr, 'YYYY-MM-DDThh:mm:ssZ').fromNow();
});

Vue.component('userevents', UserEvents);
Vue.component('userfollowers', UserFollowers);

new Vue({
    el: 'body'
});
