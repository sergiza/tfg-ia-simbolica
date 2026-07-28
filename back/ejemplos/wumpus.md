# El juego del Wumpus

Un aventurero recorre un tablero a oscuras. Hay hoyos donde caerse y un monstruo
que se lo come. No los ve, pero **percibe pistas**: brisa junto a un hoyo, hedor
junto al Wumpus, y brillo donde está el tesoro.

A partir de esas pistas hay que deducir por dónde se puede pasar.

## El tablero

```
fila 4 │ hedor    ·      brisa   HOYO
fila 3 │ WUMPUS  brillo  HOYO    brisa
fila 2 │ hedor    ·      brisa    ·
fila 1 │  ·      brisa   HOYO    brisa
       └────────────────────────────────
         col 1   col 2   col 3   col 4
```

Cada casilla se nombra con el par `(columna, fila)`, así que el Wumpus está en
`wumpus(1, 3)` y hay un hoyo en `hoyo(3, 1)`.

## Qué hay dentro

Los **hechos** son las tres cosas peligrosas, el brillo del tesoro y todas las
pistas que percibe el aventurero.

Y **tres reglas con la misma cabeza**:

```
seguro(X, Y) <= brisa(X, Y)
seguro(X, Y) <= hedor(X, Y)
seguro(X, Y) <= brillo(X, Y)
```

Esto no es una torpeza: es cómo se escribe un **o** en Datalog. No existe un
operador de disyunción, así que cada forma de llegar a la misma conclusión se
escribe como una regla aparte. Una casilla es segura si notas brisa **o** hedor
**o** brillo, porque si estás ahí percibiendo algo, es que ahí no hay ni hoyo ni
monstruo.

## Qué probar

Consulta `seguro` con los dos huecos en `libre`: sale la lista de casillas por
las que se puede pasar.

Fíjate en que la casilla `(2, 3)` aparece **una sola vez** aunque la deducen las
tres reglas a la vez. El motor no repite soluciones.

## Para seguir tú

Faltan las partes interesantes de la práctica, y son buen ejercicio:

- La relación de **adyacencia** entre casillas, que se puede escribir con
  aritmética: `adyacente(X, Y, Z, U) <= ... & (Z == X + 1)`.
- Deducir dónde **puede haber** un hoyo a partir de dónde se nota brisa.
- Usar la **negación** para asegurar que en una casilla *no* hay hoyo.

Ojo con lo último: que el sistema no pueda demostrar que hay un hoyo no
significa que no lo haya. Solo significa que con estas pistas no se sabe.
