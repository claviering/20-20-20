/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSecond = exports.checkTimeFormat = exports.formateDate = void 0;
String.prototype.p2 = function () {
    return this.padStart(2, "0");
};
/**
 * 把时间格式化为 "ss", "mm", "mm:ss", "HH:mm", "HH:mm:ss"
 * @param format 显示时间格式
 * @param time 时间, 单位秒
 * @returns
 */
function formateDate(format, time) {
    let { d, h, m, s, ms } = getTime(time * 1000);
    if (format === "ss") {
        return `${s + m * 60 + h * 60 * 60 + d * 24 * 60 * 60}`.p2() + "s";
    }
    else if (format === "mm") {
        return `${m + h * 60 + d * 24 * 60}`.p2() + "m";
    }
    else if (format === "mm:ss") {
        return `${m + h * 60 + d * 24 * 60}`.p2() + ":" + `${s}`.p2();
    }
    else if (format === "HH:mm") {
        return `${h}`.p2() + ":" + `${m + h * 60 + d * 24 * 60}`.p2();
    }
    else if (format === "HH:mm:ss") {
        return `${h}`.p2() + ":" + `${m}`.p2() + ":" + `${s}`.p2();
    }
    else {
        return format;
    }
}
exports.formateDate = formateDate;
// time 单位毫秒
function getTime(time) {
    let ms = time % 1000;
    let s = time / 1000;
    let m = s / 60;
    let h = m / 60;
    let d = h / 24;
    s = s % 60 | 0;
    m = m % 60 | 0;
    h = h % 24 | 0;
    d = d | 0;
    d = d > 0 ? d : 0;
    h = h > 0 ? h : 0;
    m = m > 0 ? m : 0;
    return { d, h, m, s, ms };
}
function checkTimeFormat(time) {
    let test = /^[1-9](\d*)(\.[0-9]{0,2})?[hms]$/.test(time);
    return test;
}
exports.checkTimeFormat = checkTimeFormat;
/**
 *
 * @param time 时间 20m, 1h, 30s
 */
function getSecond(time) {
    if (!checkTimeFormat(time)) {
        return 0;
    }
    let end = time.slice(-1);
    let numString = time.match(/^[1-9](\d*)(\.[0-9]{0,2})?/);
    if (!numString) {
        return 0;
    }
    let num = parseFloat(numString[0]);
    if (end === "s") {
        return num;
    }
    else if (end === "m") {
        return num * 60;
    }
    else if (end === "h") {
        return num * 60 * 60;
    }
    else {
        return 0;
    }
}
exports.getSecond = getSecond;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
let myStatusBarItem;
const utils_1 = __webpack_require__(2);
let timer = null;
let time = 0;
let isWorking = true;
const CANCEL_TIMER_LABEL = "$(close) Cancel timer";
const RESET_TIMER_LABEL = "$(clock) Reset timer";
const ERROE_MESSAGE = 'Please input a valid time, such as "20m", "1h", "30s"';
function activate(context) {
    const { subscriptions } = context;
    let { format, workingTime, breakingTime, showInformation, message, priority, } = vscode.workspace.getConfiguration("20-20-20");
    if (!(0, utils_1.checkTimeFormat)(workingTime) || !(0, utils_1.checkTimeFormat)(breakingTime)) {
        vscode.window.showInformationMessage(ERROE_MESSAGE);
    }
    time = (0, utils_1.getSecond)(workingTime) || 20 * 60; // 默认20分钟
    let startDisposable = vscode.commands.registerCommand("20-20-20.start", () => {
        start();
    });
    let cancelDisposable = vscode.commands.registerCommand("20-20-20.cancel", () => {
        cancel();
    });
    let restartDisposable = vscode.commands.registerCommand("20-20-20.restart", () => {
        restart();
    });
    let clickDisposable = vscode.commands.registerCommand("20-20-20._timer-click", async () => {
        const option = await vscode.window.showQuickPick([CANCEL_TIMER_LABEL, RESET_TIMER_LABEL], { canPickMany: false });
        if (!option) {
            return;
        }
        if (option === CANCEL_TIMER_LABEL) {
            cancel();
        }
        else if (option === RESET_TIMER_LABEL) {
            restart();
        }
    });
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, priority);
    myStatusBarItem.command = "20-20-20._timer-click";
    function showTimer() {
        let text = (0, utils_1.formateDate)(format, time);
        myStatusBarItem.text = text;
        if (time === 0 && isWorking && showInformation) {
            vscode.window.showInformationMessage(message, "Got It!");
        }
        if (time === 0) {
            time = (0, utils_1.getSecond)(isWorking ? breakingTime : workingTime);
            isWorking = !isWorking;
            return;
        }
        time--;
        myStatusBarItem.show();
    }
    function start() {
        if (timer)
            return;
        timer = setInterval(showTimer, 1000);
        myStatusBarItem.show();
    }
    function restart() {
        isWorking = true;
        clearInterval(timer);
        time = (0, utils_1.getSecond)(workingTime);
        showTimer();
        timer = setInterval(showTimer, 1000);
        myStatusBarItem.show();
    }
    function cancel() {
        if (!timer)
            return;
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
    subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("20-20-20")) {
            format = vscode.workspace.getConfiguration("20-20-20").get("format");
            workingTime = vscode.workspace
                .getConfiguration("20-20-20")
                .get("workingTime");
            breakingTime = vscode.workspace
                .getConfiguration("20-20-20")
                .get("breakingTime");
            if (!(0, utils_1.checkTimeFormat)(workingTime) || !(0, utils_1.checkTimeFormat)(breakingTime)) {
                vscode.window.showInformationMessage(ERROE_MESSAGE);
            }
            else {
                time = (0, utils_1.getSecond)(isWorking ? workingTime : breakingTime);
            }
            showInformation = vscode.workspace
                .getConfiguration("20-20-20")
                .get("showInformation");
            message = vscode.workspace.getConfiguration("20-20-20").get("message");
            let newPriority = vscode.workspace
                .getConfiguration("20-20-20")
                .get("priority");
            if (newPriority !== priority) {
                myStatusBarItem.dispose();
                myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, newPriority);
                subscriptions.push(myStatusBarItem);
            }
        }
    }));
}
exports.activate = activate;
function deactivate() {
    clearInterval(timer);
}
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map