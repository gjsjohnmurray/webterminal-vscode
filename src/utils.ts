import * as vscode from 'vscode';

export async function webTerminalUri(serverId: string, withCredentials: boolean, namespace?: string): Promise<vscode.Uri> {
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

      let query = namespace ? `&ns=${namespace}` : "";
      if (withCredentials && false) {
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
        if (username) {
            const usernameEncoded = encodeURIComponent(username);
            query += `&CacheUsername=${usernameEncoded}&IRISUsername=${usernameEncoded}`;
            if (password) {
              const passwordEncoded = encodeURIComponent(password);
              query += `&CachePassword=${passwordEncoded}&IRISPassword=${passwordEncoded}`;
            }
          }
      }
      query = query.slice(1);

      return vscode.Uri.from({scheme, authority: `${host}:${port}`, path: `${pathPrefix}/terminal-vscode/`, query})
    }
  }
}
