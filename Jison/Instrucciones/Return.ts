import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { ReturnSignal } from "../Utilidades/Transferencia";

export class Return extends Instruccion {
    constructor(
        private expresion: Instruccion | null,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.RETURN, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        if (!this.expresion) {
            return new ReturnSignal(null, Tipo.primitivo(tipoDato.VOID));
        }

        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }

        return new ReturnSignal(valor, this.expresion.tipo.clone());
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("RETURN");
        if (this.expresion) {
            node.pushChild(this.expresion.ast(arbol, tabla));
        }
        return node;
    }
}
