import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { BreakSignal, ContinueSignal, ReturnSignal } from "../Utilidades/Transferencia";

export class ForRange extends Instruccion {
    constructor(
        private idIndice: string,
        private idValor: string,
        private iterable: Instruccion,
        private cuerpo: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.FOR_RANGE, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorIterable = this.iterable.interpretar(arbol, tabla);
        if (valorIterable instanceof Errores) {
            return valorIterable;
        }

        if (!Array.isArray(valorIterable)) {
            return new Errores("Semantico", "range solo acepta slices", this.linea, this.col);
        }

        const entorno = new TablaSimbolos(tabla, "ForRange");
        const tipoElemento = this.iterable.tipo.subtipo?.clone() ?? Tipo.primitivo(tipoDato.NIL);
        const simboloIndice = new Simbolo(Tipo.primitivo(tipoDato.ENTERO), this.idIndice, 0, this.linea, this.col, entorno.nombre);
        const simboloValor = new Simbolo(tipoElemento, this.idValor, null, this.linea, this.col, entorno.nombre);

        const errorIndice = entorno.setVariable(simboloIndice);
        if (errorIndice) {
            return errorIndice;
        }
        const errorValor = entorno.setVariable(simboloValor);
        if (errorValor) {
            return errorValor;
        }

        arbol.registrarSimbolo(simboloIndice);
        arbol.registrarSimbolo(simboloValor);

        for (let indice = 0; indice < valorIterable.length; indice += 1) {
            simboloIndice.valor = indice;
            simboloValor.valor = valorIterable[indice];

            const resultado = this.cuerpo.interpretar(arbol, entorno);
            if (resultado instanceof Errores || resultado instanceof ReturnSignal) {
                return resultado;
            }
            if (resultado instanceof BreakSignal) {
                break;
            }
            if (resultado instanceof ContinueSignal) {
                continue;
            }
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("FOR_RANGE");
        node.pushChild(new Node(this.idIndice));
        node.pushChild(new Node(this.idValor));
        node.pushChild(this.iterable.ast(arbol, tabla));
        node.pushChild(this.cuerpo.ast(arbol, tabla));
        return node;
    }
}
