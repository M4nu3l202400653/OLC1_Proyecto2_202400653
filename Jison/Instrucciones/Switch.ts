import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { BreakSignal } from "../Utilidades/Transferencia";
import { Case } from "./Case";

export class Switch extends Instruccion {
    constructor(
        private expresion: Instruccion,
        private casos: Case[],
        private defecto: Instruccion | null,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.SWITCH, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorSwitch = this.expresion.interpretar(arbol, tabla);
        if (valorSwitch instanceof Errores) {
            return valorSwitch;
        }

        for (const caso of this.casos) {
            const coincide = caso.coincide(arbol, tabla, valorSwitch, this.expresion.tipo);
            if (coincide instanceof Errores) {
                return coincide;
            }

            if (coincide) {
                const resultado = caso.interpretar(arbol, tabla);
                if (resultado instanceof BreakSignal) {
                    return null;
                }
                return resultado;
            }
        }

        if (this.defecto) {
            const resultado = this.defecto.interpretar(arbol, tabla);
            if (resultado instanceof BreakSignal) {
                return null;
            }
            return resultado;
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SWITCH");
        node.pushChild(this.expresion.ast(arbol, tabla));
        for (const caso of this.casos) {
            node.pushChild(caso.ast(arbol, tabla));
        }
        if (this.defecto) {
            const defecto = new Node("DEFAULT");
            defecto.pushChild(this.defecto.ast(arbol, tabla));
            node.pushChild(defecto);
        }
        return node;
    }
}
