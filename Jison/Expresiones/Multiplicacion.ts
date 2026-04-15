import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { resolverMultiplicacion } from "../Utilidades/Operaciones";
import { OperadoresAritmeticos } from "./OperadoresAritmeticos";

export class Multiplicacion extends Instruccion {
    constructor(
        private operando1: Instruccion,
        private operando2: Instruccion,
        private operacion: OperadoresAritmeticos,
        linea: number,
        columna: number,
    ) {
        super(Tipo.primitivo(tipoDato.ERROR), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof Errores) {
            return opIzq;
        }

        const opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof Errores) {
            return opDer;
        }

        if (this.operacion !== OperadoresAritmeticos.MULTIPLICACION) {
            return new Errores("Semantico", "Operador de multiplicacion invalido", this.linea, this.col);
        }

        const resultado = resolverMultiplicacion(
            opIzq,
            this.operando1.tipo,
            opDer,
            this.operando2.tipo,
            this.linea,
            this.col,
        );

        if (resultado instanceof Errores) {
            return resultado;
        }

        this.tipo = resultado.tipo;
        return resultado.valor;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("MULTIPLICACION");
        node.pushChild(this.operando1.ast(arbol, tabla));
        node.pushChild(new Node("*"));
        node.pushChild(this.operando2.ast(arbol, tabla));
        return node;
    }
}
