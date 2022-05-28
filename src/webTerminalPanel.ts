import * as vscode from "vscode";
import { webTerminalUri } from "./utils";

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
   this._panel.iconPath = vscode.Uri.joinPath(webviewFolderUri, "favicon.ico");

    // Set the webview's initial content
    this.setWebviewHtml(webTerminalUri.toString(true));

    // Register handlers
    this.registerEventHandlers();

    // Send the initial message to the webview
    this._panel.webview.postMessage(this.createMessage(webTerminalUri));
  }

  /**
   * Set the static html for the webview.
   */
  private setWebviewHtml(appUrl: string) {
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
			<body>
        <div id="showText"></div>

        <div id="placeholder">
          <h2 id="header">Preparing your WebTerminal...</h2>
          <p>
            If this message remains for more than a few seconds there's a problem connecting to <b>${appUrl}</b> to launch it here. Check the following:
            <ul>
              <li>Credentials are correct.</li>
              <li>Connection uses the <b>https</b> protocol.</li>
              <li>Connection specifies a hostname which matches the target server's certificate.</li>
              <li>Web application <b>/terminal-vscode</b> was added as a copy of WebTerminal's /terminal application but with <b>Session Cookie Scope</b> set to <b>None</b>.</li>
              <li>The <b>Parameter HandleCorsRequest=1</b> patch was added to <b>WebTerminal.Router.cls</b> and the class was recompiled.</li>
              <li>The account used by the Web Gateway (typically <b>CSPSystem</b>) has at least READ privilege on the security resource which protects WebTerminal's code database.
            </ul>
            Use the <b>WebTerminal in External Browser</b> option from the context menu of the server's row in the Server Manager tree to verify some of these factors.
          </p>
        </div>

        <div id="content" class="content">
					<iframe sandbox="allow-scripts allow-same-origin"></iframe>
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
