import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const configuredView = vscode.workspace.getConfiguration().get('20-20-20-timer');
  const timer: string | any = configuredView || '00:20:00';
  console.log('timer', timer);
  let timeSplit = timer.split(':');
  let hour = Number.parseInt(timeSplit[0]);
  let minute = Number.parseInt(timeSplit[1]);
  let second = Number.parseInt(timeSplit[2]);
  let totalSecond = second + minute * 60 + hour * 3600;
  // 定时出现一次
  setInterval(() => {
    PreventEyeStrain.createOrShow(context.extensionPath);
  }, totalSecond*1000)

  context.subscriptions.push(
    vscode.commands.registerCommand('preventingEyeStrain.start', () => {
      PreventEyeStrain.createOrShow(context.extensionPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('preventingEyeStrain.stop', () => {
      if (PreventEyeStrain.currentPanel) {
        PreventEyeStrain.currentPanel.doRefactor();
      }
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(PreventEyeStrain.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        PreventEyeStrain.revive(webviewPanel, context.extensionPath);
      }
    });
  }
}

/**
 * Manages cat coding webview panels
 */
class PreventEyeStrain {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: PreventEyeStrain | undefined;

  public static readonly viewType = 'preventingEyeStrain';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (PreventEyeStrain.currentPanel) {
      PreventEyeStrain.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      PreventEyeStrain.viewType,
      'Preventing Eye Strain',
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
      }
    );

    PreventEyeStrain.currentPanel = new PreventEyeStrain(panel, extensionPath);
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    PreventEyeStrain.currentPanel = new PreventEyeStrain(panel, extensionPath);
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
          case 'close':
            this._panel.dispose()
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
    // this._panel.webview.postMessage({ command: 'refactor' });
  }

  public dispose() {
    PreventEyeStrain.currentPanel = undefined;

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
    const webview = this._panel.webview;
    // Vary the webview's content based on where it is located in the editor.
    switch (this._panel.viewColumn) {
      case vscode.ViewColumn.Two:
        this._updateForCat(webview);
        return;

      case vscode.ViewColumn.Three:
        this._updateForCat(webview);
        return;

      case vscode.ViewColumn.One:
      default:
        this._updateForCat(webview);
        return;
    }
  }

  private _updateForCat(webview: vscode.Webview) {
    this._panel.title = 'Preventing Eye Strain';
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', 'index.js')
    );
    const indexUri = webview.asWebviewUri(scriptPathOnDisk);

    const indexjs = '!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.timer=t():e.timer=t()}(window,(function(){return(()=>{"use strict";var e={138:(e,t,n)=>{n.r(t),n.d(t,{Time:()=>i});const o=(e,t)=>e.toString().padStart(t,"0");function i(e){let t,n,i,r;function d(e,t,n,i){e&&function(e){e=Number.parseInt(e)%10;let t=document.querySelector("#second"),n="";for(let t=0;t<10;t++){n+=`<div>${(e-t+10)%10}</div>`}t.innerHTML=n}(e),function(e){e=Number.parseInt(e),document.querySelector(".second-ten-digits").textContent=e}(t),function(e){document.querySelector(".minute").textContent=o(e||"00",2)}(n),function(e){document.querySelector(".hour").textContent=o(e||"00",2)}(i)}function c(){r-=1,r<0&&0<n?(r=5,n-=1):r<0&&n<=0&&0<t?(r=5,n=59,t-=1):n<=0&&t<=0&&(n=0),d(!1,r,n,t)}function u(){document.querySelector("#second").classList.toggle("running")}!function(){const{app:o,timer:s}=e;if(!function(e){return/^[0-9]{2}:[0-9]{2}:[0-9]{2}/g.test(e)}(s))throw new Error("设置的时间格式错误");let v=s.split(":");t=Number.parseInt(v[0]),n=Number.parseInt(v[1]),i=Number.parseInt(v[2]),r=Math.floor(i/10);let l=i+60*n+3600*t;!function(e){let t=document.querySelector(e);if(!t)throw new Error("app id 错误");t.innerHTML=`\n    <div id="hour" class="hour">00</div>\n    <div class="colon">:</div>\n    <div id="minute" class="minute">00</div>\n    <div class="colon">:</div>\n    <div id="second-ten-digits" class="second-ten-digits">0</div>\n    <div id="second" class="second play">\n      <div>0</div>\n      <div>9</div>\n      <div>8</div>\n      <div>7</div>\n      <div>6</div>\n      <div>5</div>\n      <div>4</div>\n      <div>3</div>\n      <div>2</div>\n      <div>1</div>\n    </div>`}(o),d(i,r,n,t),function(e){if(!e)return;e%10==0&&c();let t="";t=setInterval(()=>{if(!(e-=1))return clearInterval(t),void u();e%10||c()},1e3),u()}(l)}()}}},t={};function n(o){if(t[o])return t[o].exports;var i=t[o]={exports:{}};return e[o](i,i.exports,n),i.exports}return n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n(138)})()}));';

    const style = 'html{height:100%}body{margin:0px;padding:0px;height:100%;width:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.text-content{width:inherit;margin-bottom:100px}.text-content .box{display:flex;font-size:2rem;font-weight:bold}.text-content .left-text{width:49%;text-align:right}@keyframes rotate{0%{transform:rotateX(0)}100%{transform:rotateX(-360deg)}}@keyframes opacity-item{0%{opacity:0}10%{opacity:1}20%{opacity:0}40%{opacity:0}90%{opacity:0}100%{opacity:0}}.timer{display:flex;font-size:100px}.timer .play{animation:rotate 10s linear infinite paused;transform-style:preserve-3d}.timer .play>div:nth-child(1){transform:rotateX(0deg) translateZ(150px);animation:opacity-item 10s linear -1s infinite paused;opacity:0}.timer .play>div:nth-child(2){transform:rotateX(36deg) translateZ(150px);animation:opacity-item 10s linear 0s infinite paused;opacity:0}.timer .play>div:nth-child(3){transform:rotateX(72deg) translateZ(150px);animation:opacity-item 10s linear 1s infinite paused;opacity:0}.timer .play>div:nth-child(4){transform:rotateX(108deg) translateZ(150px);animation:opacity-item 10s linear 2s infinite paused;opacity:0}.timer .play>div:nth-child(5){transform:rotateX(144deg) translateZ(150px);animation:opacity-item 10s linear 3s infinite paused;opacity:0}.timer .play>div:nth-child(6){transform:rotateX(180deg) translateZ(150px);animation:opacity-item 10s linear 4s infinite paused;opacity:0}.timer .play>div:nth-child(7){transform:rotateX(216deg) translateZ(150px);animation:opacity-item 10s linear 5s infinite paused;opacity:0}.timer .play>div:nth-child(8){transform:rotateX(252deg) translateZ(150px);animation:opacity-item 10s linear 6s infinite paused;opacity:0}.timer .play>div:nth-child(9){transform:rotateX(288deg) translateZ(150px);animation:opacity-item 10s linear 7s infinite paused;opacity:0}.timer .play>div:nth-child(10){transform:rotateX(324deg) translateZ(150px);animation:opacity-item 10s linear 8s infinite paused;opacity:0}.timer .running{animation-play-state:running}.timer .running>div{animation-play-state:running !important}.timer .second>div{position:absolute}.timer .second p{margin:0px}';
    const configuredView = vscode.workspace.getConfiguration().get('20-20-20-timer');
    console.log('configuredView', configuredView);
    const timerString = configuredView || '00:20:00';
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
              ${style}
              </style>
              <body>
                <div class="text-content">
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
                </div>
                <div id="timer" class="timer"></div>
              </body>
              <script nonce="${nonce}">${indexjs}</script>
              <script nonce="${nonce}">const config = { timer: '${timerString}', app: "#timer"};let app = new timer.Time(config); </script>
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
