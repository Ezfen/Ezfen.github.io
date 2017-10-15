---
title: 类方法的Block不会内存泄漏....吗？！

date: 2016-7-17 19:57:39

tags: 
- Block

---

Block在很多时候会引起循环引用，已经是老生常谈了。很多文章在讲述Block的时候都会谈及这个问题：    
在一个对象中有着对Block的强引用，而在该Block中又保留着对该对象的强引用。循环引用所带来的后果相信大家也知道，有一个环存在，就意味着每次创建该对象，就会占据一定的内存不会被释放，等到内存不足以继续维持该App的存在时，就会Crash。    

<!--more-->
　　常见的解决方法是使用__weak或将有可能造成循环引用的对象作为Block的参数传入。    
　　循环引用我不打算在此展开，因为有很多好的文章已经讲得很详细，大家可自行找找。    
　　
　　很多文章提及：循环引用所针对的是对象，能够形成环的是“对象——Block——对象”。换种方式思考，类方法就不会造成相似的内存泄漏。真的是这样吗？！    
　　**不是。**    
　　**不是。**    
　　**不是。**    

## 举个栗子

　　平常使用UIView的Animation之时，例如`[UIView animateWithDuration:animations:];`使用Block可以方便快捷地将设置需要变换的属性。对于类方法可以放心地写self而不必担心循环引用的问题。但是，对于`[UIView animateWithDuration: animations: completion:];`除了在动画结束时做一些操作外，当我们需要动画循环播放的时候，很常用的方法类似于：     


``` objectivec
- (void)startAnimation {
    [UIView animateWithDuration:3.5 animations:^{
        CGRect frame = self.initFrame;
        frame.origin.y += 2 * self.initFrame.size.height;
        self.frame = frame;
    } completion:^(BOOL finished) {
        self.frame = self.initFrame;
        [self startAnimation];		// 递归调用，再次执行此函数
    }];
}
```

　　别告诉我你没这样用过，科科。    

　　如果你也像我这么写，可能已经埋下了潜在的内存泄漏的危险。    

　　我们通过Instruments来看看是否真的有内存泄漏(例子中EZScanNetGrid是我自定义的View,View中有执行动画的代码，见上方代码块，QRCodeScanner是对应的Controller)：    

1. 多次创建QRCodeScanner并销毁：
   ![self](http://7xs4ed.com1.z0.glb.clouddn.com/block_self.jpg)    
   QRCodeScanner被销毁后：
   ![self](http://7xs4ed.com1.z0.glb.clouddn.com/block_self2.jpg)     


2. 将上述代码的self改成weakSelf，再来看看Instruments：
   ![weakSelf](http://7xs4ed.com1.z0.glb.clouddn.com/block_weakSelf.jpg)     
   QRCodeScanner被销毁后：
   ![weakSelf](http://7xs4ed.com1.z0.glb.clouddn.com/block_weakSelf2.jpg)     


　　结果很明显，若是使用self，EZScanNetGrid这个View一直存在于内存中没有被释放，因为UIView Animation对其的强引用使其一直存在于内存中，直至Block里面的代码执行完毕。但是这段代码里可以看到，completion中又继续调用了`[self startAnimation];`因此，系统会继续保留对EZScanNetGrid的引用，从而即使EZScanNetGrid的SuperView被销毁了，EZScanNetGrid还是没有被销毁，无限地循环调用着动画，占据内存的同时也耗费着CPU。:(


## 总结

1. 关于Block的内存泄漏不只是循环引用会引起。
2. 不仅仅是UIView，其他将Block作为参数的类方法，如果在一个Block中递归调用到本Block，记得将引用的对象加上\_\_weak。你说，在Block被调用的时候self被释放了怎么办？！去看看\_\_strong的资料吧。
3. ~~很多iOS的类方法传入的Block是\_NSConcreteStackBlock，可见\_NSConcreteStackBlock也会对Block中的对象保持强引用。(待考究)~~确实，没有强指针引用的block都是StackBlock，表面看起来系统API传入的Block都是StackBlock，但是以下四种情况：
   1.手动调用copy    
   2.Block是函数的返回值    
   3.Block被强引用，Block被赋值给__strong或者id类型    
   4.调用系统API入参中含有usingBlcok的方法    
   系统都会默认调用copy方法把Block复制到堆中，变成MallocBlock，会对对象进行持有。
4. 关于ARC和MRC下的三种Block是否能执行，请做做这几道测试题[Objective-C Blocks Quiz](http://blog.parse.com/learn/engineering/objective-c-blocks-quiz/)
