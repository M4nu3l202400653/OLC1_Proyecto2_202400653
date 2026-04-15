import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class ExpresionStmt extends Instruccion {
    constructor(
        private expresion: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.LLAMADA, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("EXPRESION_STMT");
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
