import { AstNode } from "./ast";

export type Predicate = {
  text: string,
  selector: AstNode,
  predicate: AstNode
}

export class BlueprintStore {
  private readonly _predicates: Predicate[] = [];

  public predicates(): Iterable<Predicate> { return this._predicates }

  public addType(s: string) {

  }
  public addPredicate(s: string, selector?: AstNode, predicate?: AstNode) {
    this._predicates.push({
      text: s,
      selector: selector,
      predicate: predicate
    })
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

