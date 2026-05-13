/**
 * Uso: interpreter.run(codigoString, inputsArray?)
 */

const TokenType = {
  NUMBER: 'NUMBER', STRING: 'STRING', BOOL: 'BOOL', IDENT: 'IDENT',
  PLUS: 'PLUS', MINUS: 'MINUS', STAR: 'STAR', SLASH: 'SLASH', MOD: 'MOD', POW: 'POW',
  EQ: 'EQ', NEQ: 'NEQ', LT: 'LT', GT: 'GT', LTE: 'LTE', GTE: 'GTE',
  AND: 'AND', OR: 'OR', NOT: 'NOT',
  ASSIGN: 'ASSIGN', LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET', COMMA: 'COMMA',
  NEWLINE: 'NEWLINE', EOF: 'EOF',
  // Keywords
  ALGORITMO: 'ALGORITMO', FIN_ALGORITMO: 'FIN_ALGORITMO',
  LEER: 'LEER', ESCRIBIR: 'ESCRIBIR',
  SI: 'SI', ENTONCES: 'ENTONCES', SINO: 'SINO', FIN_SI: 'FIN_SI',
  MIENTRAS: 'MIENTRAS', HACER: 'HACER', FIN_MIENTRAS: 'FIN_MIENTRAS',
  PARA: 'PARA', DESDE: 'DESDE', HASTA: 'HASTA', CON_PASO: 'CON_PASO', FIN_PARA: 'FIN_PARA',
  REPETIR: 'REPETIR', HASTA_QUE: 'HASTA_QUE',
  FUNCION: 'FUNCION', FIN_FUNCION: 'FIN_FUNCION', RETORNAR: 'RETORNAR',
  PROCESO: 'PROCESO', FIN_PROCESO: 'FIN_PROCESO',
  SEGUN: 'SEGUN', SEA: 'SEA', DE_OTRO_MODO: 'DE_OTRO_MODO', FIN_SEGUN: 'FIN_SEGUN',
  DEFINIR: 'DEFINIR', COMO: 'COMO', ARREGLO: 'ARREGLO', DE: 'DE',
  ENTERO: 'ENTERO', REAL: 'REAL', CARACTER: 'CARACTER', LOGICO: 'LOGICO',
};

const KEYWORDS = {
  'algoritmo': TokenType.ALGORITMO, 'finalgoritmo': TokenType.FIN_ALGORITMO,
  'leer': TokenType.LEER, 'escribir': TokenType.ESCRIBIR,
  'si': TokenType.SI, 'entonces': TokenType.ENTONCES,
  'sino': TokenType.SINO, 'finsi': TokenType.FIN_SI,
  'mientras': TokenType.MIENTRAS, 'hacer': TokenType.HACER,
  'finmientras': TokenType.FIN_MIENTRAS,
  'para': TokenType.PARA, 'desde': TokenType.DESDE,
  'hasta': TokenType.HASTA, 'conpaso': TokenType.CON_PASO,
  'finpara': TokenType.FIN_PARA,
  'repetir': TokenType.REPETIR, 'hastaque': TokenType.HASTA_QUE,
  'funcion': TokenType.FUNCION, 'finfuncion': TokenType.FIN_FUNCION,
  'retornar': TokenType.RETORNAR, 'devolver': TokenType.RETORNAR,
  'proceso': TokenType.PROCESO, 'finproceso': TokenType.FIN_PROCESO,
  'segun': TokenType.SEGUN, 'sea': TokenType.SEA,
  'deotromodo': TokenType.DE_OTRO_MODO, 'finsegun': TokenType.FIN_SEGUN,
  'definir': TokenType.DEFINIR, 'como': TokenType.COMO,
  'arreglo': TokenType.ARREGLO, 'de': TokenType.DE,
  'entero': TokenType.ENTERO, 'real': TokenType.REAL,
  'caracter': TokenType.CARACTER, 'logico': TokenType.LOGICO,
  'verdadero': TokenType.BOOL, 'falso': TokenType.BOOL,
  'y': TokenType.AND, 'o': TokenType.OR, 'no': TokenType.NOT,
  'and': TokenType.AND, 'or': TokenType.OR, 'not': TokenType.NOT,
  'mod': TokenType.MOD,
};

class Token {
  constructor(type, value, line) { this.type = type; this.value = value; this.line = line; }
}

class Lexer {
  constructor(source) {
    this.src = source; this.pos = 0; this.line = 1; this.tokens = [];
  }

  error(msg) { throw new Error(`[Léxico] Línea ${this.line}: ${msg}`); }

  peek(offset = 0) { return this.src[this.pos + offset]; }
  advance() { const c = this.src[this.pos++]; if (c === '\n') this.line++; return c; }

  skipWhitespaceAndComments() {
    while (this.pos < this.src.length) {
      const c = this.peek();
      if (c === ' ' || c === '\t' || c === '\r') { this.advance(); continue; }
      // Comentarios: // o //
      if (c === '/' && this.peek(1) === '/') {
        while (this.pos < this.src.length && this.peek() !== '\n') this.advance();
        continue;
      }
      // Comentarios bloque /* */
      if (c === '/' && this.peek(1) === '*') {
        this.advance(); this.advance();
        while (this.pos < this.src.length) {
          if (this.peek() === '*' && this.peek(1) === '/') { this.advance(); this.advance(); break; }
          this.advance();
        }
        continue;
      }
      break;
    }
  }

  tokenize() {
    while (this.pos < this.src.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.src.length) break;

      const c = this.peek();
      const line = this.line;

      if (c === '\n') { this.advance(); this.tokens.push(new Token(TokenType.NEWLINE, '\n', line)); continue; }
      if (c >= '0' && c <= '9' || (c === '.' && this.peek(1) >= '0' && this.peek(1) <= '9')) {
        let num = '';
        while (this.pos < this.src.length && (this.peek() >= '0' && this.peek() <= '9' || this.peek() === '.'))
          num += this.advance();
        this.tokens.push(new Token(TokenType.NUMBER, parseFloat(num), line));
        continue;
      }
      if (c === '"' || c === "'") {
        const quote = this.advance();
        let str = '';
        while (this.pos < this.src.length && this.peek() !== quote) {
          if (this.peek() === '\\') { this.advance(); str += this.advance(); }
          else str += this.advance();
        }
        if (this.pos >= this.src.length) this.error('Cadena no terminada');
        this.advance();
        this.tokens.push(new Token(TokenType.STRING, str, line));
        continue;
      }
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c > '\x7f') {
        let id = '';
        while (this.pos < this.src.length) {
          const ch = this.peek();
          if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === '_' || ch > '\x7f') {
            id += this.advance();
          } else break;
        }
        // Normalizar: quitar espacios del keyword multipalabra lookahead
        const lower = id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (KEYWORDS[lower] !== undefined) {
          const kw = KEYWORDS[lower];
          const val = kw === TokenType.BOOL ? (lower === 'verdadero') : id;
          this.tokens.push(new Token(kw, val, line));
        } else {
          this.tokens.push(new Token(TokenType.IDENT, id, line));
        }
        continue;
      }
      // Operadores
      const map2 = { '<-': TokenType.ASSIGN, ':=': TokenType.ASSIGN, '<>': TokenType.NEQ, '!=': TokenType.NEQ, '<=': TokenType.LTE, '>=': TokenType.GTE, '==': TokenType.EQ, '**': TokenType.POW, '//': null };
      let found2 = false;
      for (const [op, type] of Object.entries(map2)) {
        if (type && this.src.slice(this.pos, this.pos + op.length) === op) {
          this.pos += op.length; this.tokens.push(new Token(type, op, line)); found2 = true; break;
        }
      }
      if (found2) continue;

      const map1 = { '+': TokenType.PLUS, '-': TokenType.MINUS, '*': TokenType.STAR, '/': TokenType.SLASH, '^': TokenType.POW, '%': TokenType.MOD, '=': TokenType.EQ, '<': TokenType.LT, '>': TokenType.GT, '(': TokenType.LPAREN, ')': TokenType.RPAREN, '[': TokenType.LBRACKET, ']': TokenType.RBRACKET, ',': TokenType.COMMA };
      if (map1[c]) { this.advance(); this.tokens.push(new Token(map1[c], c, line)); continue; }

      this.error(`Carácter inesperado: '${c}'`);
    }
    this.tokens.push(new Token(TokenType.EOF, null, this.line));
    return this.tokens;
  }
}

// ─── PARSER (AST) ─────────────────────────────────────────────────────────────

class Parser {
  constructor(tokens) { this.tokens = tokens; this.pos = 0; }

  error(msg, line) {
    const t = this.current();
    throw new Error(`[Sintaxis] Línea ${line || t.line}: ${msg}`);
  }
  current() { return this.tokens[this.pos]; }
  peek(offset = 1) { return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]; }
  advance() { const t = this.tokens[this.pos]; if (this.pos < this.tokens.length - 1) this.pos++; return t; }
  skipNewlines() { while (this.current().type === TokenType.NEWLINE) this.advance(); }
  expect(type, msg) {
    this.skipNewlines();
    if (this.current().type !== type) this.error(msg || `Se esperaba ${type}, se encontró ${this.current().type}`);
    return this.advance();
  }
  match(...types) { this.skipNewlines(); return types.includes(this.current().type); }

  parse() {
    this.skipNewlines();
    const line = this.current().line;
    // Puede empezar con Algoritmo, Funcion, o Proceso
    const stmts = [];
    while (!this.match(TokenType.EOF)) {
      stmts.push(this.parseTopLevel());
      this.skipNewlines();
    }
    if (stmts.length === 1) return stmts[0];
    return { type: 'Program', body: stmts };
  }

  parseTopLevel() {
    this.skipNewlines();
    const t = this.current();
    if (t.type === TokenType.ALGORITMO || t.type === TokenType.PROCESO) return this.parseAlgoritmo();
    if (t.type === TokenType.FUNCION) return this.parseFuncion();
    // Puede haber funciones definidas antes/después del algoritmo principal
    this.error(`Se esperaba Algoritmo, Proceso o Funcion`);
  }

  parseAlgoritmo() {
    const line = this.current().line;
    this.advance(); // Algoritmo / Proceso
    this.skipNewlines();
    let name = '';
    if (this.current().type === TokenType.IDENT) name = this.advance().value;
    const body = this.parseBlock([TokenType.FIN_ALGORITMO, TokenType.FIN_PROCESO]);
    this.advance(); // FinAlgoritmo / FinProceso
    return { type: 'Algoritmo', name, body, line };
  }

  parseFuncion() {
    const line = this.current().line;
    this.advance(); // Funcion
    this.skipNewlines();
    const name = this.expect(TokenType.IDENT, 'Se esperaba nombre de función').value;
    const params = [];
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      while (!this.match(TokenType.RPAREN)) {
        this.skipNewlines();
        if (this.current().type === TokenType.IDENT) params.push(this.advance().value);
        if (this.match(TokenType.COMMA)) this.advance();
      }
      this.advance(); // )
    }
    const body = this.parseBlock([TokenType.FIN_FUNCION]);
    this.advance(); // FinFuncion
    return { type: 'Funcion', name, params, body, line };
  }

  parseBlock(stopTokens) {
    const stmts = [];
    this.skipNewlines();
    while (!stopTokens.includes(this.current().type) && !this.match(TokenType.EOF)) {
      // SiNo también detiene un bloque SI
      if (this.current().type === TokenType.SINO) break;
      if (this.current().type === TokenType.SEA) break;
      if (this.current().type === TokenType.DE_OTRO_MODO) break;
      if (this.current().type === TokenType.HASTA_QUE) break;
      const stmt = this.parseStatement();
      if (stmt) stmts.push(stmt);
      this.skipNewlines();
    }
    return stmts;
  }

  parseStatement() {
    this.skipNewlines();
    const t = this.current();

    if (t.type === TokenType.LEER) return this.parseLeer();
    if (t.type === TokenType.ESCRIBIR) return this.parseEscribir();
    if (t.type === TokenType.SI) return this.parseSi();
    if (t.type === TokenType.MIENTRAS) return this.parseMientras();
    if (t.type === TokenType.PARA) return this.parsePara();
    if (t.type === TokenType.REPETIR) return this.parseRepetir();
    if (t.type === TokenType.SEGUN) return this.parseSegun();
    if (t.type === TokenType.DEFINIR) return this.parseDefinir();
    if (t.type === TokenType.RETORNAR) return this.parseRetornar();
    if (t.type === TokenType.FUNCION) return this.parseFuncion();
    if (t.type === TokenType.IDENT) return this.parseAsignOrCall();

    this.advance(); // skip unknown
    return null;
  }

  parseLeer() {
    const line = this.advance().line; // Leer
    this.skipNewlines();
    const vars = [];
    while (true) {
      const name = this.expect(TokenType.IDENT, 'Se esperaba variable').value;
      let index = null;
      if (this.current().type === TokenType.LBRACKET) {
        this.advance();
        index = this.parseExpr();
        this.expect(TokenType.RBRACKET);
      }
      vars.push({ name, index });
      if (this.current().type === TokenType.COMMA) { this.advance(); this.skipNewlines(); }
      else break;
    }
    return { type: 'Leer', vars, line };
  }

  parseEscribir() {
    const line = this.advance().line; // Escribir
    this.skipNewlines();
    const exprs = [];
    while (this.current().type !== TokenType.NEWLINE && this.current().type !== TokenType.EOF) {
      exprs.push(this.parseExpr());
      if (this.current().type === TokenType.COMMA) { this.advance(); this.skipNewlines(); }
      else break;
    }
    return { type: 'Escribir', exprs, line };
  }

  parseSi() {
    const line = this.advance().line; // Si
    this.skipNewlines();
    const condition = this.parseExpr();
    this.skipNewlines();
    if (this.current().type === TokenType.ENTONCES) this.advance();
    const consequent = this.parseBlock([TokenType.FIN_SI, TokenType.SINO]);
    let alternate = null;
    if (this.current().type === TokenType.SINO) {
      this.advance();
      alternate = this.parseBlock([TokenType.FIN_SI]);
    }
    this.expect(TokenType.FIN_SI);
    return { type: 'Si', condition, consequent, alternate, line };
  }

  parseMientras() {
    const line = this.advance().line;
    this.skipNewlines();
    const condition = this.parseExpr();
    this.skipNewlines();
    if (this.current().type === TokenType.HACER) this.advance();
    const body = this.parseBlock([TokenType.FIN_MIENTRAS]);
    this.advance(); // FinMientras
    return { type: 'Mientras', condition, body, line };
  }

  parsePara() {
    const line = this.advance().line; // Para
    this.skipNewlines();
    const varName = this.expect(TokenType.IDENT).value;
    this.skipNewlines();
    if (this.current().type === TokenType.DESDE) this.advance();
    else if (this.current().type === TokenType.ASSIGN) this.advance();
    else if (this.current().type === TokenType.EQ && this.peek().type !== TokenType.EQ) this.advance();
    this.skipNewlines();
    const start = this.parseExpr();
    this.skipNewlines();
    this.expect(TokenType.HASTA);
    this.skipNewlines();
    const end = this.parseExpr();
    let step = null;
    this.skipNewlines();
    if (this.current().type === TokenType.CON_PASO || this.current().type === TokenType.HACER) {
      const ttype = this.advance().type;
      if (ttype === TokenType.CON_PASO) { this.skipNewlines(); step = this.parseExpr(); }
    }
    const body = this.parseBlock([TokenType.FIN_PARA]);
    this.advance();
    return { type: 'Para', varName, start, end, step, body, line };
  }

  parseRepetir() {
    const line = this.advance().line; // Repetir
    const body = this.parseBlock([TokenType.HASTA_QUE]);
    this.advance(); // HastaQue
    this.skipNewlines();
    const condition = this.parseExpr();
    return { type: 'Repetir', body, condition, line };
  }

  parseSegun() {
    const line = this.advance().line; // Segun
    this.skipNewlines();
    const expr = this.parseExpr();
    this.skipNewlines();
    if (this.current().type === TokenType.HACER) this.advance();
    const cases = [];
    let defaultCase = null;
    this.skipNewlines();
    while (!this.match(TokenType.FIN_SEGUN) && !this.match(TokenType.EOF)) {
      this.skipNewlines();
      if (this.current().type === TokenType.DE_OTRO_MODO) {
        this.advance();
        this.skipNewlines();
        if (this.current().type === TokenType.ASSIGN || this.current().type === TokenType.COMMA) this.advance();
        defaultCase = this.parseBlock([TokenType.FIN_SEGUN]);
        break;
      }
      if (this.current().type === TokenType.SEA) this.advance();
      this.skipNewlines();
      const values = [this.parseExpr()];
      while (this.current().type === TokenType.COMMA) { this.advance(); values.push(this.parseExpr()); }
      this.skipNewlines();
      if (this.current().type === TokenType.ASSIGN || this.current().type === TokenType.COMMA) this.advance();
      const body = this.parseBlock([TokenType.FIN_SEGUN, TokenType.SEA, TokenType.DE_OTRO_MODO]);
      cases.push({ values, body });
    }
    if (this.match(TokenType.FIN_SEGUN)) this.advance();
    return { type: 'Segun', expr, cases, defaultCase, line };
  }

  parseDefinir() {
    const line = this.advance().line;
    this.skipNewlines();
    const names = [];
    names.push(this.expect(TokenType.IDENT).value);
    while (this.current().type === TokenType.COMMA) { this.advance(); names.push(this.expect(TokenType.IDENT).value); }
    this.skipNewlines();
    if (this.current().type === TokenType.COMO) this.advance();
    this.skipNewlines();
    const typeToken = this.advance();
    let isArray = false;
    if (this.current().type === TokenType.ARREGLO) { isArray = true; this.advance(); }
    return { type: 'Definir', names, varType: typeToken.value, isArray, line };
  }

  parseRetornar() {
    const line = this.advance().line;
    this.skipNewlines();
    const value = this.parseExpr();
    return { type: 'Retornar', value, line };
  }

  parseAsignOrCall() {
    const line = this.current().line;
    const name = this.advance().value;

    // Array index
    let index = null;
    if (this.current().type === TokenType.LBRACKET) {
      this.advance();
      index = this.parseExpr();
      this.expect(TokenType.RBRACKET);
    }

    // Assignment
    if (this.current().type === TokenType.ASSIGN) {
      this.advance();
      this.skipNewlines();
      const value = this.parseExpr();
      return { type: 'Asignar', name, index, value, line };
    }

    // Plain EQ as assignment (PSeInt style: a = 5)
    if (this.current().type === TokenType.EQ) {
      this.advance();
      this.skipNewlines();
      const value = this.parseExpr();
      return { type: 'Asignar', name, index, value, line };
    }

    // Function call as statement
    if (this.current().type === TokenType.LPAREN) {
      const args = this.parseArgs();
      return { type: 'ExprStmt', expr: { type: 'Call', name, args, line }, line };
    }

    return { type: 'ExprStmt', expr: { type: 'Ident', name, line }, line };
  }

  parseArgs() {
    this.advance(); // (
    const args = [];
    this.skipNewlines();
    while (!this.match(TokenType.RPAREN) && !this.match(TokenType.EOF)) {
      args.push(this.parseExpr());
      if (this.current().type === TokenType.COMMA) { this.advance(); this.skipNewlines(); }
    }
    this.expect(TokenType.RPAREN);
    return args;
  }

  // ── Expression parsing (Pratt-style) ──────────────────────────────────────

  parseExpr() { return this.parseOr(); }

  parseOr() {
    let left = this.parseAnd();
    while (this.current().type === TokenType.OR) {
      const op = this.advance().value;
      left = { type: 'BinOp', op: '||', left, right: this.parseAnd() };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseNot();
    while (this.current().type === TokenType.AND) {
      this.advance();
      left = { type: 'BinOp', op: '&&', left, right: this.parseNot() };
    }
    return left;
  }

  parseNot() {
    if (this.current().type === TokenType.NOT) {
      this.advance();
      return { type: 'UnaryOp', op: '!', operand: this.parseNot() };
    }
    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseAddSub();
    const ops = { [TokenType.EQ]: '==', [TokenType.NEQ]: '!=', [TokenType.LT]: '<', [TokenType.GT]: '>', [TokenType.LTE]: '<=', [TokenType.GTE]: '>=' };
    while (ops[this.current().type]) {
      const op = ops[this.advance().type];
      left = { type: 'BinOp', op, left, right: this.parseAddSub() };
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.current().type === TokenType.PLUS || this.current().type === TokenType.MINUS) {
      const op = this.advance().value;
      left = { type: 'BinOp', op, left, right: this.parseMulDiv() };
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parsePow();
    while ([TokenType.STAR, TokenType.SLASH, TokenType.MOD].includes(this.current().type)) {
      const op = this.advance().value;
      left = { type: 'BinOp', op: op === 'mod' ? '%' : op, left, right: this.parsePow() };
    }
    return left;
  }

  parsePow() {
    let base = this.parseUnary();
    if (this.current().type === TokenType.POW) {
      this.advance();
      return { type: 'BinOp', op: '**', left: base, right: this.parsePow() };
    }
    return base;
  }

  parseUnary() {
    if (this.current().type === TokenType.MINUS) { this.advance(); return { type: 'UnaryOp', op: '-', operand: this.parseUnary() }; }
    if (this.current().type === TokenType.PLUS) { this.advance(); return this.parseUnary(); }
    return this.parsePrimary();
  }

  parsePrimary() {
    this.skipNewlines();
    const t = this.current();

    if (t.type === TokenType.NUMBER) { this.advance(); return { type: 'Literal', value: t.value }; }
    if (t.type === TokenType.STRING) { this.advance(); return { type: 'Literal', value: t.value }; }
    if (t.type === TokenType.BOOL) { this.advance(); return { type: 'Literal', value: t.value }; }

    if (t.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpr();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    if (t.type === TokenType.IDENT) {
      const name = this.advance().value;
      // Function call
      if (this.current().type === TokenType.LPAREN) {
        const args = this.parseArgs();
        return { type: 'Call', name, args };
      }
      // Array access
      if (this.current().type === TokenType.LBRACKET) {
        this.advance();
        const index = this.parseExpr();
        this.expect(TokenType.RBRACKET);
        return { type: 'ArrayAccess', name, index };
      }
      return { type: 'Ident', name };
    }

    this.error(`Token inesperado en expresión: ${t.type} (${t.value})`);
  }
}

// ─── INTERPRETER ──────────────────────────────────────────────────────────────

class ReturnSignal { constructor(value) { this.value = value; } }
class BreakSignal {}

class Environment {
  constructor(parent = null) { this.vars = {}; this.parent = parent; }

  get(name) {
    const lower = name.toLowerCase();
    if (lower in this.vars) return this.vars[lower];
    if (this.parent) return this.parent.get(name);
    return undefined; // not declared = undefined (not error, PSeInt is lenient)
  }

  set(name, value) {
    const lower = name.toLowerCase();
    // Walk up to find existing binding
    let env = this;
    while (env) {
      if (lower in env.vars) { env.vars[lower] = value; return; }
      env = env.parent;
    }
    // Define locally
    this.vars[lower] = value;
  }

  define(name, value) { this.vars[name.toLowerCase()] = value; }
}

class Interpreter {
  constructor() {
    this.output = [];
    this.inputs = [];
    this.inputIndex = 0;
    this.functions = {};
    this.callDepth = 0;
    this.maxCallDepth = 500;
    this.maxIterations = 100000;
    this.iterCount = 0;
  }

  error(msg, line) { throw new Error(`[Runtime] ${line ? `Línea ${line}: ` : ''}${msg}`); }

  // ── Built-in functions ────────────────────────────────────────────────────

  builtins = {
    // Math
    'abs':   ([x]) => Math.abs(this.toNumber(x)),
    'raiz':  ([x]) => Math.sqrt(this.toNumber(x)),
    'sqrt':  ([x]) => Math.sqrt(this.toNumber(x)),
    'raiz2': ([x]) => Math.sqrt(this.toNumber(x)),
    'ln':    ([x]) => Math.log(this.toNumber(x)),
    'log':   ([x]) => Math.log10(this.toNumber(x)),
    'exp':   ([x]) => Math.exp(this.toNumber(x)),
    'sen':   ([x]) => Math.sin(this.toNumber(x)),
    'cos':   ([x]) => Math.cos(this.toNumber(x)),
    'tan':   ([x]) => Math.tan(this.toNumber(x)),
    'arcsen':([x]) => Math.asin(this.toNumber(x)),
    'arccos':([x]) => Math.acos(this.toNumber(x)),
    'arctan':([x]) => Math.atan(this.toNumber(x)),
    'piso':  ([x]) => Math.floor(this.toNumber(x)),
    'techo': ([x]) => Math.ceil(this.toNumber(x)),
    'redondear':([x,d=0]) => +this.toNumber(x).toFixed(d),
    'trunc': ([x]) => Math.trunc(this.toNumber(x)),
    'max':   (args) => Math.max(...args.map(a => this.toNumber(a))),
    'min':   (args) => Math.min(...args.map(a => this.toNumber(a))),
    'potencia': ([b,e]) => Math.pow(this.toNumber(b), this.toNumber(e)),
    'aleatorio': ([a,b]) => Math.floor(Math.random() * (this.toNumber(b) - this.toNumber(a) + 1)) + this.toNumber(a),
    'azar':  ([n]) => Math.floor(Math.random() * this.toNumber(n)),
    // String
    'longitud': ([s]) => String(s).length,
    'largo':    ([s]) => String(s).length,
    'len':      ([s]) => String(s).length,
    'subcadena':([s,i,f]) => String(s).substring(this.toNumber(i)-1, this.toNumber(f)),
    'mayusculas': ([s]) => String(s).toUpperCase(),
    'minusculas': ([s]) => String(s).toLowerCase(),
    'concatenar': (args) => args.map(String).join(''),
    'convertiranumero': ([s]) => parseFloat(s),
    'convertirastring': ([n]) => String(n),
    'convertirATexto': ([n]) => String(n),
    // Type checks
    'esentero': ([x]) => Number.isInteger(this.toNumber(x)),
    'esreal':   ([x]) => typeof x === 'number',
    // IO helper
    'escribirlinea': (args) => { this.output.push(args.map(this.display.bind(this)).join('')); return null; },
  };

  toNumber(v) {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') { const n = parseFloat(v); if (!isNaN(n)) return n; }
    if (typeof v === 'boolean') return v ? 1 : 0;
    return 0;
  }

  toBool(v) {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v.toLowerCase() === 'verdadero' || (v !== '' && v !== '0');
    return Boolean(v);
  }

  display(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'Verdadero' : 'Falso';
    if (Array.isArray(v)) return '[' + v.map(this.display.bind(this)).join(', ') + ']';
    return String(v);
  }

  readInput() {
    if (this.inputIndex >= this.inputs.length) this.error('Se necesita más entrada (Leer) pero no hay más valores disponibles');
    return this.inputs[this.inputIndex++];
  }

  // ── Execute ───────────────────────────────────────────────────────────────

  run(source, inputs = []) {
    this.output = [];
    this.inputs = inputs.map(String);
    this.inputIndex = 0;
    this.functions = {};
    this.callDepth = 0;
    this.iterCount = 0;

    const tokens = new Lexer(source).tokenize();
    const ast = new Parser(tokens).parse();

    // Pre-register all top-level functions
    if (ast.type === 'Program') {
      for (const node of ast.body) {
        if (node.type === 'Funcion') this.functions[node.name.toLowerCase()] = node;
      }
      // Execute Algoritmo
      const algo = ast.body.find(n => n.type === 'Algoritmo');
      if (algo) this.execAlgoritmo(algo);
    } else if (ast.type === 'Algoritmo') {
      this.execAlgoritmo(ast);
    } else if (ast.type === 'Funcion') {
      this.functions[ast.name.toLowerCase()] = ast;
    }

    return { output: this.output, inputsUsed: this.inputIndex };
  }

  execAlgoritmo(node) {
    const env = new Environment();
    this.execBlock(node.body, env);
  }

  execBlock(stmts, env) {
    for (const stmt of stmts) {
      const result = this.execStmt(stmt, env);
      if (result instanceof ReturnSignal) return result;
      if (result instanceof BreakSignal) return result;
    }
  }

  execStmt(node, env) {
    if (!node) return;
    switch (node.type) {
      case 'Leer': return this.execLeer(node, env);
      case 'Escribir': return this.execEscribir(node, env);
      case 'Asignar': return this.execAsignar(node, env);
      case 'Si': return this.execSi(node, env);
      case 'Mientras': return this.execMientras(node, env);
      case 'Para': return this.execPara(node, env);
      case 'Repetir': return this.execRepetir(node, env);
      case 'Segun': return this.execSegun(node, env);
      case 'Definir': return this.execDefinir(node, env);
      case 'Retornar': return new ReturnSignal(this.evalExpr(node.value, env));
      case 'Funcion': this.functions[node.name.toLowerCase()] = node; break;
      case 'ExprStmt': this.evalExpr(node.expr, env); break;
      case 'Algoritmo': this.execAlgoritmo(node); break;
    }
  }

  execLeer(node, env) {
    for (const { name, index } of node.vars) {
      const raw = this.readInput();
      const value = isNaN(raw) ? raw : Number(raw);
      if (index !== null) {
        const arr = env.get(name);
        if (!Array.isArray(arr)) this.error(`'${name}' no es un arreglo`, node.line);
        const i = this.toNumber(this.evalExpr(index, env)) - 1;
        arr[i] = value;
      } else {
        env.set(name, value);
      }
    }
  }

  execEscribir(node, env) {
    const parts = node.exprs.map(e => this.display(this.evalExpr(e, env)));
    this.output.push(parts.join(''));
  }

  execAsignar(node, env) {
    const value = this.evalExpr(node.value, env);
    if (node.index) {
      const arr = env.get(node.name);
      if (!Array.isArray(arr)) this.error(`'${node.name}' no es un arreglo`, node.line);
      const i = this.toNumber(this.evalExpr(node.index, env)) - 1;
      arr[i] = value;
    } else {
      env.set(node.name, value);
    }
  }

  execSi(node, env) {
    const cond = this.toBool(this.evalExpr(node.condition, env));
    const childEnv = new Environment(env);
    if (cond) return this.execBlock(node.consequent, childEnv);
    else if (node.alternate) return this.execBlock(node.alternate, childEnv);
  }

  execMientras(node, env) {
    while (true) {
      this.checkIterLimit(node.line);
      if (!this.toBool(this.evalExpr(node.condition, env))) break;
      const childEnv = new Environment(env);
      const result = this.execBlock(node.body, childEnv);
      if (result instanceof ReturnSignal) return result;
      if (result instanceof BreakSignal) break;
    }
  }

  execPara(node, env) {
    let val = this.toNumber(this.evalExpr(node.start, env));
    const end = this.toNumber(this.evalExpr(node.end, env));
    const step = node.step ? this.toNumber(this.evalExpr(node.step, env)) : (val <= end ? 1 : -1);
    const ascending = step > 0;

    while (ascending ? val <= end : val >= end) {
      this.checkIterLimit(node.line);
      const childEnv = new Environment(env);
      childEnv.define(node.varName, val);
      const result = this.execBlock(node.body, childEnv);
      if (result instanceof ReturnSignal) return result;
      if (result instanceof BreakSignal) break;
      val += step;
    }
  }

  execRepetir(node, env) {
    do {
      this.checkIterLimit(node.line);
      const childEnv = new Environment(env);
      const result = this.execBlock(node.body, childEnv);
      if (result instanceof ReturnSignal) return result;
      if (result instanceof BreakSignal) break;
    } while (!this.toBool(this.evalExpr(node.condition, env)));
  }

  execSegun(node, env) {
    const val = this.evalExpr(node.expr, env);
    for (const { values, body } of node.cases) {
      for (const v of values) {
        if (this.evalExpr(v, env) == val) {
          return this.execBlock(body, new Environment(env));
        }
      }
    }
    if (node.defaultCase) return this.execBlock(node.defaultCase, new Environment(env));
  }

  execDefinir(node, env) {
    for (const name of node.names) {
      const val = node.isArray ? [] : this.defaultValue(node.varType);
      env.define(name, val);
    }
  }

  defaultValue(type) {
    const t = String(type).toLowerCase();
    if (t === 'entero' || t === 'real') return 0;
    if (t === 'caracter') return '';
    if (t === 'logico') return false;
    return null;
  }

  checkIterLimit(line) {
    if (++this.iterCount > this.maxIterations)
      this.error(`Se superó el límite de ${this.maxIterations} iteraciones (posible bucle infinito)`, line);
  }

  // ── Evaluate expressions ──────────────────────────────────────────────────

  evalExpr(node, env) {
    if (!node) return null;
    switch (node.type) {
      case 'Literal': return node.value;
      case 'Ident': {
        const v = env.get(node.name);
        return v === undefined ? null : v;
      }
      case 'ArrayAccess': {
        const arr = env.get(node.name);
        if (!Array.isArray(arr)) this.error(`'${node.name}' no es un arreglo`);
        const i = this.toNumber(this.evalExpr(node.index, env)) - 1;
        return arr[i] ?? null;
      }
      case 'UnaryOp': {
        const v = this.evalExpr(node.operand, env);
        if (node.op === '-') return -this.toNumber(v);
        if (node.op === '!') return !this.toBool(v);
        return v;
      }
      case 'BinOp': return this.evalBinOp(node, env);
      case 'Call': return this.evalCall(node, env);
      default: return null;
    }
  }

  evalBinOp(node, env) {
    const l = this.evalExpr(node.left, env);
    // Short-circuit
    if (node.op === '&&') return this.toBool(l) ? this.toBool(this.evalExpr(node.right, env)) : false;
    if (node.op === '||') return this.toBool(l) ? true : this.toBool(this.evalExpr(node.right, env));

    const r = this.evalExpr(node.right, env);
    switch (node.op) {
      case '+':
        if (typeof l === 'string' || typeof r === 'string') return this.display(l) + this.display(r);
        return this.toNumber(l) + this.toNumber(r);
      case '-': return this.toNumber(l) - this.toNumber(r);
      case '*': return this.toNumber(l) * this.toNumber(r);
      case '/': {
        const d = this.toNumber(r);
        if (d === 0) this.error('División por cero');
        return this.toNumber(l) / d;
      }
      case '%': return this.toNumber(l) % this.toNumber(r);
      case '**': return Math.pow(this.toNumber(l), this.toNumber(r));
      case '==': return l == r;
      case '!=': return l != r;
      case '<': return this.toNumber(l) < this.toNumber(r);
      case '>': return this.toNumber(l) > this.toNumber(r);
      case '<=': return this.toNumber(l) <= this.toNumber(r);
      case '>=': return this.toNumber(l) >= this.toNumber(r);
      default: return null;
    }
  }

  evalCall(node, env) {
    const name = node.name.toLowerCase();
    const args = node.args.map(a => this.evalExpr(a, env));

    // Built-ins
    if (this.builtins[name]) return this.builtins[name](args);

    // User functions
    const fn = this.functions[name];
    if (!fn) this.error(`Función desconocida: '${node.name}'`);

    if (++this.callDepth > this.maxCallDepth) this.error('Desbordamiento de pila (recursión muy profunda)');
    const fnEnv = new Environment();
    fn.params.forEach((p, i) => fnEnv.define(p, args[i] ?? null));
    const result = this.execBlock(fn.body, fnEnv);
    this.callDepth--;
    if (result instanceof ReturnSignal) return result.value;
    return null;
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

const interpreter = {
  /**
   * @param {string} source  - Código fuente en pseudocódigo
   * @param {Array}  inputs  - Valores para Leer (strings o números)
   * @returns {{ output: string[], inputsUsed: number } | { error: string }}
   */
  run(source, inputs = []) {
    try {
      return new Interpreter().run(source, inputs);
    } catch (e) {
      return { error: e.message, output: [] };
    }
  }
};

// ─── MODULE EXPORT & BROWSER GLOBAL ──────────────────────────────────────────

if (typeof module !== 'undefined') module.exports = interpreter;
if (typeof window !== 'undefined') window.PseudoJS = interpreter;


// ─── DEMO ─────────────────────────────────────────────────────────────────────

/*
// Ejemplo 1: Suma
console.log(interpreter.run(`
Algoritmo Suma
  Leer a, b
  Escribir "Resultado: ", a + b
FinAlgoritmo
`, [3, 7]));
// → { output: ['Resultado: 10'], inputsUsed: 2 }

// Ejemplo 2: Fibonacci recursivo
console.log(interpreter.run(`
Funcion resultado <- Fib(n)
  Si n <= 1 Entonces
    Retornar n
  FinSi
  Retornar Fib(n-1) + Fib(n-2)
FinFuncion

Algoritmo TestFib
  Para i <- 0 Hasta 10 Hacer
    Escribir "Fib(", i, ") = ", Fib(i)
  FinPara
FinAlgoritmo
`));

// Ejemplo 3: Arreglos y Según
console.log(interpreter.run(`
Algoritmo Notas
  Definir nota Como Entero
  Leer nota
  Segun nota Hacer
    Sea 10: Escribir "Perfecto!"
    Sea 8, 9: Escribir "Excelente"
    Sea 6, 7: Escribir "Aprobado"
    De Otro Modo: Escribir "Reprobado"
  FinSegun
FinAlgoritmo
`, [9]));
*/