# Gramatica BNF de GoScript

## Programa

```bnf
<programa> ::= <seps_opt> <top_items_opt> <seps_opt> EOF

<top_items_opt> ::= <top_items>
                  | epsilon

<top_items> ::= <top_items> <seps> <top_item>
              | <top_items> <seps>
              | <top_item>

<top_item> ::= <funcion_decl>
             | <struct_decl>
             | <declaracion_stmt>
             | <asignacion_stmt>

<seps_opt> ::= <seps>
             | epsilon

<seps> ::= SEP
         | <seps> SEP
```

## Funciones y structs

```bnf
<funcion_decl> ::= "func" ID "(" <params_opt> ")" <retorno_opt> <bloque>

<retorno_opt> ::= <type_ref>
                | epsilon

<params_opt> ::= <params>
               | epsilon

<params> ::= <params> "," <param>
           | <param>

<param> ::= ID <type_ref>

<struct_decl> ::= "struct" ID "{" <struct_body> "}"

<struct_body> ::= <struct_lines>
                | <seps> <struct_lines>

<struct_lines> ::= <struct_lines> <struct_attr_line>
                 | <struct_attr_line>

<struct_attr_line> ::= <struct_attr>
                     | <struct_attr> <seps>

<struct_attr> ::= ID <type_ref>
                | <type_ref> ID
```

## Bloques e instrucciones

```bnf
<bloque> ::= "{" "}"
           | "{" <seps> "}"
           | "{" <block_body> "}"

<block_body> ::= <block_lines>
               | <seps> <block_lines>

<block_lines> ::= <block_lines> <stmt_line>
                | <stmt_line>

<stmt_line> ::= <stmt>
              | <stmt> <seps>

<stmt> ::= <declaracion_stmt>
         | <asignacion_stmt>
         | <print_stmt>
         | <if_stmt>
         | <for_stmt>
         | <switch_stmt>
         | "break"
         | "continue"
         | "return"
         | "return" <exp>
         | <incdec_stmt>
         | <llamada_stmt>
         | <bloque>
```

## Declaraciones y asignaciones

```bnf
<declaracion_stmt> ::= "var" ID <type_ref> "=" <exp>
                     | "var" ID <type_ref> "=" <anon_literal>
                     | "var" ID <type_ref>
                     | ID ID "=" <exp>
                     | ID ID "=" <anon_literal>
                     | ID ":=" <exp>

<asignacion_stmt> ::= <postfix_exp_no_struct> "=" <exp>
                    | <postfix_exp_no_struct> "+=" <exp>
                    | <postfix_exp_no_struct> "-=" <exp>

<incdec_stmt> ::= <postfix_exp_no_struct> "++"
                | <postfix_exp_no_struct> "--"

<llamada_stmt> ::= <func_call>
```

## Control de flujo

```bnf
<if_stmt> ::= "if" <condicion> <bloque> <else_opt>

<else_opt> ::= "else" <if_stmt>
             | "else" <bloque>
             | epsilon

<condicion> ::= <exp_no_struct>

<for_stmt> ::= "for" <condicion> <bloque>
             | "for" <for_init> SEP <exp> SEP <for_update> <bloque>
             | "for" ID "," ID ":=" "range" <exp_no_struct> <bloque>

<for_init> ::= <declaracion_stmt>
             | <asignacion_stmt>
             | <incdec_stmt>

<for_update> ::= <asignacion_stmt>
               | <incdec_stmt>
               | <llamada_stmt>

<switch_stmt> ::= "switch" <exp_no_struct> "{" <switch_body_opt> "}"

<switch_body_opt> ::= <switch_body>
                    | <seps> <switch_body>
                    | epsilon
                    | <seps>

<switch_body> ::= <case_blocks> <default_block_opt>
                | <default_block>

<case_blocks> ::= <case_blocks> <case_block>
                | <case_block>

<case_block> ::= "case" <exp> ":" <case_body_opt>

<default_block_opt> ::= <default_block>
                      | epsilon

<default_block> ::= "default" ":" <case_body_opt>
```

## Expresiones

```bnf
<exp_no_struct> ::= <exp_no_struct> "||" <exp_no_struct>
                  | <exp_no_struct> "&&" <exp_no_struct>
                  | <exp_no_struct> "==" <exp_no_struct>
                  | <exp_no_struct> "!=" <exp_no_struct>
                  | <exp_no_struct> "<" <exp_no_struct>
                  | <exp_no_struct> "<=" <exp_no_struct>
                  | <exp_no_struct> ">" <exp_no_struct>
                  | <exp_no_struct> ">=" <exp_no_struct>
                  | <exp_no_struct> "+" <exp_no_struct>
                  | <exp_no_struct> "-" <exp_no_struct>
                  | <exp_no_struct> "*" <exp_no_struct>
                  | <exp_no_struct> "/" <exp_no_struct>
                  | <exp_no_struct> "%" <exp_no_struct>
                  | "!" <exp_no_struct>
                  | "-" <exp_no_struct>
                  | <postfix_exp_no_struct>

<postfix_exp_no_struct> ::= <primario_no_struct>
                          | <postfix_exp_no_struct> "[" <exp_no_struct> "]"
                          | <postfix_exp_no_struct> "." ID

<exp> ::= <exp> "||" <exp>
        | <exp> "&&" <exp>
        | <exp> "==" <exp>
        | <exp> "!=" <exp>
        | <exp> "<" <exp>
        | <exp> "<=" <exp>
        | <exp> ">" <exp>
        | <exp> ">=" <exp>
        | <exp> "+" <exp>
        | <exp> "-" <exp>
        | <exp> "*" <exp>
        | <exp> "/" <exp>
        | <exp> "%" <exp>
        | "!" <exp>
        | "-" <exp>
        | <postfix_exp>

<postfix_exp> ::= <primario>
                | <postfix_exp> "[" <exp> "]"
                | <postfix_exp> "." ID
```

## Primarios y llamadas

```bnf
<primario_no_struct> ::= INT
                       | DECIMAL
                       | STRING
                       | RUNE
                       | "true"
                       | "false"
                       | "nil"
                       | <func_call>
                       | "len" "(" <exp_no_struct> ")"
                       | "append" "(" <exp_no_struct> "," <exp_no_struct> ")"
                       | "slices.Index" "(" <exp_no_struct> "," <exp_no_struct> ")"
                       | "strings.Join" "(" <exp_no_struct> "," <exp_no_struct> ")"
                       | "strconv.Atoi" "(" <exp_no_struct> ")"
                       | "strconv.ParseFloat" "(" <exp_no_struct> ")"
                       | "reflect.TypeOf" "(" <exp_no_struct> ")"
                       | "reflect.TypeOf" "(" <exp_no_struct> ")" ".string()"
                       | <slice_literal>
                       | ID
                       | "(" <exp_no_struct> ")"

<primario> ::= INT
             | DECIMAL
             | STRING
             | RUNE
             | "true"
             | "false"
             | "nil"
             | <func_call>
             | "len" "(" <exp> ")"
             | "append" "(" <exp> "," <exp> ")"
             | "slices.Index" "(" <exp> "," <exp> ")"
             | "strings.Join" "(" <exp> "," <exp> ")"
             | "strconv.Atoi" "(" <exp> ")"
             | "strconv.ParseFloat" "(" <exp> ")"
             | "reflect.TypeOf" "(" <exp> ")"
             | "reflect.TypeOf" "(" <exp> ")" ".string()"
             | <slice_literal>
             | <struct_literal>
             | ID
             | "(" <exp> ")"

<func_call> ::= ID "(" <arg_list_opt> ")"

<arg_list_opt> ::= <arg_list>
                 | epsilon

<arg_list> ::= <arg_list> "," <exp>
             | <exp>
```

## Literales compuestos

```bnf
<slice_literal> ::= <slice_type> "{" <slice_literal_body_opt> "}"

<slice_literal_body_opt> ::= <slice_literal_body_req>
                           | <seps> <slice_literal_body_req>
                           | <slice_literal_body_req> <seps>
                           | <seps> <slice_literal_body_req> <seps>
                           | epsilon
                           | <seps>

<slice_literal_body_req> ::= <slice_literal_items>

<slice_literal_items> ::= <slice_literal_items> "," <seps_opt> <slice_literal_item>
                        | <slice_literal_item>

<slice_literal_item> ::= <exp>
                       | <anon_slice_literal>

<struct_literal> ::= ID "{" <struct_init_body_opt> "}"

<anon_literal> ::= <anon_struct_literal>
                 | <anon_slice_literal>

<anon_struct_literal> ::= "{" <struct_init_body_req_wrap> "}"

<anon_slice_literal> ::= "{" <slice_literal_body_req_wrap> "}"

<struct_init_body_opt> ::= <struct_init_body_req>
                         | <seps> <struct_init_body_req>
                         | <struct_init_body_req> <seps>
                         | <seps> <struct_init_body_req> <seps>
                         | epsilon
                         | <seps>

<struct_init_body_req> ::= <struct_init_list>

<struct_init_list> ::= <struct_init_list> "," <seps_opt> <struct_init_item>
                     | <struct_init_item>

<struct_init_item> ::= ID ":" <exp>
```

## Tipos

```bnf
<type_ref> ::= <base_type>
             | <slice_type>

<slice_type> ::= "[" "]" <type_ref>

<base_type> ::= "int"
              | "float64"
              | "string"
              | "bool"
              | "rune"
              | ID
```

## Terminales lexicos principales

```bnf
INT ::= digitos
DECIMAL ::= digitos "." digitos
STRING ::= "\"" ... "\""
RUNE ::= "'" ... "'"
ID ::= letra (letra | digito | "_")*
```
