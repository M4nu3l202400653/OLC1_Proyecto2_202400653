# Proyecto GoScript: desglose del PDF

Resumen operativo del archivo:

- PDF original: `C:\Users\nuanu\Downloads\[OLC1]P2_1S2026 (1).pdf`
- Texto extraído localmente: `_reference_pdf_extracted.txt`
- Total de páginas extraídas: `48`

Este documento resume el enunciado del proyecto que será la base de trabajo. A partir de aquí, la lectura práctica será:

- El PDF define qué debemos construir.
- El ZIP de referencia define cómo conviene estructurarlo e implementarlo.

## 1. Qué es el proyecto

El proyecto consiste en construir un intérprete para un lenguaje llamado `GoScript`, con:

- análisis léxico
- análisis sintáctico
- construcción del AST
- recorrido/interpretación semántica
- manejo de errores
- interfaz web funcional
- reportes visuales

La competencia central del curso es desarrollar un intérprete funcional aplicando teoría de compiladores.

## 2. Tecnologías obligatorias

El PDF exige explícitamente:

- `Jison` para generar el analizador léxico y sintáctico
- `JavaScript/TypeScript` para toda la lógica del sistema
- interfaz gráfica

El documento propone como arquitectura válida:

- aplicación web
- backend/API en `Node.js`
- lógica del lenguaje en `JavaScript/TypeScript`

Esto encaja muy bien con el ZIP de referencia, especialmente con la carpeta `Jison` y el `Frontend`.

## 3. Qué debe tener la interfaz

### Editor

La GUI debe permitir:

- escribir código GoScript
- abrir múltiples archivos
- mostrar la línea actual

### Operaciones básicas del editor

Debe soportar:

- crear archivos en blanco
- abrir archivos con extensión `.gst`
- guardar archivos con extensión `.gst`

### Herramienta principal

Debe existir una acción de `Ejecutar` que invoque el intérprete para realizar:

- análisis léxico
- análisis sintáctico
- análisis semántico
- interpretación

### Consola

La consola del IDE debe mostrar:

- notificaciones
- errores
- advertencias
- impresiones del programa

### Reportes desde la interfaz

La interfaz debe permitir visualizar:

- reporte de errores
- reporte de tabla de símbolos
- reporte del AST

## 4. Flujo esperado del sistema

El flujo descrito por el PDF es:

1. El usuario escribe o carga un archivo `.gst`
2. La interfaz envía el código al intérprete
3. Jison procesa el código y genera el AST
4. Se reportan errores léxicos y sintácticos
5. Se recorre el AST para evaluar instrucciones y expresiones
6. Se generan reportes
7. La consola muestra el resultado de ejecución
8. La interfaz recibe y visualiza resultados

Esto es casi exactamente el flujo del ejemplo del ZIP:

- entrada de código
- `parser.parse(...)`
- construcción de `Arbol`
- recorrido de instrucciones
- salida de consola, errores y AST

## 5. Lenguaje GoScript: reglas generales

### Punto de entrada

El programa debe ejecutarse a partir de:

- `func main() { ... }`

El intérprete debe localizar `main` y ejecutar sus instrucciones secuencialmente.

### Identificadores

Un identificador:

- puede iniciar con letra o `_`
- puede contener letras, dígitos y `_`
- no puede iniciar con número
- no puede contener caracteres especiales como `.$,-`
- no puede ser palabra reservada

Ejemplos válidos mencionados:

- `IdValido`
- `id_Valido`
- `i1d_valido5`
- `_value`

Ejemplos inválidos mencionados:

- `&idNoValido`
- `.5ID`
- `true`
- `Tot@l`
- `1d`

### Case sensitive

GoScript distingue mayúsculas y minúsculas:

- `variable` y `Variable` son distintos
- `if` no es lo mismo que `IF`

### Comentarios

Soporta:

- comentario de una línea con `//`
- comentario multilínea con `/* ... */`

### Tipado estático

Cada variable tiene un tipo fijo desde su declaración.

Regla importante:

- una variable puede cambiar de valor
- no puede cambiar de tipo
- excepción explícita: conversión implícita de `int` a `float64`

## 6. Tipos del lenguaje

### Tipos primitivos

El PDF define:

- `int`
- `float64`
- `string`
- `bool`
- `rune`

Valores por defecto:

- `int` -> `0`
- `float64` -> `0.0`
- `string` -> `""`
- `bool` -> `false`
- `rune` -> `0`

Notas del documento:

- `string` se tratará como tipo primitivo por conveniencia
- cuando el PDF dice “tipos numéricos”, se refiere a `int` y `float64`
- el literal `0` puede ser tratado como `int` o `float`
- `rune` usa comilla simple
- `string` usa comilla doble

### Tipos compuestos

El PDF define como tipos compuestos:

- `slice`
- `struct`

### Nil

`nil` representa ausencia de valor y aplica a tipos por referencia, por ejemplo:

- slices
- otros tipos no primitivos

Si un tipo no primitivo se declara sin valor, su valor por defecto es `nil`.

### Secuencias de escape

Se mencionan:

- `\"`
- `\\`
- `\n`
- `\r`
- `\t`

## 7. Ámbitos y bloques

Un bloque está delimitado por `{ }`.

Reglas de alcance:

- un bloque define un ámbito local
- las variables locales solo son visibles en ese bloque y bloques anidados
- variables globales son visibles desde bloques internos
- un nombre local puede ocultar uno de un entorno superior

El PDF también indica algo importante:

- los bloques independientes existen
- no tienen que estar asociados a `if`, `for`, etc.

Además:

- no es obligatorio terminar todas las sentencias con `;`

## 8. Variables y declaración

El PDF permite tres formas principales:

```txt
var <identificador> <Tipo> = <Expresión>
var <identificador> <Tipo>
<identificador> := <Expresión>
```

Reglas:

- una sola variable por sentencia
- si se declara con `var` y sin valor, toma el valor por defecto
- si ya existe una variable en el mismo ámbito, no debe redeclararse
- sí puede redeclararse en un nuevo bloque interno
- la inferencia de `:=` toma el tipo de la expresión

Conversión implícita permitida expresamente:

- `int -> float64`

## 9. Expresiones y operaciones

El PDF define como expresiones:

- operaciones aritméticas
- operaciones comparativas
- operaciones lógicas
- acceso a variable
- acceso a estructura
- llamadas a función

## 10. Operadores aritméticos

### Soportados

- `+`
- `-`
- `*`
- `/`
- `%`
- negación unaria `-`

### Reglas semánticas importantes

#### Suma

La suma es la operación más flexible. El documento permite combinaciones entre:

- `int`
- `float64`
- `string`
- `bool`
- `rune`

Comportamientos destacados del PDF:

- `int + float64 -> float64`
- `int + string -> string`
- `int + bool -> int`
- `int + rune -> int`
- `float64 + string -> string`
- `bool + bool -> bool`
- `rune + string -> string`

Ejemplos del enunciado:

- `5 + true = 6`
- `1.5 + true = 2.5`
- `"manzanas" + true = "manzanastrue"`
- `'A' + 'B' = 131`

#### Resta

Se permite entre:

- `int`
- `float64`
- `bool`
- `rune`

No se documenta resta con `string`.

Ejemplos:

- `5 - true = 4`
- `5.5 - true = 4.5`
- `'A' - 'B' = -1`

#### Multiplicación

Se permite entre:

- `int`
- `float64`
- `bool`
- `rune`
- caso especial `int * string -> string`

Ejemplos:

- `3 * "ha" = "hahaha"`
- `true * false = false`
- `'A' * 2 = 130`

#### División

El PDF la restringe a tipos numéricos:

- `int / int -> int` con truncamiento
- `int / float64 -> float64`
- `float64 / float64 -> float64`
- `float64 / int -> float64`

Ejemplos:

- `10 / 3 = 3`
- `1 / 3.0 = 0.3333`

#### Módulo

Solo se documenta:

- `int % int -> int`

Ejemplo:

- `10 % 3 = 1`

#### Asignaciones compuestas

El enunciado sí menciona:

- `+=`
- `-=`

Semántica:

- `a += b` equivale a `a = a + b`
- `a -= b` equivale a `a = a - b`

`+=` se ejemplifica también con `string`.

#### Negación unaria

Aplica a:

- `int`
- `float64`

## 11. Comparaciones y lógica

### Igualdad y desigualdad

Operadores:

- `==`
- `!=`

Se documentan comparaciones entre:

- `int` con `int`
- `float64` con `float64`
- `int` con `float64`
- `float64` con `int`
- `bool` con `bool`
- `string` con `string`
- `rune` con `rune`

Notas:

- strings se comparan lexicográficamente

### Relacionales

Operadores:

- `>`
- `>=`
- `<`
- `<=`

Se documentan para:

- `int`
- `float64`
- combinaciones `int/float64`
- `rune`

Nota:

- `rune` se compara por valor ASCII

### Lógicos

Operadores:

- `&&`
- `||`
- `!`

Solo aplican a expresiones booleanas.

## 12. Precedencia

Orden de mayor a menor, según el PDF:

1. `( ) [ ]`
2. `!` y negación unaria `-`
3. `/ % *`
4. `+ -`
5. `< <= >= >`
6. `== !=`
7. `&&`
8. `||`

## 13. Control de flujo

### If / else if / else

Reglas:

- soporta `if`, `else if`, `else`
- puede haber anidamiento
- la condición puede ir con o sin paréntesis

### Switch / case

Reglas:

- evalúa una expresión
- ejecuta el primer `case` coincidente
- `default` es opcional
- el `break` es implícito al final de cada `case`
- no requiere paréntesis

### For

Es la única estructura iterativa del lenguaje.

Formas documentadas:

```txt
for <condición> { ... }
for inicialización; condición; incremento { ... }
for índice, valor := range slice { ... }
```

También aparecen en ejemplos:

- `i++`
- acceso con `range`

## 14. Transferencia de control

### Break

Solo válido dentro de:

- `for`
- `switch`

### Continue

Solo válido dentro de:

- `for`

### Return

Finaliza la función actual y puede:

- devolver valor
- no devolver valor

## 15. Slices

Los slices son la estructura compuesta más básica.

### Creación

Sintaxis observada en ejemplos:

```txt
numbers = [] int {1, 2, 3, 4, 5}
var slice [] int
numeros := [] int{10, 20, 30, 40, 50}
```

Reglas:

- los elementos deben ser del mismo tipo
- el tamaño puede variar durante la ejecución
- índices comienzan en `0`

### Funciones embebidas para slices

#### `slices.Index`

- retorna el índice de la primera coincidencia
- si no encuentra, retorna `-1`

#### `strings.Join`

- solo aplica a `[]string`
- concatena con separador

#### `len`

- retorna cantidad de elementos
- tipo de retorno `int`

#### `append`

- agrega elementos
- retorna un nuevo slice

### Acceso y modificación

El PDF exige:

- lectura por índice
- modificación por índice
- error si la posición no existe

## 16. Slices multidimensionales

El PDF documenta arreglos tipo:

```txt
[][]int
```

Reglas extraídas:

- se accede con notación `[][]`
- índices desde `0`
- pueden ser irregulares, no todas las filas deben tener el mismo tamaño
- se usa `append` para agregar nuevas filas

## 17. Structs

### Definición

Sintaxis base documentada:

```txt
struct <NombreStruct> {
<Tipo> <NombreAtributo>;
...
}
```

Reglas:

- solo se declaran en ámbito global
- deben tener al menos un atributo
- no se pueden modificar sus campos estructurales tras definirlos
- pueden contener tipos primitivos u otros structs
- si contienen structs, esos atributos se manejan por referencia

### Instanciación

Ejemplo documentado:

```txt
Persona miInstancia = { Nombre: "Alice", Edad: 25, EsEstudiante: false }
```

### Acceso y modificación

Se usa el operador `.`

Ejemplos:

- `miInstancia.Nombre`
- `miInstancia.Edad = 30`

## 18. Funciones

### Reglas generales

Las funciones:

- solo pueden declararse en ámbito global
- pueden tener o no parámetros
- pueden tener o no retorno
- si retornan, el tipo debe declararse explícitamente
- solo retornan un valor
- no existe sobrecarga por nombre
- no pueden compartir nombre con variables o structs
- structs y slices se pasan por referencia
- primitivos se pasan por valor

### Sintaxis

```txt
func <nombre>() { ... }
func <nombre>(a int, b int) { ... }
func <nombre>(a int, b int) <tipoRetorno> { return ... }
```

### Parámetros

Reglas:

- no puede haber nombres repetidos
- puede haber funciones sin parámetros
- slices y structs por referencia
- demás tipos por valor

## 19. Funciones embebidas obligatorias

### `fmt.Println`

Debe soportar:

- cero o más expresiones
- separar por espacio
- terminar siempre con salto de línea

Tipos que el PDF menciona como imprimibles:

- `int`
- `float64`
- `bool`
- `char/rune`
- `string`
- `slice`
- `struct`

Formateos esperados:

- slice: `[1 2 3]`
- struct: `Persona{Nombre: Alice, Edad: 25, EsEstudiante: true}`

### `strconv.Atoi`

- convierte `string -> int`
- si la cadena no representa entero válido, debe reportar error
- no redondea decimales

### `strconv.ParseFloat`

- convierte `string -> float64`
- acepta enteros o decimales válidos
- si no puede convertir, debe reportar error

### `reflect.TypeOf().string`

El enunciado la presenta como función de introspección de tipo.

Debe devolver el tipo en tiempo de ejecución para valores como:

- `int`
- `float64`
- `struct`
- `slice`

Ejemplos esperados:

- `int`
- `float64`
- `Persona`
- `[]int`

## 20. Reportes requeridos

### Reporte de errores

Debe recolectar todos los errores encontrados y mostrar al menos:

- tipo
- línea
- columna
- descripción

El PDF menciona explícitamente errores:

- léxicos
- sintácticos

Y por la lógica del proyecto también semánticos, aunque en esa tabla mínima solo ejemplifica léxicos y sintácticos.

### Reporte de tabla de símbolos

Debe mostrar después de la ejecución:

- variables
- funciones
- procedimientos
- tipo de símbolo
- tipo de dato
- ámbito
- línea
- columna

### Reporte de AST

Debe mostrar el árbol de sintaxis abstracta incluyendo:

- declaraciones
- funciones
- control de flujo
- expresiones
- demás elementos del lenguaje

## 21. Entregables

El PDF exige:

- código fuente
- gramática utilizada
- manual técnico
- manual de usuario
- reportes visuales

### Detalle clave de la gramática

Debe entregarse en un archivo `Markdown`:

- limpio
- entendible
- no copia directa del archivo `.jison`
- escrito en `BNF`
- solo gramática independiente del contexto

## 22. Restricciones y reglas de entrega

### Restricciones técnicas

- usar `Jison`
- implementar la lógica en `JavaScript/TypeScript`
- interfaz gráfica obligatoria

### Restricciones académicas

- trabajo individual
- plagio o copia implica `0`
- pueden usarse recursos externos si se referencian y se comprenden

### Repositorio

El nombre debe seguir el formato:

- `OLC1_Proyecto2_#Carnet`

Ejemplo del documento:

- `OLC1_Proyecto2_202110568`

### Entrega

La entrega final es:

- únicamente el enlace al repositorio privado de GitHub

También se debe agregar al auxiliar correspondiente. El PDF menciona:

- Sección B: `002Fer`
- Sección C: `JohnAlds`
- Sección N: `LempDnote`

## 23. Implicaciones prácticas para nuestra implementación

Tomando el PDF como especificación y el ZIP como patrón, conviene mantener:

- parser con `Jison`
- AST con clases concretas por instrucción/expresión
- tabla de símbolos con ámbitos encadenados
- objetos de error acumulables
- backend `Node/TypeScript`
- frontend web con editor, consola y reportes

## 24. Ambigüedades o inconsistencias del PDF

El documento tiene varios puntos que debemos tomar con cuidado:

### Fechas

- el encabezado menciona `Primer semestre 2025`
- el nombre del PDF dice `1S2026`
- el cronograma interno usa fechas de `2026`

### Typos y detalles editoriales

- en un ejemplo aparece `i := 10c`
- la numeración de entregables cambia y luego menciona `8.4`, `8.5`, `8.6`, `8.7` dentro de la sección 13
- varias secciones tienen formato mezclado por reutilización de plantilla

### Ambigüedades semánticas

- la tabla y la redacción de comparaciones dice “mismo tipo”, pero luego sí permite `int == float64`
- en slices multidimensionales se mezcla lenguaje de “matrices” con comportamiento dinámico de slices
- en `rune` la descripción textual y el rango no están del todo consistentes

### Decisión práctica recomendada

Cuando haya conflicto:

1. respetar primero los ejemplos explícitos del PDF
2. usar el patrón arquitectónico del ZIP
3. documentar cualquier supuesto dudoso

## 25. Fuente de verdad para las siguientes tareas

En adelante, para construir el proyecto asumiré:

- especificación funcional: `PROJECT_PDF_NOTES.md`
- patrón de implementación: `ZIP_REFERENCE_NOTES.md`
- respaldo textual del PDF: `_reference_pdf_extracted.txt`
