import os
from flask import Flask, jsonify, request, abort

app = Flask(__name__)

@app.route('/update', methods=['POST'])
def update():
    log = ''
    data = request.get_json()
    if data['repository']['full_name'] != 'lc-soft/lc-soft.io':
        abort(400)
    for cmd in cmds:
        log = os.popen('su lc-soft -c "sh ./api/update.sh"')
    return jsonify({'log': log})

if __name__ == '__main__':
    app.run()
