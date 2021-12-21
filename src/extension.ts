import * as vscode from "vscode";
let myStatusBarItem: vscode.StatusBarItem;
import { getSecond, formateDate, checkTimeFormat } from "./utils";
let timer: any = null;
let time: number = 0;
let isWorking: boolean = true;
const CANCEL_TIMER_LABEL = "$(close) Cancel timer";
const RESET_TIMER_LABEL = "$(clock) Reset timer";
const ERROE_MESSAGE = 'Please input a valid time, such as "20m", "1h", "30s"';

export function activate(context: vscode.ExtensionContext) {
  const { subscriptions } = context;
  let {
    format,
    workingTime,
    breakingTime,
    showInformation,
    message,
    priority,
  } = vscode.workspace.getConfiguration("20-20-20");
  if (!checkTimeFormat(workingTime) || !checkTimeFormat(breakingTime)) {
    vscode.window.showInformationMessage(ERROE_MESSAGE);
  }
  time = getSecond(workingTime) || 20 * 60; // 默认20分钟
  let startDisposable = vscode.commands.registerCommand(
    "20-20-20.start",
    () => {
      start();
    }
  );
  let cancelDisposable = vscode.commands.registerCommand(
    "20-20-20.cancel",
    () => {
      cancel();
    }
  );
  let restartDisposable = vscode.commands.registerCommand(
    "20-20-20.restart",
    () => {
      restart();
    }
  );
  let clickDisposable = vscode.commands.registerCommand(
    "20-20-20._timer-click",
    async () => {
      const option = await vscode.window.showQuickPick(
        [CANCEL_TIMER_LABEL, RESET_TIMER_LABEL],
        { canPickMany: false }
      );
      if (!option) {
        return;
      }
      if (option === CANCEL_TIMER_LABEL) {
        cancel();
      } else if (option === RESET_TIMER_LABEL) {
        restart();
      }
    }
  );

  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    priority
  );
  myStatusBarItem.command = "20-20-20._timer-click";

  function showTimer() {
    let text = formateDate(format, time);
    myStatusBarItem.text = text;
    if (time === 0 && isWorking && showInformation) {
      vscode.window.showInformationMessage(message, "Got It!");
    }
    if (time === 0) {
      time = getSecond(isWorking ? breakingTime : workingTime);
      isWorking = !isWorking;
      return;
    }
    time--;
    myStatusBarItem.show();
  }

  function start() {
    if (timer) return;
    timer = setInterval(showTimer, 1000);
    myStatusBarItem.show();
  }
  function restart() {
    isWorking = true;
    clearInterval(timer);
    time = getSecond(workingTime);
    showTimer();
    timer = setInterval(showTimer, 1000);
    myStatusBarItem.show();
  }
  function cancel() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    myStatusBarItem.hide();
  }
  start();
  subscriptions.push(myStatusBarItem);
  subscriptions.push(startDisposable);
  subscriptions.push(cancelDisposable);
  subscriptions.push(restartDisposable);
  subscriptions.push(clickDisposable);
  subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("20-20-20")) {
        format = vscode.workspace.getConfiguration("20-20-20").get("format");
        workingTime = vscode.workspace
          .getConfiguration("20-20-20")
          .get("workingTime");
        breakingTime = vscode.workspace
          .getConfiguration("20-20-20")
          .get("breakingTime");
        if (!checkTimeFormat(workingTime) || !checkTimeFormat(breakingTime)) {
          vscode.window.showInformationMessage(ERROE_MESSAGE);
        } else {
          time = getSecond(isWorking ? workingTime : breakingTime);
        }
        showInformation = vscode.workspace
          .getConfiguration("20-20-20")
          .get("showInformation");
        message = vscode.workspace.getConfiguration("20-20-20").get("message");
        let newPriority: number = vscode.workspace
          .getConfiguration("20-20-20")
          .get("priority") as number;
        if (newPriority !== priority) {
          myStatusBarItem.dispose();
          myStatusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            newPriority
          );
          subscriptions.push(myStatusBarItem);
        }
      }
    })
  );
}

export function deactivate() {
  clearInterval(timer);
}
