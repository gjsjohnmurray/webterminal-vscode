import * as vscode from 'vscode';
import { WebTerminalMessage } from './webterminalPanel';

export async function webViewMessage(serverId: string, withCredentials: boolean, namespace?: string): Promise<WebTerminalMessage> {
  const smExtension = vscode.extensions.getExtension('intersystems-community.servermanager');
  if (smExtension) {
    if (!smExtension.isActive) {
      await smExtension.activate();
    }
    const serverManagerApi = smExtension.exports;
    if (serverManagerApi && serverManagerApi.getServerSpec) {
      const serverSpec = await serverManagerApi.getServerSpec(serverId)

      const scheme = serverSpec.webServer.scheme
      const host = serverSpec.webServer.host
      const port = serverSpec.webServer.port
      const pathPrefix = serverSpec.webServer.pathPrefix

      const query = namespace ? `ns=${namespace}` : "";
      const app = withCredentials ? "terminal-vscode" : "terminal";
      const message: WebTerminalMessage = {url: vscode.Uri.from({scheme, authority: `${host}:${port}`, path: `${pathPrefix}/${app}/`, query}).toString(true)};
      if (withCredentials) {
        let username = serverSpec.username;
        let password = serverSpec.password;

        // This arises when Server Manager 3+ defers to authentication provider
        if (typeof password === 'undefined') {
          const AUTHENTICATION_PROVIDER = 'intersystems-server-credentials';
          const scopes = [serverSpec.name, username];
          let session = await vscode.authentication.getSession(AUTHENTICATION_PROVIDER, scopes, { silent: true });
          if (!session) {
              session = await vscode.authentication.getSession(AUTHENTICATION_PROVIDER, scopes, { createIfNone: true });
          }
          if (session) {
              username = username || session.scopes[1];
              password = session.accessToken;
          }
        }
        if (username && password) {
            message.authToken = Buffer.from(`${username}:${password}`).toString("base64");
          }
      }

      return message;
    }
  }
}
