import { tipoInstruccion } from "./tipoInstruccion";
import { tipoDato } from "./tipoDato";

type TipoOpciones = {
    referencia?: string | null;
    subtipo?: Tipo | null;
};

export class Tipo {
    private _tipo?: tipoInstruccion;
    private _dato?: tipoDato;
    public referencia?: string | null;
    public subtipo?: Tipo | null;

    constructor(
        valor?: tipoInstruccion | tipoDato,
        esDato: boolean = true,
        opciones: TipoOpciones = {},
    ) {
        if (valor !== undefined) {
            if (esDato) {
                this._dato = valor as tipoDato;
            } else {
                this._tipo = valor as tipoInstruccion;
            }
        }

        this.referencia = opciones.referencia ?? null;
        this.subtipo = opciones.subtipo ?? null;
    }

    static primitivo(valor: tipoDato): Tipo {
        return new Tipo(valor, true);
    }

    static slice(subtipo: Tipo): Tipo {
        return new Tipo(tipoDato.SLICE, true, { subtipo });
    }

    static struct(nombre: string): Tipo {
        return new Tipo(tipoDato.STRUCT, true, { referencia: nombre });
    }

    static void(): Tipo {
        return new Tipo(tipoDato.VOID, true);
    }

    clone(): Tipo {
        return new Tipo(
            this._dato ?? this._tipo,
            this._dato !== undefined,
            {
                referencia: this.referencia,
                subtipo: this.subtipo ? this.subtipo.clone() : null,
            },
        );
    }

    esNumerico(): boolean {
        return this._dato === tipoDato.ENTERO || this._dato === tipoDato.DECIMAL;
    }

    get tipo(): tipoInstruccion | undefined {
        return this._tipo;
    }

    set tipo(valor: tipoInstruccion | undefined) {
        this._tipo = valor;
    }

    get tipoDato(): tipoDato | undefined {
        return this._dato;
    }

    set tipoDato(valor: tipoDato | undefined) {
        this._dato = valor;
    }

    toString(): string {
        switch (this._dato) {
            case tipoDato.SLICE:
                return `[]${this.subtipo?.toString() ?? "any"}`;
            case tipoDato.STRUCT:
                return this.referencia ?? "struct";
            case tipoDato.ENTERO:
                return "int";
            case tipoDato.DECIMAL:
                return "float64";
            case tipoDato.CADENA:
                return "string";
            case tipoDato.BOOLEANO:
                return "bool";
            case tipoDato.RUNE:
                return "rune";
            case tipoDato.NIL:
                return "nil";
            case tipoDato.VOID:
                return "void";
            case tipoDato.ERROR:
                return "error";
            default:
                return this._tipo ?? "desconocido";
        }
    }
}
