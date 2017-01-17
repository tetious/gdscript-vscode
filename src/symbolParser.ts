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

        /*const parseSignature = (range: Range):string => {
          let res = "";
          const line = this.lines[range.start.line];
          if(line.indexOf("(")!= -1 && line.indexOf(")")!=-1) {
            const signature = line.substring(line.indexOf("("), line.indexOf(")")+1);
            if(signature && signature.length >0)
              res = signature;
          }
          return res;
        };*/
        
        this.buildSymbols(script.Function, /func\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'func\\s+$X$\\s*\\(');
        /*let funcsnames = getMatches(text, /func\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 1);
        const funcs = findLineRanges(funcsnames, "func\\s+$X$\\s*\\(");
        for (let key of Object.keys(funcs)) {
            script.functions[key] = { range: funcs[key], signature: parseSignature(funcs[key]) };
        }*/
    
        this.buildSymbols(script.Method, /signal\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'signal\\s+$X$\s*\\(');
        // let signalnames = getMatches(text, /signal\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 1);
        // const signals = findLineRanges(signalnames, "signal\\s+$X$\\s*\\(");
        // for (let key of Object.keys(signals)) {
        //   let range = determRange(key, funcs);
        //   script.signals[key] = { range, signature: parseSignature(range) };
        // }

        this.buildSymbols(script.Variable, /var\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'var\\s+$X$\\s*\\(');
        // let varnames = getMatches(text, /var\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*/g, 1);
        // const vars = findLineRanges(varnames, "var\\s+$X$\\s*");
        // for (let key of Object.keys(vars)){
        //   let range = determRange(key, funcs);
        //   script.variables[key] = { range }
        // }
    
        this.buildSymbols(script.Constant, /const\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*\(/g, 'const\\s+$X$\\s*\\(');
        // let constnames = getMatches(text, /const\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*/g, 1);
        // const consts = findLineRanges(constnames, "const\\s+$X$\\s*");
        // for (let key of Object.keys(consts)){
        //   const r:Range = determRange(key, consts)
        //   script.constants[key] = r;
      
        //   const linecontent = lines[r.start.line];
        //   const match = linecontent.match(/const\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*=\s*([\w+]+\(.*\)|"[^"]*"|\-?\d+\.?\d*|\[.*\]|\{.*\})/);
        //   if(match && match.length && match.length >1)
        //     script.constvalues[key] = match[2];
        // }
    
        this.buildSymbols(script.Class, /class\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*extends\s+/g, 'class\\s+$X$\\s*extends\\s+');
        // let classnames = getMatches(text, /class\s+([_A-Za-z]+[_A-Za-z0-9]*)\s*extends\s+/g, 1);
        // const classes = findLineRanges(classnames, "class\\s+$X$\\s*extends\\s+");
        // for (let key of Object.keys(classes)) {
        //   const r:Range = determRange(key, classes)
        //   script.classes[key] = determRange(key, classes);
        // }

        return script;
    }

    //   parseFile(path:string): GDScript {
    //     const self = this;
    //     if(fs.existsSync(path) && fs.statSync(path).isFile()){
    //       const content = fs.readFileSync(path, 'utf-8');
    //       return this.parseContent(content);
    //     }
    //     return null;
    //   }

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
        
        //             if (Object.keys(sm).indexOf(name) != -1) return;

        for (let key of keys) {
            let range = this.findLineRange(key, lineExpression);
            selector[key] = builder(range);
        }
    }
}