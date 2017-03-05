import os, sys, urllib2, json
from bs4 import BeautifulSoup

def get_data(username):
	data = {}
	url = 'http://git-awards.com/users/'
	html = urllib2.urlopen(url + username).read()
	soup = BeautifulSoup(html, 'html.parser')
	rows = soup.select('.col-md-9 .row')
	for row in rows:
		ranking = {}
		lang = row.find_all('p')[0].get_text()
		lang = lang.replace(' ranking', '')
		for tr in row.find_all('tr'):
			cols = tr.find_all('td')
			a = cols[0].find('a')
			num = cols[1].find('strong')
			if a:
				href = a.attrs['href']
				if href.find('http') < 0:
					href = 'http://git-awards.com' + href
				field = a.get_text().lower()
			else:
				href = '#'
				field = cols[0].get_text().lower()
			if not num:
				num = cols[1]
			num = num.get_text().replace(' ', '')
			field = field.replace(' ', '').replace(':', '').strip()
			ranking[field] = { 'value': int(num), 'url': href }
		data[lang] = ranking
	if not os.path.exists('_data'):
		os.mkdir('_data')
	f = open('_data/awards.json', 'w')
	f.write(json.dumps(data))
	f.close()

if __name__ == '__main__':
	get_data(sys.argv[1])
