# Referencia del ZIP `OLC11S2026-C-main`

Este archivo resume los patrones y convenciones del ZIP de referencia que debemos seguir estrictamente en el proyecto.

## Ubicación analizada

- ZIP original: `C:\Users\nuanu\Downloads\OLC11S2026-C-main.zip`
- Copia extraída para consulta: `_reference_zip/OLC11S2026-C-main`

## Estructura principal del ZIP

- `Introducción a Jflex-Cup/Analizadores`
  - Ejemplo base de analizador léxico y sintáctico en Java con JFlex/CUP.
- `PatronInterprete/Introduccion_Interprete`
  - Ejemplo de patrón intérprete en Java.
- `Jison`
  - Backend en Node.js + TypeScript + Express + Jison.
- `Frontend`
  - Frontend en React con Vite.

## Patrones obligatorios detectados

### 1. Modelo base de instrucciones

Tanto en Java como en TypeScript se usa una clase abstracta `Instruccion` con:

- `tipo`
- `linea`
- `col`
- método `interpretar(...)`

En TypeScript además cada instrucción implementa:

- `ast(...): Node`

Archivos guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Abstract/Instruccion.ts`
- `_reference_zip/OLC11S2026-C-main/PatronInterprete/Introduccion_Interprete/src/Abstract/Instruccion.java`

### 2. Árbol global de ejecución

La clase `Arbol` concentra el estado global de interpretación:

- listado de instrucciones
- consola acumulada
- tabla global
- lista de errores
- lista de símbolos
- contador auxiliar

También define una operación tipo `print` que concatena a la consola con salto de línea.

Archivos guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Simbolo/Arbol.ts`
- `_reference_zip/OLC11S2026-C-main/PatronInterprete/Introduccion_Interprete/src/Simbolo/Arbol.java`

### 3. Tabla de símbolos encadenada

`TablaSimbolos` maneja scopes mediante referencia a `anterior`:

- `setVariable(simbolo)`
- `getVariable(id)`
- búsqueda ascendente por entornos

En el ejemplo TypeScript también existe `getValueasNode(id)` para construir nodos AST de valores.

Archivo guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Simbolo/TablaSimbolos.ts`

### 4. Tipado mediante enums y clase contenedora

Se utiliza una clase `Tipo` que envuelve:

- `tipoDato`
- `tipoInstruccion`

Esto evita usar strings sueltos en la mayoría de clases semánticas.

Archivos guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Simbolo/Tipo.ts`
- `_reference_zip/OLC11S2026-C-main/Jison/Simbolo/tipoDato.ts`
- `_reference_zip/OLC11S2026-C-main/Jison/Simbolo/tipoInstruccion.ts`

### 5. Expresiones como instrucciones

Las expresiones heredan de `Instruccion`, por ejemplo:

- `Nativo`
- `Suma`
- `Resta`
- `Division`
- `Multiplicacion`
- relacionales
- `Identificador`

Convención observada:

- cada expresión resuelve operandos con `interpretar`
- si un operando devuelve `Errores`, se propaga
- la operación actualiza `this.tipo`
- el AST se construye con `Node`

Archivos guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Expresiones/Nativo.ts`
- `_reference_zip/OLC11S2026-C-main/Jison/Expresiones/Suma.ts`

### 6. Instrucciones semánticas concretas

Las instrucciones siguen el patrón:

1. Interpretan expresiones hijas
2. Validan semántica
3. Crean o actualizan símbolos/estado
4. Retornan `Errores` o `null`
5. Construyen su nodo AST con `Node`

Ejemplos clave:

- `Declaracion`
- `Asignacion`
- `Print`
- `If`
- `For`
- `Bloque`

Archivo guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Instrucciones/Declaracion.ts`

### 7. AST en formato DOT

La clase `Node`:

- guarda `tag`
- mantiene `children`
- construye un grafo DOT con `getDot()`

Archivo guía:

- `_reference_zip/OLC11S2026-C-main/Jison/Abstract/Node.ts`

### 8. Flujo del backend con Jison

Flujo observado:

1. `app.ts` inicia `Server`
2. `Server.ts` registra rutas Express
3. `parser.route.ts` expone `POST /api/parser/analizar`
4. `parser.controller.ts`:
   - lee `req.body.codigo`
   - ejecuta `parser.parse(entrada)`
   - asegura arreglo de instrucciones
   - crea `Arbol` y `TablaSimbolos`
   - interpreta instrucción por instrucción
   - arma AST raíz `INICIO`
   - responde JSON con `consola` y `errores`

Archivos guía:

- `_reference_zip/OLC11S2026-C-main/Jison/app.ts`
- `_reference_zip/OLC11S2026-C-main/Jison/models/Server.ts`
- `_reference_zip/OLC11S2026-C-main/Jison/routes/parser.route.ts`
- `_reference_zip/OLC11S2026-C-main/Jison/controllers/parser.controller.ts`

### 9. Convención del parser Jison

En `analizador.jison` se observa:

- imports con `require(...)`
- definición léxica dentro del mismo archivo
- tokens para reservadas, operadores y literales
- precedencia con `%left`
- regla inicial `START`
- producción `INSTRUCCIONES` que acumula en arreglo
- cada producción instancia clases concretas del AST/intérprete

Archivo guía:

- `_reference_zip/OLC11S2026-C-main/Jison/analizador/analizador.jison`

### 10. Convención JFlex/CUP

En el ejemplo Java:

- JFlex define `%class`, `%public`, `%line`, `%column`, `%cup`
- se retorna `new Symbol(sym.TOKEN, yyline+1, yycolumn+1, yytext())`
- hay método auxiliar `imprimir(...)` para depuración de tokens

Archivo guía:

- `_reference_zip/OLC11S2026-C-main/Introducción a Jflex-Cup/Analizadores/src/analizadores/Lexico.jflex`

### 11. Convención del frontend

El frontend es simple y directo:

- `useState` para `codigo`, `salida`, `errores`, `cargando`
- `fetch` a `http://localhost:8001/api/parser/analizar`
- muestra entrada, salida y errores en una sola vista

Archivo guía:

- `_reference_zip/OLC11S2026-C-main/Frontend/src/App.jsx`

## Decisiones que debemos respetar después

- Mantener la separación por carpetas tipo `Abstract`, `Simbolo`, `Expresiones`, `Instrucciones`, `Excepciones`, `analizador`, `controllers`, `routes`, `models`.
- Implementar nuevas operaciones como clases separadas, no como lógica monolítica en el parser.
- Hacer que el parser construya objetos del AST/intérprete directamente.
- Mantener `linea` y `col` en instrucciones/expresiones/errores.
- Propagar errores semánticos como objetos `Errores`.
- Usar `Arbol` y `TablaSimbolos` como núcleo del flujo.
- Si trabajamos el frontend, conservar el estilo de integración por `fetch` al endpoint del parser.

## Observaciones importantes

- El ZIP contiene ejemplos en Java y en TypeScript; el patrón es conceptualmente el mismo aunque cambie la sintaxis.
- El contenido parece material de clase, por lo que hay inconsistencias menores y código bastante directo; aun así, la arquitectura sí es clara y repetitiva.
- El frontend apunta a `localhost:8001`, mientras que `Server.ts` del backend usa `8082` por defecto. Si más adelante los unimos, habrá que decidir cuál convención seguir.
- El ZIP incluye `node_modules` dentro de `Jison`, pero eso parece accidental y no forma parte del patrón arquitectónico que debamos copiar.

## Referencia rápida para próximos pasos

Si más adelante me pides construir algo “siguiendo el ZIP”, tomaré como base prioritaria:

1. `Jison/analizador/analizador.jison`
2. `Jison/Abstract/*`
3. `Jison/Simbolo/*`
4. `Jison/Instrucciones/*`
5. `Jison/Expresiones/*`
6. `Jison/controllers/parser.controller.ts`
7. `Frontend/src/App.jsx`
