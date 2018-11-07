---
title: What's new in Xcode 10
date: 2018-06-15 17:25:21
tags:
- WWDC2018
typora-copy-images-to: ipic
---

要让开发效率提高，写更多的 ~~bug~~ ，呸，更多改变世界的代码，我们就需要先了解每个苹果系列开发者必须使用的工具，就是今天要讲的主角 —— Xcode 10

<!--more-->

## 关于 Xcode 10

Xcode 在每年的 [WWDC](https://developer.apple.com/videos/wwdc2018/) 都会有所改进，今年也不例外，如约而至降临于六月五号。同样是先发布 [beta](https://developer.apple.com/download/) 版，正式版将在秋季发布于新的 App Store 上（新版的 App Store 还挺好看的，欢心荡漾中 :] ）

### 平台限制

Xcode 10 现在只有 beta 版，只能安装在 mac 10.13.4 及以上的版本，如果升级了最新的 beta 版系统 Mojave 还可以尝试一下黑夜模式，下面会说到。

### SDK

beta 版包含了新发布的 iOS 12, watchOS 5, macOS 10.14 以及 tvOS 12 的 SDK 开发工具包。

### 下载安装

首先下载 [.xip 安装包](https://download.developer.apple.com/Developer_Tools/Xcode_10_Beta/Xcode_10_Beta.xip)，解压放到 Applications 文件夹就可以了。使用 beta 版的 command line tools ，在 iTerm 或自带的 Terminals 中执行命令：

```Shell
xcode-select -s <path to Xcode>
```

对了，Xcode 10 beta 版是可以与原有的 Xcode 共存的。

### 什么被弃用了？

Xcode 每年更新总会弃用一些旧的标准或工具，今年也不例外。Xcode 10 beta 今年对如下的几项动了刀子：

- macOS 10.14 SDK 不再支持编译 32 位的应用，以后再见不到 i386 了。

- 对 SVN 的支持也取消了，同时现在可直接使用以下源代码管理平台：

  - Bitbucket Cloud 和 Bitbucket Server
  - Github 和 Github Enterprise
  - Gitlab.com 和 Gitlab Self-hosted

  ![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/rvegj.png)

-  libstdc++ 自从 Xcode 8 宣布不建议使用后，终于在 Xcode 10 中被直接斩掉。其中包括 stdc++, stdc++.6.0.9, libstdc++.6.0.9.tbd（新的动态库）,  libstdc++.6.0.9.dylib（旧的动态库）。经过 Apple 两年对 libc++ 的优化和推广，Xcode 10 中 C++ 工程需要链接 libc++ 已经箭在弦上，如果项目中使用到 libstdc++ ，就像我一样，暂时可以做到的是继续使用 Xcode 9 苟一段时间，或将 Xcode 9 中 关于 libstdc++ 的文件复制一份到 Xcode 10 中。不过长久来看，还是将使用到 libstdc++ 的 API 的库重新修改代码，链接到 libc++ 好一点。

- OpenGL , OpenGL|ES , OpenCL 进入废弃列表，原有 API 还是可用，但说不定以后的某一天跟 i386 一样突然就没了，对游戏开发和图像处理工具等 App 影响还是蛮大的。对此，苹果建议使用 Metal 来进行图像处理，声称可以更大程度地使用到 GPU 。

- 还有一些其他的 API ，请见 [Apple Developer Documentation](https://developer.apple.com/documentation/) 。

## 新特性

Xcode 10 beta 的新特性是我们比较关心的，涉及到方方面面，接下来我们看看今年的Xcode 10 给我们带来了什么？

### 通用层面

#### Dark Mode

说到 macOS Mojave ，首先想到的应该就是 Dark Mode 黑夜模式了，看 WWDC Keynote 的时候，桌面从白天变成黑夜，真的惊艳到。Mojave 的黑夜模式不仅仅是系统层面，App 也可以融入这种深沉的黑色。当然了，Xcode 10 beta 版也在众多支持黑夜模式的首发 App 中，打开看一下：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/moj7b.png)

对这个有兴趣可以看看 [Introducing Dark Mode](https://developer.apple.com/videos/play/wwdc2018/210/) 。

#### Library 的位置改变了

用多了 storyboard ，我们都知道，每次从 Inspectors 底部的 Library(库内容) 中将各种组件拉出来放到 storyboard 为我们设置好的画布上，是一件很舒服的事情。

从 Xcode 10 开始，Library 不再内嵌于 Inspectors 。而是放到 Xcode 右上角 Configure editor area 的左侧：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/mpxl8.png)

点击后会弹出一个重叠窗口，就想 Spotlight Search 一样。窗口呈现的内容会随当前打开的文件的不同而不同，譬如，如果当前是代码文件，则显示 Code Snippets ，如果当前是 storyboard ，那么会显示各种可拖拉的组件：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/dfceb.png)

在将组件拖动放置到文件中时，弹出的重叠窗口会消失，如果不想它消失，则在拖拉组件的时候按住 Option(⌥) 键即可。

对了，弹出的重叠窗口可以左右拉伸。激活的话，还可以通过 View > Libraries 中选择打开，也可以通过快捷键 ⇧+⌘+L 。

长按按钮可以选择查看 Media Library ，也就是添加到项目中的图片等。同样的，在 View > Libraries 中选择，快捷键是 ⇧+⌘+M 。

个人觉得，这个更新操作比之前稍微繁杂了一些，但是一次性展示出来的内容更多了些，各有优劣吧感觉。

#### Scheme

新建的 scheme 默认是 Shared 的状态，如果想建立私有的 scheme ，则在 Manage Schemes 中去掉勾选。

Scheme 的选择和运行设备的选择都可以通过键盘快捷键来操作，这是要解放鼠标？

快捷键分别是 ⌃+0 和 ⌃+⇧+0 ，当弹出 popup 后，可以键入字符或使用方向键来高亮 scheme 或设备，并回车选择。

### Source Editor

#### mutil-cursor editing (多行同时输入)

像 Sublime Text 一样，支持多行同时输入了。以前一个 Alert 的提示语要复制粘贴粘贴粘贴粘贴的时代终于离我们而去。

包括鼠标点击方式 ⌃+⇧+Click ，或通过选择列 ⌥+Click+Drag ，或通过键盘的 ⌃+⇧+Up 选择上一列，或 ⌃+⇧+Down 选择下一列。

#### 可以折叠代码了，嘿嘿

Xcode 9中，在 `if` , `func` 等关键字处 ⌘+Click 可以看到代码块所占的所有行，而在 Xcode 10 beta 中，还可以激活 code folding 的 popup ，在弹出的 popup 选择 Fold 就可以折叠代码了。

不想每次都 ⌘+Click ，可以在 Xcode > Preferences > Text Editing > Show， 勾选 Code folding ribbon 。就可以看到在 Editor 的内部左侧，显示的行数的右侧有标志条，点击就可以直接折叠代码了。

还可以通过 Editor > Code Folding 选择折叠当前打开文件**所有**的代码结构，甚至是注释。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/zd5zl.png)

Xcode 10 beta 中的处于版本管理状态的工程，可以看到开发者所作出的修改和在版本控制服务器上未被 pull 下来的提交。这个的标志条是在代码行数的左侧。

#### 查找和选择

以前有一种情况是：我们想改变文件内的静态函数名、函数内的变量名、静态变量名的时候，修改之后需要整个文件审视一遍，或让 Xcode 通过编译错误提醒我们。现在，在 Xcode 10 beta 中，可以通过 Editor > Structure > Select all Symbols 选择光标所在的函数或变量的 symbols ，就可以做到改一处而改动所有。

当我们要选择当前文件下查找到的所有结果，可以先执行一次查找 ⌘+F ，然后 Find > Select All Find Matches 进行全选，就可以修改所有结果。

但是，当我们不想选择当前文件下的所有查找到的结果，而是选择某一段代码中的包含的将被查找到的结果，可以先进行查找，然后选择要查找的那段代码， Find > Select Find Matches in Selection ，就可以选择到某段代码中的所有查找到的结果。

#### overscroll

打开 Xcode 10 beta 版的 Source Editor 时，滑动到最下面时，出现了一大片空白，如下图白色框框所示：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/897w4.png)

这不是 Xcode 的 Bug ，而是 10 beta 版的新功能 overscroll 。以前版本的 Xcode ，在文件末尾添加函数的时候，视线只能一直盯着最下面几行，或者提前先使用几个空行做占位，让视线更趋近于 Source Editor 的中间。现在有了 overscroll 之后，滚动到文件末尾，Xcode 会预留更多空间，使 Source Editor 可以向下再滚动一段距离（估计只是修改了 Source Editor 的 ScrollerView 的 inset 。:] ）

可滚动的距离也可以设置，在 Preference > Text Editing > Editor Overscroll 选择距离级别，分别有 None, Small, Medium, Large ，见名知意，就不多阐述了。

#### Quick Help

右侧 Quick Help 的 layout 也修改了，可读性更强。普天同庆啊~

Quick Help 和 Documentation Viewer 的代码样式跟用户当前使用的主题是一样的，整体看起来更和谐一些。

### New Build System

Xcode 10 使用了新的 Build System ，当然也可以选择使用老的 Build System ，通过 File > Project/Workspace Settings 中选择：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/aykpw.png)

这样的话，在构建时， Toolbar 的 View Activity 的 Activity Indicators 区域会出现一个橘黄色的小锤子：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/u2dp7.png)

新的 Build System 保证了构建时的可靠性和性能，能捕获到项目的配置问题。在我们没有能很好地使用新的 Build System 之前，使用新的工具总会遇到问题，常见的一些编译问题的解释和解决方法在 [Xcode Help](https://help.apple.com/xcode/mac/current/#/dev621201fb0) 。

### Testing

#### 乱序

首先，支持乱序。Test Bundle 中的方法可以不按顺序进行测试，默认是关闭的，可以通过 Edit Scheme > Test > Info > Tests 选择任意 Test Bundle ，打开 Options 勾选 Randomize execution order 来开启。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/tn1xw.png)

#### 并行测试

上图还透露了一个信息，在 Randomize execution order 上面，还有个选项 Execute in parallel on Simulator ，那就是可以并行测试了（并发已经满足不了广大开发者的需求了）。只限于 macOS 的 unit tests ，iOS 模拟器和 tvOS 模拟器的 unit 和 UI tests 。因为，要达到真正的并行，真机肯定是不支持的。并行测试时，Xcode 会开启多个线程运行多个我们选定的模拟器，然后在上面进行测试，在 Report navigator 也会记录线程启动和测试的日志，你会看到很多诸如 Clone X of iPhone X 的信息。

命令行 `xcodebuild` 也支持并行测试，只需要加上参数 `-parallel-testing-enabled YES|NO ` 去重写 seheme 的 pre-target 就可以了。还可以通过 `-parallel-testing-worker-count` 和 `-maximum-parallel-testing-workers` 控制测试模拟器的数量。

具体请打开 iTerm 或 Terminals 敲 `xcodebuild -help` 。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/f5vxe.png)

#### 可变的测试集

新建的测试默认状态是 enabled 的，这样我们在 Test navigator 中可以通过点击测试类或测试方法右边的运行按钮进行测试。

然而，如果想固定当前的测试集，排除新建的测试类或方法时，可以取消勾选 Automatically include new tests ，见上图。此时测试方法的状态是 disabled ，将无法在 Test navigator 中进行测试，但可以在类中该方法的左侧点击运行按钮进行测试。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/4jdy0.png)

假设过了一段时间，想把 disabled 状态的测试类或方法变成 enabled ，在 Edit Scheme 中可以修改其状态。这样我们可以控制每次测试所运行的测试集，不必浪费时间去做一些不需要做的测试。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/p99x5.png)

### IB

- 画布的渲染也并行了，scenes 的放大缩小和组件的修改，据说性能都得到提升。


- 原来 storyboard 右下角的 "Embed in Stack View" 按钮也改成了 popup ，提供更多选项供开发者选择 embed ，如下图白色框框。

  ![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/kij8a.png) 

  其中的 View Without Inset 会将选择的所有 View 紧凑地放在一个 Super View 里面。


- 打开 Xcode 5 的 .nib 或 .xib 文件，会提示格式问题并自动更新到当前版本所使用的格式。
- Attributes Inspector 的字体支持 iOS 11 发布的 Large Title ，且自定义字体可以看到样式预览，这个还挺不错的。
- 同样是 Attributes Inspector 中，named color 和 图片右侧有个小按钮可以连接到 Assets ，在这个小按钮上 ⌥+Click 可以在 Assistant Editor 中打开。

### Asset Catalog

macOS 10.14 有了 Dark Mode 之后，Assets 除了之前普通模式下单一的图片和 named color ，也支持 Light 和 Dark 。并且有个 High Contrast 的选项可以勾选，所以 macOS 开发如果要加入 Dark Mode ，要上传的图片和 named color 从原来的三张、一个颜色变成十三张图片、六个颜色，我的🐴🦆。

不过感谢 Dark Mode 福泽，asset 的背景也可以切换成 Light , Dark , System Appearance(跟随系统) 。切换的按钮在 assets 的左下角。对了，View Debugger 也有这个切换背景的功能，也就是那个调试 UI 的界面。

支持 Carplay assets，国内还没普及，暂时应该没多大用处。

支持 ARKit 3D `ARReferenceObject` assets 。

### Debugging

Debugging 功能的完善主要是针对 macOS 开发：

- Disk Gauge Report 加入了已关闭文件的大小的显示和对硬盘的读写随时间推进的变化表。

- Named color 在 View Debugger 的  Inspector 显示颜色的名称和是否属于系统颜色，仅 macOS 开发才有。

- 当 macOS App 在运行过程中，可以通过 Debug > View Debugging > Appearance menu 或者调试工具 Memory Graph 右边新加的按钮或 Touch Bar 来切换 Light 或 Dark 模式

  ![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/9nth5.png)

  ![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/a5le3.png)


- Metal Frame Debugger ，笔者尚未深入了解，暂时不介绍了。

### Playground

Playground 引入了一个增量执行? ( execute code incrementally ) 的 workflow 。

1. 在 Xcode 10 中，新建 Playground 默认是 Manually Run 。

2. 当写完代码后，按 ⇧+Return 或点击代码左侧的执行按钮，Playground 会进入运行模式，执行到指定位置( ⇧+Return 或点击的执行按钮所在的上一行)，然后进入等待模式，没有结束执行。

   ![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/t5tiz.png)

3. 我们可以不断地执行第2步，Playground 只会编译上一次暂停执行的位置到我们 ⇧+Return 或点击执行按钮的位置。

   ![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/opr4z.png)

4. 点击 Stop Playground 结束操作 Playground 。

### Localization

Xcode 10 beta 版支持新的国际化 workflow ，使用新的国际化文件 .xcloc 取代以前的 .xliff 。喔，不，应该是包含 .xliff 。还支持其他可能需要国际化的文件，如图片。

有兴趣的同学可以看看 [New Localization Workflows in Xcode 10](https://developer.apple.com/videos/play/wwdc2018/404/) 。

### Signing And Distribution

今年的 Xcode 10 完善了 macOS App 的发布和认证， Organizer Distribution 的 Developer ID 选项提供了上传到 Apple 进行认证的功能。Archive 后， Distribute App > Developer ID ，可以选择 Upload 上传到 Apple 进行认证或 Export 到本地保存。要上传应用，需要在 Xcode 中添加苹果账号，并填写所需的App Store Connect role与提供者资格，此外，认证应用还需要有开发者ID证书签名。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/97fpw.png)

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/a05lh.png)

在上传的应用被认证后，你可以在 Organizer 中选择你的档案并点击 Show Status Log 按钮，这样就能查看应用的状态。当收到认证通过的通知后，就可以从 Organizer 中将 App Export 出来，保存下来的 App 包含一个附加的票据，就意味着可以发布了。

## 最后说一句

今年的 WWDC 没有专题讲述 Xcode 10 。很多都是穿插在各个 Session 中。理解并用好一个工具能提高我们开发的效率，每年 Xcode 都有很多新的功能和改进，虽然出 Bug 和闪退的问题依旧存在，依旧是开发者们诟病的一点，但是，苹果爸爸在改善开发者的工作环境和提高 Xcode 的友好度作出的努力，大家还是有目共睹的，至少黑夜模式照顾到了我们这群深夜加班~~努力写 Bug~~ ，呸，努力写改变世界的代码的工程狮。

本文是我一份小小的学习笔记，请各位批判性地看，肯定有写的不好或错误的地方，请斧正，我定虚心接受。