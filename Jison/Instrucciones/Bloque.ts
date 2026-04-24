import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class Bloque extends Instruccion {
    constructor(
        private instrucciones: Instruccion[],
        linea: number,
        columna: number,
        private nombreAmbito: string = "Bloque",
        private crearEntorno: boolean = true,
    ) {
        super(new Tipo(tipoInstruccion.BLOQUE, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const entorno = this.crearEntorno ? new TablaSimbolos(tabla, this.nombreAmbito) : tabla;

        for (const instruccion of this.instrucciones) {
            const resultado = instruccion.interpretar(arbol, entorno);
            if (resultado instanceof Errores) {
                arbol.registrarError(resultado);
                continue;
            }

            if (resultado) {
                return resultado;
            }
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("BLOQUE");
        for (const instruccion of this.instrucciones) {
            node.pushChild(instruccion.ast(arbol, tabla));
        }
        return node;
    }
}
