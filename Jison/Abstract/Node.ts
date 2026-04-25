export class Node {
    private children: Node[];

    constructor(private tag: string) {
        this.children = [];
    }

    public pushChild(child: Node | null | undefined) {
        if (child) {
            this.children.push(child);
        }
    }

    public getDot(): string {
        return `digraph AST {
    graph [fontname="Trebuchet MS", bgcolor="#ffffff", ranksep="0.55", nodesep="0.3"];
    node [fontname="Trebuchet MS", shape=rectangle, style="filled", fillcolor="#ffffff", color="#111111", penwidth="2", fontcolor="#2a3cff", margin="0.08,0.05"];
    edge [color="#111111", penwidth="2"];
${this.getNodes("i")}
}`;
    }

    public toObject() {
        return {
            tag: this.tag,
            children: this.children.map((child) => child.toObject()),
        };
    }

    private getNodes(tag: string): string {
        let dot = `    node_${tag}[label="${this.escape(this.tag)}"];`;

        for (let index = 0; index < this.children.length; index += 1) {
            const childTag = `${tag}_${index}`;
            dot += `\n${this.children[index].getNodes(childTag)}`;
            dot += `\n    node_${tag} -> node_${childTag};`;
        }

        return dot;
    }

    private escape(value: string): string {
        return value
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r");
    }
}
