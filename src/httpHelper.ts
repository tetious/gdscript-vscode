import {CompletionItem} from 'vscode';
import * as http from 'http';
import * as request from 'request';

interface CompletionRequest {
    path: string;
    text: string;
    cursor: {row: number, column: number}
}

interface CompletionResponse {
    hint: string;
    suggestions: string[];
}

export class CompletionService {
    static getCompletions(request: CompletionRequest): Promise<CompletionItem[]> {
        return new Promise(resolve => {
            CompletionService.post(request)
                .then(cr => resolve(cr.suggestions.map(s => new CompletionItem(s))));
        });
    }

    private static post(body: Object): Promise<CompletionResponse> {
        return new Promise((resolve, reject) => {
            request({ uri: 'http://localhost:' + '6070', method: 'POST', json: body }, (error, response, body) => {
                if (error) { reject(error); }
                resolve(body);
            });
        });
    }
}