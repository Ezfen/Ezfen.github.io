---
title: 《Beauty》项目小总结
date: 2017-07-17 20:48:15
id: FCDAE83256354451
tags: 
- Summary
typora-copy-images-to: ipic
---

三月底开始了自己的第一个外包项目“Beauty”，App的名字是“CHARMER”，是一个促进美容技师和客户之间达成服务协议的App，搭建供求双方沟通和交易的桥梁和平台。在做完第一版之后，几乎每晚都需要修改功能修复Bug，现在突然间一段时间没有了消息，应该算是完结了。    

<!--more-->

2017-10-12 更: 项目运营烂尾，最后好像没有上架，难过ing… :(

## 所做的事情

总的来说，有这么几个功能：

- 用户端：

  1. 通过Google地图查看当前附近且在线的技师

  2. 添加信用卡等信息，使用Paypal支付

  3. 查看、修改个人信息

  4. 发布公共订单给每个美容技师，技师可以通过竞标得到订单

  5. 查看技师信息，收藏喜爱的技师

  6. 发布私有订单给特定技师

  7. 订单结束评价，打分等

  8. 提供其他用户和技师的电话联系方式

- 技师端：

  1. 竞标用户的公共订单    

  2. 接受或拒绝用户的私有订单

  3. 添加银行卡，得到订单报酬

  4. 查看、修改个人信息，查看收入数据，

  5. 提交封面图片，作品图片

  6. 增删改查服务信息、价格

     ​

## 一些具体实现

　　基本实现下来都不是特别难，所以挑一些值得记录的写下来：

### 项目文件结构

![Beauty_项目大致结构](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/yjc6f.png)

　　因为App是用户与技师统一客户端，所以，对于每个Module，都分成Charmer和User分别对应技师和用户，再在其下分为Model、View、Controller，很常见的MVC架构。    

　　这样做的好处是，文件结构清晰，分类清楚，一下子就能找到需要的文件（虽然搜索才是最快的>w<）。但是有个问题就出现了，前面有提到说：用户与技师统一客户端，那就不免有界面相同的情况出现，这次开发使用的解决方案是复用所有相同的文件，这个错误的决定让后期维护的我一直想狠扇自己嘴巴。毕竟面向不同的使用团体，很多功能需要定制，所以后期加新需求的时候只能一直if-else，if-else，if-else。惨绝人寰～      

　　觉得，以后再有这样的情况出现，视类的复杂程度和文件的大小而定， 可能会重写一个同样实现的类文件，感觉这条线很难界定，只能靠以后的开发经验去慢慢学。     



### 地图

![Beauty_Google地图_小](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/m8ev4.jpg)

　　因为App即将在香港上线，自然地使用Google地图。第一次用Google地图做开发，感觉跟百度、高德没有太大的区别， 有一点就是：文档基本只有官方文档，遇到问题要Google，基本都是讲百度或高德。关于Google地图，后面再重新写篇文章介绍，包括使用，自定义Marker（地图上紫色的标志），PopView（点击Marker弹出的View）     



### 左侧滑动菜单

![Beauty_左边栏](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/1h42p.jpg)

　　图片好像压缩得有点过分了....

　　一开始左侧滑动菜单是主界面Controller的一个View，所以滑动的时候会被上方的Navigation Controller（Navigation Bar）遮挡住，可以想象是多么吃藕。后来在滑动的时候动态隐藏和显示Navigation Bar，就出现了诡异的上面一整条高度为64px的空白区域，发现更吃藕了...

　　所以在AlertController的启发下，决定用UIWindow来解决这个问题，正如巧神[《iOS开发进阶》](https://book.douban.com/subject/26287173/)一书的第十二章提及，使用UIWindow在所有View（当然包括当前Window的Navigation Bar）前展示自己想要的内容，所以有了下面的代码：

```objective-c
- (void)viewDidLoad {
	_window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
	_window.windowLevel = UIWindowLevelNormal;
	_window.backgroundColor = [UIColor clearColor];
	_window.hidden = YES;
	BECDrawerView *view = [BECDrawerView new];
	//省略对view的一些初始化代码
	_leftView.frame = CGRectMake(0, 0, MYScreenWidth * 0.8, MYScreenHeight);
	_leftView.center = CGPointMake(- MYScreenWidth * 0.4, _leftView.center.y);
	_leftView = view;
	//一开始先把leftView隐藏
	_leftHidden = YES;
	_leftView.hidden = _leftHidden;
	[_window addSubview:_leftView];
    
	UIScreenEdgePanGestureRecognizer *edgeGesture = [[UIScreenEdgePanGestureRecognizer alloc] initWithTarget:self action:@selector(handleRightPanGesture:)];
	edgeGesture.delegate = self;
	edgeGesture.edges = UIRectEdgeLeft;
	[self.view addGestureRecognizer:edgeGesture];
}

// 手势事件
- (void)handleRightPanGesture:(UIPanGestureRecognizer *)panGesture
{
    CGPoint translation = [panGesture translationInView:_window];
    if (translation.x > 0 && panGesture.state == UIGestureRecognizerStateEnded) {
        [self popLeft];
    }
}

// 此函数用于弹出左侧滑动菜单
- (void)popLeft
{
    [self addLeftGestures];	//添加滑动手势，这里代码就不贴出了
    [_window makeKeyWindow];
    _window.hidden = NO;
    [_window bringSubviewToFront:_leftView];
    
    _leftHidden = !_leftHidden;
    
    if (_leftHidden == YES) {
        [self removeLeftGestures];
        [_popview removeFromSuperview];
        NSLog(@"removed");
        self.navigationController.navigationBar.hidden = NO;
    }
    
    else {
        if (!_popview) {
            self.popview = [UIView new];
            _popview.backgroundColor = [UIColor clearColor];
            _popview.frame = _window.frame;
            [_window addSubview:_popview];
            [_window insertSubview:_popview belowSubview:_leftView];
        }
        _popview.hidden = NO;
        [_window addSubview:_popview];
        [_window insertSubview:_popview belowSubview:_leftView];
    }
    
    CATransition *animation = [CATransition animation];
    if (_leftHidden == NO) {
        _leftView.frame = CGRectMake(0, 0, MYScreenWidth * 0.8, MYScreenHeight);
        animation.type = kCATransitionMoveIn; // 动画过渡类型
        animation.subtype = kCATransitionFromLeft; // 动画过渡方向
        _leftView.hidden = NO;
    }else{
        _leftView.center = CGPointMake(- MYScreenWidth * 0.4, _leftView.center.y);
        animation.type = kCATransitionPush;
        animation.subtype = kCATransitionFromRight; //动画过渡方向
        _leftView.hidden = YES;
        NSLog(@"%@",self.navigationController.navigationBar);
    }
    animation.duration = 0.3; // 动画持续0.3s
    // 代理，动画执行完毕后会调用delegate的animationDidStop:finished:
    animation.delegate = self;
    [_leftView.layer addAnimation:animation forKey:nil];
    
}
```



### CHARMER PROFILE

![Beauty_CollectionView](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/f7cwa.jpg)

　　技师Profile页面，为什么会拿出来写？！是因为Conllection Viewz在日常开发中非常非常非常常见。基本每个App都会用到（TableView是特殊的Conllection View）。这个Collection View分为三部分：

1. 最上方的HeaderView是一个跑马灯，使用了之前写过的一个小组件[EZRecycleImageView](https://github.com/objchris/EZRecycleImageView)，在开发中边使用边改进是最好不过的事情了。
2. 第二个Header是技师信息和三个按钮
3. 最后是最下面的View，三个按钮分别对应不同的内容，第一二个使用的是CollectionView，即在CollectionView中再嵌入CollectionView；最后一个是TableView，即在CollectionView中再嵌入CollectionView。

　　View里面嵌入View的复杂结构也是很值得掌握的手法~



　　还有很多开发过程中的代码和解决方案，因为是别人的项目，非开源，就不一一列出啦~但是我还是信仰Open Sourcede der~~     

　　最后附上使用的第三方库：

```
platform :ios, "8.0"
target :Beauty do
pod 'SVProgressHUD', '~> 2.0.3'
pod 'Masonry', '~> 1.0.2'
pod 'AFNetworking', '~> 3.0'
pod 'SDWebImage', '~>3.8'
pod 'YYModel'
pod 'IQKeyboardManager'
pod 'GoogleMaps'
pod 'MJRefresh'
pod "MWPhotoBrowser"
pod 'JPush'
pod 'PayPal-iOS-SDK'

end
```





## 总结与反思

- 好的方面：

  1. 一位好Partner，一位一起奋斗的好朋友。

  2. 很多UI控件和底层实现都接触到了，加深了印象。

  3. 真正接触并使用到优秀的第三方框架，以后在开发过程中如果遇到适用的情况就不会因为无知而重复造轮子（可能还造不好….）。

  4. 积累了经验，这个App算是自己一个比较完整开发的App。整个开发流程虽然没有公司项目那么正规，但是一些相关的文档、说明还是不缺的。

- 不好的方面：

  1. 首先在架构上没有考虑好，这个其实也不是可控的。一开始拿到的项目结构已经定好，没办法更改，且时间也紧，无法推翻之前写过的代码重新思考和重建。

  2. 其次，在和Partner之间的沟通自我觉得不足，我的被动是我这次开发体验一般的重大引子。感觉自己做得不好，有点对不起自己的Partner。

  3. 客户的有些需求异常反人类，所以很多时候我的意见不能得到很好的反馈和解决。需求经常改动，且我的Partner才是和客户沟通的中间者，不能直面客户我很苦恼。


