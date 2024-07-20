"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicParser = exports.ParserContext = exports.IsEndTokenResult = exports.EndRule = exports.SemiRule = exports.EolRule = void 0;
const parseerror_1 = require("./parseerror");
const token_1 = require("./token");
var EolRule;
(function (EolRule) {
    EolRule[EolRule["Inherit"] = 0] = "Inherit";
    EolRule[EolRule["WhiteSpace"] = 1] = "WhiteSpace";
    EolRule[EolRule["Token"] = 2] = "Token";
})(EolRule || (exports.EolRule = EolRule = {}));
var SemiRule;
(function (SemiRule) {
    SemiRule[SemiRule["Inherit"] = 0] = "Inherit";
    SemiRule[SemiRule["End"] = 1] = "End";
    SemiRule[SemiRule["Disallow"] = 2] = "Disallow";
})(SemiRule || (exports.SemiRule = SemiRule = {}));
var EndRule;
(function (EndRule) {
    EndRule[EndRule["Pass"] = 0] = "Pass";
    EndRule[EndRule["Inherit"] = 1] = "Inherit";
})(EndRule || (exports.EndRule = EndRule = {}));
var IsEndTokenResult;
(function (IsEndTokenResult) {
    IsEndTokenResult[IsEndTokenResult["No"] = 0] = "No";
    IsEndTokenResult[IsEndTokenResult["Direct"] = 1] = "Direct";
    IsEndTokenResult[IsEndTokenResult["Inherited"] = 2] = "Inherited";
})(IsEndTokenResult || (exports.IsEndTokenResult = IsEndTokenResult = {}));
class ParserContext {
    prev = undefined;
    name;
    endTokens;
    inheritEndTokens = true;
    ignoreEol = true;
    isEos = false;
    isGreedy = true;
    endResult = IsEndTokenResult.No;
    constructor(prev = undefined, name = undefined) {
        this.prev = prev;
        this.name = name;
        // cache ignore flag
        if (prev !== undefined) {
            this.ignoreEol = prev.ignoreEol;
        }
    }
    isEndToken(token) {
        if (this.endTokens === undefined) {
            return false;
        }
        for (let et of this.endTokens) {
            if (et === token.kind) {
                return true;
            }
        }
        return false;
    }
    isEndTokenDeep(token) {
        if (this.isEndToken(token)) {
            return IsEndTokenResult.Direct;
        }
        let cur = this;
        while (cur !== undefined) {
            if (!cur.inheritEndTokens) {
                break;
            }
            if (cur.prev !== undefined) {
                if (cur.prev.isEndToken(token)) {
                    return IsEndTokenResult.Inherited;
                }
            }
            cur = cur.prev;
        }
        return IsEndTokenResult.No;
    }
}
exports.ParserContext = ParserContext;
/*
  parses list of tokens; produces AST
  the main challenge is with nested rules

  when we have a text a + b, c + d\n, we want
  to have rule (expression)+\n where expressions separated by comma
  but \n is a terminator for both parent expression and for child expression

  so we are going to use nested parsers which check with parent parser
  if token is terminator for parent. In the latter case, it will keep token
  unread so parent can read it

  also, we treat EOL as whitespace for number of cases. Such as any then, begin
  and other tokens can be parsed by EOL as whitespace. The only time is matters is
  statemens where we want one statement per line. All child parser might inherit this rule
*/
class BasicParser {
    tokenizer;
    nextIdx;
    // cached value at nextIdx-1
    _token;
    tokens;
    ctx;
    callDepth = 0;
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
        this.tokens = this.tokenizer.tokens;
        this.nextIdx = 0;
        this.ctx = new ParserContext();
    }
    /**
     * we need to pass start token as rules might change
     * for instance, we might say that \n is a token while it was ws for the
     * outer rule
     *
     * consumes the end token
     */
    withContextGreedy(token, func, ...args) {
        this.nextIdx = token.idx;
        this._token = this.tokens[this.nextIdx];
        this.pushContext();
        let res = func(this, ...args);
        this.popContext();
        return res;
    }
    /**
     * non-greedy version. stops on end token
     */
    withContext(name, token, func, ...args) {
        this.nextIdx = token.idx;
        this._token = this.tokens[this.nextIdx];
        this.pushContext(name);
        this.ctx.isGreedy = false;
        let res = func(this, ...args);
        this.popContext();
        return res;
    }
    withContextGreedy2(name, token, func, ...args) {
        this.nextIdx = token.idx;
        this._token = this.tokens[this.nextIdx];
        this.pushContext(name);
        let res = func(this, ...args);
        this.popContext();
        return res;
    }
    pushContext(name = undefined) {
        this.ctx = new ParserContext(this.ctx, name);
    }
    popContext() {
        if (this.ctx.prev === undefined) {
            throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.InvalidArg, this._token, 'Incorrect context stack');
        }
        // the tricky part of this logic is handling inheritance. When we break on child
        // node because of parent rule, we want to reach the level at which rule triggered
        // but if it was child level rule, we do not want to inherit it
        let childCtx = this.ctx;
        this.ctx = this.ctx.prev;
        if (childCtx.endResult === IsEndTokenResult.Direct || this._token === undefined) {
            // nothing to do; we already consumed the token
        }
        else {
            let deepRes = this.ctx.isEndTokenDeep(this._token);
            if (deepRes === IsEndTokenResult.Direct) {
                // consume token
                this.nextIdx++;
                this._token = undefined;
                this.ctx.endResult = IsEndTokenResult.Direct;
                this.ctx.isEos = true;
            }
            else if (deepRes === IsEndTokenResult.Inherited) {
                // just mark this layer as eos; we will consume token on upper lauer
                this.ctx.isEos = true;
            }
        }
    }
    /**
     * if true; eol is end token
     */
    setEndRule(tokens, inherit = true) {
        this.ctx.endTokens = tokens;
        this.ctx.inheritEndTokens = inherit;
    }
    /**
     * treat EOL as WS
     */
    ignoreEol(val) {
        this.ctx.ignoreEol = val;
    }
    /**
     * move reader to specific token
     * next read will return this token
     */
    moveTo(token) {
        this.nextIdx = token.idx;
        this._token = undefined;
    }
    get token() { return this._token; }
    ;
    triggerEos() {
        this.ctx.isEos = true;
    }
    tryRead() {
        // if we positioned at the end, return false
        if (this.ctx.isEos) {
            return undefined;
        }
        while (this.nextIdx < this.tokens.length) {
            // get the current token; do not consume it yet
            let token = this.tokens[this.nextIdx];
            this._token = token;
            if (this.isWsToken(token)) {
                this.nextIdx++;
                continue;
            }
            let deepRes = this.ctx.isEndTokenDeep(token);
            if (deepRes === IsEndTokenResult.Direct) {
                this.ctx.endResult = IsEndTokenResult.Direct;
                // if this is end token on our level, read it
                if (this.ctx.isGreedy) {
                    this.nextIdx++;
                }
                this._token = undefined;
                return undefined;
            }
            else if (deepRes === IsEndTokenResult.Inherited) {
                this.ctx.endResult = IsEndTokenResult.Inherited;
                // if this is parent end token, leave it to parent to read
                return undefined;
            }
            else {
                this.nextIdx++;
                return this._token;
            }
        }
        return undefined;
    }
    read() {
        if (!this.tryRead()) {
            throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.ReadEos, this._token, 'No more tokens');
        }
        return this._token;
    }
    // throws in case of error
    readKind(...kind) {
        if (!this.tryRead()) {
            throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.ReadEos, this._token, 'No more tokens');
        }
        for (let target of kind) {
            if (this.token.kind === target) {
                return this._token;
            }
        }
        throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.WrongToken, this._token, `Incorrect token ${this.token.kind}`);
    }
    peek() {
        if (this.ctx.isEos) {
            return undefined;
        }
        let tokens = this.tokenizer.tokens;
        let idx = this.nextIdx;
        while (idx < tokens.length) {
            let token = tokens[idx++];
            if (this.isWsToken(token)) {
                continue;
            }
            let deepRes = this.ctx.isEndTokenDeep(token);
            if (deepRes === IsEndTokenResult.Direct) {
                // if this is end token on our level, read it
                return undefined;
            }
            else if (deepRes === IsEndTokenResult.Inherited) {
                // if this is parent end token, leave it to parent to read
                return undefined;
            }
            else {
                return token;
            }
        }
        return undefined;
    }
    peekKind(kind) {
        let token = this.peek();
        if (token === undefined) {
            return false;
        }
        return token.kind === kind;
    }
    isWsToken(token) {
        return token.kind === token_1.TokenKind.Ws || (this.ctx.ignoreEol && token.kind === token_1.TokenKind.Eol);
    }
}
exports.BasicParser = BasicParser;
//# sourceMappingURL=basicparser.js.map