import { AstNode } from "./ast"
import { BlueprintStore } from "./blueprintstore"

export type DocProp = {
  t: "Color" | "PictureHeight"
  v: string
}

export type DocPart = {
  t: "Body" | "Title" | "Heading1" | "Heading2" | "Paragrapm"
  childred?: DocPart[]
  props?: DocProp[]
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
 * 
 */
export type PBool = () => number;

export function evalSelector(part: DocPart, selector: AstNode): {

}

export function selectMatchingParts(doc: DocPart, selector: AstNode) {
  // in the future, we can index document by common patterns used by selector
  // such as types of objects. For now, we can just run through
  visitDocParts(doc, (part: ))
  // if(selector.kind === )
}

export function evalDoc(store: BlueprintStore, doc: DocPart): number {
  for (let pred of store.predicates()) {
    selectMatchingParts(doc, pred.selector);
  }
  return 0;
}