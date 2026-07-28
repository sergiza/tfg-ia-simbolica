import json
import os
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

RUTA_BD = Path(os.environ.get("BD_BIBLIOTECA", "datos/biblioteca.db"))
RUTA_EJEMPLOS = Path(__file__).parent / "ejemplos"


@contextmanager
def _conexion():
    RUTA_BD.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(RUTA_BD)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def iniciar() -> None:
    with _conexion() as con:
        con.execute(
            """CREATE TABLE IF NOT EXISTS guardados (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   nombre TEXT NOT NULL,
                   descripcion TEXT NOT NULL,
                   estado TEXT NOT NULL,
                   fecha TEXT NOT NULL)"""
        )


def _leer_ejemplo(ruta: Path) -> dict:
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    md = ruta.with_suffix(".md")
    return {
        "id": ruta.stem,
        "nombre": datos["nombre"],
        "descripcion": md.read_text(encoding="utf-8") if md.is_file() else "",
        "orden": datos.get("orden", 99),
    }


def ejemplos() -> list[dict]:
    leidos = [_leer_ejemplo(r) for r in RUTA_EJEMPLOS.glob("*.json")]
    return sorted(leidos, key=lambda e: (e["orden"], e["nombre"]))


def estado_ejemplo(id: str) -> dict | None:
    if not re.fullmatch(r"[a-z0-9_-]+", id):
        return None
    ruta = RUTA_EJEMPLOS / f"{id}.json"
    if not ruta.is_file():
        return None
    return json.loads(ruta.read_text(encoding="utf-8"))["estado"]


def guardados() -> list[dict]:
    with _conexion() as con:
        filas = con.execute(
            "SELECT id, nombre, descripcion, fecha FROM guardados ORDER BY fecha DESC, id DESC"
        ).fetchall()
    return [dict(f) for f in filas]


def estado_guardado(id: int) -> dict | None:
    with _conexion() as con:
        fila = con.execute("SELECT estado FROM guardados WHERE id = ?", (id,)).fetchone()
    return json.loads(fila["estado"]) if fila else None


def guardar(nombre: str, descripcion: str, estado: dict) -> dict:
    fecha = datetime.now().isoformat(timespec="seconds")
    with _conexion() as con:
        cursor = con.execute(
            "INSERT INTO guardados (nombre, descripcion, estado, fecha) VALUES (?, ?, ?, ?)",
            (nombre, descripcion, json.dumps(estado), fecha),
        )
        id = cursor.lastrowid
    return {"id": id, "nombre": nombre, "descripcion": descripcion, "fecha": fecha}


def borrar(id: int) -> bool:
    with _conexion() as con:
        borradas = con.execute("DELETE FROM guardados WHERE id = ?", (id,)).rowcount
    return borradas > 0
