import * as vscode from 'vscode';
import { webTerminalUri } from './utils';
import { WebTerminalPanel } from './webterminalPanel';

export async function register(context: vscode.ExtensionContext) {


    // Install Server Manager if not already installed
    const extId = "intersystems-community.servermanager";
    let extension = vscode.extensions.getExtension(extId);
    if (!extension) {
        await vscode.commands.executeCommand("workbench.extensions.installExtension", extId);
        extension = vscode.extensions.getExtension(extId);
    }
    if (!extension.isActive) await extension.activate();

    const launchExternal = async (serverId, namespace?) => {
        const uri = await webTerminalUri(serverId, false, namespace);
        vscode.env.openExternal(uri);
    }

    const launchPanel = async (serverId, namespace?) => {
        const uri = await webTerminalUri(serverId, true, namespace);
        WebTerminalPanel.create(context.extensionUri, uri, serverId, namespace);
    }

    // Register WebTerminal external browser launcher for server context menu
    context.subscriptions.push(vscode.commands.registerCommand('webterminal-external.intersystems-servermanager', async (serverTreeItem) => {
        const idArray = serverTreeItem.id.split(':');
        const serverId = idArray[1];
        launchExternal(serverId);
    }));

    // Register WebTerminal external browser launcher for namespace context menu
    context.subscriptions.push(vscode.commands.registerCommand('webterminal-external-namespace.intersystems-servermanager', async (namespaceTreeItem) => {
        const idArray = namespaceTreeItem.id.split(':');
        const serverId = idArray[1];
        const namespace = idArray[3];
        launchExternal(serverId, namespace);
    }));

    // Register WebTerminal webview panel launcher for server context menu
    context.subscriptions.push(vscode.commands.registerCommand('webterminal.intersystems-servermanager', async (serverTreeItem) => {
        const idArray = serverTreeItem.id.split(':');
        const serverId = idArray[1];
        launchPanel(serverId);
    }));

    // Register WebTerminal webview panel launcher for namespace context menu
    context.subscriptions.push(vscode.commands.registerCommand('webterminal-namespace.intersystems-servermanager', async (namespaceTreeItem) => {
        const idArray = namespaceTreeItem.id.split(':');
        const serverId = idArray[1];
        const namespace = idArray[3];
        launchPanel(serverId, namespace);
    }));
}
