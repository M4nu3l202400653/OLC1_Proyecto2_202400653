import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoDato } from "../Simbolo/tipoDato";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { normalizarValorParaTipo, validarTipo } from "../Utilidades/Runtime";
import { ReturnSignal } from "../Utilidades/Transferencia";

type ParametroFuncion = {
    id: string;
    tipo: Tipo;
};

export class Funcion extends Instruccion {
    constructor(
        public id: string,
        public parametros: ParametroFuncion[],
        public tipoRetorno: Tipo,
        private cuerpo: Instruccion,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.FUNCION, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const error = tabla.setFuncion(this.id, this, this.linea, this.col);
        if (error) {
            return error;
        }

        arbol.registrarSimbolo(
            new Simbolo(
                this.tipoRetorno.clone(),
                this.id,
                null,
                this.linea,
                this.col,
                tabla.nombre,
                "Funcion",
            ),
        );

        return null;
    }

    invocar(
        arbol: Arbol,
        tablaLlamada: TablaSimbolos,
        argumentos: Instruccion[],
        linea: number,
        columna: number,
    ) {
        if (argumentos.length !== this.parametros.length) {
            return new Errores(
                "Semantico",
                `La funcion ${this.id} esperaba ${this.parametros.length} argumentos y recibio ${argumentos.length}`,
                linea,
                columna,
            );
        }

        const entornoFuncion = new TablaSimbolos(arbol.tablaGlobal, this.id);

        for (let index = 0; index < this.parametros.length; index += 1) {
            const parametro = this.parametros[index];
            const argumento = argumentos[index];
            const valor = argumento.interpretar(arbol, tablaLlamada);
            if (valor instanceof Errores) {
                return valor;
            }

            const errorTipo = validarTipo(parametro.tipo, argumento.tipo, linea, columna);
            if (errorTipo) {
                return errorTipo;
            }

            const simbolo = new Simbolo(
                parametro.tipo.clone(),
                parametro.id,
                normalizarValorParaTipo(parametro.tipo, valor, argumento.tipo),
                linea,
                columna,
                entornoFuncion.nombre,
                "Parametro",
            );

            const error = entornoFuncion.setVariable(simbolo);
            if (error) {
                return error;
            }

            arbol.registrarSimbolo(simbolo);
        }

        const resultado = this.cuerpo.interpretar(arbol, entornoFuncion);
        if (resultado instanceof Errores) {
            return resultado;
        }

        if (resultado instanceof ReturnSignal) {
            if (this.tipoRetorno.tipoDato === tipoDato.VOID) {
                if (resultado.valor !== null) {
                    return new Errores("Semantico", `La funcion ${this.id} no debe retornar valor`, linea, columna);
                }
                return null;
            }

            const errorRetorno = validarTipo(this.tipoRetorno, resultado.tipo, linea, columna);
            if (errorRetorno) {
                return errorRetorno;
            }

            return normalizarValorParaTipo(this.tipoRetorno, resultado.valor, resultado.tipo);
        }

        if (this.tipoRetorno.tipoDato !== tipoDato.VOID) {
            return new Errores(
                "Semantico",
                `La funcion ${this.id} debe retornar ${this.tipoRetorno.toString()}`,
                linea,
                columna,
            );
        }

        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("FUNCION");
        node.pushChild(new Node(this.id));
        const params = new Node("PARAMETROS");
        for (const parametro of this.parametros) {
            const item = new Node("PARAMETRO");
            item.pushChild(new Node(parametro.id));
            item.pushChild(new Node(parametro.tipo.toString()));
            params.pushChild(item);
        }
        node.pushChild(params);
        node.pushChild(this.cuerpo.ast(arbol, tabla));
        return node;
    }
}
