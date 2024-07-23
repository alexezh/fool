import { AstNode, AstNodeKind, CallNode, CallParamNode, ConstNode, OpNode } from "./ast";
import { JsWriter } from "./jswriter";
import type { DocPart } from "./sm";
import { TokenKind } from "./token";

export type Predicate = {
  text: string,
  selector: AstNode,
  predicate: AstNode
  compiled?: (part: DocPart) => number;
}

export class TypeDef {
  public readonly name: string;
  public constructor(name: string) {
    this.name = name;
  }
}

export class FuncDef {
  // this is not the actual prototype, we might call it with different parameters
  public readonly func: () => void;
  public readonly jsname: string;

  public constructor(jsname: string, func: () => void) {
    this.jsname = jsname;
    this.func = func;
  }
}

class SymbolCatalog {
  private functions: Map<string, string>;
  private types: Map<string, TypeDef>;

  public getFunction(name: string, params: AstNode[]): FuncDef {
    return null;
  }

  public registerType(def: TypeDef) {
    this.types.set(def.name, def);
  }

  public registerFunction(name: string, params: string[], jsname) {

  }

  public getTypeDef(s: string) {

  }
}

let catalog = new SymbolCatalog();
catalog.registerType(new TypeDef("Picture"));
catalog.registerType(new TypeDef("FontSize"));
catalog.registerType(new TypeDef("Color"));
catalog.registerType(new TypeDef("PictureHeight"));
//catalog.registerType(new TypeDef("Any"));
catalog.registerFunction("equal", ["Color|any", "Color|any"], "color_equal");
catalog.registerFunction("color", ["DocPart"], "color_part");

function compileOp(ast: OpNode, writer: JsWriter) {
  switch (ast.op.kind) {
    case TokenKind.Equal:
      let funcDef = catalog.getFunction("equal", []);
      writer.append(funcDef.jsname);
      compileNode(ast.left, writer);
      writer.append(",");
      compileNode(ast.right, writer);
      break;
    default:
      throw 'Unknown token';
  }
}

/*
  src:
    equal(funcCall("color", "_"), any()
  dest:
    function pred(node) { return color_equal(color_part(node), any_color()) }
*/

function compileNode(ast: AstNode, writer: JsWriter) {
  switch (ast.kind) {
    case AstNodeKind.const: {
      let constAst = ast as ConstNode;
      if (typeof (constAst.value) === "string") {
        writer.append("\"");
        writer.append(constAst.value as string);
        writer.append("\"");
      } else {
        writer.append(constAst.value.toString());
      }
      break;
    }
    case AstNodeKind.op:
      compileOp(ast as OpNode, writer);
      break;
    case AstNodeKind.call: {
      let callAst = ast as CallNode;
      let def = catalog.getFunction(callAst.name, callAst.params);
      writer.append(def.jsname);
      writer.append("(");
      if (callAst.params) {
        for (let p of callAst.params) {
          compileNode(p, writer);
        }
      }
      writer.append(")");
      break;
    }
    case AstNodeKind.any:
    default:
      debugger;
      throw 'unknown node';
  }

}

function compilePredicate(pred: Predicate) {
  let jsWriter = new JsWriter();

}

export class BlueprintStore {
  private readonly _predicates: Predicate[] = [];

  public predicates(): Iterable<Predicate> { return this._predicates }

  public addType(s: string) {

  }
  public addPredicate(s: string, selector?: AstNode, predicate?: AstNode) {
    let pred: Predicate = {
      text: s,
      selector: selector,
      predicate: predicate
    };
    compilePredicate(pred);
    this._predicates.push(pred);

    if (predicate) {
      let writer = new JsWriter();
      compileNode(predicate, writer);

      console.log(writer.toString());
    }
  }

  public defineRuleset(s: string) {

  }
  public addMutator(a: { value: string, pred: string, action: string }) {

  }

  /**
   * design represents an example of the document
   */
  public addDesign(s: string, blueprint?: string) {

  }
}

export class MemoryLane {
  public setContext(x: string) {

  }
  public addMemory(s: string) {

  }
}

function compute(s: { query: string, given: string }): any {

}

