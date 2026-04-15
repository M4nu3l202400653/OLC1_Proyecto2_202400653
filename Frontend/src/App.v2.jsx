import { startTransition, useDeferredValue, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8001";

const codigoInicial = `struct Persona {
    nombre string
    edad int
}

var numeros []int = []int{1, 2, 3, 4}

func duplicar(valor int) int {
    return valor * 2
}

func main() {
    mensaje := "Proyecto base listo"
    persona := Persona{nombre: "Ana", edad: 21}
    total := duplicar(5)

    fmt.Println(mensaje)
    fmt.Println(persona.nombre, persona.edad)
    fmt.Println("Tamano:", len(numeros))
    fmt.Println("Total:", total)
    fmt.Println("Tipo:", reflect.TypeOf(total).string())
}`;

const crearArchivo = (id, nombre, codigo = codigoInicial) => ({
    id,
    nombre,
    codigo,
    dirty: false,
});

const formatearError = (error) => {
    if (!error) {
        return "Error desconocido";
    }

    const posicion =
        error.linea !== undefined && error.columna !== undefined
            ? ` (${error.linea}, ${error.columna})`
            : "";

    return `${error.tipo ?? "Error"}: ${error.descripcion ?? JSON.stringify(error)}${posicion}`;
};

function App() {
    const [archivos, setArchivos] = useState([crearArchivo(1, "main.gst")]);
    const [contadorArchivos, setContadorArchivos] = useState(2);
    const [archivoActivoId, setArchivoActivoId] = useState(1);
    const [cursor, setCursor] = useState({ linea: 1, columna: 1 });
    const [cargando, setCargando] = useState(false);
    const [panelActivo, setPanelActivo] = useState("consola");
    const [vistaAst, setVistaAst] = useState("dot");
    const [consola, setConsola] = useState("");
    const [errores, setErrores] = useState([]);
    const [tablaSimbolos, setTablaSimbolos] = useState([]);
    const [ast, setAst] = useState(null);
    const [astDot, setAstDot] = useState("");
    const inputArchivoRef = useRef(null);
    const gutterRef = useRef(null);

    const archivoActivo = archivos.find((archivo) => archivo.id === archivoActivoId) ?? archivos[0];
    const codigoDiferido = useDeferredValue(archivoActivo?.codigo ?? "");
    const lineas = codigoDiferido.split("\n");

    const actualizarCursor = (valor, posicion) => {
        const previo = valor.slice(0, posicion);
        const partes = previo.split("\n");
        setCursor({
            linea: partes.length,
            columna: (partes[partes.length - 1] ?? "").length + 1,
        });
    };

    const manejarCambioCodigo = (event) => {
        const codigo = event.target.value;
        const posicion = event.target.selectionStart ?? 0;

        startTransition(() => {
            setArchivos((actuales) =>
                actuales.map((archivo) =>
                    archivo.id === archivoActivoId
                        ? { ...archivo, codigo, dirty: true }
                        : archivo,
                ),
            );
        });

        actualizarCursor(codigo, posicion);
    };

    const manejarCursor = (event) => {
        actualizarCursor(event.target.value, event.target.selectionStart ?? 0);
    };

    const sincronizarScroll = (event) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = event.target.scrollTop;
        }
    };

    const nuevoArchivo = () => {
        const siguienteId = contadorArchivos;
        setContadorArchivos((actual) => actual + 1);
        setArchivos((actuales) => [
            ...actuales,
            crearArchivo(
                siguienteId,
                `archivo${siguienteId - 1}.gst`,
                "func main() {\n    fmt.Println(\"Nuevo archivo\")\n}",
            ),
        ]);
        setArchivoActivoId(siguienteId);
        setCursor({ linea: 1, columna: 1 });
    };

    const cerrarArchivo = (id) => {
        if (archivos.length === 1) {
            return;
        }

        const indiceActual = archivos.findIndex((archivo) => archivo.id === id);
        const restantes = archivos.filter((archivo) => archivo.id !== id);
        setArchivos(restantes);

        if (archivoActivoId === id) {
            const siguiente = restantes[Math.max(0, indiceActual - 1)];
            setArchivoActivoId(siguiente.id);
        }
    };

    const abrirSelectorArchivo = () => {
        inputArchivoRef.current?.click();
    };

    const manejarArchivoSeleccionado = async (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo) {
            return;
        }

        const contenido = await archivo.text();
        const siguienteId = contadorArchivos;
        setContadorArchivos((actual) => actual + 1);
        setArchivos((actuales) => [...actuales, crearArchivo(siguienteId, archivo.name, contenido)]);
        setArchivoActivoId(siguienteId);
        setCursor({ linea: 1, columna: 1 });
        event.target.value = "";
    };

    const guardarArchivo = () => {
        if (!archivoActivo) {
            return;
        }

        const blob = new Blob([archivoActivo.codigo], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = archivoActivo.nombre.endsWith(".gst")
            ? archivoActivo.nombre
            : `${archivoActivo.nombre}.gst`;
        link.click();
        URL.revokeObjectURL(url);

        setArchivos((actuales) =>
            actuales.map((archivo) =>
                archivo.id === archivoActivoId ? { ...archivo, dirty: false } : archivo,
            ),
        );
    };

    const ejecutar = async () => {
        if (!archivoActivo) {
            return;
        }

        setCargando(true);
        setPanelActivo("consola");

        try {
            const response = await fetch(`${API_URL}/api/parser/analizar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ codigo: archivoActivo.codigo }),
            });

            const data = await response.json();

            startTransition(() => {
                setConsola(data?.consola ?? "");
                setErrores(Array.isArray(data?.errores) ? data.errores : []);
                setTablaSimbolos(Array.isArray(data?.tablaSimbolos) ? data.tablaSimbolos : []);
                setAst(data?.ast ?? null);
                setAstDot(data?.astDot ?? "");
            });

            if (!response.ok && (!Array.isArray(data?.errores) || data.errores.length === 0)) {
                setErrores([{ tipo: "Error", descripcion: data?.error ?? "No se pudo analizar" }]);
            }

            if ((data?.errores?.length ?? 0) > 0) {
                setPanelActivo("errores");
            }
        } catch (error) {
            setConsola("");
            setTablaSimbolos([]);
            setAst(null);
            setAstDot("");
            setErrores([
                {
                    tipo: "Conexion",
                    descripcion:
                        error?.message ??
                        `No fue posible conectar con el backend en ${API_URL}`,
                },
            ]);
            setPanelActivo("errores");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="app-shell">
            <input
                ref={inputArchivoRef}
                className="hidden-input"
                type="file"
                accept=".gst,.txt"
                onChange={manejarArchivoSeleccionado}
            />

            <header className="hero">
                <div>
                    <p className="eyebrow">COMPI 1 · GoScript Studio</p>
                    <h1>Proyecto base construido desde los ejemplos</h1>
                    <p className="hero-copy">
                        Editor, ejecucion, consola, errores, AST y tabla de simbolos sobre la
                        estructura del ZIP de referencia.
                    </p>
                </div>

                <div className="hero-actions">
                    <button type="button" className="ghost-button" onClick={nuevoArchivo}>
                        Nuevo
                    </button>
                    <button type="button" className="ghost-button" onClick={abrirSelectorArchivo}>
                        Abrir
                    </button>
                    <button type="button" className="ghost-button" onClick={guardarArchivo}>
                        Guardar
                    </button>
                    <button type="button" className="primary-button" onClick={ejecutar} disabled={cargando}>
                        {cargando ? "Ejecutando..." : "Ejecutar"}
                    </button>
                </div>
            </header>

            <section className="summary-strip">
                <article className="summary-card">
                    <span>Archivos</span>
                    <strong>{archivos.length}</strong>
                </article>
                <article className="summary-card">
                    <span>Errores</span>
                    <strong>{errores.length}</strong>
                </article>
                <article className="summary-card">
                    <span>Simbolos</span>
                    <strong>{tablaSimbolos.length}</strong>
                </article>
                <article className="summary-card">
                    <span>API</span>
                    <strong>{API_URL.replace("http://", "")}</strong>
                </article>
            </section>

            <main className="workspace">
                <section className="editor-panel">
                    <div className="tabs-row">
                        {archivos.map((archivo) => (
                            <button
                                key={archivo.id}
                                type="button"
                                className={`file-tab ${archivo.id === archivoActivoId ? "active" : ""}`}
                                onClick={() => setArchivoActivoId(archivo.id)}
                            >
                                <span>{archivo.nombre}{archivo.dirty ? " *" : ""}</span>
                                {archivos.length > 1 ? (
                                    <span
                                        className="tab-close"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            cerrarArchivo(archivo.id);
                                        }}
                                    >
                                        x
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>

                    <div className="editor-frame">
                        <div ref={gutterRef} className="line-gutter" aria-hidden="true">
                            {lineas.map((_, index) => (
                                <span key={`linea-${index + 1}`}>{index + 1}</span>
                            ))}
                        </div>
                        <textarea
                            className="code-editor"
                            value={archivoActivo?.codigo ?? ""}
                            onChange={manejarCambioCodigo}
                            onClick={manejarCursor}
                            onKeyUp={manejarCursor}
                            onSelect={manejarCursor}
                            onScroll={sincronizarScroll}
                            spellCheck={false}
                            wrap="off"
                            placeholder="Escribe tu programa GoScript aqui..."
                        />
                    </div>

                    <footer className="editor-status">
                        <span>{archivoActivo?.nombre ?? "Sin archivo"}</span>
                        <span>
                            Linea {cursor.linea}, columna {cursor.columna}
                        </span>
                    </footer>
                </section>

                <section className="results-panel">
                    <div className="results-tabs">
                        {["consola", "errores", "simbolos", "ast"].map((panel) => (
                            <button
                                key={panel}
                                type="button"
                                className={`result-tab ${panelActivo === panel ? "active" : ""}`}
                                onClick={() => setPanelActivo(panel)}
                            >
                                {panel === "simbolos" ? "tabla" : panel}
                            </button>
                        ))}
                    </div>

                    {panelActivo === "consola" ? (
                        <div className="result-surface console-surface">
                            <div className="surface-header">
                                <h2>Consola</h2>
                                <span>{cargando ? "Analizando..." : "Salida del programa"}</span>
                            </div>
                            <pre>{consola || "Aun no hay salida disponible."}</pre>
                        </div>
                    ) : null}

                    {panelActivo === "errores" ? (
                        <div className="result-surface">
                            <div className="surface-header">
                                <h2>Errores</h2>
                                <span>{errores.length} registro(s)</span>
                            </div>
                            {errores.length === 0 ? (
                                <p className="empty-state">No se reportaron errores.</p>
                            ) : (
                                <div className="list-surface">
                                    {errores.map((error, index) => (
                                        <article key={`error-${index}`} className="error-card">
                                            {formatearError(error)}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : null}

                    {panelActivo === "simbolos" ? (
                        <div className="result-surface">
                            <div className="surface-header">
                                <h2>Tabla de simbolos</h2>
                                <span>{tablaSimbolos.length} elemento(s)</span>
                            </div>
                            {tablaSimbolos.length === 0 ? (
                                <p className="empty-state">No hay simbolos registrados todavia.</p>
                            ) : (
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Tipo</th>
                                                <th>Categoria</th>
                                                <th>Ambito</th>
                                                <th>Linea</th>
                                                <th>Columna</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tablaSimbolos.map((simbolo, index) => (
                                                <tr key={`simbolo-${index}`}>
                                                    <td>{simbolo.id}</td>
                                                    <td>{simbolo.tipoDato}</td>
                                                    <td>{simbolo.tipoSimbolo}</td>
                                                    <td>{simbolo.ambito}</td>
                                                    <td>{simbolo.linea}</td>
                                                    <td>{simbolo.columna}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {panelActivo === "ast" ? (
                        <div className="result-surface">
                            <div className="surface-header">
                                <h2>AST</h2>
                                <div className="mini-switch">
                                    <button
                                        type="button"
                                        className={vistaAst === "dot" ? "active" : ""}
                                        onClick={() => setVistaAst("dot")}
                                    >
                                        DOT
                                    </button>
                                    <button
                                        type="button"
                                        className={vistaAst === "json" ? "active" : ""}
                                        onClick={() => setVistaAst("json")}
                                    >
                                        JSON
                                    </button>
                                </div>
                            </div>
                            <pre>{vistaAst === "dot" ? astDot || "Sin AST generado." : JSON.stringify(ast, null, 2) || "Sin AST generado."}</pre>
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    );
}

export default App;
