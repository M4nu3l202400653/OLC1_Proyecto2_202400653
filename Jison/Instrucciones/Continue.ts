import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { ContinueSignal } from "../Utilidades/Transferencia";

export class Continue extends Instruccion {
    constructor(linea: number, columna: number) {
        super(new Tipo(tipoInstruccion.CONTINUE, false), linea, columna);
    }

    interpretar(_arbol: Arbol, _tabla: TablaSimbolos): any {
        return new ContinueSignal();
    }

    public ast(): Node {
        return new Node("CONTINUE");
    }
}
