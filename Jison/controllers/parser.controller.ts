import parser from "../analizador/parserWrapper";
import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Funcion } from "../Instrucciones/Funcion";
import { Struct } from "../Instrucciones/Struct";
import { Arbol } from "../Simbolo/Arbol";
import { BreakSignal, ContinueSignal, ReturnSignal } from "../Utilidades/Transferencia";

const registrarResultado = (arbol: Arbol, resultado: any, linea: number, columna: number) => {
    if (resultado instanceof Errores) {
        arbol.registrarError(resultado);
        return;
    }

    if (resultado instanceof BreakSignal) {
        arbol.registrarError(new Errores("Semantico", "break fuera de un ciclo o switch", linea, columna));
        return;
    }

    if (resultado instanceof ContinueSignal) {
        arbol.registrarError(new Errores("Semantico", "continue fuera de un ciclo", linea, columna));
        return;
    }

    if (resultado instanceof ReturnSignal) {
        arbol.registrarError(new Errores("Semantico", "return fuera de una funcion", linea, columna));
    }
};

const construirAst = (instrucciones: Instruccion[]) => {
    const raiz = new Node("INICIO");

    for (const instruccion of instrucciones) {
        raiz.pushChild(instruccion.ast());
    }

    return raiz;
};

export const analizar = (req: any, res: any) => {
    const entrada = req.body?.codigo ?? "";
    parser.yy = { lexicalErrors: [] };

    try {
        let instrucciones = parser.parse(entrada);
        if (!Array.isArray(instrucciones)) {
            instrucciones = instrucciones ? [instrucciones] : [];
        }

        const arbol = new Arbol(instrucciones);
        const tablaGlobal = arbol.tablaGlobal;

        for (const instruccion of instrucciones) {
            if (instruccion instanceof Funcion || instruccion instanceof Struct) {
                const resultado = instruccion.interpretar(arbol, tablaGlobal);
                registrarResultado(arbol, resultado, instruccion.linea, instruccion.col);
            }
        }

        for (const instruccion of instrucciones) {
            if (instruccion instanceof Funcion || instruccion instanceof Struct) {
                continue;
            }

            const resultado = instruccion.interpretar(arbol, tablaGlobal);
            registrarResultado(arbol, resultado, instruccion.linea, instruccion.col);
        }

        const funcionMain = tablaGlobal.getFuncion("main");
        if (!funcionMain) {
            arbol.registrarError(new Errores("Semantico", "No se encontro la funcion main", 0, 0));
        } else {
            const resultadoMain = funcionMain.invocar(arbol, tablaGlobal, [], 0, 0);
            registrarResultado(arbol, resultadoMain, 0, 0);
        }

        const ast = construirAst(instrucciones);
        arbol.ast = ast;

        const lexicalErrors = Array.isArray(parser.yy?.lexicalErrors) ? parser.yy.lexicalErrors : [];
        lexicalErrors.forEach((error: Errores) => arbol.registrarError(error));

        res.json({
            consola: arbol.consola,
            errores: arbol.errores.map((error) => error.toJSON()),
            tablaSimbolos: arbol.simbolos.map((simbolo) => simbolo.toJSON()),
            ast: ast.toObject(),
            astDot: ast.getDot(),
        });
    } catch (error: any) {
        const errores: Errores[] = [];
        const lexicalErrors = Array.isArray(parser.yy?.lexicalErrors) ? parser.yy.lexicalErrors : [];

        lexicalErrors.forEach((lexicalError: Errores) => errores.push(lexicalError));
        errores.push(
            new Errores(
                "Sintactico",
                error?.message || "Error sintactico no controlado",
                error?.hash?.loc?.first_line ?? 0,
                error?.hash?.loc?.first_column ?? 0,
            ),
        );

        res.status(400).json({
            consola: "",
            errores: errores.map((item) => item.toJSON()),
            tablaSimbolos: [],
            ast: null,
            astDot: "",
        });
    }
};
