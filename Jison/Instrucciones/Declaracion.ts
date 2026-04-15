import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";
import { inferirTipoDesdeValor, normalizarValorParaTipo, validarTipo, valorPorDefecto } from "../Utilidades/Runtime";

export class Declaracion extends Instruccion {
    constructor(
        private tipoDeclarado: Tipo | null,
        private id: string,
        private valor: Instruccion | null,
        private esInferida: boolean,
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.DECLARACION, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): Errores | null {
        let tipoVariable = this.tipoDeclarado?.clone() ?? null;
        let valorVariable: any = null;

        if (this.valor) {
            const resultado = this.valor.interpretar(arbol, tabla);
            if (resultado instanceof Errores) {
                return resultado;
            }

            if (!tipoVariable) {
                tipoVariable = this.valor.tipo.clone();
            } else {
                const error = validarTipo(tipoVariable, this.valor.tipo, this.linea, this.col);
                if (error) {
                    return error;
                }
            }

            valorVariable = normalizarValorParaTipo(tipoVariable, resultado, this.valor.tipo);
        } else {
            if (this.esInferida) {
                return new Errores(
                    "Semantico",
                    `La declaracion inferida de ${this.id} requiere una expresion`,
                    this.linea,
                    this.col,
                );
            }

            if (!tipoVariable) {
                return new Errores(
                    "Semantico",
                    `La variable ${this.id} necesita un tipo declarado`,
                    this.linea,
                    this.col,
                );
            }

            valorVariable = valorPorDefecto(tipoVariable);
        }

        if (!tipoVariable) {
            tipoVariable = inferirTipoDesdeValor(valorVariable);
        }

        const simbolo = new Simbolo(
            tipoVariable,
            this.id,
            valorVariable,
            this.linea,
            this.col,
            tabla.nombre,
            "Variable",
        );

        const error = tabla.setVariable(simbolo);
        if (error) {
            return error;
        }

        arbol.registrarSimbolo(simbolo);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("DECLARACION");
        node.pushChild(new Node(this.esInferida ? ":=" : "var"));
        node.pushChild(new Node(this.id));
        if (this.tipoDeclarado) {
            node.pushChild(new Node(this.tipoDeclarado.toString()));
        }
        if (this.valor) {
            node.pushChild(this.valor.ast(arbol, tabla));
        }
        return node;
    }
}
