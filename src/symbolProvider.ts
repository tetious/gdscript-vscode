import {
    DocumentSymbolProvider, TextDocument, SymbolInformation, CancellationToken,
    SymbolKind, Range, WorkspaceSymbolProvider, Uri, workspace
} from 'vscode';

import GodotScriptSymbolParser from './symbolParser';

interface SymbolCache {
    [key: string]: SymbolInformation[];
}
let symbolCache: SymbolCache = {}

function getSymbols(document: TextDocument) {
    const symbols: SymbolInformation[] = [];
    const script = new GodotScriptSymbolParser().parse(document.getText());

    for (let kind of Object.keys(script)) {
        for (let key of Object.keys(script[kind])) {
            symbols.push(new SymbolInformation(key, SymbolKind[kind], script[kind][key].range, document.uri));
        }
    }

    symbolCache[document.uri.fsPath] = symbols;
    return symbols;
}

function getAllSymbols(filter: string) {
    const symbols: SymbolInformation[] = [];
    for (let file of Object.keys(symbolCache)) {        
        symbols.push(...symbolCache[file].filter(s => s.name.includes(filter)));
    }

    return symbols;
}

export class GodotScriptWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    public provideWorkspaceSymbols(query: string, token: CancellationToken): Thenable<SymbolInformation[]> {
        return new Promise<SymbolInformation[]>((resolve, reject) => {
            workspace.findFiles("**/*.gd", "").then(files => {
                files.forEach(uri => {
                    if (!symbolCache[uri.fsPath]) {
                        console.log("Rebuilding symbols for file " + uri.fsPath);
                        workspace.openTextDocument(uri).then(doc => getSymbols(doc));
                    }
                });
            });
            resolve(getAllSymbols(query));
        })
    }
}

export class GodotScriptSymbolProvider implements DocumentSymbolProvider {
    private parser: GodotScriptSymbolParser = null;

    constructor() {
        this.parser = new GodotScriptSymbolParser();
    }

    provideDocumentSymbols(document: TextDocument, token: CancellationToken): SymbolInformation[] {
        return getSymbols(document);
    }

}