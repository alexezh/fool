"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicLexer = exports.StringReader = exports.isConstTokenKind = exports.isOpTokenKind = void 0;
const parseerror_1 = require("./parseerror");
const token_1 = require("./token");
function isOpTokenKind(kind) {
    return kind >= token_1.TokenKind.Equal && kind <= token_1.TokenKind.Mul;
}
exports.isOpTokenKind = isOpTokenKind;
function isConstTokenKind(kind) {
    return kind >= token_1.TokenKind.String && kind <= token_1.TokenKind.False;
}
exports.isConstTokenKind = isConstTokenKind;
class StringReader {
    source;
    _pos = 0;
    constructor(source) {
        this.source = source;
    }
    get pos() { return this._pos; }
    get isEol() { return this._pos === this.source.length; }
    readNext() {
        let c = this.source[this._pos];
        this._pos++;
        return c;
    }
    peekNext() {
        let c = this.source[this._pos];
        return c;
    }
    move(n) {
        if (this._pos + n > this.source.length) {
            return;
        }
        this._pos += n;
    }
    compare(s) {
        if (this._pos + s.length >= this.source.length) {
            return false;
        }
        for (let i = 0; i < s.length; i++) {
            if (s[i] !== this.source[this._pos + i]) {
                return false;
            }
        }
        return true;
    }
    skipWs() {
        var wsCount = 0;
        while (!this.isEol) {
            let c = this.peekNext();
            if (!StringReader.isWs(c)) {
                return wsCount;
            }
            wsCount++;
            this.move(1);
        }
        return wsCount;
    }
    static isWs(c) {
        return c === ' ' || c === '\t';
    }
}
exports.StringReader = StringReader;
class BasicLexer {
    _tokens = [];
    static load(source) {
        let tokenizer = new BasicLexer();
        tokenizer.loadTokens(source);
        return tokenizer;
    }
    get tokens() { return this._tokens; }
    loadTokens(source) {
        let reader = new StringReader(source);
        while (!reader.isEol) {
            let token = this.readNext(reader);
            if (token !== undefined) {
                token.idx = this._tokens.length;
                this._tokens.push(token);
            }
        }
    }
    readNext(reader) {
        reader.skipWs();
        if (reader.isEol) {
            return undefined;
        }
        let pos = reader.pos;
        let c = reader.readNext();
        if (c >= '0' && c <= '9') {
            return this.readNumber(reader, c, pos);
        }
        if (c === 't') {
            if (reader.compare('rue')) {
                reader.move(3);
                return new token_1.Token(token_1.TokenKind.True, 'true', pos);
            }
        }
        else if (c === 'f') {
            if (reader.compare('alse')) {
                reader.move(4);
                return new token_1.Token(token_1.TokenKind.False, 'false', pos);
            }
        }
        if (c === '"' || c === '\'') {
            return this.readString(reader, c, pos);
        }
        switch (c) {
            case '>':
                return new token_1.Token(token_1.TokenKind.Greater, c, pos);
            case '<':
                return new token_1.Token(token_1.TokenKind.Less, c, pos);
            case '=':
                return new token_1.Token(token_1.TokenKind.Equal, c, pos);
            case '!':
                if (reader.compare('=')) {
                    reader.move(1);
                    return new token_1.Token(token_1.TokenKind.NotEqual, '!=', pos);
                }
                break;
            case '-':
                return new token_1.Token(token_1.TokenKind.Minus, c, pos);
            case '+':
                return new token_1.Token(token_1.TokenKind.Plus, c, pos);
            case '*':
                return new token_1.Token(token_1.TokenKind.Mul, c, pos);
            case '/':
                return new token_1.Token(token_1.TokenKind.Div, c, pos);
            case '(':
                return new token_1.Token(token_1.TokenKind.LeftParen, c, pos);
            case ')':
                return new token_1.Token(token_1.TokenKind.RightParen, c, pos);
            case '[':
                return new token_1.Token(token_1.TokenKind.LeftSquare, c, pos);
            case ']':
                return new token_1.Token(token_1.TokenKind.RightSquare, c, pos);
            case '{':
                return new token_1.Token(token_1.TokenKind.LeftSquiggly, c, pos);
            case '}':
                return new token_1.Token(token_1.TokenKind.RightSquiggly, c, pos);
            case ',':
                return new token_1.Token(token_1.TokenKind.Comma, c, pos);
            case ';':
                return new token_1.Token(token_1.TokenKind.Semi, c, pos);
            case '|':
                if (reader.peekNext() === '|') {
                    reader.move(1);
                    return new token_1.Token(token_1.TokenKind.Or, 'or', pos);
                }
                break;
            case '&':
                if (reader.peekNext() === '&') {
                    reader.move(1);
                    return new token_1.Token(token_1.TokenKind.And, 'and', pos);
                }
                break;
            case ':':
                if (reader.peekNext() === '=') {
                    reader.move(1);
                    return new token_1.Token(token_1.TokenKind.Assign, ':=', pos);
                }
                else {
                    return new token_1.Token(token_1.TokenKind.Colon, ':', pos);
                }
            case '\n':
                return new token_1.Token(token_1.TokenKind.Eol, '\n', pos);
            case '\r':
                if (reader.peekNext() === '\n') {
                    reader.move(1);
                }
                return new token_1.Token(token_1.TokenKind.Eol, '\n', pos);
        }
        return this.readId(reader, c, pos);
    }
    readId(reader, head, pos) {
        let s = [head];
        while (!reader.isEol) {
            let c = reader.peekNext();
            if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                c === '.' ||
                (c >= '0' && c <= '9')) {
                reader.readNext();
                s.push(c);
            }
            else if (c === '_') {
                reader.readNext();
                s.push(c);
            }
            else {
                let name = "".concat(...s);
                return new token_1.Token(this.getIdKind(name), name, pos);
            }
        }
        // read until EOL
        let name = "".concat(...s);
        return new token_1.Token(this.getIdKind(name), name, pos);
    }
    getIdKind(name) {
        switch (name) {
            case 'if': return token_1.TokenKind.If;
            case 'for': return token_1.TokenKind.For;
            case 'foreach': return token_1.TokenKind.Foreach;
            case 'forever': return token_1.TokenKind.Forever;
            case 'in': return token_1.TokenKind.In;
            case 'to': return token_1.TokenKind.To;
            case 'by': return token_1.TokenKind.By;
            case 'do': return token_1.TokenKind.Do;
            case 'on': return token_1.TokenKind.On;
            case 'event': return token_1.TokenKind.Event;
            case 'while': return token_1.TokenKind.While;
            case 'then': return token_1.TokenKind.Then;
            case 'else': return token_1.TokenKind.Else;
            case 'elif': return token_1.TokenKind.ElIf;
            case 'end': return token_1.TokenKind.End;
            case 'begin': return token_1.TokenKind.Begin;
            case 'or': return token_1.TokenKind.Or;
            case 'and': return token_1.TokenKind.And;
            case 'not': return token_1.TokenKind.Not;
            case 'is': return token_1.TokenKind.Is;
            case 'function': return token_1.TokenKind.Function;
            case 'true': return token_1.TokenKind.True;
            case 'false': return token_1.TokenKind.False;
            case 'break': return token_1.TokenKind.Break;
            case 'var': return token_1.TokenKind.Var;
            case 'return': return token_1.TokenKind.Return;
            default: return token_1.TokenKind.Id;
        }
    }
    readString(reader, head, pos) {
        let s = [head];
        while (!reader.isEol) {
            let c = reader.readNext();
            s.push(c);
            if (c === '\\') {
                s.push(reader.readNext());
            }
            else if (c === '"' || c === '\'') {
                return new token_1.Token(token_1.TokenKind.String, "".concat(...s), pos);
            }
        }
        throw new parseerror_1.ParseError(parseerror_1.ParseErrorCode.NoStringEnding, new token_1.Token(token_1.TokenKind.String, "", pos), 'String should end with \"');
    }
    readNumber(reader, head, pos) {
        let s = [head];
        while (!reader.isEol) {
            let c = reader.peekNext();
            if (c >= '0' && c <= '9') {
                reader.readNext();
                s.push(c);
            }
            else if (c === '.') {
                reader.readNext();
                s.push(c);
            }
            else {
                return new token_1.Token(token_1.TokenKind.Number, "".concat(...s), pos);
            }
        }
        return new token_1.Token(token_1.TokenKind.Number, "".concat(...s), pos);
    }
}
exports.BasicLexer = BasicLexer;
//# sourceMappingURL=lexer.js.map