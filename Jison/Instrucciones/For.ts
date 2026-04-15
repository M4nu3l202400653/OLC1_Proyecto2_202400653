import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { BreakSignal, ContinueSignal, ReturnSignal } from "../Utilidades/Transferencia";

export class For extends Instruccion {
    constructor(
        private inicializacion: Instruccion | null,
        private condicion: Instruccion | null,
        private actualizacion: Instruccion | null,
        private cuerpo: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.FOR, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const entornoFor = new TablaSimbolos(tabla, "For");

        if (this.inicializacion) {
            const init = this.inicializacion.interpretar(arbol, entornoFor);
            if (init instanceof Errores) {
                return init;
            }
        }

        while (true) {
            if (this.condicion) {
                const condicion = this.condicion.interpretar(arbol, entornoFor);
                if (condicion instanceof Errores) {
                    return condicion;
                }

                if (this.condicion.tipo.tipoDato !== tipoDato.BOOLEANO) {
                    return new Errores("Semantico", "La condicion del for debe ser bool", this.linea, this.col);
                }

                if (!condicion) {
                    break;
                }
            }

            const resultadoCuerpo = this.cuerpo.interpretar(arbol, entornoFor);
            if (resultadoCuerpo instanceof Errores || resultadoCuerpo instanceof ReturnSignal) {
                return resultadoCuerpo;
            }

            if (resultadoCuerpo instanceof BreakSignal) {
                break;
            }

            if (this.actualizacion) {
                const act = this.actualizacion.interpretar(arbol, entornoFor);
                if (act instanceof Errores || act instanceof ReturnSignal) {
                    return act;
                }
            }

            if (resultadoCuerpo instanceof ContinueSignal) {
                continue;
            }
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("FOR");
        if (this.inicializacion) {
            node.pushChild(this.inicializacion.ast(arbol, tabla));
        }
        if (this.condicion) {
            node.pushChild(this.condicion.ast(arbol, tabla));
        }
        if (this.actualizacion) {
            node.pushChild(this.actualizacion.ast(arbol, tabla));
        }
        node.pushChild(this.cuerpo.ast(arbol, tabla));
        return node;
    }
}
