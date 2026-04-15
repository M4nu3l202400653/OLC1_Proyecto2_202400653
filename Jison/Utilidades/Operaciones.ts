import { Errores } from "../Excepciones/Errores";
import { Tipo } from "../Simbolo/Tipo";
import { tipoDato } from "../Simbolo/tipoDato";
import { formatearValor, obtenerNumero } from "./Runtime";

type ResultadoOperacion = {
    valor: any;
    tipo: Tipo;
};

function esBooleano(tipo: Tipo) {
    return tipo.tipoDato === tipoDato.BOOLEANO;
}

function esCadena(tipo: Tipo) {
    return tipo.tipoDato === tipoDato.CADENA;
}

function esRune(tipo: Tipo) {
    return tipo.tipoDato === tipoDato.RUNE;
}

function esEntero(tipo: Tipo) {
    return tipo.tipoDato === tipoDato.ENTERO;
}

function esDecimal(tipo: Tipo) {
    return tipo.tipoDato === tipoDato.DECIMAL;
}

function esNumericoExtendido(tipo: Tipo) {
    return (
        tipo.tipoDato === tipoDato.ENTERO
        || tipo.tipoDato === tipoDato.DECIMAL
        || tipo.tipoDato === tipoDato.BOOLEANO
        || tipo.tipoDato === tipoDato.RUNE
    );
}

function tipoNumericoResultado(tipo1: Tipo, tipo2: Tipo): Tipo {
    return esDecimal(tipo1) || esDecimal(tipo2)
        ? Tipo.primitivo(tipoDato.DECIMAL)
        : Tipo.primitivo(tipoDato.ENTERO);
}

function errorOperacion(nombre: string, tipo1: Tipo, tipo2: Tipo, linea: number, columna: number) {
    return new Errores(
        "Semantico",
        `Operacion ${nombre} invalida entre ${tipo1.toString()} y ${tipo2.toString()}`,
        linea,
        columna,
    );
}

export function resolverSuma(
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (esCadena(tipo1) || esCadena(tipo2)) {
        return {
            valor: `${formatearValor(valor1)}${formatearValor(valor2)}`,
            tipo: Tipo.primitivo(tipoDato.CADENA),
        };
    }

    if (esBooleano(tipo1) && esBooleano(tipo2)) {
        return {
            valor: Boolean(valor1) || Boolean(valor2),
            tipo: Tipo.primitivo(tipoDato.BOOLEANO),
        };
    }

    if (esNumericoExtendido(tipo1) && esNumericoExtendido(tipo2)) {
        const numero1 = obtenerNumero(valor1, tipo1);
        const numero2 = obtenerNumero(valor2, tipo2);
        const tipo = tipoNumericoResultado(tipo1, tipo2);
        return {
            valor: tipo.tipoDato === tipoDato.DECIMAL ? numero1 + numero2 : Math.trunc(numero1 + numero2),
            tipo,
        };
    }

    return errorOperacion("suma", tipo1, tipo2, linea, columna);
}

export function resolverResta(
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (esNumericoExtendido(tipo1) && esNumericoExtendido(tipo2)) {
        const numero1 = obtenerNumero(valor1, tipo1);
        const numero2 = obtenerNumero(valor2, tipo2);
        const tipo = tipoNumericoResultado(tipo1, tipo2);
        return {
            valor: tipo.tipoDato === tipoDato.DECIMAL ? numero1 - numero2 : Math.trunc(numero1 - numero2),
            tipo,
        };
    }

    return errorOperacion("resta", tipo1, tipo2, linea, columna);
}

export function resolverMultiplicacion(
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (esEntero(tipo1) && esCadena(tipo2)) {
        return {
            valor: String(valor2).repeat(Math.max(0, Number(valor1))),
            tipo: Tipo.primitivo(tipoDato.CADENA),
        };
    }

    if (esCadena(tipo1) && esEntero(tipo2)) {
        return {
            valor: String(valor1).repeat(Math.max(0, Number(valor2))),
            tipo: Tipo.primitivo(tipoDato.CADENA),
        };
    }

    if (esBooleano(tipo1) && esBooleano(tipo2)) {
        return {
            valor: Boolean(valor1) && Boolean(valor2),
            tipo: Tipo.primitivo(tipoDato.BOOLEANO),
        };
    }

    if (esNumericoExtendido(tipo1) && esNumericoExtendido(tipo2)) {
        const numero1 = obtenerNumero(valor1, tipo1);
        const numero2 = obtenerNumero(valor2, tipo2);
        const tipo = tipoNumericoResultado(tipo1, tipo2);
        return {
            valor: tipo.tipoDato === tipoDato.DECIMAL ? numero1 * numero2 : Math.trunc(numero1 * numero2),
            tipo,
        };
    }

    return errorOperacion("multiplicacion", tipo1, tipo2, linea, columna);
}

export function resolverDivision(
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (!tipo1.esNumerico() || !tipo2.esNumerico()) {
        return errorOperacion("division", tipo1, tipo2, linea, columna);
    }

    const numero1 = obtenerNumero(valor1, tipo1);
    const numero2 = obtenerNumero(valor2, tipo2);

    if (numero2 === 0) {
        return new Errores("Semantico", "No se puede dividir dentro de cero", linea, columna);
    }

    const tipo = tipoNumericoResultado(tipo1, tipo2);

    if (tipo.tipoDato === tipoDato.ENTERO) {
        return {
            valor: Math.trunc(numero1 / numero2),
            tipo,
        };
    }

    return {
        valor: numero1 / numero2,
        tipo,
    };
}

export function resolverModulo(
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (!esEntero(tipo1) || !esEntero(tipo2)) {
        return errorOperacion("modulo", tipo1, tipo2, linea, columna);
    }

    const numero1 = Number(valor1);
    const numero2 = Number(valor2);

    if (numero2 === 0) {
        return new Errores("Semantico", "No se puede calcular modulo con cero", linea, columna);
    }

    return {
        valor: numero1 % numero2,
        tipo: Tipo.primitivo(tipoDato.ENTERO),
    };
}

export function resolverNegacion(
    valor: any,
    tipo: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (!tipo.esNumerico()) {
        return new Errores(
            "Semantico",
            `La negacion unaria solo aplica a int o float64, no a ${tipo.toString()}`,
            linea,
            columna,
        );
    }

    return {
        valor: -Number(valor),
        tipo: tipo.clone(),
    };
}

export function resolverComparacion(
    operador: "==" | "!=" | "<" | "<=" | ">" | ">=",
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    const ambasNumericas = tipo1.esNumerico() && tipo2.esNumerico();
    const ambasRunes = esRune(tipo1) && esRune(tipo2);
    const ambasCadenas = esCadena(tipo1) && esCadena(tipo2);
    const ambasBooleanas = esBooleano(tipo1) && esBooleano(tipo2);

    if (operador === "==" || operador === "!=") {
        if (ambasNumericas) {
            const resultado = Number(valor1) === Number(valor2);
            return {
                valor: operador === "==" ? resultado : !resultado,
                tipo: Tipo.primitivo(tipoDato.BOOLEANO),
            };
        }

        if (ambasRunes || ambasCadenas || ambasBooleanas) {
            const resultado = valor1 === valor2;
            return {
                valor: operador === "==" ? resultado : !resultado,
                tipo: Tipo.primitivo(tipoDato.BOOLEANO),
            };
        }

        return errorOperacion("comparacion", tipo1, tipo2, linea, columna);
    }

    if (ambasNumericas) {
        const numero1 = Number(valor1);
        const numero2 = Number(valor2);
        return {
            valor: compararNumeros(operador, numero1, numero2),
            tipo: Tipo.primitivo(tipoDato.BOOLEANO),
        };
    }

    if (ambasRunes) {
        const numero1 = obtenerNumero(valor1, tipo1);
        const numero2 = obtenerNumero(valor2, tipo2);
        return {
            valor: compararNumeros(operador, numero1, numero2),
            tipo: Tipo.primitivo(tipoDato.BOOLEANO),
        };
    }

    return errorOperacion("comparacion", tipo1, tipo2, linea, columna);
}

function compararNumeros(operador: string, numero1: number, numero2: number): boolean {
    switch (operador) {
        case "<":
            return numero1 < numero2;
        case "<=":
            return numero1 <= numero2;
        case ">":
            return numero1 > numero2;
        case ">=":
            return numero1 >= numero2;
        default:
            return false;
    }
}

export function resolverLogica(
    operador: "&&" | "||",
    valor1: any,
    tipo1: Tipo,
    valor2: any,
    tipo2: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (!esBooleano(tipo1) || !esBooleano(tipo2)) {
        return errorOperacion("logica", tipo1, tipo2, linea, columna);
    }

    return {
        valor: operador === "&&" ? Boolean(valor1) && Boolean(valor2) : Boolean(valor1) || Boolean(valor2),
        tipo: Tipo.primitivo(tipoDato.BOOLEANO),
    };
}

export function resolverNot(
    valor: any,
    tipo: Tipo,
    linea: number,
    columna: number,
): ResultadoOperacion | Errores {
    if (!esBooleano(tipo)) {
        return new Errores(
            "Semantico",
            `El operador ! solo acepta bool, no ${tipo.toString()}`,
            linea,
            columna,
        );
    }

    return {
        valor: !Boolean(valor),
        tipo: Tipo.primitivo(tipoDato.BOOLEANO),
    };
}
