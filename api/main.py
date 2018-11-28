import os
from flask import Flask, jsonify, request, abort

app = Flask(__name__)

@app.route('/build', methods=['POST'])
def update():
    data = request.get_json()
    if data['repository']['full_name'] != 'lc-soft/lc-soft.io':
        abort(400)
    log = os.popen('sh ./api/build.sh')
    return jsonify({'logs': log.readlines()})

if __name__ == '__main__':
    app.run()
