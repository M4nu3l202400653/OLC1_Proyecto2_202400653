import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";

export class Llamada extends Instruccion {
    constructor(
        private id: string,
        private argumentos: Instruccion[],
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.ERROR), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const funcion = tabla.getFuncion(this.id);
        if (!funcion) {
            return new Errores("Semantico", `La funcion ${this.id} no existe`, this.linea, this.col);
        }

        const resultado = funcion.invocar(arbol, tabla, this.argumentos, this.linea, this.col);
        if (resultado instanceof Errores) {
            return resultado;
        }

        this.tipo = funcion.tipoRetorno.clone();
        return resultado;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("LLAMADA");
        node.pushChild(new Node(this.id));
        for (const argumento of this.argumentos) {
            node.pushChild(argumento.ast(arbol, tabla));
        }
        return node;
    }
}
