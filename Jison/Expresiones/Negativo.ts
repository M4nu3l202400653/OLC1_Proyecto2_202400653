import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { resolverNegacion } from "../Utilidades/Operaciones";

export class Negativo extends Instruccion {
    constructor(
        private expresion: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.ERROR), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }

        const resultado = resolverNegacion(valor, this.expresion.tipo, this.linea, this.col);
        if (resultado instanceof Errores) {
            return resultado;
        }

        this.tipo = resultado.tipo;
        return resultado.valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("NEGATIVO");
        node.pushChild(new Node("-"));
        node.pushChild(this.expresion.ast(arbol, tabla));
        return node;
    }
}
