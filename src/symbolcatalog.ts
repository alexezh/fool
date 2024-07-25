import { AstNodeKind, type AstNode, type TypeRefNode } from "./ast";
import { DocPart, PFalse, PTrue, type PBool } from "./sm";

export class TypeDef {
  public readonly name: string;
  public readonly parts?: TypeDef[];

  public constructor(name: string, parts?: TypeDef[]) {
    this.name = name;
    this.parts = parts;
  }
}

export class FuncDef {
  // this is not the actual prototype, we might call it with different parameters
  public readonly func: (...args: any) => any;
  public readonly jsname: string;
  public readonly params: TypeDef[];

  public constructor(jsname: string, params: TypeDef[], func: () => void) {
    this.jsname = jsname;
    this.func = func;
    this.params = params;
  }
}

export class SymbolCatalog {
  private readonly functions = new Map<string, FuncDef[]>();
  private readonly types = new Map<string, TypeDef>();

  public getFunction(name: string, params: AstNode[]): FuncDef {
    let list = this.functions.get(name);
    if (!list) {
      throw 'Function not found ' + name;
    }

    for (let def of list) {
      if (this.matchFuncDef(def, params)) {
        return def;
      }
    }
  }

  public registerType(def: TypeDef) {
    this.types.set(def.name, def);
  }

  public registerFunction(name: string, sparams: string[], jsname: string, func: (...args: any) => any) {
    let params: TypeDef[] = [];
    for (let s of sparams) {
      params.push(this.parseParam(s));
    }
    let funcDef = new FuncDef(jsname, params, func);
    let funcList = this.functions.get(name);
    if (!funcList) {
      this.functions.set(name, funcList);
    }
    funcList.push(funcDef);
  }

  public getTypeDef(s: string): TypeDef {
    let def = this.types.get(s);
    if (!def) {
      throw 'Cannot find type ' + s;
    }
    return def;
  }

  private matchFuncDef(def: FuncDef, params: AstNode[]) {

  }

  private parseParam(s: string): TypeDef {
    let parts = s.split("|");
    if (parts.length === 1) {
      return this.getTypeDef(s);
    } else {
      // check if we already have type
      parts.sort();
      let canonicalName = parts.join("|");
      let def = this.types.get(canonicalName);
      if (def) {
        return def;
      }

      let td: TypeDef[] = [];
      for (let part of parts) {
        td.push(this.getTypeDef(part));
      }
      def = new TypeDef(canonicalName, td);
      this.types.set(canonicalName, def);
      return def;
    }
  }
}

export let catalog = new SymbolCatalog();
catalog.registerType(new TypeDef("any"));
catalog.registerType(new TypeDef("Picture"));
catalog.registerType(new TypeDef("FontSize"));
catalog.registerType(new TypeDef("Color"));
catalog.registerType(new TypeDef("PictureHeight"));
catalog.registerType(new TypeDef("DocPart"));

//catalog.registerType(new TypeDef("Any"));
catalog.registerFunction("equal", ["Color|any", "Color|any"], "color_equal", color_equal);
catalog.registerFunction("color", ["DocPart"], "color_part", color_part);

function color_equal(c1: number, c2: number): PBool {
  return (c1 === c2) ? PTrue : PFalse;
}

function color_part(part: DocPart): number {
  return part.color ?? 0;
}