"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenKind = void 0;
var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Eol"] = 1] = "Eol";
    TokenKind[TokenKind["Eof"] = 2] = "Eof";
    TokenKind[TokenKind["Ws"] = 3] = "Ws";
    // first op
    TokenKind[TokenKind["Equal"] = 4] = "Equal";
    TokenKind[TokenKind["NotEqual"] = 5] = "NotEqual";
    TokenKind[TokenKind["Less"] = 6] = "Less";
    TokenKind[TokenKind["Greater"] = 7] = "Greater";
    TokenKind[TokenKind["LessOrEqual"] = 8] = "LessOrEqual";
    TokenKind[TokenKind["GreaterOrEqual"] = 9] = "GreaterOrEqual";
    TokenKind[TokenKind["Or"] = 10] = "Or";
    TokenKind[TokenKind["And"] = 11] = "And";
    TokenKind[TokenKind["Not"] = 12] = "Not";
    TokenKind[TokenKind["Is"] = 13] = "Is";
    TokenKind[TokenKind["Plus"] = 14] = "Plus";
    TokenKind[TokenKind["Minus"] = 15] = "Minus";
    TokenKind[TokenKind["Div"] = 16] = "Div";
    TokenKind[TokenKind["Mul"] = 17] = "Mul";
    // last op
    TokenKind[TokenKind["Assign"] = 18] = "Assign";
    TokenKind[TokenKind["Comma"] = 19] = "Comma";
    TokenKind[TokenKind["Semi"] = 20] = "Semi";
    TokenKind[TokenKind["Colon"] = 21] = "Colon";
    TokenKind[TokenKind["LeftParen"] = 22] = "LeftParen";
    TokenKind[TokenKind["RightParen"] = 23] = "RightParen";
    TokenKind[TokenKind["LeftSquiggly"] = 24] = "LeftSquiggly";
    TokenKind[TokenKind["RightSquiggly"] = 25] = "RightSquiggly";
    TokenKind[TokenKind["LeftSquare"] = 26] = "LeftSquare";
    TokenKind[TokenKind["RightSquare"] = 27] = "RightSquare";
    // const start
    TokenKind[TokenKind["String"] = 28] = "String";
    TokenKind[TokenKind["Number"] = 29] = "Number";
    TokenKind[TokenKind["Boolean"] = 30] = "Boolean";
    TokenKind[TokenKind["True"] = 31] = "True";
    TokenKind[TokenKind["False"] = 32] = "False";
    // const end
    TokenKind[TokenKind["Break"] = 50] = "Break";
    TokenKind[TokenKind["Id"] = 51] = "Id";
    TokenKind[TokenKind["For"] = 52] = "For";
    TokenKind[TokenKind["Foreach"] = 53] = "Foreach";
    TokenKind[TokenKind["Forever"] = 54] = "Forever";
    TokenKind[TokenKind["In"] = 55] = "In";
    TokenKind[TokenKind["To"] = 56] = "To";
    TokenKind[TokenKind["By"] = 57] = "By";
    TokenKind[TokenKind["Do"] = 58] = "Do";
    TokenKind[TokenKind["While"] = 59] = "While";
    TokenKind[TokenKind["If"] = 60] = "If";
    TokenKind[TokenKind["Then"] = 61] = "Then";
    TokenKind[TokenKind["Else"] = 62] = "Else";
    TokenKind[TokenKind["ElIf"] = 63] = "ElIf";
    TokenKind[TokenKind["End"] = 64] = "End";
    TokenKind[TokenKind["Begin"] = 65] = "Begin";
    TokenKind[TokenKind["Function"] = 66] = "Function";
    TokenKind[TokenKind["Var"] = 67] = "Var";
    TokenKind[TokenKind["Return"] = 68] = "Return";
    TokenKind[TokenKind["On"] = 69] = "On";
    TokenKind[TokenKind["Event"] = 70] = "Event";
    TokenKind[TokenKind["IdPlaceholder"] = 100] = "IdPlaceholder";
    TokenKind[TokenKind["ParamPlaceholder"] = 101] = "ParamPlaceholder";
    TokenKind[TokenKind["ExpPlaceholder"] = 102] = "ExpPlaceholder";
    TokenKind[TokenKind["StatementPlaceholder"] = 103] = "StatementPlaceholder";
})(TokenKind || (exports.TokenKind = TokenKind = {}));
/**
 * not sure why we need class here; type will work just fine
 */
class Token {
    kind;
    value;
    pos;
    idx = 0;
    constructor(kind, value, pos) {
        this.kind = kind;
        this.value = value;
        this.pos = pos;
    }
    static makeWs() {
        return new Token(TokenKind.Ws, '', 0);
    }
}
exports.Token = Token;
//# sourceMappingURL=token.js.map