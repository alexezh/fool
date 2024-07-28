import { AstNode, AstNodeKind, CallNode, ConstNode, OpNode, SelectorNode } from "./ast";
import { JsWriter } from "./jswriter";
import type { Doc, DocPart, PBool } from "./sm";
import { TypeDef, catalog } from "./symbolcatalog";
import { TokenKind } from "./token";

export class Predicate {
  selector: SelectorNode;
  predicate: AstNode
  compiledPredicate?: (part: DocPart) => number;

  public eval(doc: Doc): { part: DocPart, p: PBool }[] {
    let parts: { part: DocPart, p: PBool }[] = [];

    // in the future, we can index document by common patterns used by selector
    // such as types of objects. For now, we can just run through

    // this.visitDocParts(doc, (part: DocPart) => {
    //   let v = evalSelector(part, selector);
    //   if (!isPFalse(v)) {
    //     parts.push({ part: part, p: v });
    //   }

    //   return true;
    // })

    return parts;
  }
}

function compileOp(ast: OpNode, writer: JsWriter) {
  switch (ast.op.kind) {
    case TokenKind.Equal:
      let funcDef = catalog.getFunction("equal", [ast.left, ast.right]);
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

function resolveType(ast: AstNode): TypeDef {
  switch (ast.kind) {
    case AstNodeKind.const:
    case AstNodeKind.selectorRef:
  }
}

function compileCall(callAst: CallNode, writer: JsWriter) {
  // bind parameter types
  for (let param of callAst.params) {
    param.typeDef = resolveType(param);
  }

  {
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
  }
}

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
    case AstNodeKind.call:
      compileCall(ast as CallNode, writer);
      break;
    case AstNodeKind.any:
    default:
      debugger;
      throw 'unknown node';
  }

}

function compileSelector(ast: SelectorNode) {
  if (ast.value.kind === AstNodeKind.typeDef) {
    // check if type 
    // if(part.t === type)

  } else {
    throw 'unknown selector type'
  }
}

/**
 * Type selector:
 *    Function(doc: Document) {
 *      doc.selectKind("Foo", (part) => {
 *        // predicate
 *      })
 *    }
 * 
 *  Complex expression such as: iif(picture_category(Picture) == Headshot
 *  For now converted to 
 *    Function(doc: Document) {
 *      doc.select((part) => { if(picture_category())}, (part) => {
 *        // predicate
 *      })
 *    }
 */
function compilePredicate(pred: Predicate) {
  let writer = new JsWriter();
  let ctx = new NameContext();

  if (pred.selector.kind !== AstNodeKind.selector) {
    throw 'Incorrect selector type';
  }
  compileSelector(ctx)
  compileNode(pred.predicate, writer);

  console.log(writer.toString());
}

class NameContext {
  private readonly names: Record<string, TypeDef> = {};
  private readonly parent: NameContext;

  public constructor(parent?: NameContext) {
    if (parent) {
      this.parent = parent;
    }
  }

  public getItem(name: string): TypeDef | undefined {
    let item = this.names[name];
    if (item) {
      return item;
    }
    if (this.parent) {
      return this.parent.getItem(name);
    }
    //let func = catalog.getFunction();
    return undefined;
  }
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
      compilePredicate(pred);
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

