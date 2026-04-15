import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

export class If extends Instruccion {
    constructor(
        private condicion: Instruccion,
        private bloqueIf: Instruccion,
        private bloqueElse: Instruccion | null,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.IF, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const resultadoCondicion = this.condicion.interpretar(arbol, tabla);
        if (resultadoCondicion instanceof Errores) {
            return resultadoCondicion;
        }

        if (this.condicion.tipo.tipoDato !== tipoDato.BOOLEANO) {
            return new Errores("Semantico", "La condicion del if debe ser bool", this.linea, this.col);
        }

        if (resultadoCondicion) {
            return this.bloqueIf.interpretar(arbol, tabla);
        }

        if (this.bloqueElse) {
            return this.bloqueElse.interpretar(arbol, tabla);
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("IF");
        node.pushChild(this.condicion.ast(arbol, tabla));
        node.pushChild(this.bloqueIf.ast(arbol, tabla));
        if (this.bloqueElse) {
            node.pushChild(this.bloqueElse.ast(arbol, tabla));
        }
        return node;
    }
}
