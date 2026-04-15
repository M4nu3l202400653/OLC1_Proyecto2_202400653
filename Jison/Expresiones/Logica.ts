import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { resolverLogica } from "../Utilidades/Operaciones";

export class Logica extends Instruccion {
    constructor(
        private operando1: Instruccion,
        private operando2: Instruccion,
        private operador: "&&" | "||",
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.BOOLEANO), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const izquierdo = this.operando1.interpretar(arbol, tabla);
        if (izquierdo instanceof Errores) {
            return izquierdo;
        }

        const derecho = this.operando2.interpretar(arbol, tabla);
        if (derecho instanceof Errores) {
            return derecho;
        }

        const resultado = resolverLogica(
            this.operador,
            izquierdo,
            this.operando1.tipo,
            derecho,
            this.operando2.tipo,
            this.linea,
            this.col,
        );

        if (resultado instanceof Errores) {
            return resultado;
        }

        this.tipo = resultado.tipo;
        return resultado.valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("LOGICA");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node(this.operador));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}
