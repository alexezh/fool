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

export function doceval(store: BlueprintStore, doc: DocPart): number {
  return 0;
}