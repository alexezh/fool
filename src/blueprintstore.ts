import { AstNode, AstNodeKind, OpNode } from "./ast";
import { JsWriter } from "./jswriter";
import type { DocPart } from "./sm";
import { TokenKind } from "./token";

export type Predicate = {
  text: string,
  selector: AstNode,
  predicate: AstNode
  compiled?: (part: DocPart) => number;
}

function compileOp(ast: OpNode, writer: JsWriter) {
  switch (ast.op.kind) {
    case TokenKind.Equal:

      break;
    default:
      throw 'Unknown token'
  }
}

/*
  src:
    equal(funcCall("color", "_"), any()
  dest:
    function pred(node) { return color(node) == any
*/

function compileNode(ast: AstNode, writer: JsWriter) {
  switch (ast.kind) {
    case AstNodeKind.const:
    case AstNodeKind.op:
      compileOp(ast as OpNode, writer);
      break;
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
    this._predicates.push(pred)
  }
  public defineRuleset(s: string) {

  }
  public addBlueprint(s: string, blueprint?: string) {

  }
  public addMutator(a: { value: string, pred: string, action: string }) {

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

