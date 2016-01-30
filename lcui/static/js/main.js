(function () {
	var hosts = {'lc-soft.io': '', 'localhost':''};
	if( location.hostname in hosts ) {
		return;
	}
	var href = location.href;
	href = href.replace(location.host, 'lc-soft.io');
	href = href.replace('http://', 'https://');
	location.href = href;
})();
