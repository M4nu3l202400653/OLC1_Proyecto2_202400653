import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";

export class SlicesIndex extends Instruccion {
    constructor(
        private slice: Instruccion,
        private buscado: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.ENTERO), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const sliceValor = this.slice.interpretar(arbol, tabla);
        if (sliceValor instanceof Errores) {
            return sliceValor;
        }

        const buscado = this.buscado.interpretar(arbol, tabla);
        if (buscado instanceof Errores) {
            return buscado;
        }

        if (!Array.isArray(sliceValor)) {
            return new Errores("Semantico", "slices.Index solo acepta slices", this.linea, this.col);
        }

        return sliceValor.findIndex((item) => item === buscado);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SLICES_INDEX");
        node.pushChild(this.slice.ast(arbol, tabla));
        node.pushChild(this.buscado.ast(arbol, tabla));
        return node;
    }
}
