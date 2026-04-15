import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";

export class StringsJoin extends Instruccion {
    constructor(
        private slice: Instruccion,
        private separador: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.CADENA), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const sliceValor = this.slice.interpretar(arbol, tabla);
        if (sliceValor instanceof Errores) {
            return sliceValor;
        }

        const separador = this.separador.interpretar(arbol, tabla);
        if (separador instanceof Errores) {
            return separador;
        }

        if (!Array.isArray(sliceValor)) {
            return new Errores("Semantico", "strings.Join solo acepta []string", this.linea, this.col);
        }

        if (this.slice.tipo.subtipo?.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "strings.Join solo acepta []string", this.linea, this.col);
        }

        if (this.separador.tipo.tipoDato !== tipoDato.CADENA) {
            return new Errores("Semantico", "El separador de strings.Join debe ser string", this.linea, this.col);
        }

        return sliceValor.join(separador);
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("STRINGS_JOIN");
        node.pushChild(this.slice.ast(arbol, tabla));
        node.pushChild(this.separador.ast(arbol, tabla));
        return node;
    }
}
