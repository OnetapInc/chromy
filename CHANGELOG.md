## 0.3.4 - 2017-07-XX
### Change
 - Add event handling functions: on(), once(), removeListener(), removeAllListeners()
 - Supports array format with setCookie() and deleteCookie()
 - url parameter of setCookie() and deleteCookie() is now optional. If not set, current url is used as default value.
 - Fix screenshotDocument()/screenshotMultipleSelectors() with chrome ver.61.

## 0.3.3 - 2017-07-11
### Change
 - Add host option
 - Improve screenshotMultipleSelector(). (A promise that is returned from callback is resolved by screenshotMultipleSelecotr().)

## 0.3.2 - 2017-07-05
### Change
 - Add visible()
 - Add exists()
 - Upgrading chrome-launcher to 0.3.1
