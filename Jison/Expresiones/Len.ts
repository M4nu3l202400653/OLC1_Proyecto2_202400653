import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";

export class Len extends Instruccion {
    constructor(
        private expresion: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.ENTERO), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }

        if (!Array.isArray(valor)) {
            return new Errores("Semantico", "len solo acepta slices", this.linea, this.col);
        }

        return valor.length;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("LEN");
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
