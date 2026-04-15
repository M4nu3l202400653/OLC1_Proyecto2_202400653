export class Errores {
    constructor(
        public tipo: string,
        public descripcion: string,
        public linea: number,
        public columna: number,
    ) {}

    get desc(): string {
        return this.descripcion;
    }

    set desc(valor: string) {
        this.descripcion = valor;
    }

    toJSON() {
        return {
            tipo: this.tipo,
            descripcion: this.descripcion,
            linea: this.linea,
            columna: this.columna,
        };
    }

    toString(): string {
        return `${this.tipo}: ${this.descripcion} (${this.linea}, ${this.columna})`;
    }
}
