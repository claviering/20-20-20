# 20/20/20 rule

Webview Panel will be opened every 20 minutes to remind you to take a break

## Usage

run `Eye Strain: Stroll to grab a cup of coffee` to open Webview Panel

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

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the MIT License.