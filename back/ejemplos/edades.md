# Edades

Un ejemplo con **números**, para ver que una constante no tiene por qué ser un
nombre.

## Qué hay dentro

Cuatro **hechos** `edad`, que relacionan a cada persona con su edad. Fíjate en
cómo se escriben en la base de conocimiento:

```
edad('juan', 20)
```

El nombre va entre comillas y el número no. Esa diferencia no es decorativa: con
un número se puede comparar y operar, con un nombre solo se puede mirar si es
igual a otro.

Y una **regla** que usa esa diferencia:

```
mayor_de_edad(X) <= edad(X, Y) & (Y >= 18)
```

La `Y` no se compara con un valor concreto, sino que se exige que cumpla algo.

## Qué probar

Consulta `mayor_de_edad` con el hueco en `libre`: salen juan y luis.

Luego prueba los **filtros**: elige `edad`, deja los dos huecos libres y añade
`+ filtro` en el segundo con `< 18`. Es la misma pregunta al revés, y esta vez
sin necesidad de definir ninguna regla.
