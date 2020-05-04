import os
from flask import Flask, jsonify, request, abort
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
executor = ThreadPoolExecutor(1)

@app.route('/build', methods=['POST'])
def build():
    data = request.get_json()
    if data['repository']['full_name'] != 'lc-soft/lc-soft.io':
        abort(400)
    executor.submit(run_build)
    return jsonify({ 'message': 'The build task has started' })

def run_build():
    os.popen('sh ./api/build.sh')

if __name__ == '__main__':
    app.run()
