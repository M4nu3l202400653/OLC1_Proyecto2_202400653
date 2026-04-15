import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { formatearValor } from "../Utilidades/Runtime";

export class Print extends Instruccion {
    constructor(
        private expresiones: Instruccion[],
        linea: number,
        col: number,
    ) {
        super(new Tipo(tipoInstruccion.PRINT, false), linea, col);
    }

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

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("PRINT");
        for (const expresion of this.expresiones) {
            node.pushChild(expresion.ast(arbol, tabla));
        }
        return node;
    }
}
