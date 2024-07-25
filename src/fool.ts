import { AstNode, anyNode, constNode, equal, funcCall, genericType, paramNode, partSelector, selectorRef, sub, typeRef, typeSelector } from "./ast";
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
 * next predicate ensures that Title font size is at least 30
 */
store.addPredicate(equal(funcCall("docpart_kind", part), "Title"), greater(funcCall("font_size", 0), 30))

/*
 * color(Title) == any
 *
 * the goal for this predicate is to provide way for system to mutate color(Title)
 * the predicate is true for any value, but mutator can still change things. When we train
 * we are going to record all values of color(Title) and setup value as any_color as P(color)
 * this will give us weight for rule such as that if color matches one of colors we've seen we know the P
 * otherwise, we can set probability to low default value
 *
 * The distribution of any_color is affected by user selection. If we know that user changed Title color
 * we will reset probability to look like sigmoid, with user selected value having highest probability
 */
store.addPredicate(docpart_kind(part) == "Title", equal(funcCall("color", 0), any_color()))

/*
 * similarly, we want to ensure that paragraphs are consistent across the board
 * we do not expect this rule to have high weight
 *
 * unlike title, we will have a lot of paragraphs. A user might change color to any specific paragraph
 * We are going to keep all colors which user applies in distribution for this rule (removing if necessary)
 * this way, if user selected 3 colors across paragraphs, we will keep all three colors and suggest other 
 * paragraphs to one of them
 */
store.addPredicate(docpart_kind(part) == "Paragraph", equal(funcCall("color", 0), any_color()))

/*
 * however, this rules might have higher value as it checks that all paragraphs are from same theme
 */
store.addPredicate(docpart_kind(part) == "Paragraph", equal(funcCall("theme", 0), any_theme()))

/*
* limits number of colors across paragraphs to 3
* the predicate does not have mutators by itself, but it references rules which are affected
*/
store.addPredicate(unique(funcCall("color", part)), less(array_length(0), 3), "color")

store..... picture....

function *iterateHeaderLevel(): Iterable<number[]> { 
  for(let i = 0; i < 9; i++) yeild([i]); 
}

/*
 * isdarker(color(Title), color(Heading))
 *
 * for any heading, checks that color of heading is darker than title color
 */
store.addMacroPredicate(
  iterateHeaderLevel,
  [
    equal(docpart_kind(part), "Title"), 
    equal(docpart_kind(part), "Heading$1"), 
  ],
  color_darker(funcCall("color", 0), funcCall("color", 1)))

function *iterateHeaderPairs(): Iterable<number[]> { 
  for(let i = 0; i < 9; i++) yeild([i, i+1]); 
}

/*
 * isdarker(color(Heading1), color(Heading2))
 *
 * for heading hierarchy, force hierarchy color
 * the colors can be different in different parts of document
 */
store.addMacroPredicate(
  iterateHeaderPairs,
  [
    equal(docpart_kind(part), "Heading$0"), 
    equal(docpart_kind(part), "Heading$1"), 
  ],
  color_same(funcCall("color", 0), funcCall("color", 1)))

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

<<<<<<< HEAD
// any object of Title type
store.addPredicate("color(Title) == any",
  typeSelector("1", typeRef("Title")),
  equal(funcCall("color", paramNode(selectorRef("1"))), anyNode()))

=======
>>>>>>> 2c13bf100d479a395bcc1c82ce58378216bd9317
/**
 * mutators provide a way for system to change model and as a result change the result of predicates
 * 
 * the first two calls define mutators for paragraph and run color. It takes one parameter of type Color, and passes it
 * to set_paragraph_color method. If predicate uses color(), the system will be able to adjust
 * the color on the paragraph which matched selector
 */
store.addMutator({ value: "x: Color", pred: "color(para: Para)", action: "set_paragraph_color(para, x)" })
store.addMutator({ value: "x: Color", pred: "color(run: Run)", action: "set_run_color(para, x)" })

// title object of the document
// store.addPredicate("color(document.title) == any", partSelector("document.title"),
//   equal(funcCall("color", paramNode(partSelector("_"))), any()))

// store.addPredicate("color(Heading<N>) == any",
//   typeSelector("1", genericType("Heading", "N")),
//   equal(funcCall("color", paramNode(selectorRef("1"))), paramNode(anyNode())));

// store.addPredicate("color(Heading<N>) == color(Heading<N-1>)",
//   typeSelector("1", typeRef("Heading")),
//   equal(
//     funcCall("color", paramNode(selectorRef("1"))),
//     funcCall("color", paramNode(selectorRef("2")))))

/**
 * documents can have same color
 */
store.addPredicate("color(Title) == color(Heading(N))")

store.addPredicateGroup("picture_layout", docpart_kind(part) == "Paragraph" && paragraph_contains("picture), () => {
  /*
  * related block is a model function which returns multiple blocks with probabilities
  * we will back propagate probabilities through the system the same way
  * 
  * "let" defines an alias to statement on the right. It is not a variable in JS sense.
  */                                                                                                 
  store.addClause("let block = related_block(para)")

  store.withElem("block", () => {                                                                                         
    /*
    * now we have probable blocks, compute
    */                                                                                                   
    store.addClause("picture_height(Picture) == block_height(block)")
                                                                                                    
    store.addPredicate("picture_height(Picture) == block_height(Block)")
    store.addPredicate("picture_height(Picture) + line_height(Block) * 2 < block_height(Block)")
    store.addPredicate("iif(picture_category(Picture) == Headshot, picture_size(Picture) < page_size() / 3")
    store.addPredicate("iif(picture_complexity(Picture) == high, section_orientation(containing_section(Picture)) == landscape")
  }
}

/**
 * similar for picture size
 */
store.addMutator({ value: "x: PictureSize", pred: "picture_height(page: Picture)", action: "set_picture_height(Picture, x)" })

/*
 * flyer is single page document which can have multiple designs inclidong
 *   - Figure on top (which can be one or more pictures) and table on the bottom
 *   - Figure across page with table overlaying
 */
<<<<<<< HEAD
store.defineRuleset("one_page_flyer");

/*
 * content must be on one page
 */
store.addPredicate("content_height(Body) == page_size()")

/*
 * content must have title, figure and table
 */
store.addPredicate("content_has(body, Title) && content_has(body, Figure) && content_has(body, InfoBlock)")

/*
 * need better syntax. We want to say that figure is either picture, or list of pictures  
 */
store.addPredicate("figure = Picture || [Picture, next_element(Picture)]")

/*
 * info block must be a table. Need to work on this if we want to format table into something
 */
store.addPredicate("content_kind(InfoBlock, Table)")

/*
 * for mutator, we want to scale figure (which is one or more pictures)
 */
store.addMutator({ value: "", pred: "content_height(content: Body)", action: "set_figure_height(Body.Figure, x)" })

store.addDesign("create Body(Sequence(Picture, Table())", "one_page_flyer")

store.addPredicate("type Picture")
store.addPredicate("type Block: Paragraph[]")


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
=======
store.addPredicateGroup("one_page_flyer", document_kind(doc, "Flyer"), () => {
                  
  /*
   * content must be on one page
   */
  store.addPredicate("content_height(Body) == page_size()")
  
  /*
   * content must have title, figure and table
   */
  store.addPredicate("content_has(body, Title) && content_has(body, Figure) && content_has(body, InfoBlock)")
  
  /*
   * need better syntax. We want to say that figure is either picture, or list of pictures  
   */
  store.addPredicate("figure = Picture || [Picture, next_element(Picture)]" })
  
  /*
   * info block must be a table. Need to work on this if we want to format table into something
   */
  store.addPredicate("content_kind(InfoBlock, Table)")
  
  /*
   * for mutator, we want to scale figure (which is one or more pictures)
   */
  store.addMutator({ value: "", pred: "content_height(content: Body)", action: "set_figure_height(Body.Figure, x)" })
  
  store.addDesign("create Body(Sequence(Picture, Table())", "one_page_flyer")
  
  store.addPredicate("type Picture")
  store.addPredicate("type Block: Paragraph[]")
  
  
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
}
>>>>>>> 2c13bf100d479a395bcc1c82ce58378216bd9317

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
