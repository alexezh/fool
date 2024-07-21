import { AstNode, any, constNode, equal, funcCall, genericType, partSelector, sub, typeSelector } from "./ast";
import { BlueprintStore, MemoryLane } from "./blueprintstore";
import { DocPart, evalDoc } from "./sm";

/**
 * fool is a reasoning engine which combines ideas of prolog and ML
 * the idea is to represent knowledge as set of predicates which are either
 * hardcoded or inferred from the data and perform actions to maximize predicates
 * 
 * Unlike prolog language (and boolean algebra), predicates and not boolean. Instead then
 * return probability functions (such as sigmoids) so we can apply gradient descent when
 * optimizing the model
 * 
 * The second part is mutators, which provides a way for system to solve the problem by
 * changing the model
 */

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
 * predicate which is expected to be true
 * the terms in predicate are either constants or functions
 * 
 * predicate has to be true for all elements which are matched by a selector
 * 
 */
store.addPredicate(":Title => font_size(Title) > 30)")

/**
 * inline selector
 */
store.addPredicate("font_size(:Title) > 30)")

/**
 * aliasing variable
 */
store.addPredicate("x:Title => font_size(x) > 30)")

/**
 * using default alias
 */
store.addPredicate(":Title => font_size(_) > 30)")

/**
 * predicate can also check multiple elements, in which case will run over 
 * all combination of values
 */
store.addPredicate(":Title :Heading<1> => font_size(Title) > font_size(Heading<1>)")

/**
   bit of meta programming. Heading<1> etc are types
   below we are saying that heading color should match between different levels
 */
store.addPredicate(":Heading<N> :Heading<N-1> => font_size(Heading<N>) >= font_size(Heading<N-1>)")

/**
 * the above is shorthand for following LINQ type expression
 */
store.addPredicate("x:document.all(x => x.Type == \"Title\") y:document.all(x => x.Type == \"Heading<1>\")) => font_size(x) > font_size(y))")

/**
 * add empty facts just to define parameters for the model
 */

// any object of Title type
store.addPredicate("color(Title) == any", typeSelector("Title"), equal(funcCall("color", "_"), any()))

// title object of the document
store.addPredicate("color(document.title) == any", partSelector("document.title"),
  equal(funcCall("color", partSelector("_")), any()))

store.addPredicate("color(Heading<N>) == any", typeSelector(genericType("Heading", "N")),
  equal(funcCall("color", typeSelector(genericType("Heading", "N"))), any()))
store.addPredicate("color(Heading<N>) == color(Heading<N-1>)", typeSelector("Heading"), equal(
  funcCall("color", typeSelector(genericType("Heading", constNode("N")))),
  funcCall("color", typeSelector(genericType("Heading", sub(constNode("N"), constNode(("1"))))))))

/**
 * documents can have same color
 */
store.addPredicate("color(Title) == color(Heading(N))")

store.defineRuleset("picture_layout");
store.addPredicate("picture_height(Picture) == block_height(Block)")
store.addPredicate("picture_height(Picture) + line_height(Block) * 2 < block_height(Block)")
store.addPredicate("iif(picture_category(Picture) == Headshot, picture_size(Picture) < page_size() / 3")
store.addPredicate("iif(picture_complexity(Picture) == high, section_orientation(containing_section(Picture)) == landscape")

store.defineRuleset("one_page_flyer");
store.addPredicate("page_height(Body) == page_size()")
store.addPredicate("page_size(Picture) == block_height(Block)")
store.addPredicate("page_size(Picture) == block_height(Block)")

store.addBlueprint("create Body(Sequence(Picture, Table())", "one_page_flyer")

store.addPredicate("type Picture")
store.addPredicate("type Block: Paragraph[]")

/**
 * mutators provide a way for system to change model and as a result change the result of predicates
 * 
 * the first two calls define mutators for paragraph and run color. It takes one parameter of type Color, and passes it
 * to set_paragraph_color method. If predicate uses color(), the system will be able to adjust
 * the color on the paragraph which matched selector
 */
store.addMutator({ value: "x: Color", pred: "color(para: Para)", action: "set_paragraph_color(para, x)" })
store.addMutator({ value: "x: Color", pred: "color(run: Run)", action: "set_run_color(para, x)" })

/**
 * similar for picture size
 */
store.addMutator({ value: "x: PictureSize", pred: "picture_height(page: Picture)", action: "set_picture_height(Picture, x)" })

/**
 * The predicate checks parent object of a picture = section_orientation(containing_section(Picture))
 * 
 * We want to wrap a picture if section is not landscape. There are two ways for doing this, we can either change
 * existing section, or we can wrap picture into section. Potentially we can convert heading block into section. We are going
 * to define mutators for all cases and learn the best approaches
 * 
 * first, first define method for changing page orientation and wrapping picture
 */
store.addMutator({ value: "x: PageOrientation", pred: "page_orientation(section: Section)", action: "set_page_orientation(page, x)" });

/**
 * second wrap picture into a section
 */
store.addMutator({ value: "", pred: "page_orientation(containing_picture(pic))", action: "wrap_picture(page); set_page_orientation(PictureOrientation.landscape);" });

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
//store.eval(doc);

let doc: DocPart = {
  t: "Body",
  childred: [
    {
      t: "Title",
      props: [
        {
          t: "Color",
          v: "0"
        }
      ]
    },
    {
      t: "Paragrapm"
    }
  ]
}

console.log("hello world");
evalDoc(store, doc);
