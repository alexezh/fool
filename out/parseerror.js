"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwUnexpectedError = exports.ParseError = exports.ParseErrorCode = void 0;
var ParseErrorCode;
(function (ParseErrorCode) {
    ParseErrorCode[ParseErrorCode["Unknown"] = 0] = "Unknown";
    ParseErrorCode[ParseErrorCode["NoStringEnding"] = 1] = "NoStringEnding";
    ParseErrorCode[ParseErrorCode["ReadEos"] = 2] = "ReadEos";
    ParseErrorCode[ParseErrorCode["WrongToken"] = 3] = "WrongToken";
    ParseErrorCode[ParseErrorCode["InvalidArg"] = 4] = "InvalidArg";
    ParseErrorCode[ParseErrorCode["InvalidExpression"] = 5] = "InvalidExpression";
    ParseErrorCode[ParseErrorCode["InvalidFuncParams"] = 6] = "InvalidFuncParams";
    ParseErrorCode[ParseErrorCode["InvalidToken"] = 7] = "InvalidToken";
    ParseErrorCode[ParseErrorCode["UnknownFunctionName"] = 8] = "UnknownFunctionName";
    ParseErrorCode[ParseErrorCode["NotImpl"] = 9] = "NotImpl";
})(ParseErrorCode || (exports.ParseErrorCode = ParseErrorCode = {}));
class ParseError {
    msg;
    code;
    token;
    constructor(code, token, msg) {
        this.msg = msg;
        this.code = code;
        this.token = token?.value;
    }
}
exports.ParseError = ParseError;
function throwUnexpectedError(token, exp) {
    throw new ParseError(ParseErrorCode.InvalidArg, token, `Expecting ${exp}, got ${token.value}`);
}
exports.throwUnexpectedError = throwUnexpectedError;
//# sourceMappingURL=parseerror.js.map