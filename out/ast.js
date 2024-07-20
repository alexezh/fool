"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceNode = exports.getModule = exports.getChildNodes = exports.insertPlaceholderBefore = exports.makeIdNode = exports.makeConstNode = exports.makeAstId = exports.AstNodeKind = exports.AstError = exports.AstErrorCode = void 0;
const token_1 = require("./token");
const parseerror_1 = require("./parseerror");
var AstErrorCode;
(function (AstErrorCode) {
    AstErrorCode[AstErrorCode["generic"] = 0] = "generic";
    AstErrorCode[AstErrorCode["invalidNode"] = 1] = "invalidNode";
})(AstErrorCode || (exports.AstErrorCode = AstErrorCode = {}));
class AstError {
    msg;
    code;
    ast;
    constructor(code, ast, msg) {
        this.msg = msg;
        this.code = code;
        this.ast = ast;
    }
}
exports.AstError = AstError;
var AstNodeKind;
(function (AstNodeKind) {
    AstNodeKind[AstNodeKind["module"] = 0] = "module";
    AstNodeKind[AstNodeKind["paramDef"] = 1] = "paramDef";
    AstNodeKind[AstNodeKind["funcDef"] = 2] = "funcDef";
    AstNodeKind[AstNodeKind["typeDef"] = 3] = "typeDef";
    AstNodeKind[AstNodeKind["varDef"] = 4] = "varDef";
    AstNodeKind[AstNodeKind["return"] = 5] = "return";
    AstNodeKind[AstNodeKind["break"] = 6] = "break";
    AstNodeKind[AstNodeKind["assingment"] = 7] = "assingment";
    AstNodeKind[AstNodeKind["call"] = 8] = "call";
    AstNodeKind[AstNodeKind["op"] = 9] = "op";
    AstNodeKind[AstNodeKind["const"] = 10] = "const";
    AstNodeKind[AstNodeKind["id"] = 11] = "id";
    AstNodeKind[AstNodeKind["expression"] = 12] = "expression";
    AstNodeKind[AstNodeKind["block"] = 13] = "block";
    AstNodeKind[AstNodeKind["if"] = 14] = "if";
    AstNodeKind[AstNodeKind["for"] = 16] = "for";
    AstNodeKind[AstNodeKind["forever"] = 17] = "forever";
    AstNodeKind[AstNodeKind["foreach"] = 18] = "foreach";
    AstNodeKind[AstNodeKind["while"] = 19] = "while";
    AstNodeKind[AstNodeKind["on"] = 20] = "on";
    AstNodeKind[AstNodeKind["comment"] = 21] = "comment";
    AstNodeKind[AstNodeKind["linePlaceholder"] = 100] = "linePlaceholder";
    AstNodeKind[AstNodeKind["idPlaceholder"] = 101] = "idPlaceholder";
    AstNodeKind[AstNodeKind["expressionPlaceholder"] = 102] = "expressionPlaceholder";
    AstNodeKind[AstNodeKind["paramPlaceholder"] = 103] = "paramPlaceholder";
    AstNodeKind[AstNodeKind["bodyPlaceholder"] = 104] = "bodyPlaceholder";
})(AstNodeKind || (exports.AstNodeKind = AstNodeKind = {}));
let nextId = 1;
function makeAstId() {
    let id = nextId++;
    return id;
}
exports.makeAstId = makeAstId;
function makeConstNode(token) {
    return {
        kind: AstNodeKind.const,
        id: makeAstId(),
        startToken: token,
        value: token
    };
}
exports.makeConstNode = makeConstNode;
function makeIdNode(token) {
    return {
        kind: AstNodeKind.id,
        id: makeAstId(),
        startToken: token,
        name: token
    };
}
exports.makeIdNode = makeIdNode;
function insertPlaceholderBefore(before) {
    if (!before.parent) {
        throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.InvalidArg, undefined, 'Cannot get parent');
    }
    // we can only insert empty line if there is a block
    if (before.parent.kind === AstNodeKind.block) {
        let ph = {
            kind: AstNodeKind.linePlaceholder,
            id: makeAstId(),
            startToken: token_1.Token.makeWs()
        };
        let block = before.parent;
        let idx = block.statements.findIndex((e) => e === before);
        if (idx === -1) {
            throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.InvalidArg, undefined, 'Cannot find node');
        }
        ph.parent = block;
        block.statements.splice(idx, 0, ph);
        return ph;
    }
    else {
        return insertPlaceholderBefore(before.parent);
    }
}
exports.insertPlaceholderBefore = insertPlaceholderBefore;
/**
 * for now we are going to treat any object with .kind property as ast
 * layer we can add symbol tag if needed
 */
function* getChildNodes(ast) {
    for (let k in ast) {
        let v = ast[k];
        if (Array.isArray(v)) {
            for (let cv of v) {
                if (cv.kind !== undefined) {
                    yield cv;
                }
            }
        }
        else if (v.kind !== undefined) {
            yield v;
        }
    }
}
exports.getChildNodes = getChildNodes;
/**
 * for now we are going to treat any object with .kind property as ast
 * layer we can add symbol tag if needed
 */
function getModule(ast) {
    while (true) {
        if (ast.kind === AstNodeKind.module) {
            return ast;
        }
        if (!ast.parent) {
            return undefined;
        }
        ast = ast.parent;
    }
}
exports.getModule = getModule;
/**
 * replace node with new node by scanning parent node
 */
function replaceNode(cur, upd) {
    let parent = cur.parent;
    if (!parent) {
        throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.InvalidArg, undefined, 'Unconnected node');
    }
    for (let k in parent) {
        let field = parent[k];
        if (Array.isArray(field)) {
            for (let i = 0; i < field.length; i++) {
                let arrVal = field[i];
                if (arrVal.kind !== undefined) {
                    let arrValAst = arrVal;
                    if (arrValAst.id === cur.id) {
                        field[i] = upd;
                        return;
                    }
                }
            }
        }
        else if (field.kind !== undefined) {
            let fieldAst = field;
            if (fieldAst.id === cur.id) {
                parent[k] = upd;
                return;
            }
        }
    }
}
exports.replaceNode = replaceNode;
//# sourceMappingURL=ast.js.map