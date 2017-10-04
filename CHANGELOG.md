## 0.5.5 - 2017-10-05
 - add babel-runtime dependency explicitly. #76
 - fix newline problem in .insert() #74
 - inject buffer content into page. #71

## 0.5.4 - 2017-09-13
 - Supports CHROME_PATH enviroment variable to spcify an executable file path

## 0.5.3 - 2017-09-06
 - Add .send()
 - Add .setDeviceScaleFactor()
 - Change default startup flags to the flags based on puppeteer.
 - Replace sharp with jimp.
 - Remove compatibility to chrome60 or before version.
 - Fix signal handler problem.

## 0.4.8 - 2017-08-17
 - Fix signal handler problem.

## 0.4.7 - 2017-08-09
 - Add enableExtensions option

## 0.4.6 - 2017-08-08
 - fix regression bugs in .wait() and .goto()

## 0.4.5 - 2017-08-06
 - fix wait() problem #47 

## 0.4.4 - 2017-08-06
 - fix a url problem in goto().

## 0.4.3 - 2017-08-02
 - fix double quote problem in .type().
 - .type() is available with iframe

## 0.4.2 - 2017-07-30
 - fix regression bug.

## 0.4.1 - 2017-07-30
 - fix regression bug.

## 0.4.0 - 2017-07-30
 - Update dependent chrome version to 60 (it makes WebGL enabled and performance up)
 - .screenshotSelector() and .screenshotMultipleSelectors() with chrome61 or later work without sharp library.

## 0.3.7 - 2017-07-28
 - Close the browser when SIGINT is happend
 - Add ignoreCertificateErrors()

## 0.3.6 - 2017-07-21
 - Add useDeviceResolution option to screenshot functions.
 - Change interface of screenshot series.

## 0.3.5 - 2017-07-20
### Change
 - Add Chromy.addCustomDevice()
 - Add userDataDir option.

## 0.3.4 - 2017-07-13
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
