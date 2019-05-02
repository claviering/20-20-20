import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('starting');
  setTimeout(() => {
    console.log('show');
    CatCodingPanel.createOrShow(context.extensionPath);
  }, 3000);

  context.subscriptions.push(
    vscode.commands.registerCommand('preventingEyeStrain.start', () => {
      CatCodingPanel.createOrShow(context.extensionPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('preventingEyeStrain.stop', () => {
      if (CatCodingPanel.currentPanel) {
        CatCodingPanel.currentPanel.doRefactor();
      }
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        CatCodingPanel.revive(webviewPanel, context.extensionPath);
      }
    });
  }
}

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: CatCodingPanel | undefined;

  public static readonly viewType = 'preventingEyeStrain';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (CatCodingPanel.currentPanel) {
      CatCodingPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      CatCodingPanel.viewType,
      'Preventing Eye Strain',
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
      }
    );

    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionPath);
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionPath);
  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public doRefactor() {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ command: 'refactor' });
  }

  public dispose() {
    CatCodingPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    // Vary the webview's content based on where it is located in the editor.
    switch (this._panel.viewColumn) {
      case vscode.ViewColumn.Two:
        this._updateForCat();
        return;

      case vscode.ViewColumn.Three:
        this._updateForCat();
        return;

      case vscode.ViewColumn.One:
      default:
        this._updateForCat();
        return;
    }
  }

  private _updateForCat() {
    this._panel.title = 'Preventing Eye Strain';
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private getScriptOnDisk(scriptName: string) {
    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, 'media', scriptName)
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

    return scriptUri
  }

  private _getHtmlForWebview() {

    const mainUri = this.getScriptOnDisk('main.js')
    const buttonUri = this.getScriptOnDisk('button.js')
    const maincssUri = this.getScriptOnDisk('main.css')
    const buttoncssUri = this.getScriptOnDisk('button.css')

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preventing Eye Strain</title>
            </head>
            <style>
            body{
           padding: 0px 20px;
         }
         h1{
           text-align: center;
         }
         .box{
           display: flex;
           font-size: 2em;
           font-weight: bold;
           padding-top: 24px;
         }
         .left-text{
           width: 45%;
           text-align: right;
         }
         .button {
           background: #3498db;
           width: 180px;
           padding: 4px 0;
           position: absolute;
           left: 50%;
           top: 80%;
           -webkit-transform: translateX(-50%) translateY(-50%);
                   transform: translateX(-50%) translateY(-50%);
           border-radius: 3px;
         }
         .button p {
           text-align: center;
           text-transform: uppercase;
           color: #FFF;
           -webkit-user-select: none;
              -moz-user-select: none;
               -ms-user-select: none;
                   user-select: none;
         }
         .button:hover {
           cursor: pointer;
         }
         .button:after {
           content: "";
           display: block;
           position: absolute;
           width: 100%;
           height: 10%;
           border-radius: 50%;
           background-color: #927608;
           opacity: 0.4;
           bottom: -30px;
         } 
           </style>
              <body>
                <div class="box">
                <div class="left-text">Every&nbsp;</div>
                <div class="center-text">20 Minutes</div>
              </div>
              <div class="box">
                <div class="left-text">Look&nbsp;</div>
                <div class="center-text">20 Feet Away</div>
              </div>
              <div class="box">
                <div class="left-text">For&nbsp;</div>
                <div class="center-text">20 Seconds</div>
              </div>
                <div class="button">
                  <p>GOOD JOB</p>
                </div>
              </body>
              <script nonce="${nonce}" src="${buttonUri}"></script>
              <script nonce="${nonce}" src="${mainUri}"></script>
              <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.12.1/TweenMax.min.js"></script>
            </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
