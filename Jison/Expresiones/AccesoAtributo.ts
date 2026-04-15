import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { StructValue } from "../Simbolo/StructValue";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { normalizarValorParaTipo, validarTipo } from "../Utilidades/Runtime";

export class AccesoAtributo extends Instruccion {
    constructor(
        private objetivo: Instruccion,
        private atributo: string,
        linea: number,
        columna: number,
    ) {
        super(objetivo.tipo.clone(), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const valorObjetivo = this.objetivo.interpretar(arbol, tabla);
        if (valorObjetivo instanceof Errores) {
            return valorObjetivo;
        }

        if (!(valorObjetivo instanceof StructValue)) {
            return new Errores("Semantico", "El acceso por punto solo aplica a structs", this.linea, this.col);
        }

        const atributo = valorObjetivo.getAtributo(this.atributo);
        if (!atributo) {
            return new Errores(
                "Semantico",
                `El atributo ${this.atributo} no existe en ${valorObjetivo.nombre}`,
                this.linea,
                this.col,
            );
        }

        this.tipo = atributo.tipo.clone();
        return atributo.valor;
    }

    asignar(arbol: Arbol, tabla: TablaSimbolos, valorNuevo: any, tipoValor: Tipo) {
        const valorObjetivo = this.objetivo.interpretar(arbol, tabla);
        if (valorObjetivo instanceof Errores) {
            return valorObjetivo;
        }

        if (!(valorObjetivo instanceof StructValue)) {
            return new Errores("Semantico", "El acceso por punto solo aplica a structs", this.linea, this.col);
        }

        const atributo = valorObjetivo.getAtributo(this.atributo);
        if (!atributo) {
            return new Errores(
                "Semantico",
                `El atributo ${this.atributo} no existe en ${valorObjetivo.nombre}`,
                this.linea,
                this.col,
            );
        }

        const error = validarTipo(atributo.tipo, tipoValor, this.linea, this.col);
        if (error) {
            return error;
        }

        valorObjetivo.setAtributo(
            this.atributo,
            atributo.tipo,
            normalizarValorParaTipo(atributo.tipo, valorNuevo, tipoValor),
        );
        this.tipo = atributo.tipo.clone();
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("ACCESO_ATRIBUTO");
        node.pushChild(this.objetivo.ast(arbol, tabla));
        node.pushChild(new Node("."));
        node.pushChild(new Node(this.atributo));
        return node;
    }
}
