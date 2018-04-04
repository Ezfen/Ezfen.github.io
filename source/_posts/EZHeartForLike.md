---
title: 穿越的桃心~
date: 2016-05-21 15:23:18
tags: 
- Animation
typora-copy-images-to: ipic
---

最近没事看看Instagram的时候，对于双击点赞的功能感觉蛮Like。所以就想自己仿照做一个。但是嘞，直接仿造感觉不是很好玩，所以就自己想添加点新东西，因此就有了EZHeartForLike。:)

<!--more-->

![EZHeartForLike_logo](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/pwmtz.png)    
效果图(第一张是双击图片触发，第二张是单击按钮)：
![](https://raw.githubusercontent.com/Ezfen/EZHeartForLike/master/double.gif)       ![](https://raw.githubusercontent.com/Ezfen/EZHeartForLike/master/single.gif)    
先说说这是个什么东西。    
一开始我是在Instagram的基础上开始做的。双击点击图片可以弹出一个桃心，随即下面的小桃心点亮。完成点赞的操作。like this(专门截了我❤️GEM❤️过来，Instagram的心挡住她的脸了。。。)：
![EZHeartForLike_gem](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/37lsw.jpg)    
好吧，尺寸是是用我又爱又恨的4S的 320 x 480    
紧接着就想，能不能实现大桃心一边移动一边缩小，最后到大小桃心的位置并替换它？！就像上面最终效果一样
![aixin](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/4p80z.jpg)
很快我遇到问题：如果两个桃心都在同一个View中，话甘易啦！！！但是现在的情况是两个桃心并不在同一个View中（现实中很多情况都不会），**位置不明确**是一个Super巨大的问题。因此跨View的动画是EZHeartForLike是这次的主要话题。当然动画是使用UIView来实现的~~    
那么，讲讲我的思路历程吧：    
首先，我想了下能不能在一个EZHeartForLikeView中分别放入下列三个View，已实现我的想法：    
* ContentView ：用于让用户将自己的View放入其中。类似iOS8里面的UIVisualEffectView的contentView一样。    
* SmallHeart ：被当做按钮的小桃心，是Public的，提供给用户改造它的样式、大小、位置等。 
* BigHeart ：出现在图片(ImageView)中的大桃心

在我自己涂涂画画后是这样的：    
![EZHeartForLike_begin](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/r0ov5.jpg)

一开始觉得可能能行，因为两个桃心都在同一个View中(EZHeartForLikeView)，要实现动画应该是没什么问题，但是后来想到，既然我把小桃心作为Public对外提供，那么用户就可以将它放入自己的View中。因此这个想法很快被否了。。。

这个问题让我便秘了两天，哈哈哈哈。后来在洗澡时想到一个或许能解决问题的方法，虽然大小桃心的位置都不清楚，但是他们至少有同一个SuperView，或许加以利用就能实现这个想法。谁知道嘞，试一下吧：    
简单一句话就是：**找到相同的SuperView，映射坐标，在SuperView上完成动画的实现**    
![EZHeartForLike_findview](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/1c4s3.jpg)
具体怎么找到相同的SuperView嘞，那就要扯到另外一个算法了，那就是判断两条链表是否相交，且交点是哪一个的问题。    
这里我又要祭出我的灵魂画风了
![EZHeartForLike_lianbiao](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/e0q6r.jpg)    
实现起来其实不是能难，且看代码：

``` objc
- (UIView *)findTheMutualSuperView {
    // 找出小桃心（self）和大桃心（self.BigHeart）的共同的SuperView
    // 计算self到UIWindow的距离（以中间View的层数为距离计量）
    UIView *view1 = self;
    NSInteger smallViewSuperViewCount = 0;
    while (![view1 isKindOfClass:[UIWindow class]]) {
        smallViewSuperViewCount ++;
        view1 = view1.superview;
    }
    // 计算self.BigHeart到UIWindow的距离（以中间View的层数为距离计量）
    UIView *view2 = self.BigHeart;
    NSInteger bigViewSuperViewCount = 0;
    while (![view2 isKindOfClass:[UIWindow class]]) {
        bigViewSuperViewCount ++;
        view2 = view2.superview;
    }
    // 共同的SuperView之后的View肯定是一致的，因此小桃心和大桃心到UIWindow的距离之间的差
    // 实在共同的SuperView之前就存在的。所以，判断二者到UIWindow的距离大小，并利用两者之间
    // 的差距就可以找到共同的SuperView
    NSInteger mutualViewCount = labs(smallViewSuperViewCount - bigViewSuperViewCount);
    view1 = self;
    view2 = self.BigHeart;
    if (smallViewSuperViewCount > bigViewSuperViewCount) {
        for (int i = 0; i < mutualViewCount; ++ i) {
            view1 = view1.superview;
        }
    } else {
        for (int i = 0; i < mutualViewCount; ++ i) {
            view2 = view2.superview;
        }
    }
    while (view1 != view2) {
        view1 = view1.superview;
        view2 = view2.superview;
    }
    return view1;
}
```

有了上面的思想，映射坐标同样变得简单：

``` objc 
    //映射两个Heart的坐标。
    // 首先是小桃心(self)
    UIView *view1 = self;
    CGPoint smallHeartPoint = CGPointZero;
    while (view1 != mutualSuperView) {
        smallHeartPoint.x += view1.frame.origin.x;
        smallHeartPoint.y += view1.frame.origin.y;
        view1 = view1.superview;
    }
    // 其次是大桃心(self.BigHeart)
    UIView *view2 = self.BigHeart;
    CGPoint bigHeartPoint = CGPointZero;
    while (view2 != mutualSuperView) {
        bigHeartPoint.x += view2.frame.origin.x;
        bigHeartPoint.y += view2.frame.origin.y;
        view2 = view2.superview;
    }
```

既然得到两个桃心的坐标了，实现动画就自然变得简单啦，就不赘述了:)    
有兴趣的同学可以查看我的[Github](https://github.com/objchris/EZHeartForLike)，可以下载在项目中，顺便给我个Like吧![hahaha](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/pivxc.jpg)