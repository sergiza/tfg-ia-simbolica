# Familia

El ejemplo clásico de la IA simbólica: a partir de una sola relación conocida,
deducir otra que nadie ha escrito.

## Qué hay dentro

Siete **hechos** con la relación `padre`, que dicen quién es padre o madre de
quién. Eso es todo lo que el sistema sabe de entrada.

Y una **regla** que define un predicado nuevo:

```
abuelo(X, Y) <= padre(X, Z) & padre(Z, Y)
```

Se lee: *X es abuelo de Y si X es padre de alguien que a su vez es padre de Y*.
La `Z` del medio es la persona que enlaza a los dos, y no aparece en la
conclusión porque no importa quién sea.

## Qué probar

En **Consultar**, elige `abuelo` y deja los dos huecos en `libre`: salen todas
las parejas abuelo-nieto. No hay ni un solo hecho `abuelo` en la base de
conocimiento — todos están deducidos.

Prueba también a fijar el primer hueco en `abe` para preguntar solo por sus
nietos.
