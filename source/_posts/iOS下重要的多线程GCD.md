---
title: iOS下重要的多线程GCD
date: 2016-03-13 12:15:06
tags: 
- iOSThread
 
---

**多线程**是每个系统都必须具备的功能，带给用户更多的便利，伴随着友好度的提升，APP的被使用率和被使用频率也会更加高。    
此篇笔记参考了网络上一些好文，学习到了很多。在Ray Wenderlich上摘录了一些队列的常用情景，希望自己得到提高的同时分享给大家。

<!--more-->
![](https://koenig-media.raywenderlich.com/uploads/2014/01/Concurrency_vs_Parallelism.png)

## 一些概念

### 串行（Serial）与 并发（Concurrent）
- 任务串行，意味着在同一时间，有且只有一个任务被执行，即一个任务执行完毕之后再执行下一个任务。
- 任务并发，意味着对于用户体验，在同一时间，有多个任务被执行。

### 同步（Synchronous）与 异步 （Asynchronous）
- 同步派发(sync)会尽可能地在当前线程派发任务。但如果在其他队列往主队列同步派发，任务会在主线程执行。 
- 异步派发(async)也不绝对会另开线程。例如在主线程异步派发到主线程，派发依旧是异步的，任务也会在主线程执行。

同步异步的重要区别在于派发方法是否需要等待 block 完成后才能返回。

### 临界区（Critical Section）
一段代码不能被并发执行，也就是，两个线程不能同时执行这段代码。这很常见，因为代码去操作一个共享资源，例如一个变量若能被并发进程访问，那么它很可能会变质（它的值不再可信）。

### 死锁（Deadlock）    
停止等待事情的线程会导致多个线程相互维持等待，即死锁。    
两个（或更多）线程卡住了，等待对方完成或执行其它操作。第一个不能完成是因为它在等待第二个的完成。但第二个也不能完成，因为它在等待第一个的完成。

### 线程安全（Thread Safe）
线程安全的代码能在多线程或并发任务中被安全的调用，而不会导致任何问题（数据损坏，崩溃等）。线程不安全的代码在某个时刻只能在一个上下文中运行。一个线程安全代码的例子是NSDictionary。你可以在同一时间在多个线程中使用它而不会有问题。另一方面，NSMutableDictionary就不是线程安全的，应该保证一次只能有一个线程访问它。更多请看：[helpful and somewhat chilling list](https://developer.apple.com/library/mac/documentation/cocoa/conceptual/multithreading/ThreadSafetySummary/ThreadSafetySummary.html)

### 上下文切换（Context Switch）
一个上下文切换指当你在单个进程里切换执行不同的线程时存储与恢复执行状态的过程。这个过程在编写多任务应用时很普遍，但会带来一些额外的开销。

### 并发（Concurrency）与 并行 （Parallelism）
并行要求并发，但并发不能保证并行，就计算机操作系统来说，开启线程是很耗性能的，也就是说，事实上，在某次并发处理任务中，开启的线程是有上限的，如果上限为2，即每次开启的新线程为2，那么是有可能出现并发却不并行的情况。
并发代码的不同部分可以“同步”执行。然而，该怎样发生或是否发生都取决于系统。多核设备通过并行来同时执行多个线程；然而，为了使单核设备也能实现这一点，它们必须先运行一个线程，执行一个上下文切换，然后运行另一个线程或进程。这通常发生地足够快以致给我们并发执行地错觉，如下图所示： 
![](https://koenig-media.raywenderlich.com/uploads/2014/01/Concurrency_vs_Parallelism.png)


## 队列（queue）

|  队列  |   线程   |
| :--: | :----: |
|  串行  | 当前线程运行 |
|  并发  | 另开线程运行 |

### 串行队列（Serial Queues）
---
![](https://koenig-media.raywenderlich.com/uploads/2014/01/Serial-Queue.png)
`dispatch_queue_create("com.selander.GooglyPuff.photoQueue",DISPATCH_QUEUE_SERIAL);`    
串行队列最典型的是**main queue**：主线程所对应的queue，主要用于更新UI。


### 并发队列（Concurrent Queues）
---
![](https://koenig-media.raywenderlich.com/uploads/2014/01/Concurrent-Queue.png)
`dispatch_queue_create("com.selander.GooglyPuff.photoQueue",DISPATCH_QUEUE_CONCURRENT);`    
除了通过DISPATCH_QUEUE_CONCURRENT创建的queue外，系统提供了Global Dispatch Queues：分别有四种优先级（background, low, default, high）    
`dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0)`


## GCD语法和适用范围

### dispatch_sync

![](https://koenig-media.raywenderlich.com/uploads/2014/01/dispatch_sync_in_action.gif)    
- 串行队列：Caution！！需要注意不能往本队列派发任务，否则会造成死锁。    
- 并发队列：√


### dispatch_async

![](https://koenig-media.raywenderlich.com/uploads/2014/01/dispatch_async_in_action.gif)    
- 串行队列：√    
- 并发队列：√


### dispatch barriers

![](https://koenig-media.raywenderlich.com/uploads/2014/01/Dispatch-Barrier.png)    
正如上图所示：使用dispatch\_barriers\_sync或dispatch\_barries\_async会在你创建的队列中插入Barrier Block，而这个Block被执行时确保当前仅有一个任务在执行中。这就很好地在并发队列中保持一段暂时串行的任务执行顺序。这很适合于：如对某一个数组或存储结构添加数据时，就可以将该任务作为Barrier Block插入到队列中，即保证了该数组的原子性，防止脏数据的产生。    
- 串行队列：完全没必要....
- 并发队列：√

#### read and write 读写问题

```
- (void)addPhoto:(Photo *)photo 
{ 
if (photo) { // 1 
dispatch_barrier_async(self.concurrentPhotoQueue, ^{ // 2 
[_photosArray addObject:photo]; // 3 
dispatch_async(dispatch_get_main_queue(), ^{ // 4 
[self postContentAddedNotification]; 
}); 
}); 
} 
}
```
```
- (NSArray *)photos 
{ 
__block NSArray *array; // 1 
dispatch_sync(self.concurrentPhotoQueue, ^{ // 2 
array = [NSArray arrayWithArray:_photosArray]; // 3 
}); 
return array; 
}
```

### dispatch_after

dispatch\_after有一个非常使用的情景：当你需要在APP启动时让启动图片再显示就一些，让APP有更充足的时间准备一些初始化的工作时，就使用dispatch\_after.而且正如下文将说到的：dispatch\_after最好只在main queue中使用。
```
double delayInSeconds = 1.0; 
dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC)); // 1 
dispatch_after(popTime, dispatch_get_main_queue(), ^(void){ // 2 
if (!count) { 
[self.navigationItem setPrompt:@"Add photos with faces to Googlyify them!"]; 
} else { 
[self.navigationItem setPrompt:nil]; 
} 
}); 
```
**只能用于Main Queue！！！！！！！！！！！！！！**

### dispatch_once

```
static PhotoManager *sharedPhotoManager = nil; 
static dispatch_once_t onceToken; 
dispatch_once(&onceToken, ^{ 
sharedPhotoManager = [[PhotoManager alloc] init]; 
sharedPhotoManager->_photosArray = [NSMutableArray array]; 
}); 
return sharedPhotoManager; 
```

### dispatch_groups

```
dispatch_group_t downloadGroup = dispatch_group_create(); 
//任务开始之前要执行下面的enter函数 
dispatch_group_enter(downloadGroup); 
//在任务结束的时候要执行下面的leave函数 
dispatch_group_leave(downloadGroup); 
dispatch_group_wait(downloadGroup, DISPATCH_TIME_FOREVER);//阻塞进程等待所有任务结束 
// or 交给group通知 
dispatch_group_notify(downloadGroup, dispatch_get_main_queue(), ^{ // 4 
if (completionBlock) { 
completionBlock(error); 
} 
}); 
```
group中的任务不一定在同一个queue里面。串行队列和并发队列都可用。
- 串行队列：√    
- 并发队列：√

### dispatch_apply

```
dispatch_apply(3, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^(size_t i) { 
}//就像for循环一样
```
- 串行队列：没什么必要....串行队列使用跟普通的循环没有区别。
- 并发队列：√


---
参考文献：

[Grand Central Dispatch In-Depth: Part 1/2](https://www.raywenderlich.com/60749/grand-central-dispatch-in-depth-part-1)

[Grand Central Dispatch In-Depth: Part 2/2](https://www.raywenderlich.com/63338/grand-central-dispatch-in-depth-part-2)