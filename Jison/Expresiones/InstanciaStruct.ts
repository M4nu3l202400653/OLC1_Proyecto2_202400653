import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { StructValue } from "../Simbolo/StructValue";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { normalizarValorParaTipo, validarTipo, valorPorDefecto } from "../Utilidades/Runtime";

type AtributoLiteral = {
    id: string;
    expresion: Instruccion;
};

export class InstanciaStruct extends Instruccion {
    constructor(
        private idStruct: string,
        private atributos: AtributoLiteral[],
        linea: number,
        columna: number,
    ) {
        super(Tipo.struct(idStruct), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const definicion = tabla.getStruct(this.idStruct);
        if (!definicion) {
            return new Errores("Semantico", `El struct ${this.idStruct} no existe`, this.linea, this.col);
        }

        const instancia = new StructValue(this.idStruct);

        for (const atributo of definicion.atributos) {
            instancia.setAtributo(
                atributo.id,
                atributo.tipo.clone(),
                valorPorDefecto(atributo.tipo),
            );
        }

        for (const atributo of this.atributos) {
            const definicionAtributo = definicion.atributos.find((item: any) => item.id === atributo.id);
            if (!definicionAtributo) {
                return new Errores(
                    "Semantico",
                    `El atributo ${atributo.id} no existe en ${this.idStruct}`,
                    this.linea,
                    this.col,
                );
            }

            const valor = atributo.expresion.interpretar(arbol, tabla);
            if (valor instanceof Errores) {
                return valor;
            }

            const error = validarTipo(definicionAtributo.tipo, atributo.expresion.tipo, this.linea, this.col);
            if (error) {
                return error;
            }

            instancia.setAtributo(
                atributo.id,
                definicionAtributo.tipo.clone(),
                normalizarValorParaTipo(definicionAtributo.tipo, valor, atributo.expresion.tipo),
            );
        }

        return instancia;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("INSTANCIA_STRUCT");
        node.pushChild(new Node(this.idStruct));
        for (const atributo of this.atributos) {
            const atributoNode = new Node("ATRIBUTO");
            atributoNode.pushChild(new Node(atributo.id));
            atributoNode.pushChild(atributo.expresion.ast(arbol, tabla));
            node.pushChild(atributoNode);
        }
        return node;
    }
}
