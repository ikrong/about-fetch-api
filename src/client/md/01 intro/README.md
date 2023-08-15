## fetch 和 XMLHTTPRequest 简介

XMLHTTPRequest最初由微软Outlook邮件团队提出，用于定时拉取最新邮件。在1999年3月18日，通过 ActiveX 控件技术集成进 IE5.0 版本中。随后，Mozilla基金会进行标准化，于2002年6月5日正式成为Web标准。从2004年开始，各大浏览器开始逐步适配 XMLHTTPRequest ，随着jQuery于2006年8月26日发布，互联网XMLHTTPRequest也随之开启了新的时代。

不过由于XMLHTTPRequest的设计不符合现代语言，且接口设计复杂，2015年，Github团队开始推动 fetch API的标准化，很快就得到各大浏览器的适配，并于2017年5月20日正式成为W3C标准。

从微软提出XMLHTTPRequest到标准化，用了7年时间，fetch API的标准化更迅速，只用了2年时间。