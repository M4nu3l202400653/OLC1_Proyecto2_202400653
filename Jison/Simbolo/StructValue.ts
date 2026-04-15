import { Tipo } from "./Tipo";

export class StructValue {
    private atributos: Map<string, { tipo: Tipo; valor: any }>;

    constructor(public nombre: string) {
        this.atributos = new Map();
    }

    setAtributo(id: string, tipo: Tipo, valor: any) {
        this.atributos.set(id, { tipo, valor });
    }

    getAtributo(id: string) {
        return this.atributos.get(id) ?? null;
    }

    getEntries() {
        return Array.from(this.atributos.entries());
    }

    toJSON() {
        return {
            nombre: this.nombre,
            atributos: Object.fromEntries(
                this.getEntries().map(([id, atributo]) => [
                    id,
                    {
                        tipo: atributo.tipo.toString(),
                        valor: atributo.valor,
                    },
                ]),
            ),
        };
    }
}
