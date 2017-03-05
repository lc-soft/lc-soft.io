import os, sys, urllib2, json

def get_stats(username):
	html_url = 'https://github.com/search?q='
	api_url = 'https://api.github.com/search/issues?q='
	excludes = '+-repo:lc-soft/LCUI+-repo:lc-soft/LC-Finder'
	params = (api_url, username, excludes)
	involves_url = '%sinvolves:%s%s' % params
	pulls_url = '%sauthor:%s+type:pr%s' % params
	issues_url = '%sauthor:%s+type:issue%s' % params
	involves_str = urllib2.urlopen(involves_url).read()
	issues_str = urllib2.urlopen(issues_url).read()
	pulls_str = urllib2.urlopen(pulls_url).read()
	involves = json.loads(involves_str)
	issues = json.loads(issues_str)
	pulls = json.loads(pulls_str)
	data = {
		'username': username,
		'pulls_count': pulls['total_count'],
		'involves_count': involves['total_count'],
		'issues_count': issues['total_count'],
		'pulls_url': pulls_url.replace(api_url, html_url),
		'involves_url': involves_url.replace(api_url, html_url),
		'issues_url': issues_url.replace(api_url, html_url)
	}
	if not os.path.exists('_data'):
		os.mkdir('_data')
	f = open('_data/github.json', 'w')
	f.write(json.dumps(data))
	f.close()

if __name__ == '__main__':
	get_stats(sys.argv[1])
