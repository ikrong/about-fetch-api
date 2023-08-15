## EventStream 和 EventSource

根据流式API的特点，WEB支持了一种服务器向客户端发送持续流的通信模式，被称为 EventStream 事件流。基于事件流，浏览器可以不间断向客户端发送数据，客户端可以逐步进行处理，用户体验非常好。

EventStream 数据格式本质是文本，单次格式如下：

```
event: name
id: 1
data: 数据
retry: 3000
// 换行
// 换行
```

最后2个换行不能省略
