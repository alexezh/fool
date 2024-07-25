import { AstNode, AstNodeKind, CallNode, ConstNode, OpNode } from "./ast";
import { JsWriter } from "./jswriter";
import type { DocPart } from "./sm";
import { catalog } from "./symbolcatalog";
import { TokenKind } from "./token";

export type Predicate = {
  selector: AstNode[],
  predicate: AstNode
  compiled?: (part: DocPart) => number;
}

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

export class Blueprint {
  private readonly _predicates: Predicate[] = [];
  private groupStack: Predicate[] = [];

  public predicates(): Iterable<Predicate> { return this._predicates }

  public addType(s: string) {

  }

  public addClause(selector?: AstNode, predicate?: AstNode) {
    let pred: Predicate = {
      selector: [selector],
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

  public addGroupClause(selector: AstNode, group: (() => void)) {
    group();
  }

  public addMacroClause(macroIter: Iterable<number[]>, selector?: AstNode[], predicate?: AstNode) {
    for (let macroPara of macroIter) {
      let pred: Predicate = {
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
  }

  /**
   * takes variable representing array of choices
   * will run modelling for each choice and select best result
   */
  public addChoiceClause() {

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

