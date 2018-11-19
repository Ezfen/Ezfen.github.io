---
title: 我想...修复一个已发布软件的BUG
date: 2018-11-7 14:53:07
tags: 
- Security
typora-copy-images-to: ipic
---

事实上，我也没想过会是以这种形式接触逆向工程，我甚至不知道这样是不是就叫逆向工程，事情的起因就只是想省下一笔买蓝牙键盘的钱，惭愧。

<!--more-->

## 背景与目的

对全面屏 iPad Pro 的青睐已久，在今年 10 月 30 号 发布之后就剁手买了一个。不想买配套键盘，一是觉得与 iPad 的设计初衷向违背，移动办公不想多个累赘的键盘；二是一千三百多大洋着实让我望而却步，感觉不是很值得吧。而且平时用 iPad 也没用键盘，小部分时候确实不方便。今天看着电脑键盘突然想到，能不能通过 Mac 来连接 iPad ，充当 iPad 的键盘呢？

起初想学学自己写个 Mac 端的 App ，发现成本略高，遂转去寻找市面上是否有满足的 App。发现了一款：1Keyboard 。不过很久没更新，上一次已是 2016 年。看了 App Store，68 大洋。

使用的过程中，我发现了一个可能是 BUG 的无脑设定，十分影响使用，所以寻思着看看能否自己解决，于是我要对 1Keyboard 开刀了。

## 工具

- class-dump —— 导出一个二进制文件的头文件等信息。

- Hopper Disassembler —— 反汇编分析工具。
- lldb —— Xcode 自带的调试器。

- Hex fiend —— 二进制文件编辑器。

## 开刀

### 为什么要开刀

正如医生对症下刀一样，病人接受临床手术必定是身体机能有问题。 1Keyboard 的问题在于：一个可能是 BUG 的无脑设定。

实话，第一次的尝试『 macOS 10.14 连接 iOS 12.1 ( iPhone ) 』给我留下的印象还是很好的，输入的东西很快地在我的手机上显示出来，时延低。但是我在 Mac 上码字习惯用 Caps Lock 来切换输入法，事实上，1Keyboard 应该也是支持 Caps Lock 来更换移动设备的输入法的（我看到 iPhone 上输入法已经切换），但在 Mac 上弹出的类似 HUD 的窗口竟然出现了一个 Sheet ？！

![Screen Shot 2018-11-07 at 4.07.39 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/8f3t1.png)

What ？！！ 这种感觉就好像代码的某个位置接收到键盘 Caps Lock 事件时命名奇妙地执行了这样一段代码：

```objective-c
NSAlert *alert = [[NSAlert alloc] init];
alert.alertStyle = NSAlertStyleInformational;
alert.messageText = @"Use the fn Key + media keys to control playback and volumn";
[alert beginSheetModalForWindow:window completionHandler:nil];
```

这个提示是好的，让我知道我还能通过 Fn + 的组合去调节移动设备的音量、亮度等。但不应该是以这种情况出现的。

所以，很明显——这次的临床手术就是**找到这个 BUG 并解决它**。

### 初探 1Keyboard

我们知道 App 的执行代码最后都编译链接成一个二进制文件，而 1Keyboard 的二进制文件就是 1Keyboard.app/Contents/MacOS/1Keyboard 。绝大多数的操作都是对这个二进制文件进行的。

了解一个软件，我们都需要从头文件开始做起。先看看软件中存在哪些类，类中都有些什么函数。这时候，我们第一个工具 class-dump 就起作用了。

将 class-dump 放在与 App 放在同一个文件夹下，然后在终端执行命令，看看里面有哪些头文件：

```shell
class-dump -H 1Keyboard.app/Contents/MacOS/1Keyboard -o ./Headers
```

运行结束后在当前目录中会有一个叫 Headers 的文件夹，里面就包含了 1Keyboard 的头文件。此时会看到，几十个头文件，密密麻麻不知道从何看起。

### 第一次寻找突破点

还记得前面的截图吗？！在出现问题的时候，我们使用的窗口是仅仅是类 HUD 的一个 Windows。那突破口应该就是一个 Controller 或者一个 Window 。在头文件里找，很快地找到一个疑似的 BoxViewController.h 。

![Screen Shot 2018-11-08 at 11.44.52 AM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/qcyfk.png)

一个疑似的函数也出现了：`- (void)handleKeyboardEvent:(id)arg1`。感觉像是用来处理键盘事件的。

找到点苗头，接下来就是看看函数实现能否印证我们的猜测。

打开 Hopper Disassembler ，将 Macos 文件夹下的二进制文件拖入其中，会得到很多汇编代码，如下图：

![Screen Shot 2018-11-08 at 11.56.02 AM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/w7f2s.png)

汇编是低层的编程语言，写 C 时有可能会在函数中间插入一小段，还有使用 Xcode 调试的时候也经常能看到，但是没有深入的学习，是没法了解其中指令的含义，在本次逆向，我们就先忽略它们。

左边栏的 Tag Scope 可以选择类，或者通过上方的搜索框，我们可以轻松地找到我们想要的 BoxViewController 。随即下方出现 BoxViewController 类中被实现的函数。同样，找到 `[BoxViewController handleKeyboardEvent:]` 

![Screen Shot 2018-11-08 at 12.03.21 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/qeb6a.png)

:[ 还是汇编代码。不过，我们可以通过

![Screen Shot 2018-11-08 at 12.04.41 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/8futb.png)

第三个选项 if(b) f(x); 转换成伪代码，看起来就简单多了。

![Screen Shot 2018-11-08 at 12.06.00 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/jk2jy.png)

一切都是这么顺利。但是到这里，我们发现：伪代码中只有一个 `if-else` ，判断条件是 event 的 keyCode 是否等于 0x35 。通过参考资料 1. NSEvent Code 可以得出，0x35 是 esc ，不是我们想要的 Caps Lock （0x39）。

### 第二次寻找突破点

回想起来，忽略了一点，既然 App 弹出提示，那为何不从提示文本入手呢？

```
Use the fn key + media keys to control playback and volumn.
```

对于没有做国际化的 App ，提示文本肯定是在实现文件内的，同样地，我们在 Hopper Disassembler 中看能否搜索到。这次不能搜索 Labels 了，要选择 str 选项。

![Screen Shot 2018-11-08 at 2.48.00 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/xo66d.png)

找到了我们要的结果，看右边，在地址处右键选择 References to 0x10001f3ed 。可以得到是哪个方法引用了这个字符串。我们得到的是

```
DATA XREF=-[BoxViewController mediaKeysPressed:]+102
```

继续深入，我们如法炮制，来看看 `mediaKeysPressed` 这个函数里面是什么。

![Screen Shot 2018-11-08 at 2.55.46 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/c3z3h.png)

1Keyboard 就是在这个方法中弹出框的，这也验证了一开始的猜想，在不知道什么情况下，执行了最上面说的那段类似的代码。

然而，这个函数也只是做到弹框显示，没有什么对解决问题有用的信息。那我们就要来看看是哪里调用了这个函数。

回到汇编代码这边来，在函数名称右键选择 References to selector mediaKeysPressed :

![Screen Shot 2018-11-08 at 3.01.38 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/rnxwk.png)

会发现，我们去到 BoxViewController 的 `awakeFromNib`中。

![Screen Shot 2018-11-08 at 3.06.48 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/o9rhm.png)

`mediaKeysPressed` 原来是通知事件的 selector 。我们可以发现到后面的字符串  media_keys_pressed 。

再重复上面的操作，最后可以找到 MyNSApplication 的 `sendEvent:`方法。

![Screen Shot 2018-11-08 at 3.14.29 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/irvtr.png)

乍一看觉得很熟悉，查阅了文档知道是 NSApplication 用于分发事件的， 1Keyboard 重写了这个方法，那现在问题很明确，我们按下 Caps Lock 的时候，进入到这个方法中了。

本着科学的无限探索精神，我想弄清楚：为什么要重写？怎么解决我们要解决的问题？

### 问题思考

首先，对几个问题的思考：

Q：什么是 Media Key？

A：就是这几个键。![Screen Shot 2018-11-08 at 3.28.42 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/3fclz.png)

Q：为什么要重写`sendEvent:`？

A：这个问题个人觉得与 1Keyboard 的设计初衷有关系，从方法名、Notification Name 我们可以得知，1Keyboard 是想在 macOS 上实现对移动设备播放、暂停、调节亮度、音量等多媒体操作的控制。对于有 Media Key 的键盘，自然就需要增加对 Media Key 的支持。监测 Media Key 的`KeyDown` 和`KeyUp`最常见的方式就是重写 `sendEvent:`。

如上面代码中所示：

```objective-c
if (([rbx type] == 0xe) && (([rbx subtype] & 0xffff) == 0x8))
```

`rbx `是 `[arg2 retain]` ，理所当然是一个 `NSEvent` Object 。当 `[rbx type]` 是 `NSEventTypeSystemDefined`（14）且  `[rbx subtype]` 是 8 的时候，就当做是一个  Media Key 的事件，可以借鉴参考资料给出的 2.获取MediaKey的开源Lib——SPMediaKeyTap 。

然后，第二个判断条件：

```objective-c
if ([rbx data1] & 0xff00) != 0xa00)
```

成立是指按键被按下，即 KeyDown 。

 1Keyboard 设计的初衷和出发点是好的，但是在`sendEvent:`中没有对 Event 的 keyCode进行判断，导致问题的出现。

### 寻找解决方法

稍微停一下，我们在这里重整一下思路，一开始通过查找字符串，得到 selector ，然后通过引用关系，找到 NSApplication 中的 `sendEvent` 中通知的发起点，并知道了 BUG 发生的原因，没有判断 event 的 keyCode。

那好了，现在有两种解决方式：

1. 在发送 media_keys_pressed 通知之前判断 event 的 keyCode 是否为 0x39 ，若是，则不发送通知。
2. 去掉`[postNotificationName:object:]`，不再发送通知。

第一种会影响整个二进制文件，添加的代码后面所有属性和函数的地址都需要修改；第二种直接覆盖原有地址的汇编，对原来二进制文件影响小，但是不会再弹出提示框。

对于我这个新手来说，第二种方法虽然没有第一种高级，但至少省下时间，且提示框也不影响平时的使用。

所以，剩下最后一步：将`[postNotificationName:object:]`的汇编码变成无作为。

这时候就需要用到 lldb 了，实际上，用 Hopper Disassembler 是可以直接修改的，只是需要购买 license 。我使用的是试用版，没有修改二进制文件的功能。其实用 gdb 也可以，现在搜到的大多数文章也是用 gdb 来调试程序，但既然在 macOS 上，安装了 Xcode 就有了lldb ，且可以免去 gdb codesign 的烦恼。

好啦，接下来，我们用 lldb 来完成剩下的工作：

1. 找到调用语句。
2. 使用 NOP 替换掉它。

先使 lldb 进入调试模式：

```shell
lldb 1Keyboard.app/Contents/MacOS/1Keyboard
```

lldb 有个 disassemble 指令，可以通过它来看到一个区间内的地址指令情况：

```shell
(lldb) di -s 000000010000a541 -e 000000010000a582
1Keyboard`___lldb_unnamed_symbol224$$1Keyboard:
1Keyboard[0x10000a541] <+103>: movq   0x2ba00(%rip), %rdi       ; (void *)0x0000000000000000
1Keyboard[0x10000a548] <+110>: movq   0x2a919(%rip), %rsi       ; "defaultCenter"
1Keyboard[0x10000a54f] <+117>: movq   0x20bfa(%rip), %r15       ; (void *)0x0000000000000000
1Keyboard[0x10000a556] <+124>: callq  *%r15
1Keyboard[0x10000a559] <+127>: movq   %rax, %rdi
1Keyboard[0x10000a55c] <+130>: callq  0x100019b10               ; symbol stub for: objc_retainAutoreleasedReturnValue
1Keyboard[0x10000a561] <+135>: movq   %rax, %r14
1Keyboard[0x10000a564] <+138>: movq   0x2af95(%rip), %rsi       ; "postNotificationName:object:"
1Keyboard[0x10000a56b] <+145>: leaq   0x2184e(%rip), %rdx       ; @"media_keys_pressed"
1Keyboard[0x10000a572] <+152>: xorl   %ecx, %ecx
1Keyboard[0x10000a574] <+154>: movq   %r14, %rdi
1Keyboard[0x10000a577] <+157>: callq  *%r15
1Keyboard[0x10000a57a] <+160>: movq   %r14, %rdi
1Keyboard[0x10000a57d] <+163>: callq  0x100019af8               ; symbol stub for: objc_release
```

lldb 的指令如无歧义，可以进行缩写，如 **p**rint **o**bject 可以缩写成 po 。disassemble 也可以缩写成 di 。-s 是起始地址，-e 是结束地址。

肯定有人要问：000000010000a541 和 000000010000a582 是怎么得来的？

那就要回到 Hopper Disassembler 了。

记得前面我们看过 `[sendEvent:]`的伪代码，我们还可以看到它的汇编代码的不是吗？只需要点击 mov add 按钮就可以了。可以看到起始地址和结束地址了吧。

![Screen Shot 2018-11-09 at 11.03.14 AM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/j7fmb.png)

我们都知道 OC 使用消息传递，用 objc_msgSend 来充当函数调用。需要有消息发送者和参数。

分析一下这段输出，首先我们很快找到 `postNotificationName:object:` ：

```shell
movq   0x2af95(%rip), %rsi		 ; "postNotificationName:object:"
```

在汇编代码中 % 前缀的是指寄存器。`movq (%ebx), %edx` 是指64位间接寻址，因此，这个指令应该是去找 selector 的地址。

```shell
leaq   0x2184e(%rip), %rdx       ; @"media_keys_pressed"
```

这个很明显：找到 @"media_keys_pressed" 这个字符串。

```shell
movq   %r14, %rdi
```

这个是找调用 `postNotificationName:object:` 的对象，也就是 NotificationCenter 。

最后，通过 `callq` 来进行调用：

```
callq  *%r15
```

至此，调用语句已经找到了，接下来就是使用 NOP 来替换它。

> NOP 是什么？
>
> 计算机科学中，NOP 或 NOOP 是汇编语言的一个指令，一系列编程语句，或网络传输协议中的表示不做任何有效操作的命令。
>
> NOP 的值是 0x90 ，占用一个字节。

首先，要设置断点，让程序在某个位置停下来，方便我们修改指令调试：

```shell
(lldb) breakpoint set -n "[MyNSApplication sendEvent:]"
(lldb) r
```

r 是让程序开始运行，按照之前，我们连接手机，按下任意键，会触发断点。此时 lldb 会停下来等待我们进一步的输入。

从上面可以知道，我们要修改的指令是：

```shell
1Keyboard[0x10000a577] <+157>: callq  *%r15
1Keyboard[0x10000a57a] <+160>: movq   %r14, %rdi
```

指令在内存中的起始地址是 `0x10000a577`，需要注意的是：下一条指令起始地址是 `0x10000a57a`。也就是说，我们要修改的指令占据了三个 Byte 。而一个 NOP 只是一个 Byte 。所以我们要将 `callq  *%r15` 替换成三个 NOP ：

```shell
(lldb) memory write -f x 0x10000a577 0x90
(lldb) memory write -f x 0x10000a578 0x90
(lldb) memory write -f x 0x10000a579 0x90
```

使用 `memory write` 可以达到 gdb 中 `set` 的效果。然后我们再 disassemble 一次：

```shell
(lldb) di -s 000000010000a541 -e 000000010000a582
1Keyboard`___lldb_unnamed_symbol224$$1Keyboard:
    0x10000a541 <+103>: movq   0x2ba00(%rip), %rdi       ; (void *)0x00007fffa62b49d8: NSNotificationCenter
    0x10000a548 <+110>: movq   0x2a919(%rip), %rsi       ; "defaultCenter"
    0x10000a54f <+117>: movq   0x20bfa(%rip), %r15       ; (void *)0x00007fff7a0d1a00: objc_msgSend
    0x10000a556 <+124>: callq  *%r15
    0x10000a559 <+127>: movq   %rax, %rdi
    0x10000a55c <+130>: callq  0x100019b10               ; symbol stub for: objc_retainAutoreleasedReturnValue
    0x10000a561 <+135>: movq   %rax, %r14
    0x10000a564 <+138>: movq   0x2af95(%rip), %rsi       ; "postNotificationName:object:"
    0x10000a56b <+145>: leaq   0x2184e(%rip), %rdx       ; @"media_keys_pressed"
    0x10000a572 <+152>: xorl   %ecx, %ecx
    0x10000a574 <+154>: movq   %r14, %rdi
    0x10000a577 <+157>: nop
    0x10000a578 <+158>: nop
    0x10000a579 <+159>: nop
    0x10000a57a <+160>: movq   %r14, %rdi
    0x10000a57d <+163>: callq  0x100019af8               ; symbol stub for: objc_release
```

如我们所愿，已经改好了。在终端输入 `c` ，让程序继续运行，这时会发现，按下 Caps Lock已经不会再弹出那个厌烦的 Sheet 了。

到这里，已经完成大部分了，lldb 只是一个调试工具，并不能做到修改二进制文件的功能，所以要将修改长效地保存下来，就需要对原二进制文件进行修改。我们就必须先找到 `0x10000a577` 起始的三个 Byte 的二进制代码是什么。

因为我们已经修改过内存中的程序，所以需要先将 lldb 退出，重新加载原来的程序，再使用 `x/x` 指令：

```shell
(lldb) x/x 0x10000a577
0x10000a577: 0x4cd7ff41
(lldb) x/x 0x10000a578
0x10000a578: 0x894cd7ff
(lldb) x/x 0x10000a579
0x10000a579: 0xf7894cd7
```

我们发现，这三个地址都有部分是重合的，不是巧合，不同的指令拥有不同的二进制编码，`x/x` 指令总是读取相同长度的内存中的数据。因此我们要将相同的合在一起。

还需要注意的是：

> **字节序问题（ Byte Order ）**，Intel 处理器一般是以**小端（ Little endian ）**进行存储，而在硬盘上的二进制码，则是以**大端（ Big endian ）**存储。所谓的**大端**，就是把数字的最高位放在最前面，**小端**则是把最高位放在最后面。
>
> ——摘自参考资料 5.一个数字的魔法——破解Mac上198元的Paw

所以，三者的二进制代码组合起来就是：`41 FF D7 4C 89 F7` 。

打开 Hex Fiend 。将二进制文件拖入其中，搜索 `41 FF D7 4C 89 F7` ，仔细发现，可以搜索出来三个，在不确定是哪个的情况下，我们可以继续对后面的指令再 `x/x` 。组合更多的 Byte 提高搜索精确度。

再选两个指令：

```
(lldb) x/x 0x10000a57a
0x10000a57a: 0xe8f7894c
(lldb) x/x 0x10000a57b
0x10000a57b: 0x76e8f789
```

好了，我们的搜索组合现在变成：`41 FF D7 4C 89 F7 E8 76`。这样就有且仅有一个结果了：

![Screen Shot 2018-11-09 at 1.24.40 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/pkugc.png)

还记得我们要替换为三位 NOP 吗？将 `90 90 90 4C 89 F7 E8 76` 填入到 Replace 中。再选择 Replace & Find 就可以了。

至此，就完成了整个问题的修复。可以 lldb 打开调试看看有没有问题。直接通过双击 1Keyboard.app 是无法打开的，是因为我们修改了 app 中的文件，App 签名已经无法验证通过了。需要进行代码重签：具体可以看我之前的这篇文章。

然后就可以愉快地玩耍了~ 



## 最后说两句

我是在看别人的优秀文章的时候学习了一点点逆向工程的皮毛。第一次接触逆向工程，很多地方写的不好，肯定有错误的地方，对上述操作手动表示滑稽，还请不吝指正。

另外，推荐两篇延伸阅读，请见参考资料 5.6. 。



## 参考资料

[1. NSEvent KeyCode](https://forums.macrumors.com/threads/nsevent-keycode-list.780577/)

[2.获取MediaKey的开源Lib——SPMediaKeyTap](https://github.com/nevyn/SPMediaKeyTap)

[3.SPMediaKeyTap作者对Media Key处理方式的解释](http://overooped.com/post/2593597587/mediakeys)

[4.GDB - To - LLDB](http://lldb.llvm.org/lldb-gdb.html)

[5.一个数字的魔法——破解Mac上198元的Paw](https://bestswifter.com/app-crack/)

[6.饿了么安全：Mac 下的破解软件真的安全吗？](https://juejin.im/entry/598d53155188257c666c5943)