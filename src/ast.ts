import { Token, TokenKind } from "./token";
import type { DocPart } from "./sm";

export enum AstErrorCode {
  generic,
  invalidNode,
}

export class AstError {
  public readonly msg: string;
  public readonly code: AstErrorCode;
  public readonly ast: AstNode | undefined;

  public constructor(code: AstErrorCode, ast: AstNode | undefined, msg: string) {
    this.msg = msg;
    this.code = code;
    this.ast = ast;
  }
}

export enum AstNodeKind {
  module = 0,
  paramDef = 1,
  funcDef = 2,
  typeDef = 3,
  varDef = 4,
  return = 5,
  break = 6,
  assingment = 7,
  call = 8,
  op = 9,
  const = 10,
  id = 11,
  expression = 12,
  block = 13,
  if = 14,
  for = 16,
  forever = 17,
  foreach = 18,
  while = 19,
  comment = 21,
  any = 22,
  typeRef = 23,
  varRef = 24,
  selector = 100,
  selectorRef = 101
}

let nextId: number = 1;

export function makeAstId(): number {
  let id = nextId++;
  return id;
}

//export let astTag = Symbol('AstNode');

export type AstNode = {
  //[astTag]?: boolean;
  kind: AstNodeKind;
  id: number;
  startToken?: Token;
  parent?: AstNode;
}

export type CommentNode = AstNode & {
  text?: string;
}

export type LinePlaceholderNode = AstNode & {
  text?: string;
}

export type StatementNode = AstNode & {

}

export type ParamDefNode = AstNode & {
  name: Token;
  paramType: Token;
}

export type FuncDefNode = AstNode & {
  name: Token | undefined;
  returnType: Token | undefined;
  params: ParamDefNode[];
  isAsync: boolean;
  body: BlockNode | Function;
}

export type FieldDef = {
  name: Token;
  fieldType: Token;
}

export type TypeDefNode = AstNode & {
  systemType: Function | undefined;
  fields: FieldDef[];
}

export type VarDefNode = AstNode & {
  name: Token;
  value: ExpressionNode | undefined;
}

export function equal(left: AstNode, right: AstNode): OpNode {
  return {
    kind: AstNodeKind.op,
    op: new Token(TokenKind.Equal, "==", 0),
    id: makeAstId(),
    left: left,
    right: right
  }
}

export function greater(left: AstNode, right: AstNode): OpNode {
  return {
    kind: AstNodeKind.op,
    op: new Token(TokenKind.Greater, ">", 0),
    id: makeAstId(),
    left: left,
    right: right
  }
}

export type CallNode = AstNode & {
  name: string,
  params?: ParamNode[]
}

export type ParamNode = AstNode & {
  // set during binding
  t?: TypeDef;
  value: AstNode;
}
export function paramNode(value: AstNode): ParamNode {
  return {
    kind: AstNodeKind.paramDef,
    id: makeAstId(),
    value: value
  }
}

export function funcCall(name: string, ...param: ParamNode[]): CallNode {
  return {
    kind: AstNodeKind.call,
    name: name,
    id: makeAstId(),
    params: param
  }
}

export type SelectorNode = AstNode & {
  /**
   * internal name of selector for references
   */
  name: string;
  value: AstNode
}

export function typeSelector(name: string, value: AstNode): SelectorNode {
  return {
    kind: AstNodeKind.selector,
    id: makeAstId(),
    name: name,
    value: value
  }
}

export type SelectorRefNode = AstNode & {
  name: string;
}

export function selectorRef(name: string): SelectorRefNode {
  return {
    kind: AstNodeKind.selectorRef,
    id: makeAstId(),
    name: name
  }
}

export type TypeRefNode = AstNode & {
  name: string,
  // args for generics
  args?: AstNode[],
  typeDef?: TypeDef;
}

export function typeRef(name: string): TypeRefNode {
  return {
    kind: AstNodeKind.typeDef,
    id: makeAstId(),
    name: name
  }
}

export function genericType(s: string, ...param: AstNode[]): TypeRefNode {
  return {
    kind: AstNodeKind.typeDef,
    id: makeAstId(),
    name: s,
    args: param
  }
}

export function sub(n1: AstNode, n2: AstNode): OpNode {
  return {
    kind: AstNodeKind.op,
    id: makeAstId(),
    left: n1,
    right: n2
  }
}

export function partSelector(s: string): AstNode {
  return null;
}

export function anyNode(): AstNode {
  return {
    kind: AstNodeKind.any,
    id: makeAstId(),
  }
}

export type EqualNode = AstNode;

export type ReturnNode = AstNode & {
  value: ExpressionNode | undefined;
}

export type AssingmentNode = StatementNode & {
  name: Token;
  value: ExpressionNode;
}

export type CallParamNode = ExpressionNode & {
  name: Token | undefined;
}

// export type CallNode = StatementNode & {
//   name: Token;
//   params: CallParamNode[];
//   funcDef?: FuncDefNode;
// }

export type TypeDef = {
  name: string;
}

export type OpNode = AstNode & {
  op?: Token;
  left: AstNode;
  right: AstNode;
  leftType?: TypeDef;
  rightType?: TypeDef;
}

export type ConstNode = AstNode & {
  value: Token | string | number;
}

export function constNode(val: string | number): ConstNode {
  return {
    kind: AstNodeKind.const,
    id: makeAstId(),
    value: val
  }
}

export function varRef(val: string): ConstNode {
  return {
    kind: AstNodeKind.varRef,
    id: makeAstId(),
    value: val
  }
}

export type IdNode = AstNode & {
  name: Token;
}

export function makeIdNode(token: Token): IdNode {
  return {
    kind: AstNodeKind.id,
    id: makeAstId(),
    startToken: token,
    name: token
  }
}

export type ExpressionNode = AstNode & {
  left: AstNode | undefined;
  op: OpNode | undefined;
  right: AstNode | undefined;
}

export type BlockNode = AstNode & {
  statements: StatementNode[];
}

export type IfNode = StatementNode & {
  exp: ExpressionNode;
  th: BlockNode;
  elif: { exp: ExpressionNode, block: BlockNode }[];
  el: BlockNode | undefined;
}

export type ForNode = StatementNode & {
  name: Token;
  startExp: ExpressionNode;
  endExp: ExpressionNode;
  byExp: ExpressionNode | undefined;
  body: BlockNode
}

export type ForeverNode = StatementNode & {
  body: BlockNode
}

export type ForeachNode = StatementNode & {
  name: Token;
  exp: ExpressionNode;
  body: BlockNode
}

export type WhileNode = StatementNode & {
  exp: ExpressionNode;
  body: BlockNode
}

/**
 * for now we are going to treat any object with .kind property as ast
 * layer we can add symbol tag if needed
 */
export function* getChildNodes(ast: AstNode): Iterable<AstNode> {
  for (let k in ast) {
    let v = ast[k];
    if (Array.isArray(v)) {
      for (let cv of v) {
        if (cv.kind !== undefined) {
          yield cv as AstNode;
        }
      }
    }
    else if (v.kind !== undefined) {
      yield v as AstNode;
    }
  }
}

