import { Errores } from "../Excepciones/Errores";
import { Simbolo } from "./Simbolo";

export class TablaSimbolos {
    private variables: Map<string, Simbolo>;
    private funciones: Map<string, any>;
    private structs: Map<string, any>;
    public anterior?: TablaSimbolos;

    constructor(anterior?: TablaSimbolos, public nombre: string = "Global") {
        this.variables = new Map();
        this.funciones = new Map();
        this.structs = new Map();
        this.anterior = anterior;
    }

    existeEnAmbitoActual(id: string): boolean {
        return this.variables.has(id) || this.funciones.has(id) || this.structs.has(id);
    }

    setVariable(simbolo: Simbolo): Errores | null {
        if (this.existeEnAmbitoActual(simbolo.id)) {
            return new Errores(
                "Semantico",
                `El identificador ${simbolo.id} ya existe en el ambito ${this.nombre}`,
                simbolo.linea,
                simbolo.columna,
            );
        }

        this.variables.set(simbolo.id, simbolo);
        return null;
    }

    updateVariable(id: string, valor: any, linea: number, columna: number): Errores | null {
        let tablaActual: TablaSimbolos | undefined = this;

        while (tablaActual) {
            const simbolo = tablaActual.variables.get(id);
            if (simbolo) {
                simbolo.valor = valor;
                return null;
            }
            tablaActual = tablaActual.anterior;
        }

        return new Errores("Semantico", `La variable ${id} no existe`, linea, columna);
    }

    getVariable(id: string): Simbolo | null {
        let tablaActual: TablaSimbolos | undefined = this;

        while (tablaActual) {
            const simbolo = tablaActual.variables.get(id);
            if (simbolo) {
                return simbolo;
            }
            tablaActual = tablaActual.anterior;
        }

        return null;
    }

    setFuncion(id: string, funcion: any, linea: number, columna: number): Errores | null {
        if (this.existeEnAmbitoActual(id)) {
            return new Errores(
                "Semantico",
                `El identificador ${id} ya existe en el ambito ${this.nombre}`,
                linea,
                columna,
            );
        }

        this.funciones.set(id, funcion);
        return null;
    }

    getFuncion(id: string): any | null {
        let tablaActual: TablaSimbolos | undefined = this;

        while (tablaActual) {
            const funcion = tablaActual.funciones.get(id);
            if (funcion) {
                return funcion;
            }
            tablaActual = tablaActual.anterior;
        }

        return null;
    }

    setStruct(id: string, definicion: any, linea: number, columna: number): Errores | null {
        if (this.existeEnAmbitoActual(id)) {
            return new Errores(
                "Semantico",
                `El identificador ${id} ya existe en el ambito ${this.nombre}`,
                linea,
                columna,
            );
        }

        this.structs.set(id, definicion);
        return null;
    }

    getStruct(id: string): any | null {
        let tablaActual: TablaSimbolos | undefined = this;

        while (tablaActual) {
            const struct = tablaActual.structs.get(id);
            if (struct) {
                return struct;
            }
            tablaActual = tablaActual.anterior;
        }

        return null;
    }
}
