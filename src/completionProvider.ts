import {
    CompletionItemProvider, TextDocument, Position, CancellationToken,
    CompletionItem, CompletionList
} from 'vscode';
import { CompletionService } from './httpHelper';

export class GodotScriptCompletionProvider implements CompletionItemProvider {
    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Thenable<CompletionItem[]> {
        return CompletionService.getCompletions({
            path: document.fileName,
            text: document.getText(),
            cursor: { column: position.character, row: position.line }
        });
    }
}