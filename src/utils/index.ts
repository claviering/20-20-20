String.prototype.p2 = function () {
  return this.padStart(2, "0");
};
/**
 * 把时间格式化为 "ss", "mm", "mm:ss", "HH:mm", "HH:mm:ss"
 * @param format 显示时间格式
 * @param time 时间, 单位秒
 * @returns
 */
export function formateDate(format: string, time: number) {
  let { d, h, m, s, ms } = getTime(time * 1000);
  if (format === "ss") {
    return `${s + m * 60 + h * 60 * 60 + d * 24 * 60 * 60}`.p2() + "s";
  } else if (format === "mm") {
    return `${m + h * 60 + d * 24 * 60}`.p2() + "m";
  } else if (format === "mm:ss") {
    return `${m + h * 60 + d * 24 * 60}`.p2() + ":" + `${s}`.p2();
  } else if (format === "HH:mm") {
    return `${h}`.p2() + ":" + `${m + h * 60 + d * 24 * 60}`.p2();
  } else if (format === "HH:mm:ss") {
    return `${h}`.p2() + ":" + `${m}`.p2() + ":" + `${s}`.p2();
  } else {
    return format;
  }
}

// time 单位毫秒
function getTime(time: number) {
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

export function checkTimeFormat(time: string): boolean {
  let test = /^[1-9](\d*)(\.[0-9]{0,2})?[hms]$/.test(time);
  return test;
}

/**
 *
 * @param time 时间 20m, 1h, 30s
 */
export function getSecond(time: string) {
  if (!checkTimeFormat(time)) {
    return 0;
  }
  let end: string = time.slice(-1);
  let numString = time.match(/^[1-9](\d*)(\.[0-9]{0,2})?/);
  if (!numString) {
    return 0;
  }
  let num = parseFloat(numString[0]);
  if (end === "s") {
    return num;
  } else if (end === "m") {
    return num * 60;
  } else if (end === "h") {
    return num * 60 * 60;
  } else {
    return 0;
  }
}
