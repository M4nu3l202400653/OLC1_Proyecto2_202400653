import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { resolverResta, resolverSuma } from "../Utilidades/Operaciones";

export class Asignacion extends Instruccion {
    constructor(
        private objetivo: any,
        private valor: Instruccion,
        private operador: "=" | "+=" | "-=",
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.ASIGNACION, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (typeof this.objetivo.asignar !== "function") {
            return new Errores("Semantico", "El destino de asignacion no es valido", this.linea, this.col);
        }

        const nuevoValor = this.valor.interpretar(arbol, tabla);
        if (nuevoValor instanceof Errores) {
            return nuevoValor;
        }

        if (this.operador === "=") {
            return this.objetivo.asignar(arbol, tabla, nuevoValor, this.valor.tipo);
        }

        const actual = this.objetivo.interpretar(arbol, tabla);
        if (actual instanceof Errores) {
            return actual;
        }

        const resultado = this.operador === "+="
            ? resolverSuma(actual, this.objetivo.tipo, nuevoValor, this.valor.tipo, this.linea, this.col)
            : resolverResta(actual, this.objetivo.tipo, nuevoValor, this.valor.tipo, this.linea, this.col);

        if (resultado instanceof Errores) {
            return resultado;
        }

        return this.objetivo.asignar(arbol, tabla, resultado.valor, resultado.tipo);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("ASIGNACION");
        node.pushChild(this.objetivo.ast(arbol, tabla));
        node.pushChild(new Node(this.operador));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
