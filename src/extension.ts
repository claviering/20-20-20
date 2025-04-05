import * as vscode from "vscode";
let myStatusBarItem: vscode.StatusBarItem;
import { getSecond, formateDate, checkTimeFormat } from "./utils";
let timer: any = null;
const CANCEL_TIMER_LABEL = "$(close) Cancel timer";
const RESET_TIMER_LABEL = "$(clock) Reset timer";
const ERROE_MESSAGE = 'Please input a valid time, such as "20m", "1h", "30s"';

// Timestamp for last interval tick to sync across windows
const TIMER_STATE_KEY = "timerState";
const TIMER_ACTIVE_KEY = "timerActive";
const TIMER_END_TIME_KEY = "timerEndTime"; // New key to store end time
const IS_WORKING_KEY = "isWorking";

export function activate(context: vscode.ExtensionContext) {
  // Initialize global state if needed
  if (!context.globalState.get(TIMER_STATE_KEY)) {
    context.globalState.update(TIMER_STATE_KEY, 0);
  }
  if (context.globalState.get(IS_WORKING_KEY) === undefined) {
    context.globalState.update(IS_WORKING_KEY, true);
  }
  if (!context.globalState.get(TIMER_ACTIVE_KEY)) {
    context.globalState.update(TIMER_ACTIVE_KEY, false);
  }
  if (!context.globalState.get(TIMER_END_TIME_KEY)) {
    context.globalState.update(TIMER_END_TIME_KEY, 0);
  }

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

  // Initialize timer state
  const initialTime = getSecond(workingTime) || 20 * 60; // default 20 minutes
  context.globalState.update(TIMER_STATE_KEY, initialTime);
  
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
    const now = Date.now();
    const endTime = context.globalState.get(TIMER_END_TIME_KEY) as number;
    const isWorking = context.globalState.get(IS_WORKING_KEY) as boolean;
    
    // Calculate remaining seconds
    let remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    
    // Update the global state for other windows
    context.globalState.update(TIMER_STATE_KEY, remainingSeconds);
    
    let text = formateDate(format, remainingSeconds);
    myStatusBarItem.text = text;
    
    // Check if timer has finished
    if (remainingSeconds === 0 && endTime > 0) {
      // Only show message if the timer expired recently (not after VSCode restart)
      // Consider recently as within the last minute
      if (isWorking && showInformation && (now - endTime < 60000)) {
        vscode.window.showInformationMessage(message, "Got It!");
      }
      
      // Toggle between working and breaking
      const newIsWorking = !isWorking;
      context.globalState.update(IS_WORKING_KEY, newIsWorking);
      
      // Set new end time
      const durationSeconds = getSecond(newIsWorking ? workingTime : breakingTime);
      const newEndTime = now + (durationSeconds * 1000);
      context.globalState.update(TIMER_END_TIME_KEY, newEndTime);
    }
    
    myStatusBarItem.show();
  }

  function start() {
    if (timer) return;
    
    // Calculate end time based on current time plus duration
    const isWorking = context.globalState.get(IS_WORKING_KEY) as boolean;
    const durationSeconds = getSecond(isWorking ? workingTime : breakingTime);
    const endTime = Date.now() + (durationSeconds * 1000);
    
    // Store end time in global state
    context.globalState.update(TIMER_END_TIME_KEY, endTime);
    context.globalState.update(TIMER_ACTIVE_KEY, true);
    
    timer = setInterval(showTimer, 1000);
    myStatusBarItem.show();
  }
  
  function restart() {
    // Clear interval immediately
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    // Reset working state to true
    context.globalState.update(IS_WORKING_KEY, true);
    
    // Calculate new end time
    const durationSeconds = getSecond(workingTime);
    const endTime = Date.now() + (durationSeconds * 1000);
    context.globalState.update(TIMER_END_TIME_KEY, endTime);
    
    // Update display immediately with the full time
    myStatusBarItem.text = formateDate(format, durationSeconds - 1);
    myStatusBarItem.show();
    
    timer = setInterval(showTimer, 1000);
  }
  
  function cancel() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    
    // Mark timer as inactive in global state
    context.globalState.update(TIMER_ACTIVE_KEY, false);
    
    myStatusBarItem.hide();
  }

  // Check if there's an existing timer running in another window
  if (context.globalState.get(TIMER_ACTIVE_KEY)) {
    const now = Date.now();
    const endTime = context.globalState.get(TIMER_END_TIME_KEY) as number;
    
    // If timer is active but significantly expired (more than 1 hour)
    // or if the end time is in the past
    if (endTime < now) {
      // Reset to a new working period without showing notification
      context.globalState.update(IS_WORKING_KEY, true);
      restart();
    } else {
      // Synchronize with existing active timer
      timer = setInterval(showTimer, 1000);
      showTimer(); // Show immediately to update UI
      myStatusBarItem.show();
    }
  } else {
    // Start a new timer
    start();
  }
  
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
          // Fix: Use globalState instead of local variables
          const isWorking = context.globalState.get(IS_WORKING_KEY) as boolean;
          const newTime = getSecond(isWorking ? workingTime : breakingTime);
          context.globalState.update(TIMER_STATE_KEY, newTime);
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
