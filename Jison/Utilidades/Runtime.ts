import { Errores } from "../Excepciones/Errores";
import { StructValue } from "../Simbolo/StructValue";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";

export function esTipoCompatible(destino: Tipo, origen: Tipo): boolean {
    if (destino.tipoDato === origen.tipoDato) {
        if (destino.tipoDato === tipoDato.STRUCT) {
            return destino.referencia === origen.referencia;
        }

        if (destino.tipoDato === tipoDato.SLICE) {
            if (!destino.subtipo || !origen.subtipo) {
                return true;
            }
            return esTipoCompatible(destino.subtipo, origen.subtipo);
        }

        return true;
    }

    if (destino.tipoDato === tipoDato.DECIMAL && origen.tipoDato === tipoDato.ENTERO) {
        return true;
    }

    if (
        origen.tipoDato === tipoDato.NIL &&
        (destino.tipoDato === tipoDato.SLICE || destino.tipoDato === tipoDato.STRUCT)
    ) {
        return true;
    }

    return false;
}

export function valorPorDefecto(tipo: Tipo): any {
    switch (tipo.tipoDato) {
        case tipoDato.ENTERO:
            return 0;
        case tipoDato.DECIMAL:
            return 0.0;
        case tipoDato.CADENA:
            return "";
        case tipoDato.BOOLEANO:
            return false;
        case tipoDato.RUNE:
            return "\0";
        case tipoDato.SLICE:
        case tipoDato.STRUCT:
        case tipoDato.NIL:
            return null;
        default:
            return null;
    }
}

export function inferirTipoDesdeValor(valor: any, tipoSugerido?: Tipo | null): Tipo {
    if (tipoSugerido && valor === null) {
        return tipoSugerido.clone();
    }

    if (valor instanceof StructValue) {
        return Tipo.struct(valor.nombre);
    }

    if (Array.isArray(valor)) {
        if (tipoSugerido?.tipoDato === tipoDato.SLICE) {
            return tipoSugerido.clone();
        }

        const subtipo = valor.length > 0
            ? inferirTipoDesdeValor(valor[0])
            : Tipo.primitivo(tipoDato.NIL);
        return Tipo.slice(subtipo);
    }

    if (typeof valor === "number") {
        return Number.isInteger(valor)
            ? Tipo.primitivo(tipoDato.ENTERO)
            : Tipo.primitivo(tipoDato.DECIMAL);
    }

    if (typeof valor === "string") {
        if (valor.length === 1 && tipoSugerido?.tipoDato === tipoDato.RUNE) {
            return Tipo.primitivo(tipoDato.RUNE);
        }

        return Tipo.primitivo(tipoDato.CADENA);
    }

    if (typeof valor === "boolean") {
        return Tipo.primitivo(tipoDato.BOOLEANO);
    }

    if (valor === null || valor === undefined) {
        return Tipo.primitivo(tipoDato.NIL);
    }

    return Tipo.primitivo(tipoDato.ERROR);
}

export function normalizarValorParaTipo(tipo: Tipo, valor: any, tipoOrigen: Tipo): any {
    if (valor === null || valor === undefined) {
        return null;
    }

    if (tipo.tipoDato === tipoDato.DECIMAL && tipoOrigen.tipoDato === tipoDato.ENTERO) {
        return Number(valor);
    }

    return valor;
}

export function obtenerNumero(valor: any, tipo: Tipo): number {
    switch (tipo.tipoDato) {
        case tipoDato.ENTERO:
        case tipoDato.DECIMAL:
            return Number(valor);
        case tipoDato.BOOLEANO:
            return valor ? 1 : 0;
        case tipoDato.RUNE:
            return typeof valor === "string" ? valor.charCodeAt(0) : Number(valor);
        default:
            return Number.NaN;
    }
}

export function formatearValor(valor: any): string {
    if (valor === null || valor === undefined) {
        return "nil";
    }

    if (valor instanceof StructValue) {
        const contenido = valor
            .getEntries()
            .map(([id, atributo]) => `${id}: ${formatearValor(atributo.valor)}`)
            .join(", ");
        return `${valor.nombre}{${contenido}}`;
    }

    if (Array.isArray(valor)) {
        return `[${valor.map((item) => formatearValor(item)).join(" ")}]`;
    }

    if (typeof valor === "boolean") {
        return valor ? "true" : "false";
    }

    return String(valor);
}

export function validarTipo(
    tipoEsperado: Tipo,
    tipoRecibido: Tipo,
    linea: number,
    columna: number,
    mensaje?: string,
): Errores | null {
    if (esTipoCompatible(tipoEsperado, tipoRecibido)) {
        return null;
    }

    return new Errores(
        "Semantico",
        mensaje ?? `No se puede asignar ${tipoRecibido.toString()} a ${tipoEsperado.toString()}`,
        linea,
        columna,
    );
}
