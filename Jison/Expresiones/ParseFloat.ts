import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";

export class ParseFloat extends Instruccion {
    constructor(
        private expresion: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.DECIMAL), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }

        if (this.expresion.tipo.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "strconv.ParseFloat solo acepta string", this.linea, this.col);
        }

        if (!/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(String(valor))) {
            return new Errores("Semantico", `No se pudo convertir "${valor}" a float64`, this.linea, this.col);
        }

        return Number.parseFloat(String(valor));
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("PARSE_FLOAT");
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
