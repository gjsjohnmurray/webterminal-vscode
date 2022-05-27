
# gj&nbsp;::&nbsp;connect

This is a demonstration extension that shows how to extend the Intersystems Server Manager to perform custom actions.

It makes use of the context menu contribution points to add both in-line and right click menu options.

It also demonstrates how to create a new top level folder in your workspace corresponding to the server and namespace selected in Server Manager.

## Features

* Add in-line command to each namespace folder
* Add right-click context menu to each namespace folder
* Demonstrates use of getServerSpec api to read and use connection properties
* Demonstrates how to launch a url in an external browser
* Demonstrates how to add a top level folder to the workspace (if not already present)

![Screenshot](https://raw.githubusercontent.com/george-james-software/gjConnect/master/images/screenshot.png)

## Requirements

This extension requires the InterSystems Server Manager extension to be installed, and will install it automatically if it is not.


## Installation

1. To install the gj&nbsp;::&nbsp;connect VS Code extension, go to the Extensions view (⌘/Ctrl+Shift+X), search for "gjconnect" and click the install button.

2. Click the InterSystems Tools icon in the VS Code Activity Bar to go to the InterSystem Server Manager view.

3. Drill down into the list of namespaces for a server in the Server Manager.  Observe the additional Debug (Serenji) button adjacent to each namespace entry.  This was contributed by this extension.

4. Right click on the namespace and observe the context menu options.  These were contributed by this extension.

## Release Notes

### 1.0.0

First release.

