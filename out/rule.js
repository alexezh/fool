class BlueprintStore {
    addRule(fact) {
    }
    defineRuleset(s) {
    }
    addBlueprint(s, blueprint) {
    }
    addAction(a) {
    }
}
class MemoryLane {
    setContext(x) {
    }
    addMemory(s) {
    }
}
function makeRule(s) {
    return null;
}
function compute(s) {
}
let store = new BlueprintStore();
let lane = new MemoryLane();
store.addRule(makeRule("font_size(Title) > font_size(Heading(1))"));
/**
 * recursive definition for all heading
 */
store.addRule(makeRule("font_size(Heading(N)) >= font_size(Heading(N-1))"));
/**
 * add empty facts just to define parameters for the model
 */
store.addRule(makeRule("color(Heading(N)) == any"));
store.addRule(makeRule("color(Heading(N)) == color(Heading(N-1))"));
store.addRule(makeRule("color(Title) == any"));
/**
 * documents can have same color
 */
store.addRule(makeRule("color(Title) == color(Heading(N))"));
store.defineRuleset("picture_layout");
store.addRule(makeRule("picture_height(Picture) == block_height(Block)"));
store.addRule(makeRule("picture_height(Picture) + line_height(Block) * 2 < block_height(Block)"));
store.addRule(makeRule("iif(picture_category(Picture) == Headshot, picture_size(Picture) < page_size() / 3"));
store.addRule(makeRule("iif(picture_complexity(Picture) == high, page_orientation(containing_page(Picture)) == landscape"));
store.defineRuleset("one_page_flyer");
store.addRule(makeRule("page_height(Body) == page_size()"));
store.addRule(makeRule("page_size(Picture) == block_height(Block)"));
store.addRule(makeRule("page_size(Picture) == block_height(Block)"));
store.addBlueprint("create Body(Sequence(Picture, Table())", "one_page_flyer");
store.addRule("type Picture");
store.addRule("type Block: Paragraph[]");
store.addAction({ pred: "color(para: Para)", action: "set_paragraph_color(para, $x)" });
store.addAction({ pred: "color(run: Run)", action: "set_run_color(para, $x)" });
store.addAction({ pred: "picture_height(page: Picture)", action: "set_picture_height(Picture, x)" });
store.addAction({ pred: "page_orientation(page: Page)", action: "wrap_section(Picture)" });
/**
 * populate some sample data about two documents
 */
lane.setContext("document = X");
lane.addMemory("color(Title) = Black");
lane.addMemory("color(Heading(1)) = Blue");
lane.addMemory("font_size(Title) = 20");
lane.addMemory("font_size(Heading(1)) = 10");
lane.addMemory("border(Title) = Bottom");
lane.setContext("document = Y");
lane.addMemory("color(Title) = Blue");
lane.addMemory("color(Heading(1)) = Blue");
lane.addMemory("font_size(Title) = 30");
lane.addMemory("font_size(Heading(1)) = 10");
// from here I can compute with pretty simple Bayesian model that
/*
compute({ query: "color(Title)", given: "color(Heading(1)) == Blue)" }) => "uniform(Black | Blue)"
compute({ query: "color(Heading(1))", given: "color(Title) == Blue)" }) => "Blue"
compute({ query: "color(Heading(1))", given: "color(Title) == Blue)" }) => "Blue"
compute({ query: "font_size(Heading(1))", given: "" }) => "uniform(20, 30)"
*/
// 
console.log("hello world");
//# sourceMappingURL=rule.js.map