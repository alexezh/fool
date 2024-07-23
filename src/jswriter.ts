export class JsWriter {
  private output: string[] = [];

  public append(s: string) {
    this.output.push(s);
    this.output.push('\n');
  }

  public toString(): string {
    return ''.concat(...this.output);
  }
}

