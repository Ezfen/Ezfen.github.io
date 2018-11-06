---
title: iOS Touch Event传递和响应链
date: 2017-02-27 18:54:59
id: 8539A86063B11E16
tags: 
- UIView 
typora-copy-images-to: ipic
---

本来不想重复造轮子，因为网上已经很多关于 iOS 触碰事件传递响应链的文章，而且苹果官方文档也已经解释得很清楚。但是上周和朋友吃饭的时候聊到却不能很好地将想法表达出来，所以感觉还是写一写，加深印象吧～

<!-- more -->

毋庸置疑地，在论及事件传递的时候我们都会很顺口地使用用上下方向来表达事件传递( Event Delivery )，从 UIApplication 到响应事件的 UIView 是「从下往上」，反过来自然就是「从上往下」了。

## 从下往上——寻找 HitTest View

当一个用户产生的事件发生并被系统捕获到后，UIKit会创建一个事件对象( Event Object )，携带着一些处理信息，eg: 点击位置、事件类型等，然后将这个对象存放在 UIApplication 的事件队列中，等待处理。

我们开发中使用的最多的是触碰事件( Touch Event )，也只有触碰事件才需要 iOS 为我们寻找 **HitTest View** ，即**寻找响应该事件的 View **，这一过程，官方文档里称为 ***Hit-Testing*** 。

了解这一过程，先了解 UIView 的两个可重载的方法：

1. `- (BOOL)pointInside:(CGPoint)point withEvent:(UIEvent *)event`

   传入的参数类型是`CGPoint point`和`UIEvent *event` ，分别表示拥护触碰事件的**触碰点**和对应的**事件**，event 可为`nil`，返回的是`Boolean`表示 point 是否在当前 View 的Bounds中。

2. `- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event`

   同样，传入的参数类型是`CGPoint point`和`UIEvent *event` ，event 可为`nil`(我们本次讨论的是触碰事件的 Hit-Testing ，自然此参数不会为空)，此方法返回的是 point 所在的 View 。



`hitTest:withEvent:`内部会先调用`pointInside:withEvent:`，来检测触碰点是否在当前View中

- 若返回`NO`,则直接返回`nil`，且所有的 SubView 都不会响应当前事件。所以，敲重点啦，对于`clipsToBounds`设置为`NO`，允许 SubView 向外延伸的 View ，需要重载`pointInside:withEvent:`，例如：

  ![TouchEvent_WechatIMG3](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/rkb9k.jpg)

  ```objective-c
  - (BOOL)pointInside:(CGPoint)point withEvent:(UIEvent *)event{
    	//以下是伪代码  
    	if (point inside blueArea) return true;
    	else return false;
  }
  ```

  如果没有重载`pointInside:withEvent:`，那么用户点击上图触碰点，SubView 将不响应事件。


- 若返回`YES`，则调用所有 SubView 的`hitTest:withEvent:`，继续寻找 HitTest View 。在视图层级树(这样翻译?!  view hierarchy )中**最后添加的叶结点**且**包含触碰点**的 View 就会光荣地成为 **HitTest View** (如下图最后一个 UIView )，首先接受事件，并做下一步操作——寻找响应对象。

  ![TouchEvent_WechatIMG1](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/zedzb.jpg)



我们也可以在中途截断系统的 Hit-Testing ，如果你想让某个 View 的所有 SubView 都不响应事件，最简单的就是重载该 View 的`hitTest:withEvent:`，返回 View （自己响应点击事件）或者`nil`（都不响应）。

```objective-c
-(UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    //return nil; 本View和SubView都不成为HitTest View，都不响应事件
  	return self;	// 自己成为HitTest View
}
```

## 从上往下——寻找响应对象

![1387344-cd500e5bd93d9606](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/2fznc.png)

这张图相信在其他地方已经看了一千遍了，但是有图还是容易理解，从上往下的意思是：

当上一步找到的 HitTest View 没能响应事件时( eg: userInteractionEnabled 为 NO 或者没有定义响应事件的方法)，那么事件就会被传递到 SuperView 或着 Controller 。直至 Applicaion 都不能处理该事件则忽略。

需要注意的是：这里的传递只会给 SuperView 或着 Controller ，并不会传递给与自己相同级别的 View ，除非你自己控制。

iOS10的 UIResponder 中定义了两个新的 Property ：

1. `nextResponder(Swift是next)`：这个比较蛋疼，因为 UIResponder 中它默认返回的是nil，所以如果我们想让特定的 Responder 响应事件，我们需要在我们的类中重载 Get 方法，返回自己想要的下一个 Responder 。
2. `isFirstResponder`：判断当前View或 Controller 是否为即将响应事件的 Responder 。不能明白？！那么想想这两个方法：`becomeFirstResponder`和`resignFirstResponder`：）

## 总结

废话了这么多，三点：

1. iOS 的 Touch Event 先「从下往上」寻找 HitTest View ( FirstResponder )，再「从上往下」寻找真正响应该事件的 Responder 。
2. 可以通过重载`hitTest:withEvent:`，决定 HitTest View ，即最开始**接收（敲重点，只是接收）**事件的 Responder 。
3. Responder 不一定会响应事件，看有没有响应事件的方法。



所以，以后如果有人问你：两个View重叠在一起，在上面的 View 将下面的 View 完全覆盖，且上面的 View 不能响应事件，下面的 View 会响应吗？

你不如先反问一句，两个 View 是否为 SuperView 和 SubView 的关系？！

再分门别类地回答～

以上



## 参考文献

[Event Handling Guide for iOS](https://developer.apple.com/library/content/documentation/EventHandling/Conceptual/EventHandlingiPhoneOS/event_delivery_responder_chain/event_delivery_responder_chain.html#//apple_ref/doc/uid/TP40009541-CH4-SW1)

