import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { normalizarValorParaTipo, validarTipo } from "../Utilidades/Runtime";

export class Append extends Instruccion {
    constructor(
        private slice: Instruccion,
        private valor: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(slice.tipo.clone(), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const sliceValor = this.slice.interpretar(arbol, tabla);
        if (sliceValor instanceof Errores) {
            return sliceValor;
        }

        this.tipo = this.slice.tipo.clone();

        const valor = this.valor.interpretar(arbol, tabla);
        if (valor instanceof Errores) {
            return valor;
        }

        if (!Array.isArray(sliceValor)) {
            return new Errores("Semantico", "append solo acepta slices", this.linea, this.col);
        }

        const tipoElemento = this.slice.tipo.subtipo;
        if (tipoElemento) {
            const error = validarTipo(tipoElemento, this.valor.tipo, this.linea, this.col);
            if (error) {
                return error;
            }

            return [...sliceValor, normalizarValorParaTipo(tipoElemento, valor, this.valor.tipo)];
        }

        return [...sliceValor, valor];
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("APPEND");
        node.pushChild(this.slice.ast(arbol, tabla));
        node.pushChild(this.valor.ast(arbol, tabla));
        return node;
    }
}
