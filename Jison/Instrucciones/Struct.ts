import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Arbol } from "../Simbolo/Arbol";
import { Simbolo } from "../Simbolo/Simbolo";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { tipoInstruccion } from "../Simbolo/tipoInstruccion";

type AtributoStruct = {
    id: string;
    tipo: Tipo;
};

export class Struct extends Instruccion {
    constructor(
        public id: string,
        public atributos: AtributoStruct[],
        linea: number,
        columna: number,
    ) {
        super(new Tipo(tipoInstruccion.STRUCT, false), linea, columna);
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolos): any {
        const error = tabla.setStruct(this.id, this, this.linea, this.col);
        if (error) {
            return error;
        }

        arbol.registrarSimbolo(
            new Simbolo(
                Tipo.struct(this.id),
                this.id,
                null,
                this.linea,
                this.col,
                tabla.nombre,
                "Struct",
            ),
        );

        return null;
    }

    public ast(): Node {
        const node = new Node("STRUCT");
        node.pushChild(new Node(this.id));
        for (const atributo of this.atributos) {
            const item = new Node("ATRIBUTO");
            item.pushChild(new Node(atributo.id));
            item.pushChild(new Node(atributo.tipo.toString()));
            node.pushChild(item);
        }
        return node;
    }
}
