import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoDato } from "../Simbolo/tipoDato";
import { normalizarValorParaTipo, validarTipo } from "../Utilidades/Runtime";

export class Identificador extends Instruccion {
    constructor(
        public id: string,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.ERROR), linea, columna);
    }

    interpretar(_arbol: Arbol, tabla: TablaSimbolos): any {
        const simbolo = tabla.getVariable(this.id);

        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }

        this.tipo = simbolo.tipo.clone();
        return simbolo.valor;
    }

    asignar(_arbol: Arbol, tabla: TablaSimbolos, valor: any, tipoValor: Tipo) {
        const simbolo = tabla.getVariable(this.id);

        if (!simbolo) {
            return new Errores("Semantico", `La variable ${this.id} no existe`, this.linea, this.col);
        }

        const error = validarTipo(simbolo.tipo, tipoValor, this.linea, this.col);
        if (error) {
            return error;
        }

        simbolo.valor = normalizarValorParaTipo(simbolo.tipo, valor, tipoValor);
        this.tipo = simbolo.tipo.clone();
        return null;
    }

    public ast(): Node {
        const node = new Node("IDENTIFICADOR");
        node.pushChild(new Node(this.id));
        return node;
    }
}
