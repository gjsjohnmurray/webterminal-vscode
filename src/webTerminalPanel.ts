import * as vscode from "vscode";

/**
 * The schema of the message that gets sent to the webview.
 */
type WebviewMessage = {
  /** The url launching the WebTerminal */
  url: string;
};

/**
 * Manages Class Documentation preview webviews.
 */
export class WebTerminalPanel {
  /** The viewType for WebTerminal webviews. */
  private static readonly viewType = "isc-webterminal";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _webviewFolderUri: vscode.Uri;
  private readonly _serverId: string;
  private readonly _namespace: string;
  private _disposables: vscode.Disposable[] = [];

  public static create(extensionUri: vscode.Uri, webTerminalUri: vscode.Uri, serverId: string, namespace?: string): WebTerminalPanel {

    // Get the full path to the folder containing our webview files
    const webviewFolderUri: vscode.Uri = vscode.Uri.joinPath(extensionUri, "webview");

    // Create the documatic preview webview
    const titlePrefix = namespace ? `${namespace}@${serverId}` : serverId;
    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      `${titlePrefix} WebTerminal`,
      { preserveFocus: false, viewColumn: vscode.ViewColumn.Active },
      {
        enableScripts: true,
        enableForms: false,
        retainContextWhenHidden: true,
        localResourceRoots: [
          webviewFolderUri
        ],
      }
    );

    return new WebTerminalPanel(panel, webviewFolderUri, webTerminalUri, serverId);
  }

  private constructor(panel: vscode.WebviewPanel, webviewFolderUri: vscode.Uri, webTerminalUri: vscode.Uri, serverId: string, namespace?: string) {
    this._panel = panel;
    this._webviewFolderUri = webviewFolderUri;
    this._serverId = serverId;
    this._namespace = namespace;

    // Update the panel's icon
    this._panel.iconPath = {
      dark: vscode.Uri.joinPath(webviewFolderUri, "terminal-dark.svg"),
      light: vscode.Uri.joinPath(webviewFolderUri, "terminal-light.svg"),
    };

    // Set the webview's initial content
    this.setWebviewHtml();

    // Register handlers
    this.registerEventHandlers();

    // Send the initial message to the webview
    this._panel.webview.postMessage(this.createMessage(webTerminalUri));
  }

  /**
   * Set the static html for the webview.
   */
  private setWebviewHtml() {
    const webview = this._panel.webview;

    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._webviewFolderUri, "webTerminal.js"));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._webviewFolderUri, "webTerminal.css"));

    // Use a nonce to whitelist which scripts can be run
    const nonce = (function () {
      let text = "";
      const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    })();

    // Set the webview's html
    this._panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en-us">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="
          default-src 'none';
          img-src ${webview.cspSource};
          style-src ${webview.cspSource};
          script-src 'nonce-${nonce}';
          frame-src *;
          connect-src *;
          ">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleUri}" rel="stylesheet">
			</head>
			<body onload="document.querySelector('iframe').focus()">
				<div id="content" class="content">
					<iframe sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  /**
   * Clean up disposables.
   */
  public dispose(): void {

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disp = this._disposables.pop();
      if (disp) {
        disp.dispose();
      }
    }
  }

  /**
   * Create the message to send to the webview.
   */
  private createMessage(webTerminalUri: vscode.Uri): WebviewMessage {

    // Create the message
    return {
      url: webTerminalUri.toString(true),
    };
  }

  /**
   * Register handlers for events that may require us to update our webview
   */
  private registerEventHandlers() {
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

  }
}
