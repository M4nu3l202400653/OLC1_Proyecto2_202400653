import { Node } from "../Abstract/Node";
import { Instruccion } from "../Abstract/Instruccion";
import { Errores } from "../Excepciones/Errores";
import { Arbol } from "../Simbolo/Arbol";
import { Tipo } from "../Simbolo/Tipo";
import { TablaSimbolos } from "../Simbolo/TablaSimbolos";
import { inferirTipoDesdeValor, normalizarValorParaTipo, validarTipo } from "../Utilidades/Runtime";

export class AccesoIndice extends Instruccion {
    constructor(
        private objetivo: Instruccion,
        private indice: Instruccion,
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

        const valorIndice = this.indice.interpretar(arbol, tabla);
        if (valorIndice instanceof Errores) {
            return valorIndice;
        }

        if (!Array.isArray(valorObjetivo)) {
            return new Errores("Semantico", "El acceso por indice solo aplica a slices", this.linea, this.col);
        }

        if (!Number.isInteger(Number(valorIndice))) {
            return new Errores("Semantico", "El indice debe ser entero", this.linea, this.col);
        }

        const index = Number(valorIndice);
        if (index < 0 || index >= valorObjetivo.length) {
            return new Errores("Semantico", `El indice ${index} esta fuera de rango`, this.linea, this.col);
        }

        const valor = valorObjetivo[index];
        this.tipo = this.objetivo.tipo.subtipo?.clone() ?? inferirTipoDesdeValor(valor);
        return valor;
    }

    asignar(arbol: Arbol, tabla: TablaSimbolos, valorNuevo: any, tipoValor: Tipo) {
        const valorObjetivo = this.objetivo.interpretar(arbol, tabla);
        if (valorObjetivo instanceof Errores) {
            return valorObjetivo;
        }

        const valorIndice = this.indice.interpretar(arbol, tabla);
        if (valorIndice instanceof Errores) {
            return valorIndice;
        }

        if (!Array.isArray(valorObjetivo)) {
            return new Errores("Semantico", "El acceso por indice solo aplica a slices", this.linea, this.col);
        }

        const index = Number(valorIndice);
        if (!Number.isInteger(index)) {
            return new Errores("Semantico", "El indice debe ser entero", this.linea, this.col);
        }

        if (index < 0 || index >= valorObjetivo.length) {
            return new Errores("Semantico", `El indice ${index} esta fuera de rango`, this.linea, this.col);
        }

        const tipoElemento = this.objetivo.tipo.subtipo;
        if (tipoElemento) {
            const error = validarTipo(tipoElemento, tipoValor, this.linea, this.col);
            if (error) {
                return error;
            }
            valorObjetivo[index] = normalizarValorParaTipo(tipoElemento, valorNuevo, tipoValor);
            this.tipo = tipoElemento.clone();
            return null;
        }

        valorObjetivo[index] = valorNuevo;
        this.tipo = inferirTipoDesdeValor(valorNuevo);
        return null;
    }

    public ast(arbol: Arbol, tabla: TablaSimbolos): Node {
        const node = new Node("ACCESO_INDICE");
        node.pushChild(this.objetivo.ast(arbol, tabla));
        node.pushChild(new Node("["));
        node.pushChild(this.indice.ast(arbol, tabla));
        node.pushChild(new Node("]"));
        return node;
    }
}
