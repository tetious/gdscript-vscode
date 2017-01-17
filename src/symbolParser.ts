import {Range, SymbolKind} from 'vscode';
import * as fs from 'fs';

interface Symbol {
    range: Range;
}

interface Constant extends Symbol {
    value: any;
}

interface SymbolMap  {
    [key: string]: Symbol
}

interface GDScript {
    [key: string]: SymbolMap;
}

export default class GodotScriptSymbolParser {
    private readonly
    private content: string;
    private lines: string[];

    parse(content: string): GDScript {
        this.content = content;
        this.lines = content.split(/\r?\n/);

        const script = {
            Function: {},
            Variable: {},
            Constant: {},
            Class: {},
            Method: {}
        };
        
        this.buildSymbols(script.Function, /func\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'func\\s+$X$\\s*\\(');
        this.buildSymbols(script.Method, /signal\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'signal\\s+$X$\s*\\(');
        this.buildSymbols(script.Variable, /var\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'var\\s+$X$\\s*\\(');
        this.buildSymbols(script.Constant, /const\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'const\\s+$X$\\s*\\(');
        this.buildSymbols(script.Class, /class\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*extends\s+/g, 'class\\s+$X$\\s*extends\\s+');

        return script;
    }

    private getMatches(string, regex) {
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[1]);
        }
        return matches;
    }
    
    private findLineRange(name, reg) {
        let line = 0;
        let curline = 0;
        this.lines.map(l => {
            const nreg = reg.replace("$X$", name);
            if (l.match(nreg) != null) {
                line = curline;
                return;
            }
            curline += 1;
        });
        let startAt = this.lines[line].indexOf(name);
        if (startAt < 0) startAt = 0;

        return new Range(line, startAt, line, startAt + name.length);;
    }

    private buildSymbols(selector, keyExpression, lineExpression, builder: (Range) => Symbol = null) {
        if (!builder) { builder = range => ({ range }); }

        let keys = this.getMatches(this.content, keyExpression);

        for (let key of keys) {
            let range = this.findLineRange(key, lineExpression);
            selector[key] = builder(range);
        }
    }
}