import {CompletionItem, workspace, window } from 'vscode';
import * as http from 'http';
import * as request from 'request';
import * as fs from 'fs';
import * as path from 'path';
const md5 = require('md5');

interface CompletionRequest {
    path: string;
    text: string;
    cursor: {row: number, column: number}
}

interface CompletionResponse {
    hint: string;
    suggestions: string[];
}

function getServersListPath() {
    if (process.env.APPDATA) {
        return process.env.APPDATA + "/Godot/.autocomplete-servers.json" 
    }
    else if (process.env.HOME) {
        return process.env.HOME + "/.godot/.autocomplete-servers.json";
  }
}

export class CompletionService {
    private static portForProject;

    private static refreshProjectPort(force: boolean = false): Promise<string> {
        if (force) { CompletionService.portForProject = null };

        return new Promise((resolve, reject) => {
            if (CompletionService.portForProject) {
                resolve(CompletionService.portForProject);
                return;
            }
            
            workspace.findFiles("engine.cfg", "").then(ec => {
                if (ec.length != 1) {
                    console.log(`Found ${ec.length} engine.cfg files. Expected 1.`);
                    reject(null);
                }
                const projectPath = path.dirname(ec[0].fsPath);
                console.log(`Using ${projectPath} as project path.`);

                const serversListPath = getServersListPath();
                if (fs.existsSync(serversListPath)) {
                    const servers = JSON.parse(fs.readFileSync(serversListPath, 'utf8'));
                    const port = servers[md5(projectPath)];
                    if (port) {
                        CompletionService.portForProject = port;
                        resolve(port);
                    } else {
                        console.log("Could not find a match for this project.");
                        reject(null);
                    }
                }
            })
        });
    }

    static getCompletions(request: CompletionRequest): Promise<CompletionItem[]> {
        return new Promise(resolve => {
            CompletionService.post(request)
                .then(cr => resolve(cr.suggestions.map(s => new CompletionItem(s))));
        });
    }

    private static post(body: Object): Promise<CompletionResponse> {
        return new Promise((resolve, reject) => {                        
            CompletionService.refreshProjectPort().then(port => {
                request({ uri: 'http://localhost:' + port, method: 'POST', json: body }, (error, response, body) => {
                    if (error) {
                        CompletionService.refreshProjectPort(true).then(port => CompletionService.portForProject = port);
                        reject(error);
                    }
                    resolve(body);
                });
            });
        });
    }
}
