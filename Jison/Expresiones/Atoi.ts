import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";

export class Atoi extends Instruccion {
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

        if (this.expresion.tipo.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "strconv.Atoi solo acepta string", this.linea, this.col);
        }

        if (!/^[+-]?\d+$/.test(String(valor))) {
            return new Errores("Semantico", `No se pudo convertir "${valor}" a int`, this.linea, this.col);
        }

        return Number.parseInt(String(valor), 10);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("ATOI");
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
