import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { resolverResta, resolverSuma } from "../Utilidades/Operaciones";

export class Incremento extends Instruccion {
    constructor(
        private objetivo: any,
        private delta: 1 | -1,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.INCREMENTO, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (typeof this.objetivo.asignar !== "function") {
            return new Errores("Semantico", "El destino del incremento no es valido", this.linea, this.col);
        }

        const actual = this.objetivo.interpretar(arbol, tabla);
        if (actual instanceof Errores) {
            return actual;
        }

        const literal = 1;
        const tipoLiteral = Tipo.primitivo(tipoDato.ENTERO);
        const resultado = this.delta === 1
            ? resolverSuma(actual, this.objetivo.tipo, literal, tipoLiteral, this.linea, this.col)
            : resolverResta(actual, this.objetivo.tipo, literal, tipoLiteral, this.linea, this.col);

        if (resultado instanceof Errores) {
            return resultado;
        }

        return this.objetivo.asignar(arbol, tabla, resultado.valor, resultado.tipo);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node(this.delta === 1 ? "INCREMENTO" : "DECREMENTO");
        node.pushChild(this.objetivo.ast(arbol, tabla));
        node.pushChild(new Node(this.delta === 1 ? "++" : "--"));
        return node;
    }
}
