import { AstNode, ConstNode, SelectorNode } from "./ast"
import { Blueprint } from "./blueprintstore"

export type DocProp = {
  t: "Color" | "PictureHeight"
  v: string
}

export type DocPartKind =
  "Body" | "Title" | "Heading1" | "Heading2" | "Paragraph";

export type DocPart = {
  kind: DocPartKind,
  childred?: DocPart[],
  props?: DocProp[],
  color?: number,
}

export class Doc {
  public readonly body: DocPart;
  // flat parts
  private readonly allParts: DocPart[] = [];

  public constructor(body: DocPart) {
    this.body = body;
    this.visitDocParts(this.body, (part: DocPart) => {
      this.allParts.push(part);
      return true;
    })
  }

  public map() {
    throw 'not implemented'
  }

  public mapKind(kind: DocPartKind) {

  }

  private visitDocParts(part: DocPart, visitor: (part: DocPart) => boolean) {
    if (!visitor(part)) {
      return;
    }
    if (part.childred) {
      for (let child of part.childred) {
        this.visitDocParts(child, visitor);
      }
    }
  }
}

/**
 * boolean
 */
export type PBool = number & {
  __bool__: boolean
};

export const PFalse: PBool = 0 as PBool;
export const PTrue: PBool = 1 as PBool;

export function isPFalse(v: PBool): boolean {
  return v < 0.000001;
}

export function evalSelector(part: DocPart, selector: SelectorNode): PBool {
  let targetType = (selector.value as ConstNode).value as string;
  if (part.t === targetType) {
    return PTrue;
  }

  return PFalse;
}

export function evalPredicate(part: DocPart, pred: AstNode): number {
  return 0;
}

<<<<<<< Updated upstream
export function evalDoc(store: Blueprint, doc: DocPart): number {
=======
export function evalDoc(store: BlueprintStore, doc: Document): number {
>>>>>>> Stashed changes
  let total: number = 0;

  for (let pred of store.predicates()) {
    let res = pred.eval(doc);
    total += res;
  }

  return total;
}