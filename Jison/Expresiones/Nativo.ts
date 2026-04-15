import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { Tipo } from "../Simbolo/Tipo";
import { formatearValor } from "../Utilidades/Runtime";

export class Nativo extends Instruccion {
    constructor(
        public valor: any,
        tipo: Tipo,
        linea: number,
        columna: number,
    ) {
        super(tipo, linea, columna);
    }

    interpretar(_arbol: Arbol, _tabla: TablaSimbolos): any {
        return this.valor;
    }

    public ast(): Node {
        const node = new Node("NATIVO");
        node.pushChild(new Node(formatearValor(this.valor)));
        return node;
    }
}
