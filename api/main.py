import os
from flask import Flask, jsonify, request, abort

app = Flask(__name__)

@app.route('/build', methods=['POST'])
def update():
    data = request.get_json()
    if data['repository']['full_name'] != 'lc-soft/lc-soft.io':
        abort(400)
    log = os.popen('su - liuchao -m -c "sh ./api/build.sh"')
    return jsonify({'log': log.read()})

if __name__ == '__main__':
    app.run()
