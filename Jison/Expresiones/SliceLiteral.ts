import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { normalizarValorParaTipo, validarTipo } from "../Utilidades/Runtime";

export class SliceLiteral extends Instruccion {
    constructor(
        private tipoSlice: Tipo,
        private valores: Instruccion[],
        linea: number,
        columna: number,
    ) {
        super(tipoSlice.clone(), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const salida: any[] = [];

        for (const expresion of this.valores) {
            const valor = expresion.interpretar(arbol, tabla);
            if (valor instanceof Errores) {
                return valor;
            }

            const subtipo = this.tipoSlice.subtipo;
            if (subtipo) {
                const error = validarTipo(subtipo, expresion.tipo, this.linea, this.col);
                if (error) {
                    return error;
                }

                salida.push(normalizarValorParaTipo(subtipo, valor, expresion.tipo));
            } else {
                salida.push(valor);
            }
        }

        return salida;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("SLICE_LITERAL");
        for (const expresion of this.valores) {
            node.pushChild(expresion.ast(arbol, tabla));
        }
        return node;
    }
}
