import { Tipo } from "../Simbolo/Tipo";

export class BreakSignal {}

export class ContinueSignal {}

export class ReturnSignal {
    constructor(
        public valor: any,
        public tipo: Tipo,
    ) {}
}
