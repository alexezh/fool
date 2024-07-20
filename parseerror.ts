import { Token, TokenKind } from "./token";

export enum ParseErrorCode {
  Unknown,
  NoStringEnding,
  ReadEos,
  WrongToken,
  InvalidArg,
  InvalidExpression,
  InvalidFuncParams,
  InvalidToken,
  UnknownFunctionName,
  NotImpl,
}

export class ParseError {
  public readonly msg: string;
  public readonly code: ParseErrorCode;
  public readonly token: string | undefined;

  public constructor(code: ParseErrorCode, token: Token | undefined, msg: string) {
    this.msg = msg;
    this.code = code;
    this.token = token?.value;
  }
}

export function throwUnexpectedError(token: Token, exp: string) {
  throw new ParseError(ParseErrorCode.InvalidArg, token, `Expecting ${exp}, got ${token.value}`);
}
