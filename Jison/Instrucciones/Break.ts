import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { BreakSignal } from "../Utilidades/Transferencia";

export class Break extends Instruccion {
    constructor(linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.BREAK, false), linea, columna);
    }

    interpretar(_arbol: Arbol, _tabla: TablaSimbolos): any {
        return new BreakSignal();
    }

    public ast(): Node {
        return new Node("BREAK");
    }
}
