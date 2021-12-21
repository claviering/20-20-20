# 20/20/20 rule

Webview Panel will be opened every 20 minutes to remind you to take a break

## Features

- Set a timer for working time
- View time remaining in status bar
- Click on status bar to cancel or reset timer

## Available Commands

- 20-20-20: Start
- 20-20-20: Cancel
- 20-20-20: Restar

## Supported Settings

| Name                       | Default | Description                                                                                                                 |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `20-20-20.workingTime`     | `true`  | Continue working should take a break for preventing eye strain. e.g. 20m for 20 minutes. 1h for 1 hour. 30s for 30 seconds. |
| `20-20-20.breakingTime`    | `true`  | Time for taking a break. e.g. 20m for 20 minutes. 1h for 1 hour. 30s for 30 seconds.                                        |
| `20-20-20.showInformation` | `true`  | Whether to show information when finish a workingTime                                                                       |
| `20-20-20.message`         | `true`  | The message to show. when finish a workingTime                                                                              |
| `20-20-20.priority`        | `true`  | The priority of the item. Higher values mean the item should be shown more to the left.                                     |

## Usage

run `Eye Strain: Stroll to grab a cup of coffee` to open Webview Panel

## 实现思路

1. 在 vscode 生命周期 onStartupFinished 执行插件
2. 插件在 StatusBar 生命周期执行，添加一个倒计时，显示格式 HH:mm
3. 创建 onCommand 命令 可以手动启动/关闭倒计时
4. 创建 Configuration 配置可以自定义:计数器的显示格式、工作倒计时时间、休息倒计时时间

## subscriptions: {dispose}[]

确保插件卸载的时候回收资源

参考 https://stackoverflow.com/questions/55554018/purpose-for-subscribing-a-command-in-vscode-extension

## About 20/20/20 rule

A helpful trick called the 20-20-20 rule for preventing eye strain. Running `Eye Strain: Stroll to grab a cup of coffee` to have a break

After or during a long day of working at a computer, have you experienced any of the following problems?

- sore, tired or burning eyes
- blurred or double vision
- watery, itchy or dry eyes
- headaches

If you have, it’s likely the result of eye strain, which happens when your eyes get tired from intense use. Fortunately, it can be remedied with a helpful trick called the 20-20-20 rule:

Every 20 minutes, look at something 20 feet away for 20 seconds.

## python script

### For Mac

Python v3.7 `test.py`

```python
import os
from threading import Timer

TIME = 60.0 * 20 # 20 min

def notify():
    title = '20/20/20 rule'
    text = 'hava a break'
    os.system("""
              osascript -e 'display notification "{}" with title "{}"'
              """.format(text, title))
    Timer(TIME, notify).start()

Timer(TIME, notify).start()
```

`nohup test.py &` run it in the background

`ps ax | grep test.py` find PID and to kill it

## Feedback

claviering@gmail.com

## Repo

[Github](https://github.com/claviering/20-20-20)

## License

[MIT License.](LICENSE.txt)
