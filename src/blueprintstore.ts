import { AstNode } from "./ast";

export class BlueprintStore {
  public addType(s: string) {

  }
  public addPredicate(s: string, selector?: AstNode, predicate?: AstNode) {

  }
  public defineRuleset(s: string) {

  }
  public addBlueprint(s: string, blueprint?: string) {

  }
  public addAction(a: { pred: string, action: string }) {

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

