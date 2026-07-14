from flask import Flask, request, jsonify
from flask_cors import CORS
from pyDatalog import Logic
import knowledge_base as kb

app = Flask(__name__)
CORS(app)


@app.before_request
def init_pydatalog():
    if not hasattr(Logic.tl, 'logic'):
        Logic()


@app.route('/estado', methods=['GET'])
def get_estado():
    return jsonify(kb.get_estado())


@app.route('/hechos', methods=['POST'])
def post_hecho():
    data = request.get_json()
    if not data.get('predicado') or not data.get('terminos'):
        return jsonify({'error': 'Predicado y terminos son obligatorios'}), 400
    hecho = kb.add_hecho(data['predicado'], data['terminos'])
    return jsonify(hecho), 201


@app.route('/hechos', methods=['DELETE'])
def delete_hecho():
    data = request.get_json()
    encontrado = kb.remove_hecho(data['predicado'], data['terminos'])
    if not encontrado:
        return jsonify({'error': 'Hecho no encontrado'}), 404
    return '', 204


@app.route('/reglas', methods=['POST'])
def post_regla():
    data = request.get_json()
    regla = kb.add_regla(data['cabeza'], data['cuerpo'])
    return jsonify(regla), 201


@app.route('/consultar', methods=['POST'])
def post_consultar():
    data = request.get_json()
    resultados = kb.consultar(data['predicado'], data['argumentos'])
    return jsonify(resultados)


if __name__ == '__main__':
    app.run(debug=True, threaded=False)
