from pyDatalog import pyDatalog

_hechos = []
    # {"predicado": str, "terminos": list[str]}
_reglas = []
    # {
    #   "cabeza": {"predicado": str, "variables": list[str]},
    #   "cuerpo": [{"predicado": str, "argumentos": list[str]}, ...]
    # }


def add_hecho(predicado: str, terminos: list[str]) -> dict:
    pyDatalog.assert_fact(predicado, *terminos)
    hecho = {"predicado": predicado, "terminos": list(terminos)}
    _hechos.append(hecho)
    return hecho


def remove_hecho(predicado: str, terminos: list[str]) -> bool:
    for i, h in enumerate(_hechos):
        if h["predicado"] == predicado and h["terminos"] == list(terminos):
            pyDatalog.retract_fact(predicado, *terminos)
            _hechos.pop(i)
            return True
    return False


def _formato_arg(arg: str) -> str:
    return arg if arg[0].isupper() else f"'{arg}'"


def add_regla(cabeza: dict, cuerpo: list[dict]) -> dict:
    cabeza_str = f"{cabeza['predicado']}({', '.join(cabeza['variables'])})"
    cuerpo_partes = [
        f"{literal['predicado']}({', '.join(_formato_arg(arg) for arg in literal['argumentos'])})"
        for literal in cuerpo
    ]
    pyDatalog.load(f"{cabeza_str} <= {' & '.join(cuerpo_partes)}")
    regla = {"cabeza": cabeza, "cuerpo": cuerpo}
    _reglas.append(regla)
    return regla


def consultar(predicado: str, argumentos: list[str]) -> list:
    args_str = ", ".join(_formato_arg(a) for a in argumentos)
    resultado = pyDatalog.ask(f"{predicado}({args_str})")
    if resultado is None:
        return []
    return [list(fila) for fila in resultado.answers]


def get_estado() -> dict:
    return {"hechos": list(_hechos), "reglas": list(_reglas)}


def reiniciar() -> None:
    pyDatalog.clear()
    _hechos.clear()
    _reglas.clear()
