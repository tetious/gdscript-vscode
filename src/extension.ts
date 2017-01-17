import * as vscode from 'vscode';
import { GodotScriptCompletionProvider } from './completionProvider';
import { GodotScriptSymbolProvider, GodotScriptWorkspaceSymbolProvider } from './symbolProvider';

export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerCompletionItemProvider('gdscript', new GodotScriptCompletionProvider());
    vscode.languages.registerDocumentSymbolProvider('gdscript', new GodotScriptSymbolProvider());
    vscode.languages.registerWorkspaceSymbolProvider(new GodotScriptWorkspaceSymbolProvider());
    console.log("Hello from gdscript-autocomplete!");
}

export function deactivate() {
   
}