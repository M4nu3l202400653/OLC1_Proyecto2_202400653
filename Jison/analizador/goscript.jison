%{
const Declaracion = require("../Instrucciones/Declaracion").Declaracion;
const Asignacion = require("../Instrucciones/Asignacion").Asignacion;
const Bloque = require("../Instrucciones/Bloque").Bloque;
const Print = require("../Instrucciones/Print").Print;
const If = require("../Instrucciones/If").If;
const For = require("../Instrucciones/For").For;
const ForRange = require("../Instrucciones/ForRange").ForRange;
const Continue = require("../Instrucciones/Continue").Continue;
const Break = require("../Instrucciones/Break").Break;
const Return = require("../Instrucciones/Return").Return;
const Incremento = require("../Instrucciones/Incremento").Incremento;
const ExpresionStmt = require("../Instrucciones/ExpresionStmt").ExpresionStmt;
const Funcion = require("../Instrucciones/Funcion").Funcion;
const Struct = require("../Instrucciones/Struct").Struct;
const Switch = require("../Instrucciones/Switch").Switch;
const Case = require("../Instrucciones/Case").Case;

const Nativo = require("../Expresiones/Nativo").Nativo;
const Identificador = require("../Expresiones/Identificador").Identificador;
const Suma = require("../Expresiones/Suma").Suma;
const Resta = require("../Expresiones/Resta").Resta;
const Multiplicacion = require("../Expresiones/Multiplicacion").Multiplicacion;
const Division = require("../Expresiones/Division").Division;
const Modulo = require("../Expresiones/Modulo").Modulo;
const Negativo = require("../Expresiones/Negativo").Negativo;
const Comparacion = require("../Expresiones/Comparacion").Comparacion;
const Logica = require("../Expresiones/Logica").Logica;
const Not = require("../Expresiones/Not").Not;
const AccesoIndice = require("../Expresiones/AccesoIndice").AccesoIndice;
const AccesoAtributo = require("../Expresiones/AccesoAtributo").AccesoAtributo;
const SliceLiteral = require("../Expresiones/SliceLiteral").SliceLiteral;
const InstanciaStruct = require("../Expresiones/InstanciaStruct").InstanciaStruct;
const Llamada = require("../Expresiones/Llamada").Llamada;
const Len = require("../Expresiones/Len").Len;
const Append = require("../Expresiones/Append").Append;
const SlicesIndex = require("../Expresiones/SlicesIndex").SlicesIndex;
const StringsJoin = require("../Expresiones/StringsJoin").StringsJoin;
const Atoi = require("../Expresiones/Atoi").Atoi;
const ParseFloat = require("../Expresiones/ParseFloat").ParseFloat;
const TypeOf = require("../Expresiones/TypeOf").TypeOf;

const Tipo = require("../Simbolo/Tipo").Tipo;
const tipoDato = require("../Simbolo/tipoDato").tipoDato;
const OperadoresAritmeticos = require("../Expresiones/OperadoresAritmeticos").OperadoresAritmeticos;
const Errores = require("../Excepciones/Errores").Errores;

function decodeStringLiteral(text) {
    return JSON.parse(text);
}

function decodeRuneLiteral(text) {
    const inner = text.substring(1, text.length - 1);
    return decodeStringLiteral(`"${inner.replace(/"/g, '\\"')}"`);
}

function createCase(expresion, instrucciones, line, col) {
    return new Case(
        expresion,
        new Bloque(instrucciones, line, col, "Case"),
        line,
        col,
    );
}

function createDefault(instrucciones, line, col) {
    return new Bloque(instrucciones, line, col, "Default");
}

function createSliceItem(expresion) {
    return {
        kind: "expr",
        expresion,
    };
}

function createAnonSliceLiteral(valores, line, col) {
    return {
        kind: "anon_slice",
        valores,
        line,
        col,
    };
}

function createInvalidLiteral(line, col) {
    return new Nativo(null, Tipo.primitivo(tipoDato.ERROR), line, col);
}

function buildTypedSliceLiteral(tipoSlice, valores, line, col) {
    const expresiones = valores.map((valor) => {
        if (!valor || typeof valor !== "object") {
            return createInvalidLiteral(line, col);
        }

        if (valor.kind === "expr") {
            return valor.expresion;
        }

        if (valor.kind === "anon_slice") {
            if (!tipoSlice.subtipo || tipoSlice.subtipo.tipoDato !== tipoDato.SLICE) {
                return createInvalidLiteral(valor.line, valor.col);
            }

            return buildTypedSliceLiteral(
                tipoSlice.subtipo.clone(),
                valor.valores,
                valor.line,
                valor.col,
            );
        }

        return createInvalidLiteral(line, col);
    });

    return new SliceLiteral(tipoSlice.clone(), expresiones, line, col);
}

function buildAnonymousLiteral(tipo, literal, line, col) {
    if (!tipo || !literal) {
        return createInvalidLiteral(line, col);
    }

    if (tipo.tipoDato === tipoDato.STRUCT && literal.kind === "anon_struct" && tipo.referencia) {
        return new InstanciaStruct(tipo.referencia, literal.valor, line, col);
    }

    if (tipo.tipoDato === tipoDato.SLICE && literal.kind === "anon_slice") {
        return buildTypedSliceLiteral(tipo, literal.valor, line, col);
    }

    return createInvalidLiteral(line, col);
}
%}

%options locations

%lex
%%
"func"                      return 'FUNC';
"var"                       return 'VAR';
"struct"                    return 'STRUCT';
"if"                        return 'IF';
"else"                      return 'ELSE';
"switch"                    return 'SWITCH';
"case"                      return 'CASE';
"default"                   return 'DEFAULT';
"for"                       return 'FOR';
"range"                     return 'RANGE';
"break"                     return 'BREAK';
"continue"                  return 'CONTINUE';
"return"                    return 'RETURN';
"true"                      return 'TRUE';
"false"                     return 'FALSE';
"nil"                       return 'NIL';
"int"                       return 'INT_TYPE';
"float64"                   return 'FLOAT_TYPE';
"string"                    return 'STRING_TYPE';
"bool"                      return 'BOOL_TYPE';
"rune"                      return 'RUNE_TYPE';
"fmt.Println"               return 'PRINT';
"slices.Index"              return 'SLICES_INDEX';
"strings.Join"              return 'STRINGS_JOIN';
"len"                       return 'LEN';
"append"                    return 'APPEND';
"strconv.Atoi"              return 'ATOI';
"strconv.ParseFloat"        return 'PARSEFLOAT';
"reflect.TypeOf"            return 'TYPEOF';
".string()"                 return 'STRINGIFY';
":="                        return 'DECLARE_ASSIGN';
"+="                        return 'PLUS_ASSIGN';
"-="                        return 'MINUS_ASSIGN';
"=="                        return 'EQEQ';
"!="                        return 'NEQ';
"<="                        return 'LE';
">="                        return 'GE';
"&&"                        return 'AND';
"||"                        return 'OR';
"++"                        return 'INC';
"--"                        return 'DEC';
[ \t\f]+                    /* ignorar */;
"//".*                      /* ignorar */;
\/\*[\s\S]*?\*\/            /* ignorar */;
"!"                         return 'NOT';
"="                         return 'ASSIGN';
"<"                         return 'LT';
">"                         return 'GT';
"+"                         return 'PLUS';
"-"                         return 'MINUS';
"*"                         return 'TIMES';
"/"                         return 'DIV';
"%"                         return 'MOD';
"("                         return 'LPAREN';
")"                         return 'RPAREN';
"{"                         return 'LBRACE';
"}"                         return 'RBRACE';
"["                         return 'LBRACKET';
"]"                         return 'RBRACKET';
","                         return 'COMMA';
":"                         return 'COLON';
"."                         return 'DOT';
";"                         return 'SEP';
[\r\n]+                     return 'SEP';
[0-9]+"."[0-9]+             return 'DECIMAL';
[0-9]+                      return 'INT';
\"([^\"\\]|\\[btnfr\"\\])*\" return 'STRING';
\'([^\'\\]|\\[btnfr\'\\])*\' return 'RUNE';
[a-zA-Z_][a-zA-Z0-9_]*      return 'ID';
<<EOF>>                     return 'EOF';
.                           {
                                if (!yy.lexicalErrors) yy.lexicalErrors = [];
                                yy.lexicalErrors.push(
                                    new Errores("Lexico", `El simbolo ${yytext} no es valido`, yylineno + 1, yylloc.first_column + 1)
                                );
                            }
/lex

%start PROGRAMA

%left OR
%left AND
%left EQEQ NEQ
%left LT LE GT GE
%left PLUS MINUS
%left TIMES DIV MOD
%right NOT UMINUS

%%

PROGRAMA
    : SEPS_OPT TOP_ITEMS_OPT SEPS_OPT EOF
        { return $2; }
;

TOP_ITEMS_OPT
    : TOP_ITEMS
        { $$ = $1; }
    |
        { $$ = []; }
;

TOP_ITEMS
    : TOP_ITEMS SEPS TOP_ITEM
        { $1.push($3); $$ = $1; }
    | TOP_ITEMS SEPS
        { $$ = $1; }
    | TOP_ITEM
        { $$ = [$1]; }
;

TOP_ITEM
    : FUNCION_DECL
        { $$ = $1; }
    | STRUCT_DECL
        { $$ = $1; }
    | DECLARACION_STMT
        { $$ = $1; }
    | ASIGNACION_STMT
        { $$ = $1; }
;

SEPS_OPT
    : SEPS
        { $$ = null; }
    |
        { $$ = null; }
;

SEPS
    : SEP
        { $$ = null; }
    | SEPS SEP
        { $$ = null; }
;

FUNCION_DECL
    : FUNC ID LPAREN PARAMS_OPT RPAREN RETORNO_OPT BLOQUE
        {
            $$ = new Funcion($2, $4, $6, $7, @1.first_line, @1.first_column);
        }
;

RETORNO_OPT
    : TYPE_REF
        { $$ = $1; }
    |
        { $$ = Tipo.void(); }
;

PARAMS_OPT
    : PARAMS
        { $$ = $1; }
    |
        { $$ = []; }
;

PARAMS
    : PARAMS COMMA PARAM
        { $1.push($3); $$ = $1; }
    | PARAM
        { $$ = [$1]; }
;

PARAM
    : ID TYPE_REF
        { $$ = { id: $1, tipo: $2 }; }
;

STRUCT_DECL
    : STRUCT ID LBRACE STRUCT_BODY RBRACE
        {
            $$ = new Struct($2, $4, @1.first_line, @1.first_column);
        }
;

STRUCT_BODY
    : STRUCT_LINES
        { $$ = $1; }
    | SEPS STRUCT_LINES
        { $$ = $2; }
;

STRUCT_LINES
    : STRUCT_LINES STRUCT_ATTR_LINE
        { $1.push($2); $$ = $1; }
    | STRUCT_ATTR_LINE
        { $$ = [$1]; }
;

STRUCT_ATTR_LINE
    : STRUCT_ATTR
        { $$ = $1; }
    | STRUCT_ATTR SEPS
        { $$ = $1; }
;

STRUCT_ATTR
    : TYPE_REF ID
        { $$ = { id: $2, tipo: $1 }; }
;

BLOQUE
    : LBRACE RBRACE
        {
            $$ = new Bloque([], @1.first_line, @1.first_column);
        }
    | LBRACE SEPS RBRACE
        {
            $$ = new Bloque([], @1.first_line, @1.first_column);
        }
    | LBRACE BLOCK_BODY RBRACE
        {
            $$ = new Bloque($2, @1.first_line, @1.first_column);
        }
;

BLOCK_BODY
    : BLOCK_LINES
        { $$ = $1; }
    | SEPS BLOCK_LINES
        { $$ = $2; }
;

BLOCK_LINES
    : BLOCK_LINES STMT_LINE
        { $1.push($2); $$ = $1; }
    | STMT_LINE
        { $$ = [$1]; }
;

STMT_LINE
    : STMT
        { $$ = $1; }
    | STMT SEPS
        { $$ = $1; }
;

STMT
    : DECLARACION_STMT
        { $$ = $1; }
    | ASIGNACION_STMT
        { $$ = $1; }
    | PRINT_STMT
        { $$ = $1; }
    | IF_STMT
        { $$ = $1; }
    | FOR_STMT
        { $$ = $1; }
    | SWITCH_STMT
        { $$ = $1; }
    | BREAK
        { $$ = new Break(@1.first_line, @1.first_column); }
    | CONTINUE
        { $$ = new Continue(@1.first_line, @1.first_column); }
    | RETURN
        { $$ = new Return(null, @1.first_line, @1.first_column); }
    | RETURN EXP
        { $$ = new Return($2, @1.first_line, @1.first_column); }
    | INCDEC_STMT
        { $$ = $1; }
    | LLAMADA_STMT
        { $$ = $1; }
    | BLOQUE
        { $$ = $1; }
;

PRINT_STMT
    : PRINT LPAREN ARG_LIST_OPT RPAREN
        { $$ = new Print($3, @1.first_line, @1.first_column); }
;

DECLARACION_STMT
    : VAR ID TYPE_REF ASSIGN EXP
        { $$ = new Declaracion($3, $2, $5, false, @1.first_line, @1.first_column); }
    | VAR ID TYPE_REF ASSIGN ANON_LITERAL
        { $$ = new Declaracion($3, $2, buildAnonymousLiteral($3, $5, @1.first_line, @1.first_column), false, @1.first_line, @1.first_column); }
    | VAR ID TYPE_REF
        { $$ = new Declaracion($3, $2, null, false, @1.first_line, @1.first_column); }
    | DECL_TYPE ID ASSIGN EXP
        { $$ = new Declaracion($1, $2, $4, false, @2.first_line, @2.first_column); }
    | DECL_TYPE ID ASSIGN ANON_LITERAL
        { $$ = new Declaracion($1, $2, buildAnonymousLiteral($1, $4, @1.first_line, @1.first_column), false, @2.first_line, @2.first_column); }
    | ID ID ASSIGN EXP
        { $$ = new Declaracion(Tipo.struct($1), $2, $4, false, @2.first_line, @2.first_column); }
    | ID ID ASSIGN ANON_LITERAL
        { $$ = new Declaracion(Tipo.struct($1), $2, buildAnonymousLiteral(Tipo.struct($1), $4, @1.first_line, @1.first_column), false, @2.first_line, @2.first_column); }
    | ID DECLARE_ASSIGN EXP
        { $$ = new Declaracion(null, $1, $3, true, @1.first_line, @1.first_column); }
;

ASIGNACION_STMT
    : POSTFIX_EXP_NO_STRUCT ASSIGN EXP
        { $$ = new Asignacion($1, $3, "=", @2.first_line, @2.first_column); }
    | POSTFIX_EXP_NO_STRUCT PLUS_ASSIGN EXP
        { $$ = new Asignacion($1, $3, "+=", @2.first_line, @2.first_column); }
    | POSTFIX_EXP_NO_STRUCT MINUS_ASSIGN EXP
        { $$ = new Asignacion($1, $3, "-=", @2.first_line, @2.first_column); }
;

INCDEC_STMT
    : POSTFIX_EXP_NO_STRUCT INC
        { $$ = new Incremento($1, 1, @2.first_line, @2.first_column); }
    | POSTFIX_EXP_NO_STRUCT DEC
        { $$ = new Incremento($1, -1, @2.first_line, @2.first_column); }
;

LLAMADA_STMT
    : FUNC_CALL
        { $$ = new ExpresionStmt($1, @1.first_line, @1.first_column); }
;

IF_STMT
    : IF CONDICION BLOQUE ELSE_OPT
        { $$ = new If($2, $3, $4, @1.first_line, @1.first_column); }
;

ELSE_OPT
    : ELSE IF_STMT
        { $$ = $2; }
    | ELSE BLOQUE
        { $$ = $2; }
    |
        { $$ = null; }
;

CONDICION
    : EXP_NO_STRUCT
        { $$ = $1; }
;

FOR_STMT
    : FOR CONDICION BLOQUE
        { $$ = new For(null, $2, null, $3, @1.first_line, @1.first_column); }
    | FOR FOR_INIT SEP EXP SEP FOR_UPDATE BLOQUE
        { $$ = new For($2, $4, $6, $7, @1.first_line, @1.first_column); }
    | FOR ID COMMA ID DECLARE_ASSIGN RANGE EXP_NO_STRUCT BLOQUE
        { $$ = new ForRange($2, $4, $7, $8, @1.first_line, @1.first_column); }
;

FOR_INIT
    : DECLARACION_STMT
        { $$ = $1; }
    | ASIGNACION_STMT
        { $$ = $1; }
    | INCDEC_STMT
        { $$ = $1; }
;

FOR_UPDATE
    : ASIGNACION_STMT
        { $$ = $1; }
    | INCDEC_STMT
        { $$ = $1; }
    | LLAMADA_STMT
        { $$ = $1; }
;

SWITCH_STMT
    : SWITCH EXP_NO_STRUCT LBRACE SWITCH_BODY_OPT RBRACE
        { $$ = new Switch($2, $4.cases, $4.defaultBlock, @1.first_line, @1.first_column); }
;

SWITCH_BODY_OPT
    : SWITCH_BODY
        { $$ = $1; }
    | SEPS SWITCH_BODY
        { $$ = $2; }
    |
        { $$ = { cases: [], defaultBlock: null }; }
    | SEPS
        { $$ = { cases: [], defaultBlock: null }; }
;

SWITCH_BODY
    : CASE_BLOCKS DEFAULT_BLOCK_OPT
        { $$ = { cases: $1, defaultBlock: $2 }; }
    | DEFAULT_BLOCK
        { $$ = { cases: [], defaultBlock: $1 }; }
;

CASE_BLOCKS
    : CASE_BLOCKS CASE_BLOCK
        { $1.push($2); $$ = $1; }
    | CASE_BLOCK
        { $$ = [$1]; }
;

CASE_BLOCK
    : CASE EXP COLON CASE_BODY_OPT
        { $$ = createCase($2, $4, @1.first_line, @1.first_column); }
;

DEFAULT_BLOCK_OPT
    : DEFAULT_BLOCK
        { $$ = $1; }
    |
        { $$ = null; }
;

DEFAULT_BLOCK
    : DEFAULT COLON CASE_BODY_OPT
        { $$ = createDefault($3, @1.first_line, @1.first_column); }
;

CASE_BODY_OPT
    : CASE_BODY
        { $$ = $1; }
    | SEPS CASE_BODY
        { $$ = $2; }
    |
        { $$ = []; }
    | SEPS
        { $$ = []; }
;

CASE_BODY
    : CASE_BODY CASE_STMT_LINE
        { $1.push($2); $$ = $1; }
    | CASE_STMT_LINE
        { $$ = [$1]; }
;

CASE_STMT_LINE
    : STMT
        { $$ = $1; }
    | STMT SEPS
        { $$ = $1; }
;

EXP_NO_STRUCT
    : EXP_NO_STRUCT OR EXP_NO_STRUCT
        { $$ = new Logica($1, $3, "||", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT AND EXP_NO_STRUCT
        { $$ = new Logica($1, $3, "&&", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT EQEQ EXP_NO_STRUCT
        { $$ = new Comparacion($1, $3, "==", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT NEQ EXP_NO_STRUCT
        { $$ = new Comparacion($1, $3, "!=", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT LT EXP_NO_STRUCT
        { $$ = new Comparacion($1, $3, "<", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT LE EXP_NO_STRUCT
        { $$ = new Comparacion($1, $3, "<=", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT GT EXP_NO_STRUCT
        { $$ = new Comparacion($1, $3, ">", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT GE EXP_NO_STRUCT
        { $$ = new Comparacion($1, $3, ">=", @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT PLUS EXP_NO_STRUCT
        { $$ = new Suma($1, $3, OperadoresAritmeticos.SUMA, @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT MINUS EXP_NO_STRUCT
        { $$ = new Resta($1, $3, OperadoresAritmeticos.RESTA, @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT TIMES EXP_NO_STRUCT
        { $$ = new Multiplicacion($1, $3, OperadoresAritmeticos.MULTIPLICACION, @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT DIV EXP_NO_STRUCT
        { $$ = new Division($1, $3, OperadoresAritmeticos.DIVISION, @2.first_line, @2.first_column); }
    | EXP_NO_STRUCT MOD EXP_NO_STRUCT
        { $$ = new Modulo($1, $3, OperadoresAritmeticos.MODULO, @2.first_line, @2.first_column); }
    | NOT EXP_NO_STRUCT
        { $$ = new Not($2, @1.first_line, @1.first_column); }
    | MINUS EXP_NO_STRUCT %prec UMINUS
        { $$ = new Negativo($2, @1.first_line, @1.first_column); }
    | POSTFIX_EXP_NO_STRUCT
        { $$ = $1; }
;

POSTFIX_EXP_NO_STRUCT
    : PRIMARIO_NO_STRUCT
        { $$ = $1; }
    | POSTFIX_EXP_NO_STRUCT LBRACKET EXP_NO_STRUCT RBRACKET
        { $$ = new AccesoIndice($1, $3, @2.first_line, @2.first_column); }
    | POSTFIX_EXP_NO_STRUCT DOT ID
        { $$ = new AccesoAtributo($1, $3, @2.first_line, @2.first_column); }
;

PRIMARIO_NO_STRUCT
    : INT
        { $$ = new Nativo(Number(yytext), Tipo.primitivo(tipoDato.ENTERO), @1.first_line, @1.first_column); }
    | DECIMAL
        { $$ = new Nativo(Number(yytext), Tipo.primitivo(tipoDato.DECIMAL), @1.first_line, @1.first_column); }
    | STRING
        { $$ = new Nativo(decodeStringLiteral(yytext), Tipo.primitivo(tipoDato.CADENA), @1.first_line, @1.first_column); }
    | RUNE
        { $$ = new Nativo(decodeRuneLiteral(yytext), Tipo.primitivo(tipoDato.RUNE), @1.first_line, @1.first_column); }
    | TRUE
        { $$ = new Nativo(true, Tipo.primitivo(tipoDato.BOOLEANO), @1.first_line, @1.first_column); }
    | FALSE
        { $$ = new Nativo(false, Tipo.primitivo(tipoDato.BOOLEANO), @1.first_line, @1.first_column); }
    | NIL
        { $$ = new Nativo(null, Tipo.primitivo(tipoDato.NIL), @1.first_line, @1.first_column); }
    | FUNC_CALL
        { $$ = $1; }
    | LEN LPAREN EXP_NO_STRUCT RPAREN
        { $$ = new Len($3, @1.first_line, @1.first_column); }
    | APPEND LPAREN EXP_NO_STRUCT COMMA EXP_NO_STRUCT RPAREN
        { $$ = new Append($3, $5, @1.first_line, @1.first_column); }
    | SLICES_INDEX LPAREN EXP_NO_STRUCT COMMA EXP_NO_STRUCT RPAREN
        { $$ = new SlicesIndex($3, $5, @1.first_line, @1.first_column); }
    | STRINGS_JOIN LPAREN EXP_NO_STRUCT COMMA EXP_NO_STRUCT RPAREN
        { $$ = new StringsJoin($3, $5, @1.first_line, @1.first_column); }
    | ATOI LPAREN EXP_NO_STRUCT RPAREN
        { $$ = new Atoi($3, @1.first_line, @1.first_column); }
    | PARSEFLOAT LPAREN EXP_NO_STRUCT RPAREN
        { $$ = new ParseFloat($3, @1.first_line, @1.first_column); }
    | TYPEOF LPAREN EXP_NO_STRUCT RPAREN
        { $$ = new TypeOf($3, @1.first_line, @1.first_column); }
    | TYPEOF LPAREN EXP_NO_STRUCT RPAREN STRINGIFY
        { $$ = new TypeOf($3, @1.first_line, @1.first_column); }
    | SLICE_LITERAL
        { $$ = $1; }
    | ID
        { $$ = new Identificador($1, @1.first_line, @1.first_column); }
    | LPAREN EXP_NO_STRUCT RPAREN
        { $$ = $2; }
;

EXP
    : EXP OR EXP
        { $$ = new Logica($1, $3, "||", @2.first_line, @2.first_column); }
    | EXP AND EXP
        { $$ = new Logica($1, $3, "&&", @2.first_line, @2.first_column); }
    | EXP EQEQ EXP
        { $$ = new Comparacion($1, $3, "==", @2.first_line, @2.first_column); }
    | EXP NEQ EXP
        { $$ = new Comparacion($1, $3, "!=", @2.first_line, @2.first_column); }
    | EXP LT EXP
        { $$ = new Comparacion($1, $3, "<", @2.first_line, @2.first_column); }
    | EXP LE EXP
        { $$ = new Comparacion($1, $3, "<=", @2.first_line, @2.first_column); }
    | EXP GT EXP
        { $$ = new Comparacion($1, $3, ">", @2.first_line, @2.first_column); }
    | EXP GE EXP
        { $$ = new Comparacion($1, $3, ">=", @2.first_line, @2.first_column); }
    | EXP PLUS EXP
        { $$ = new Suma($1, $3, OperadoresAritmeticos.SUMA, @2.first_line, @2.first_column); }
    | EXP MINUS EXP
        { $$ = new Resta($1, $3, OperadoresAritmeticos.RESTA, @2.first_line, @2.first_column); }
    | EXP TIMES EXP
        { $$ = new Multiplicacion($1, $3, OperadoresAritmeticos.MULTIPLICACION, @2.first_line, @2.first_column); }
    | EXP DIV EXP
        { $$ = new Division($1, $3, OperadoresAritmeticos.DIVISION, @2.first_line, @2.first_column); }
    | EXP MOD EXP
        { $$ = new Modulo($1, $3, OperadoresAritmeticos.MODULO, @2.first_line, @2.first_column); }
    | NOT EXP
        { $$ = new Not($2, @1.first_line, @1.first_column); }
    | MINUS EXP %prec UMINUS
        { $$ = new Negativo($2, @1.first_line, @1.first_column); }
    | POSTFIX_EXP
        { $$ = $1; }
;

POSTFIX_EXP
    : PRIMARIO
        { $$ = $1; }
    | POSTFIX_EXP LBRACKET EXP RBRACKET
        { $$ = new AccesoIndice($1, $3, @2.first_line, @2.first_column); }
    | POSTFIX_EXP DOT ID
        { $$ = new AccesoAtributo($1, $3, @2.first_line, @2.first_column); }
;

PRIMARIO
    : INT
        { $$ = new Nativo(Number(yytext), Tipo.primitivo(tipoDato.ENTERO), @1.first_line, @1.first_column); }
    | DECIMAL
        { $$ = new Nativo(Number(yytext), Tipo.primitivo(tipoDato.DECIMAL), @1.first_line, @1.first_column); }
    | STRING
        { $$ = new Nativo(decodeStringLiteral(yytext), Tipo.primitivo(tipoDato.CADENA), @1.first_line, @1.first_column); }
    | RUNE
        { $$ = new Nativo(decodeRuneLiteral(yytext), Tipo.primitivo(tipoDato.RUNE), @1.first_line, @1.first_column); }
    | TRUE
        { $$ = new Nativo(true, Tipo.primitivo(tipoDato.BOOLEANO), @1.first_line, @1.first_column); }
    | FALSE
        { $$ = new Nativo(false, Tipo.primitivo(tipoDato.BOOLEANO), @1.first_line, @1.first_column); }
    | NIL
        { $$ = new Nativo(null, Tipo.primitivo(tipoDato.NIL), @1.first_line, @1.first_column); }
    | FUNC_CALL
        { $$ = $1; }
    | LEN LPAREN EXP RPAREN
        { $$ = new Len($3, @1.first_line, @1.first_column); }
    | APPEND LPAREN EXP COMMA EXP RPAREN
        { $$ = new Append($3, $5, @1.first_line, @1.first_column); }
    | SLICES_INDEX LPAREN EXP COMMA EXP RPAREN
        { $$ = new SlicesIndex($3, $5, @1.first_line, @1.first_column); }
    | STRINGS_JOIN LPAREN EXP COMMA EXP RPAREN
        { $$ = new StringsJoin($3, $5, @1.first_line, @1.first_column); }
    | ATOI LPAREN EXP RPAREN
        { $$ = new Atoi($3, @1.first_line, @1.first_column); }
    | PARSEFLOAT LPAREN EXP RPAREN
        { $$ = new ParseFloat($3, @1.first_line, @1.first_column); }
    | TYPEOF LPAREN EXP RPAREN
        { $$ = new TypeOf($3, @1.first_line, @1.first_column); }
    | TYPEOF LPAREN EXP RPAREN STRINGIFY
        { $$ = new TypeOf($3, @1.first_line, @1.first_column); }
    | SLICE_LITERAL
        { $$ = $1; }
    | STRUCT_LITERAL
        { $$ = $1; }
    | ID
        { $$ = new Identificador($1, @1.first_line, @1.first_column); }
    | LPAREN EXP RPAREN
        { $$ = $2; }
;

FUNC_CALL
    : ID LPAREN ARG_LIST_OPT RPAREN
        { $$ = new Llamada($1, $3, @1.first_line, @1.first_column); }
;

ARG_LIST_OPT
    : ARG_LIST
        { $$ = $1; }
    |
        { $$ = []; }
;

ARG_LIST
    : ARG_LIST COMMA EXP
        { $1.push($3); $$ = $1; }
    | EXP
        { $$ = [$1]; }
;

SLICE_LITERAL
    : SLICE_TYPE LBRACE SLICE_LITERAL_BODY_OPT RBRACE
        { $$ = buildTypedSliceLiteral($1, $3, @1.first_line, @1.first_column); }
;

STRUCT_LITERAL
    : ID LBRACE STRUCT_INIT_BODY_OPT RBRACE
        { $$ = new InstanciaStruct($1, $3, @1.first_line, @1.first_column); }
;

ANON_LITERAL
    : ANON_STRUCT_LITERAL
        { $$ = $1; }
    | ANON_SLICE_LITERAL
        { $$ = $1; }
;

ANON_STRUCT_LITERAL
    : LBRACE STRUCT_INIT_BODY_REQ_WRAP RBRACE
        { $$ = { kind: "anon_struct", valor: $2, line: @1.first_line, col: @1.first_column }; }
;

ANON_SLICE_LITERAL
    : LBRACE SLICE_LITERAL_BODY_REQ_WRAP RBRACE
        { $$ = { kind: "anon_slice", valor: $2, line: @1.first_line, col: @1.first_column }; }
;

STRUCT_INIT_BODY_OPT
    : STRUCT_INIT_BODY_REQ
        { $$ = $1; }
    | SEPS STRUCT_INIT_BODY_REQ
        { $$ = $2; }
    | STRUCT_INIT_BODY_REQ SEPS
        { $$ = $1; }
    | SEPS STRUCT_INIT_BODY_REQ SEPS
        { $$ = $2; }
    |
        { $$ = []; }
    | SEPS
        { $$ = []; }
;

STRUCT_INIT_BODY_REQ
    : STRUCT_INIT_LIST
        { $$ = $1; }
;

STRUCT_INIT_BODY_REQ_WRAP
    : STRUCT_INIT_BODY_REQ
        { $$ = $1; }
    | SEPS STRUCT_INIT_BODY_REQ
        { $$ = $2; }
    | STRUCT_INIT_BODY_REQ SEPS
        { $$ = $1; }
    | SEPS STRUCT_INIT_BODY_REQ SEPS
        { $$ = $2; }
;

STRUCT_INIT_LIST
    : STRUCT_INIT_LIST COMMA SEPS_OPT STRUCT_INIT_ITEM
        { $1.push($4); $$ = $1; }
    | STRUCT_INIT_LIST COMMA SEPS_OPT
        { $$ = $1; }
    | STRUCT_INIT_ITEM
        { $$ = [$1]; }
;

STRUCT_INIT_ITEM
    : ID COLON EXP
        { $$ = { id: $1, expresion: $3 }; }
;

SLICE_LITERAL_BODY_OPT
    : SLICE_LITERAL_BODY_REQ
        { $$ = $1; }
    | SEPS SLICE_LITERAL_BODY_REQ
        { $$ = $2; }
    | SLICE_LITERAL_BODY_REQ SEPS
        { $$ = $1; }
    | SEPS SLICE_LITERAL_BODY_REQ SEPS
        { $$ = $2; }
    |
        { $$ = []; }
    | SEPS
        { $$ = []; }
;

SLICE_LITERAL_BODY_REQ
    : SLICE_LITERAL_ITEMS
        { $$ = $1; }
;

SLICE_LITERAL_BODY_REQ_WRAP
    : SLICE_LITERAL_BODY_REQ
        { $$ = $1; }
    | SEPS SLICE_LITERAL_BODY_REQ
        { $$ = $2; }
    | SLICE_LITERAL_BODY_REQ SEPS
        { $$ = $1; }
    | SEPS SLICE_LITERAL_BODY_REQ SEPS
        { $$ = $2; }
;

SLICE_LITERAL_ITEMS
    : SLICE_LITERAL_ITEMS COMMA SEPS_OPT SLICE_LITERAL_ITEM
        { $1.push($4); $$ = $1; }
    | SLICE_LITERAL_ITEMS COMMA SEPS_OPT
        { $$ = $1; }
    | SLICE_LITERAL_ITEM
        { $$ = [$1]; }
;

SLICE_LITERAL_ITEM
    : EXP
        { $$ = createSliceItem($1); }
    | ANON_SLICE_LITERAL
        { $$ = createAnonSliceLiteral($1.valor, $1.line, $1.col); }
;

TYPE_REF
    : BASE_TYPE
        { $$ = $1; }
    | SLICE_TYPE
        { $$ = $1; }
;

DECL_TYPE
    : PRIMITIVE_TYPE
        { $$ = $1; }
    | SLICE_TYPE
        { $$ = $1; }
;

SLICE_TYPE
    : LBRACKET RBRACKET TYPE_REF
        { $$ = Tipo.slice($3); }
;

BASE_TYPE
    : PRIMITIVE_TYPE
        { $$ = $1; }
    | ID
        { $$ = Tipo.struct($1); }
;

PRIMITIVE_TYPE
    : INT_TYPE
        { $$ = Tipo.primitivo(tipoDato.ENTERO); }
    | FLOAT_TYPE
        { $$ = Tipo.primitivo(tipoDato.DECIMAL); }
    | STRING_TYPE
        { $$ = Tipo.primitivo(tipoDato.CADENA); }
    | BOOL_TYPE
        { $$ = Tipo.primitivo(tipoDato.BOOLEANO); }
    | RUNE_TYPE
        { $$ = Tipo.primitivo(tipoDato.RUNE); }
;

%%
