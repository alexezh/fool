import { AstNode, aconst, any, equal, funcCall, genericType, partSelector, sub, typeSelector } from "./ast";

interface IRule {

}

class BlueprintStore {
  public addType(s: string) {

  }
  public addRule(s: string, ast?: AstNode) {

  }
  public defineRuleset(s: string) {

  }
  public addBlueprint(s: string, blueprint?: string) {

  }
  public addAction(a: { pred: string, action: string }) {

  }
}

class MemoryLane {
  public setContext(x: string) {

  }
  public addMemory(s: string) {

  }
}

function makeRule(s: string): IRule {
  return null as unknown as IRule;
}

function compute(s: { query: string, given: string }): any {

}

let store = new BlueprintStore();
let lane = new MemoryLane();

store.addType(`
  type Paragraph;
  type Body: (paragraph | table)[]
  type Body: (paragraph | table)[]
  type Title = Paragraph
  type Color = Number;
  type FontSize = Number;
  type Picture;
  type PictureHeight = Number;

  function font_size(Picture): Number;
  function color(Picture | Paragraph): Color;
  function picture_height(Pictire): PictureHeight;
  function picture_height(Pictire): PictureHeight;
`);
/**
 * rule is a predicate which is expected to be true
 * the terms in predicate are either constants or functions
 */
store.addRule("font_size(Title) > font_size(Heading(1))")

/**
   bit of meta programming. Heading<1> etc are types
   below we are saying that heading color should match between different levels
 */
store.addRule("font_size(Heading<N>) >= font_size(Heading<N-1>)")

/**
 * add empty facts just to define parameters for the model
 */

// any object of Title type
store.addRule("color(Title) == any", equal(funcCall("color", typeSelector("Title")), any()))

// title object of the document
store.addRule("color(document.title) == any", equal(funcCall("color", partSelector("document.title")), any()))

store.addRule("color(Heading<N>) == any", equal(funcCall("color", typeSelector(genericType("Heading", "N"))), any()))
store.addRule("color(Heading<N>) == any", equal(
  funcCall("color", typeSelector(genericType("Heading", aconst("N")))),
  funcCall("color", typeSelector(genericType("Heading", sub(aconst("N"), aconst(XMLDocument"1")))))))
store.addRule("color(Heading<N>) == color(Heading<N-1>)")

/**
 * documents can have same color
 */
store.addRule("color(Title) == color(Heading(N))")

store.defineRuleset("picture_layout");
store.addRule("picture_height(Picture) == block_height(Block)")
store.addRule("picture_height(Picture) + line_height(Block) * 2 < block_height(Block)")
store.addRule("iif(picture_category(Picture) == Headshot, picture_size(Picture) < page_size() / 3")
store.addRule("iif(picture_complexity(Picture) == high, page_orientation(containing_page(Picture)) == landscape")

store.defineRuleset("one_page_flyer";
store.addRule("page_height(Body) == page_size()")
store.addRule("page_size(Picture) == block_height(Block)")
store.addRule("page_size(Picture) == block_height(Block)")

store.addBlueprint("create Body(Sequence(Picture, Table())", "one_page_flyer")

store.addRule("type Picture")
store.addRule("type Block: Paragraph[]")

store.addAction({ pred: "color(para: Para)", action: "set_paragraph_color(para, $x)" })
store.addAction({ pred: "color(run: Run)", action: "set_run_color(para, $x)" })
store.addAction({ pred: "picture_height(page: Picture)", action: "set_picture_height(Picture, x)" })
store.addAction({ pred: "page_orientation(page: Page)", action: "wrap_section(Picture)" });

/**
 * populate some sample data about two documents
 */
lane.setContext("document = X")
lane.addMemory("color(Title) = Black")
lane.addMemory("color(Heading(1)) = Blue")
lane.addMemory("font_size(Title) = 20")
lane.addMemory("font_size(Heading(1)) = 10")
lane.addMemory("border(Title) = Bottom")

lane.setContext("document = Y")
lane.addMemory("color(Title) = Blue")
lane.addMemory("color(Heading(1)) = Blue")
lane.addMemory("font_size(Title) = 30")
lane.addMemory("font_size(Heading(1)) = 10")

// from here I can compute with pretty simple Bayesian model that
/*
compute({ query: "color(Title)", given: "color(Heading(1)) == Blue)" }) => "uniform(Black | Blue)"
compute({ query: "color(Heading(1))", given: "color(Title) == Blue)" }) => "Blue"
compute({ query: "color(Heading(1))", given: "color(Title) == Blue)" }) => "Blue"
compute({ query: "font_size(Heading(1))", given: "" }) => "uniform(20, 30)"
*/
// 

console.log("hello world")