import { AstNode, ConstNode, SelectorNode } from "./ast"
import { BlueprintStore } from "./blueprintstore"

export type DocProp = {
  t: "Color" | "PictureHeight"
  v: string
}

export type DocPart = {
  t: "Body" | "Title" | "Heading1" | "Heading2" | "Paragrapm"
  childred?: DocPart[]
  props?: DocProp[]
  color?: number;
}

export function visitDocParts(part: DocPart, visitor: (part: DocPart) => boolean) {
  if (!visitor(part)) {
    return;
  }
  if (part.childred) {
    for (let child of part.childred) {
      visitDocParts(child, visitor);
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

export function selectMatchingParts(doc: DocPart, selector: SelectorNode): { part: DocPart, p: PBool }[] {
  let parts: { part: DocPart, p: PBool }[] = [];
  // in the future, we can index document by common patterns used by selector
  // such as types of objects. For now, we can just run through
  visitDocParts(doc, (part: DocPart) => {
    let v = evalSelector(part, selector);
    if (!isPFalse(v)) {
      parts.push({ part: part, p: v });
    }

    return true;
  })

  return parts;
}

export function evalPredicate(part: DocPart, pred: AstNode): number {
  return 0;
}

export function evalDoc(store: BlueprintStore, doc: DocPart): number {
  let total: number = 0;

  for (let pred of store.predicates()) {
    let parts = selectMatchingParts(doc, pred.selector as SelectorNode);
    for (let part of parts) {
      let res = evalPredicate(part.part, pred.predicate);
      total += res;
    }
  }
  return total;
}