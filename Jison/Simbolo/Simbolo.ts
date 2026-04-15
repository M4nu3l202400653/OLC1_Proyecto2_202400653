import { Tipo } from "./Tipo";

export class Simbolo {
    constructor(
        public tipo: Tipo,
        public id: string,
        public valor: any,
        public linea: number,
        public columna: number,
        public entorno: string,
        public tipoSimbolo: string = "Variable",
    ) {}

    toJSON() {
        return {
            id: this.id,
            tipoSimbolo: this.tipoSimbolo,
            tipoDato: this.tipo.toString(),
            ambito: this.entorno,
            linea: this.linea,
            columna: this.columna,
            valor: this.valor,
        };
    }
}
