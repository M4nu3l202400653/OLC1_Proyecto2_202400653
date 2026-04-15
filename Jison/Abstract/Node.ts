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
    graph [fontname="Consolas", bgcolor="#10212b"];
    node [fontname="Consolas", shape=rectangle, style="rounded,filled", fillcolor="#173547", color="#2a5f7a", fontcolor="#f4fbff"];
    edge [color="#8ac6e6"];
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
