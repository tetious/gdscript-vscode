import {
    DocumentSymbolProvider, TextDocument, SymbolInformation, CancellationToken,
    SymbolKind, Range, WorkspaceSymbolProvider, Uri
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

    symbolCache[document.fileName] = symbols;
    return symbols;
}

export class GodotScriptWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    public provideWorkspaceSymbols(query: string, token: CancellationToken): SymbolInformation[] {
        return [];
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