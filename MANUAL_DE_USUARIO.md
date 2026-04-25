# Manual De Usuario

## Datos Generales

- Curso: Organizacion de Lenguajes y Compiladores 1
- Proyecto: Proyecto 2
- Sistema: Interprete GoScript
- Carnet: 202400653
- Fecha: 2026-04-24

## 1. Que Es Este Programa

Este programa sirve para escribir, abrir, guardar y ejecutar archivos del lenguaje GoScript.

Cuando usted ejecuta un archivo, el sistema le muestra cuatro cosas:

- lo que el programa imprimio
- los errores que encontro
- una tabla con los nombres que reconoce el sistema
- un arbol que muestra como fue entendido el programa

No necesita conocimientos tecnicos para usarlo. Lo importante es seguir los pasos en orden.

## 2. Que Necesita Antes De Empezar

Antes de usar el sistema, asegurese de tener:

- Node.js instalado
- el proyecto descargado en su computadora
- dos ventanas de terminal o PowerShell

Si el proyecto ya le abre correctamente, puede saltarse esta parte.

## 3. Como Encender El Sistema

El sistema se levanta en dos partes: backend y frontend.

### Paso 1. Encender El Backend

Abra una terminal dentro de la carpeta `Jison` y escriba:

```powershell
npm run dev
```

Si todo esta bien, vera un mensaje parecido a este:

```text
Server running on port 8001
```

### Paso 2. Encender La Vista

Abra otra terminal dentro de la carpeta `Frontend` y escriba:

```powershell
npm run dev
```

Luego abra en el navegador la direccion que muestre la terminal. Normalmente sera algo parecido a:

```text
http://localhost:5173
```

## 4. Que Ve En La Pantalla Principal

Al abrir el sistema vera varias zonas.

### Parte Superior

Aqui aparecen los botones:

- `Nuevo`: crea un archivo nuevo
- `Abrir`: carga un archivo desde su computadora
- `Guardar`: guarda el archivo actual
- `Ejecutar`: analiza y ejecuta el archivo actual

### Parte Izquierda

Aqui esta el editor. En esta zona usted puede escribir su codigo.

### Parte Derecha

Aqui aparecen los resultados. Hay cuatro pestanas:

- `consola`
- `errores`
- `tabla`
- `ast`

## 5. Como Probar El Sistema Por Primera Vez

Si quiere hacer una prueba simple, escriba este codigo:

```go
func main() {
    fmt.Println("Hola")
}
```

Despues haga clic en `Ejecutar`.

Si todo esta bien:

- en `consola` deberia aparecer `Hola`
- en `errores` no deberia aparecer nada
- en `ast` deberia aparecer el arbol del programa

## 6. Como Abrir Un Archivo Ya Hecho

1. Presione el boton `Abrir`.
2. Busque su archivo `.gst`.
3. Seleccione el archivo.
4. El contenido aparecera en una nueva pestana.
5. Presione `Ejecutar`.

## 7. Como Guardar Su Trabajo

1. Presione el boton `Guardar`.
2. El sistema descargara el archivo actual.
3. Si el archivo no tiene extension, el sistema le pondra `.gst`.

## 8. Como Leer Los Resultados

### Consola

La consola muestra el resultado del programa.

Ejemplo:

```text
Hola
5
true
```

Esto significa que el programa se ejecuto y fue imprimiendo esos valores.

### Errores

Esta pestana muestra problemas encontrados durante el analisis o la ejecucion.

Ejemplos comunes:

- error lexico: se escribio un simbolo invalido
- error sintactico: el codigo esta mal escrito
- error semantico: el codigo esta escrito, pero hace algo no permitido

Si aparece una linea y una columna, use esos datos para encontrar el problema en el editor.

### Tabla

La tabla muestra nombres que el sistema registro durante el analisis.

Por ejemplo:

- variables
- funciones
- parametros
- structs

Esto es util para confirmar que el sistema entendio correctamente los nombres usados en el programa.

### AST

AST significa arbol de sintaxis abstracta.

Si no sabe que significa, no se preocupe. Para usar el sistema no hace falta entenderlo a fondo.

Esta vista sirve para ver como el interprete organizo el programa por dentro. Tiene tres formas:

- `Visual`: muestra el arbol como grafica
- `DOT`: muestra el texto usado para dibujar el arbol
- `JSON`: muestra el arbol como datos

## 9. Que Hacer Si Aparecen Errores

### Caso 1. No conecta con el backend

Si la vista dice que no puede conectarse:

1. revise si el backend esta encendido
2. revise si aparece `Server running on port 8001`
3. cierre y vuelva a abrir la vista si es necesario

### Caso 2. El archivo tiene errores

Si aparecen errores en la pestana `errores`:

1. lea el mensaje con calma
2. busque la linea y columna indicadas
3. corrija el codigo
4. presione `Ejecutar` otra vez

### Caso 3. No aparece nada en consola

Esto puede pasar si:

- el programa no imprime nada
- hay errores que impiden una ejecucion correcta
- falta la funcion `main`

## 10. Uso Recomendado Paso A Paso

Si es la primera vez que lo usa, siga exactamente este orden:

1. encender backend
2. encender frontend
3. abrir la pagina en el navegador
4. crear o abrir un archivo `.gst`
5. escribir o revisar el codigo
6. presionar `Ejecutar`
7. revisar `consola`
8. revisar `errores`
9. guardar el archivo si lo necesita

## 11. Buenas Practicas Para El Usuario

- guarde su archivo cada vez que haga cambios importantes
- ejecute el programa despues de cambios pequenos para detectar errores rapido
- si aparece un error, corrija uno por uno
- use nombres claros para sus archivos
- mantenga siempre una funcion `main`

## 12. Preguntas Frecuentes

### El sistema borra mis archivos?

No. El sistema solo analiza el contenido del editor y permite guardarlo cuando usted lo desee.

### Tengo que saber programacion para usarlo?

No para abrir, ejecutar y leer resultados basicos. Si va a escribir codigo nuevo, si necesitara conocer la sintaxis del lenguaje GoScript.

### Para que sirve la tabla?

Sirve para ver que nombres reconocio el sistema dentro del programa.

### Para que sirve el AST?

Sirve como apoyo visual para entender como el interprete organizo el programa.

## 13. Capturas Recomendadas Para La Version Final En PDF

Para cumplir mejor con la entrega final, se recomienda colocar capturas de pantalla en estos puntos:

1. pantalla principal del sistema
2. editor con un archivo cargado
3. ejecucion correcta en consola
4. ejemplo de reporte de errores
5. tabla de simbolos
6. AST en vista visual

## 14. Cierre

El sistema fue pensado para que cualquier persona pueda:

- abrir archivos
- ejecutar codigo GoScript
- ver resultados
- encontrar errores

Si sigue los pasos de este manual en orden, podra usar el proyecto sin necesidad de conocimientos tecnicos avanzados.
