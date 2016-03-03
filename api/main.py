import os
from flask import Flask, jsonify, request, abort

app = Flask(__name__)

@app.route('/update', methods=['POST'])
def update():
    data = request.get_json()
    if data['repository']['full_name'] != 'lc-soft/lc-soft.io':
        abort(400)
    os.system('git pull master')
    os.system('jekyll build')
    return jsonify({'message': 'ok'})

if __name__ == '__main__':
    app.run()
