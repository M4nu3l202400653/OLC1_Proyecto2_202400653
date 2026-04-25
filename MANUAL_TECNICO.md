# Manual Tecnico

## Datos Generales

- Curso: Organizacion de Lenguajes y Compiladores 1
- Proyecto: Proyecto 2
- Sistema: Interprete GoScript
- Carnet: 202400653
- Fecha: 2026-04-24

## 1. Proposito Del Sistema

Este proyecto implementa un interprete para el lenguaje GoScript. El sistema recibe codigo fuente escrito por el usuario, lo analiza con Jison, construye estructuras internas de interpretacion, ejecuta el programa y devuelve:

- salida en consola
- lista de errores
- tabla de simbolos
- AST en formato estructurado, DOT y SVG

El proyecto esta dividido en dos partes:

- `Jison/`: backend, parser, interprete y generacion de AST
- `Frontend/`: editor visual, ejecucion y presentacion de resultados

## 2. Tecnologias Y Herramientas

### Backend

- Node.js
- TypeScript
- Express
- Jison
- Graphviz `dot` para convertir el AST a SVG

### Frontend

- React
- Vite
- CSS puro

### Dependencias Principales

Backend, segun [Jison/package.json](Jison/package.json):

```json
{
  "scripts": {
    "parse": "jison analizador/goscript.jison -o analizador/parser.js",
    "dev": "npm run parse && ts-node app.ts",
    "build": "npm run parse && tsc",
    "start": "node dist/app.js"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1"
  }
}
```

Frontend, segun [Frontend/package.json](Frontend/package.json):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

## 3. Estructura Del Proyecto

### Backend

- `Jison/app.ts`: punto de arranque del servidor
- `Jison/models/Server.ts`: configuracion de Express
- `Jison/routes/parser.route.ts`: ruta del analizador
- `Jison/controllers/parser.controller.ts`: flujo principal del analisis y ejecucion
- `Jison/analizador/goscript.jison`: lexer y parser del lenguaje
- `Jison/Abstract/`: clases base del interprete
- `Jison/Instrucciones/`: instrucciones ejecutables
- `Jison/Expresiones/`: operaciones y valores del lenguaje
- `Jison/Simbolo/`: arbol, tabla de simbolos, tipos y simbolos
- `Jison/Utilidades/`: utilidades de tipos, runtime y transferencias

### Frontend

- `Frontend/src/App.jsx`: interfaz principal
- `Frontend/src/main.jsx`: arranque de React
- `Frontend/src/index.css`: estilos de la aplicacion

## 4. Flujo General De Funcionamiento

El recorrido principal del sistema es este:

1. El usuario escribe o carga un archivo `.gst` en la interfaz.
2. El frontend envia el texto al backend por `POST /api/parser/analizar`.
3. Jison analiza la entrada y produce una lista de instrucciones.
4. El controlador crea el `Arbol` y la `TablaSimbolos` global.
5. Se registran funciones y structs.
6. Se interpretan instrucciones globales.
7. Se busca y ejecuta la funcion `main`.
8. Se construye el AST.
9. El AST se convierte a DOT y, si Graphviz esta disponible, a SVG.
10. El frontend muestra consola, errores, tabla y AST.

## 5. Componentes Clave Del Backend

### 5.1 Inicio Del Servidor

Archivo: [Jison/app.ts](Jison/app.ts)

```ts
import { Server } from './models/Server';

const server = new Server();
server.listen();
```

Este archivo solo crea el servidor y lo pone a escuchar.

### 5.2 Configuracion De Express

Archivo: [Jison/models/Server.ts](Jison/models/Server.ts)

```ts
export class Server {
  public app: Application;
  public port: number;

  private parserPath = "/api/parser";

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8001;

    this.middlewares();
    this.routes();
  }
}
```

Puntos importantes:

- habilita `cors`
- habilita `express.json()`
- expone el servicio bajo `/api/parser`
- usa `8001` por defecto si no existe otra configuracion

### 5.3 Ruta Principal

Archivo: [Jison/routes/parser.route.ts](Jison/routes/parser.route.ts)

```ts
const router = Router();

router.post("/analizar", analizar);
```

La API principal del proyecto es un solo `POST`, lo cual simplifica el mantenimiento y la integracion con el frontend.

### 5.4 Controlador Principal

Archivo: [Jison/controllers/parser.controller.ts](Jison/controllers/parser.controller.ts)

Fragmento central:

```ts
let instrucciones = parser.parse(entrada);
if (!Array.isArray(instrucciones)) {
    instrucciones = instrucciones ? [instrucciones] : [];
}

const arbol = new Arbol(instrucciones);
const tablaGlobal = arbol.tablaGlobal;
```

Despues del parseo:

```ts
for (const instruccion of instrucciones) {
    if (instruccion instanceof Funcion || instruccion instanceof Struct) {
        const resultado = instruccion.interpretar(arbol, tablaGlobal);
        registrarResultado(arbol, resultado, instruccion.linea, instruccion.col);
    }
}
```

Luego se ejecuta `main`:

```ts
const funcionMain = tablaGlobal.getFuncion("main");
if (!funcionMain) {
    arbol.registrarError(new Errores("Semantico", "No se encontro la funcion main", 0, 0));
} else {
    const resultadoMain = funcionMain.invocar(arbol, tablaGlobal, [], 0, 0);
    registrarResultado(arbol, resultadoMain, 0, 0);
}
```

Y finalmente se genera el AST:

```ts
const ast = construirAst(instrucciones, arbol);
arbol.ast = ast;
const astDot = ast.getDot();
const astSvg = generarSvgAst(astDot);
```

Este controlador concentra las tareas mas importantes del sistema:

- recupera errores lexicos de Jison
- detecta errores sintacticos
- ejecuta instrucciones
- ejecuta `main`
- devuelve los reportes al frontend

### 5.5 Estructura Central De Ejecucion

Archivo: [Jison/Simbolo/Arbol.ts](Jison/Simbolo/Arbol.ts)

```ts
export class Arbol {
    public consola = "";
    public tablaGlobal: TablaSimbolos;
    public errores: Errores[] = [];
    public simbolos: Simbolo[] = [];
    public contador = 0;
    public ast: Node | null = null;

    constructor(public instrucciones: Instruccion[]) {
        this.tablaGlobal = new TablaSimbolos(undefined, "Global");
    }
}
```

El `Arbol` sirve como contenedor del estado global de la ejecucion:

- consola acumulada
- errores encontrados
- simbolos registrados
- AST final
- tabla global

### 5.6 Tabla De Simbolos

Archivo: [Jison/Simbolo/TablaSimbolos.ts](Jison/Simbolo/TablaSimbolos.ts)

Fragmento:

```ts
setVariable(simbolo: Simbolo): Errores | null {
    if (this.existeEnAmbitoActual(simbolo.id)) {
        return new Errores(
            "Semantico",
            `El identificador ${simbolo.id} ya existe en el ambito ${this.nombre}`,
            simbolo.linea,
            simbolo.columna,
        );
    }

    this.variables.set(simbolo.id, simbolo);
    return null;
}
```

Busqueda encadenada por ambito:

```ts
getVariable(id: string): Simbolo | null {
    let tablaActual: TablaSimbolos | undefined = this;

    while (tablaActual) {
        const simbolo = tablaActual.variables.get(id);
        if (simbolo) {
            return simbolo;
        }
        tablaActual = tablaActual.anterior;
    }

    return null;
}
```

La tabla de simbolos resuelve:

- variables
- funciones
- structs
- manejo de ambitos anidados
- validacion de redeclaraciones

### 5.7 Declaracion De Variables

Archivo: [Jison/Instrucciones/Declaracion.ts](Jison/Instrucciones/Declaracion.ts)

```ts
if (this.valor) {
    const resultado = this.valor.interpretar(arbol, tabla);
    if (resultado instanceof Errores) {
        return resultado;
    }

    if (!tipoVariable) {
        tipoVariable = this.valor.tipo.clone();
    } else {
        const error = validarTipo(tipoVariable, this.valor.tipo, this.linea, this.col);
        if (error) {
            return error;
        }
    }
}
```

Esta instruccion:

- evalua la expresion si existe
- infiere tipo cuando corresponde
- valida compatibilidad de tipos
- registra la variable en la tabla de simbolos

### 5.8 Registro E Invocacion De Funciones

Archivo: [Jison/Instrucciones/Funcion.ts](Jison/Instrucciones/Funcion.ts)

Registro:

```ts
interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
    const error = tabla.setFuncion(this.id, this, this.linea, this.col);
    if (error) {
        return error;
    }

    arbol.registrarSimbolo(
        new Simbolo(
            this.tipoRetorno.clone(),
            this.id,
            null,
            this.linea,
            this.col,
            tabla.nombre,
            "Funcion",
        ),
    );

    return null;
}
```

Invocacion:

```ts
const entornoFuncion = new TablaSimbolos(arbol.tablaGlobal, this.id);

for (let index = 0; index < this.parametros.length; index += 1) {
    const parametro = this.parametros[index];
    const argumento = argumentos[index];
    const valor = argumento.interpretar(arbol, tablaLlamada);
```

La clase `Funcion` se encarga de:

- registrar la firma
- validar cantidad de argumentos
- crear el entorno local
- validar tipos de parametros
- validar y normalizar el valor de retorno

### 5.9 Impresion En Consola

Archivo: [Jison/Instrucciones/Print.ts](Jison/Instrucciones/Print.ts)

```ts
interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
    const valores: string[] = [];

    for (const expresion of this.expresiones) {
        const valor = expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }
        valores.push(formatearValor(valor));
    }

    arbol.print(valores.join(" "));
    return null;
}
```

Su trabajo es evaluar cada expresion, convertirla a texto y enviarla a la consola del `Arbol`.

## 6. Analizador Lexico Y Sintactico

Archivo: [Jison/analizador/goscript.jison](Jison/analizador/goscript.jison)

Ejemplo del lexer:

```jison
"func"                      return 'FUNC';
"var"                       return 'VAR';
"struct"                    return 'STRUCT';
"if"                        return 'IF';
"switch"                    return 'SWITCH';
"for"                       return 'FOR';
"fmt.Println"               return 'PRINT';
"strconv.Atoi"              return 'ATOI';
"reflect.TypeOf"            return 'TYPEOF';
"//".*                      /* ignorar */;
\/\*[\s\S]*?\*\/            /* ignorar */;
```

Registro de errores lexicos:

```jison
.                           {
                                if (!yy.lexicalErrors) yy.lexicalErrors = [];
                                yy.lexicalErrors.push(
                                    new Errores("Lexico", `El simbolo ${yytext} no es valido`, yylineno + 1, yylloc.first_column + 1)
                                );
                            }
```

Inicio de la gramatica:

```jison
PROGRAMA
    : SEPS_OPT TOP_ITEMS_OPT SEPS_OPT EOF
        { return $2; }
;
```

El archivo `goscript.jison` cumple dos funciones:

- definir el conjunto de tokens del lenguaje
- construir objetos del AST de interpretacion directamente desde la gramatica

La gramatica formal del proyecto se encuentra en [GRAMATICA_BNF.md](GRAMATICA_BNF.md).

## 7. Generacion Del AST

### 7.1 Construccion De La Raiz

Archivo: [Jison/controllers/parser.controller.ts](Jison/controllers/parser.controller.ts)

```ts
const construirAst = (instrucciones: Instruccion[], arbol: Arbol) => {
    const raiz = new Node("INICIO");

    for (const instruccion of instrucciones) {
        raiz.pushChild(instruccion.ast(arbol, arbol.tablaGlobal));
    }

    return raiz;
};
```

### 7.2 Exportacion A DOT

Archivo: [Jison/Abstract/Node.ts](Jison/Abstract/Node.ts)

```ts
public getDot(): string {
    return `digraph AST {
    graph [fontname="Trebuchet MS", bgcolor="#ffffff", ranksep="0.55", nodesep="0.3"];
    node [fontname="Trebuchet MS", shape=rectangle, style="filled", fillcolor="#ffffff", color="#111111", penwidth="2", fontcolor="#2a3cff", margin="0.08,0.05"];
    edge [color="#111111", penwidth="2"];
${this.getNodes("i")}
}`;
}
```

Recorrido recursivo:

```ts
private getNodes(tag: string): string {
    let dot = `    node_${tag}[label="${this.escape(this.tag)}"];`;

    for (let index = 0; index < this.children.length; index += 1) {
        const childTag = `${tag}_${index}`;
        dot += `\n${this.children[index].getNodes(childTag)}`;
        dot += `\n    node_${tag} -> node_${childTag};`;
    }

    return dot;
}
```

Con esto el AST puede verse:

- como objeto JSON
- como texto DOT
- como imagen SVG en la interfaz

## 8. Componentes Clave Del Frontend

Archivo: [Frontend/src/App.jsx](Frontend/src/App.jsx)

Definicion de la URL del backend:

```jsx
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";
```

Ejecucion desde la interfaz:

```jsx
const response = await fetch(`${API_URL}/api/parser/analizar`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ codigo: archivoActivo.codigo }),
});
```

Recepcion de resultados:

```jsx
setConsola(data?.consola ?? "");
setErrores(Array.isArray(data?.errores) ? data.errores : []);
setTablaSimbolos(Array.isArray(data?.tablaSimbolos) ? data.tablaSimbolos : []);
setAst(data?.ast ?? null);
setAstDot(data?.astDot ?? "");
setAstSvg(data?.astSvg ?? "");
```

Visualizacion del AST:

```jsx
{astSvg ? (
    <div
        className="ast-graphviz-surface"
        dangerouslySetInnerHTML={{ __html: astSvg }}
    />
) : (
    <div className="ast-visual-canvas">
        <ul className="ast-tree-root">
            <AstTreeNode node={ast} />
        </ul>
    </div>
)}
```

## 9. Contrato De La API

### Endpoint

- Metodo: `POST`
- Ruta: `/api/parser/analizar`

### Entrada

```json
{
  "codigo": "func main() { fmt.Println(\"Hola\") }"
}
```

### Salida Correcta

```json
{
  "consola": "Hola\n",
  "errores": [],
  "tablaSimbolos": [],
  "ast": {},
  "astDot": "digraph AST { ... }",
  "astSvg": "<svg>...</svg>"
}
```

### Salida Con Error Sintactico

```json
{
  "consola": "",
  "errores": [
    {
      "tipo": "Sintactico",
      "descripcion": "..."
    }
  ],
  "tablaSimbolos": [],
  "ast": null,
  "astDot": "",
  "astSvg": ""
}
```

## 10. Compilacion Y Ejecucion

### Backend

```powershell
cd Jison
npm install
npm run dev
```

### Frontend

```powershell
cd Frontend
npm install
npm run dev
```

### Construccion

```powershell
cd Jison
npm run build

cd ..\\Frontend
npm run build
```

## 11. Recomendaciones De Mantenimiento

### Si se modifica la gramatica

- editar `Jison/analizador/goscript.jison`
- regenerar el parser con `npm run parse` o `npm run build`
- probar archivos validos y archivos con errores

### Si se agrega una nueva instruccion

1. crear la clase en `Jison/Instrucciones/`
2. implementar `interpretar(...)`
3. implementar `ast(...)`
4. registrar la produccion en `goscript.jison`
5. probar salida, errores y AST

### Si se agrega una nueva expresion nativa

1. crear la clase en `Jison/Expresiones/`
2. validar tipos y retorno
3. exponer el token en el lexer si aplica
4. conectarla en las reglas del parser

### Si falla la grafica del AST

- verificar que Graphviz este instalado y que `dot` pueda ejecutarse desde terminal
- revisar `generarSvgAst(...)` en [Jison/controllers/parser.controller.ts](Jison/controllers/parser.controller.ts)
- usar la vista `DOT` o `JSON` para depuracion mientras se corrige el problema

## 12. Conclusiones Tecnicas

El proyecto ya cuenta con una arquitectura clara para continuar mantenimiento:

- parser e interprete desacoplados por clases
- tabla de simbolos con ambitos
- AST reutilizable para reportes y visualizacion
- frontend separado del backend por API HTTP

Para futuras mejoras conviene concentrarse en:

- reducir conflictos de gramatica en Jison
- ampliar pruebas automatas
- exportar reportes adicionales
- agregar mas capturas y version PDF de la documentacion
