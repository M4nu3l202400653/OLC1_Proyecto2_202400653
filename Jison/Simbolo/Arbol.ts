import { Instruccion } from "../Abstract/Instruccion";
import { Node } from "../Abstract/Node";
import { Errores } from "../Excepciones/Errores";
import { Simbolo } from "./Simbolo";
import { TablaSimbolos } from "./TablaSimbolos";

export class Arbol {
    public consola = "";
    public tablaGlobal: TablaSimbolos;
    public errores: Errores[] = [];
    public simbolos: Simbolo[] = [];
    public contador = 0;
    public ast: Node | null = null;

    constructor(public instrucciones: Instruccion[]) {
        this.tablaGlobal = new TablaSimbolos(undefined, "Global");
    }

    print(valor: string) {
        this.consola += `${valor}\n`;
    }

    registrarError(error: Errores) {
        this.errores.push(error);
    }

    registrarSimbolo(simbolo: Simbolo) {
        this.simbolos.push(simbolo);
    }

    getContador(): number {
        this.contador += 1;
        return this.contador;
    }
}
