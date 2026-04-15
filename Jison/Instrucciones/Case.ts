import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { resolverComparacion } from "../Utilidades/Operaciones";

export class Case extends Instruccion {
    constructor(
        public expresion: Instruccion,
        public bloque: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.CASE, false), linea, columna);
    }

    coincide(arbol: Arbol, tabla: TablaSimbolos, valorSwitch: any, tipoSwitch: Tipo): any {
        const valorCase = this.expresion.interpretar(arbol, tabla);
        if (valorCase instanceof Errores) {
            return valorCase;
        }

        const comparacion = resolverComparacion(
            "==",
            valorSwitch,
            tipoSwitch,
            valorCase,
            this.expresion.tipo,
            this.linea,
            this.col,
        );

        if (comparacion instanceof Errores) {
            return comparacion;
        }

        return comparacion.valor;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        return this.bloque.interpretar(arbol, tabla);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("CASE");
        node.pushChild(this.expresion.ast(arbol, tabla));
        node.pushChild(this.bloque.ast(arbol, tabla));
        return node;
    }
}
