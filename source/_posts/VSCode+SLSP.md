---
title: VSCode 和 SourceKit-LSP
date: 2018-11-19 20:56:06
tags:
- Swift
typora-copy-images-to: ipic
---

三年前 VSCode 诞生，它设计理念在我看来还是不错的，如今下载得到的 zip 也才 70M 不到。看了文档知道其中只是内嵌了些 JavaScript 、 TypeScript 等少数语言的支持。用户可以根据需要，通过安装 extension 来实现自定义功能的 IDE 。

但用 VSCode 来写 Swift 一直以来都不是很友好，知道最近 SourceKit-LSP 开源，就打算来试试这个被 MS 捧在掌心的 IDE 。

<!--more-->

## 本文大纲

写这篇文章的时候 VSCode 的版本是 Version 1.29.1 (1.29.1) ，更新日志在[这里](https://code.visualstudio.com/updates/v1_29) 。VSCode 三年来的发展我没有过多去了解，但是看更新日志，基本上是每月一更新，很是给力。

我也是第一次使用 VSCode ，在写本文的时候所做的定位是尝尝鲜，是抱着试试的心态，很多地方也没有去深入的了解，所以本篇文章就仅仅从以下两个方面出发，简单讲一下 VSCode 和 SourceKit-LSP 的集合：

1. VSCode 的配置和 extensions 的安装
2. SourceKit-LSP 的安装和 Swift 的编译运行

## VSCode 的配置与扩展

先对 VSCode 做一个大致的了解，官方文档中有几个[介绍视频](https://code.visualstudio.com/docs/getstarted/introvideos)可以看看，只是挂在 YouTube 上的，需要科学上网。

### Settings

VSCode 在实现用户自定义上真的是做了很多的功夫，基本能想到的东西都有一个配置项可供用户自定义设置。

安装完 VSCode 后，通过 `⌘+,` 调出 Settings 界面，如下图所示：

![Screen Shot 2018-11-16 at 11.35.28 AM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/vr8t4.png)

但是我建议，还是通过直接修改配置文件 `Settings.json` 的方式来更改配置。配置涉及方方面面，且对应的，还有全局配置和工作区( Workspace )的配置。

- **User Setting** - 存放在：`~/Library/Application Support/Code/User/` ，是全局配置，影响所有打开的 VSCode 的窗口。
- **Workspace Settings** - 存放在工作区的 `.vscode` 文件夹中。仅影响当前工作区，会覆盖 User Setting 中存在的项，用于不同机器间的共享，可以配置项目使用的编译器版本，如 Python2 、Python3 等。

通过上图右上角 `···` 按钮即可查看修改 `Settings.json` 文件：
![Screen Shot 2018-11-16 at 11.47.17 AM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/5xxac.png)

左侧是默认配置，右侧是用户自定义配置。通过修改键值对的方式实时更改 VSCode 。上图是我自己的一些配置：sidebar 的位置在左侧，activityBar 显示。我用习惯了 Xcode ，用不习惯类似于 IDEA 的 Tabs ，所以关闭 Tabs 和 Preview 功能。主题用 Horizon，并自己做了一些修改，还改了字体字号和文件icon。配置了 Python3 的解释器的地址。还有很多的配置可以自定义，具体可以阅读 [配置](https://code.visualstudio.com/docs/getstarted/settings) ，就不多赘述了。

### extension

安装扩展十分简单，通过快捷键 `⌘+⇧+x` 可以唤出搜索安装界面。搜索想要的 extension 就可以安装了，**Install** 等待安装完成后 **Reload** 重新加载 extension 就可以了。

搜索可以使用特定的 filter ，有 `@buildin` 、`@installed` 、`@outdated` 、`@recommended` ，各自表示 VSCode 自带，已安装，过期的，建议安装的。还可以通过 `@category` 来搜索指定类别的 extension 。

安装的 extension 默认是自动更新的，如果不想要自动更新，可以在配置文件中修改配置： `extensions.autoUpdatesetting` 的值为 `false` 。设置 `extensions.autoCheckUpdates`的值可以关闭 extension 的自动检查更新。

更多关于 extension 的说明，请看 [这里](https://code.visualstudio.com/docs/editor/extension-gallery)。

为了接下来的工作，我们要安装的扩展如下：

![Screen Shot 2018-11-19 at 2.44.33 PM](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/prq7v.png)

- SourceKit-LSP : 对 Swift 的支持
- file-icon、Horizon Theme : VSCode 的一些主题配置
- C/C++ 、Python : 本文不会提及，有需要进行 C/C++ 或 Python 可以安装，Python 在官方文档中还有专门的[介绍](https://code.visualstudio.com/docs/python/python-tutorial)。

## SourceKit-LSP 和 Swift 

[LSP](https://microsoft.github.io/language-server-protocol/) 是 Language Server Protocol 的简称，是微软开源的一套用于代码自动完成、跳转到定义、hover 显示文档等功能的协议，被广泛应用于各种 IDE 中，实现了这套协议，可以在 VSCode 等 IDE 中使用上述的特性，给编码过程带来极大的便利。

### SourceKit-LSP

[SourceKit-LSP(以下简称SLSP)](https://github.com/apple/sourcekit-lsp) 就是 LSP 的一套实现，提供对 Swift 的支持。在安装 VSCode Extension 的时候，我们可以发现，其实已经有很多 Swift 的扩展可供使用，但是使用时却不能像 Xcode 一般便利，没有跳转到定义、显示文档之类的功能。所以，SLSP 应运而生。

#### 安装和配置

> SourceKit-LSP is under heavy development! The best way to try it out is to build it from source. You will also need a Swift development toolchain and an editor that supports LSP.

让我们跟着文档来，安装 SLSP 最好的方式是通过源码安装，这就需要我们的电脑有 Swift 的环境。像我们用 beta 版的 Xcode 要用新版本的 Swift 时要装 snapshot 一样，SLSP 依赖的 `sourcekitd` 和 `clangd` 是在 Swift 的 toolchain 运行时启动的。我在写这篇文章的时候用的 snapshot 是 [swift-DEVELOPMENT-SNAPSHOT-2018-11-01-a](https://swift.org/download/#snapshots) 。

下载下来的 pkg 安装后，Swift 的 snapshot 存放在 `/Library/Developer/Toolchains` 。

进入 sourcekit-lsp 文件夹：

```shell
cd <path_to_sourcekit_lsp>
swift build
```

这里 `build` 的时候有可能会有这样的问题出现：

```shell
sourcekit-lsp' requires a minimum Swift tools version of 4.2.0 (currently 4.0.0)
```

看出错信息，是 Swift 的版本太低，我试过将 Swift 的版本更改为 snapshot 的版本（打开终端，更改 `TOOLCHAINS` 的值）：

```shell
# 使用 xcrun --find swift ，可以看到当前是使用 Xcode 中的 swift
~ xcrun --find swift
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift
# 设置 TOOLCHAINS 环境变量
~ export TOOLCHAINS=swift
# 使用 xcrun --find swift ，已经变成最后安装的 snapshot 版本
~ xcrun --find swift
/Library/Developer/Toolchains/swift-DEVELOPMENT-SNAPSHOT-2018-11-01-a.xctoolchain/usr/bin/swift
```

会出现下面这个问题：

```shell
<unknown>:0: error: Swift does not support the SDK 'MacOSX10.13.sdk'
```

Google 了一下，参考[这里](https://forums.swift.org/t/error-building-swift-swift-does-not-support-the-sdk-macosx10-13-sdk/13701)。可能是 Command Line Tools 的版本不对应所致，于是我安装了 `Command_Line_Tools_macOS_10.14_for_Xcode_10.1.dmg` 。`xcode-select -s` 选择安装的 command line tools 之后以为就可以了，没想到还是有问题：

```shell
~ sudo xcode-select -s /Library/Developer/CommandLineTools
~ swift build
error: terminated(72): xcrun --sdk macosx --find xctest output:
```

找不到 macOS 的 SDK ...

没有找到最好的解决方式，无奈之下，只能安装 Xcode 10 ，让 Xcode 10 帮助我们设置一系列的环境变量、SDK等。编译 SourceKit-LSP 只兼容 Xcode 10 这种一刀斩的做法，还真是苹果一贯任性的作风。（这肯定不是唯一的解决方法，以后有好的解决方法会回来补充）

#### VSCode Extension

好了，编译完 sourcekit-lsp 后，就要安装 VSCode extension 了，SourceKit-LSP 已经做好了对 VSCode 和 Sublime Text 的支持，直接执行命令就可以了（需要 npm ）：

```shell
# in sourcekit-lsp
cd Editors/vscode
npm run createDevPackage
```

打包完成了，就可以使用 VSCode 的 `code` 命令进行安装了。

```shell
# in sourcekit-lsp/Editors/vscode
code --install-extension out/sourcekit-lsp-vscode-dev.vsix
```

打开 VSCode ，配置也很简单，SLSP 就两个配置项，分别为：

1. `sourcekit-lsp.serverPath` - 指定 soursekit-lsp 位置的完整路径。

2. `sourcekit-lsp.toolchainPath` - 指定 Swift snapshot 的位置。

   Swift snapshot 的路径我们可以用一个变量来存储：

   ```shell
   export SOURCEKIT_TOOLCHAIN_PATH=/Library/Developer/Toolchains/swift-DEVELOPMENT-SNAPSHOT-2018-11-01-a.xctoolchain
   ```

添加在全局配置 `settings.json` 或工作区配置 `.vscode/settings.json` 即可，如下：





### Code some swift



## 总结

SourceKit-LSP 的出世可以让我们在其他支持 LSP 的 IDE 上更友好地进行 Swift 代码的编写，用于跨平台编码库文件是挺不错，但用来写应用感觉还是有点力不从心。

总的来说，不同的场景运用不同的编译器，来实现不同的需求，比如在 Linux 上写 Swift 等等，VSCode + SLSP 还是值得被关注的。

## 参考资料

[1.VSCode docs](https://code.visualstudio.com/docs)

[2.LSP](https://microsoft.github.io/language-server-protocol/)

[3.Sourcekit-LSP](https://github.com/apple/sourcekit-lsp)

[4.Using the Package Manager](https://swift.org/getting-started/#using-the-package-manager)