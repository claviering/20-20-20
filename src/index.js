// 前面补零
const fillZero = (num, len) => num.toString().padStart(len, "0");

/**
 * 
 * @param {Object} config 倒计时 配置
 */
export function Time(config) {
  let hour, minute, second, secondTenDigits;
  /**
   * 初始化开始的秒数
   * @param {Number | String} second 
   */
  function initSecond(second) {
    second = Number.parseInt(second) % 10;
    let secondDom = document.querySelector('#second');
    let innerHTML = '';
    for (let index = 0; index < 10; index++) {
      let num = (second - index + 10) % 10;
      innerHTML += `<div>${num}</div>`;
    }
    secondDom.innerHTML = innerHTML;
  }
  /**
   * 初始化开始的秒的十位数
   * @param {Number | String} second 
   */
  function initSecondTenDigits(secondTenDigits) {
    secondTenDigits = Number.parseInt(secondTenDigits)
    let secondTenDigitsDom = document.querySelector('.second-ten-digits');
    secondTenDigitsDom.textContent = secondTenDigits;
  }
  /**
   * 初始化开始的分钟数
   * @param {Number | String} minute 
   */
  function initMinute(minute) {
    let minuteDom = document.querySelector('.minute');
    minuteDom.textContent = fillZero(minute || '00', 2);
  }
  /**
   * 初始化开始的分钟数
   * @param {Number | String} hour 
   */
  function initHour(hour) {
    let secondTenDigits = document.querySelector('.hour');
    secondTenDigits.textContent = fillZero(hour || '00', 2);
  }
  /**
   * 初始化内容
   * @param {Number} second 
   * @param {Number} minute 
   * @param {Number} hour 
   */
  function initTextContent(second, tmpSecondTenDigits, tmpMinute, tmpHour) {
    if (second) {
      initSecond(second);
    }
    initSecondTenDigits(tmpSecondTenDigits);
    initMinute(tmpMinute);
    initHour(tmpHour);
  }
  /**
   * 秒数的十进制位减 1
   */
  function decrease() {
    secondTenDigits = secondTenDigits - 1;
    if (secondTenDigits < 0 && 0 < minute) {
      secondTenDigits = 5;
      minute -= 1;
    } else if (secondTenDigits < 0 && minute <= 0 && 0 < hour) {
      secondTenDigits = 5;
      minute = 59;
      hour -= 1;
    } else if (minute <= 0 && hour <= 0) {
      minute = 0;
    }
    initTextContent(false, secondTenDigits, minute, hour);
  }
  /**
   * 设置定时器
   * @param {Number} 总的秒数 
   */
  function interval(totalSecond) {
    if (!totalSecond) return;
    // 00 秒，立即执行一次
    if (totalSecond % 10 === 0) {
      decrease();
    }
    let timeInterval = '';
    timeInterval = setInterval(() => {
      totalSecond -= 1;
      if (!totalSecond) {
        clearInterval(timeInterval);
        togglePlay();
        return;
      }
      if (totalSecond % 10) return;
      decrease();
    }, 1000);
    togglePlay();
  }
  /**
   * 暂停/开始动画
   */
  function togglePlay() {
    let secondDom = document.querySelector('#second');
    secondDom.classList.toggle('running');
  }
  function initApp(app) {
    let appDom = document.querySelector(app);
    if (!appDom) throw new Error('app id 错误');
    appDom.innerHTML = `
    <div id="hour" class="hour">00</div>
    <div class="colon">:</div>
    <div id="minute" class="minute">00</div>
    <div class="colon">:</div>
    <div id="second-ten-digits" class="second-ten-digits">0</div>
    <div id="second" class="second play">
      <div>0</div>
      <div>9</div>
      <div>8</div>
      <div>7</div>
      <div>6</div>
      <div>5</div>
      <div>4</div>
      <div>3</div>
      <div>2</div>
      <div>1</div>
    </div>`;
  }
  /**
   * 正则表达式校验时间
   * @param {String} timer 时间
   */
  function testTimer(timer) {
    let s = /^[0-9]{2}:[0-9]{2}:[0-9]{2}/g;
    return s.test(timer);
  }
  function init() {
    const {app, timer} = config;
    if (!testTimer(timer)) {
      throw new Error('设置的时间格式错误');
    };
    let timeSplit = timer.split(':');
    hour = Number.parseInt(timeSplit[0]);
    minute = Number.parseInt(timeSplit[1]);
    second = Number.parseInt(timeSplit[2]);
    secondTenDigits = Math.floor(second / 10);
    let totalSecond = second + minute * 60 + hour * 3600;
    initApp(app);
    initTextContent(second, secondTenDigits, minute, hour);
    interval(totalSecond);
  }
  init();
}
