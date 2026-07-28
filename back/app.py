from flask import Flask, request, jsonify
from flask_cors import CORS
from pyDatalog import Logic
import biblioteca
import knowledge_base as kb

app = Flask(__name__)
CORS(app)
biblioteca.iniciar()


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
    resultados = kb.consultar(
        data['predicado'], data['argumentos'], data.get('condiciones')
    )
    return jsonify(resultados)


@app.route('/reiniciar', methods=['POST'])
def post_reiniciar():
    kb.reiniciar()
    return '', 204


@app.route('/biblioteca', methods=['GET'])
def get_biblioteca():
    return jsonify({
        'ejemplos': biblioteca.ejemplos(),
        'guardados': biblioteca.guardados(),
    })


@app.route('/biblioteca/guardados', methods=['POST'])
def post_guardado():
    data = request.get_json()
    nombre = (data.get('nombre') or '').strip()
    if not nombre:
        return jsonify({'error': 'El nombre es obligatorio'}), 400
    guardado = biblioteca.guardar(nombre, data.get('descripcion', ''), kb.get_estado())
    return jsonify(guardado), 201


@app.route('/biblioteca/guardados/<int:id>', methods=['DELETE'])
def delete_guardado(id):
    if not biblioteca.borrar(id):
        return jsonify({'error': 'Guardado no encontrado'}), 404
    return '', 204


@app.route('/biblioteca/ejemplos/<id>/cargar', methods=['POST'])
def post_cargar_ejemplo(id):
    estado = biblioteca.estado_ejemplo(id)
    if estado is None:
        return jsonify({'error': 'Ejemplo no encontrado'}), 404
    kb.cargar(estado)
    return jsonify(kb.get_estado())


@app.route('/biblioteca/guardados/<int:id>/cargar', methods=['POST'])
def post_cargar_guardado(id):
    estado = biblioteca.estado_guardado(id)
    if estado is None:
        return jsonify({'error': 'Guardado no encontrado'}), 404
    kb.cargar(estado)
    return jsonify(kb.get_estado())


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=False)
