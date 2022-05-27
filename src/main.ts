'use strict'

import * as vscode from 'vscode'
import * as commands from './commands'


// Activate Extension
export function activate(context: vscode.ExtensionContext) {
    commands.register(context)
}


export function deactivate() {}