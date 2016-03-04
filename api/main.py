import os
from flask import Flask, jsonify, request, abort

app = Flask(__name__)

@app.route('/update', methods=['POST'])
def update():
    logs = []
    data = request.get_json()
    cmds = ['git pull master', 'jekyll build']
    if data['repository']['full_name'] != 'lc-soft/lc-soft.io':
        abort(400)
    for cmd in cmds:
        log = os.popen('su lc-soft -c %s' % cmd)
        logs.append({'command': cmd, 'output': log.readlines()})
    return jsonify({'logs': logs})

if __name__ == '__main__':
    app.run()
