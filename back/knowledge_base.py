from pyDatalog import pyDatalog

_hechos = []
_reglas = []


def _valor(arg: str) -> str | int:
    return int(arg) if arg.isdigit() else arg


def add_hecho(predicado: str, terminos: list[str]) -> dict:
    pyDatalog.assert_fact(predicado, *(_valor(t) for t in terminos))
    hecho = {"predicado": predicado, "terminos": list(terminos)}
    _hechos.append(hecho)
    return hecho


def remove_hecho(predicado: str, terminos: list[str]) -> bool:
    for i, h in enumerate(_hechos):
        if h["predicado"] == predicado and h["terminos"] == list(terminos):
            pyDatalog.retract_fact(predicado, *(_valor(t) for t in terminos))
            _hechos.pop(i)
            return True
    return False


def _formato_arg(arg: str) -> str:
    if arg[0].isupper() or arg.isdigit():
        return arg
    return f"'{arg}'"


def _formato_llamada(predicado: str, args: list[str]) -> str:
    return f"{predicado}({', '.join(_formato_arg(a) for a in args)})"


def _formato_condicion(cond: dict) -> str:
    if cond.get("tipo") == "comparacion":
        partes = [
            _formato_arg(cond["izquierda"]),
            cond["operador"],
            _formato_arg(cond["derecha"]),
        ]
        if cond.get("operacion"):
            partes += [cond["operacion"], _formato_arg(cond["derecha2"])]
        return f"({' '.join(partes)})"
    negacion = "~" if cond.get("negado") else ""
    return negacion + _formato_llamada(cond["predicado"], cond["argumentos"])


def add_regla(cabeza: dict, cuerpo: list[dict]) -> dict:
    cabeza_str = _formato_llamada(cabeza["predicado"], cabeza["variables"])
    cuerpo_str = " & ".join(_formato_condicion(c) for c in cuerpo)
    pyDatalog.load(f"{cabeza_str} <= {cuerpo_str}")
    regla = {"cabeza": cabeza, "cuerpo": cuerpo}
    _reglas.append(regla)
    return regla


def consultar(
    predicado: str, argumentos: list[str], condiciones: list[dict] | None = None
) -> list:
    partes = [_formato_llamada(predicado, argumentos)]
    partes += [_formato_condicion(c) for c in (condiciones or [])]
    try:
        resultado = pyDatalog.ask(" & ".join(partes))
    except AttributeError:
        return []  # predicado sin hechos ni reglas no debe ser error
    if resultado is None:
        return []
    return [list(fila) for fila in resultado.answers]


def get_estado() -> dict:
    return {"hechos": list(_hechos), "reglas": list(_reglas)}


def reiniciar() -> None:
    pyDatalog.clear()
    _hechos.clear()
    _reglas.clear()
