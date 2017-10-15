---
title: Code Signing In Xcode
date: 2017-08-20 15:10:44
tags: 
- WWDC2017
- Xcode
---

Xcode 9 虽然目前只有Beta版。但是已经很多开发者在使用了。Xcode 9 在应用签名方面做出了新的尝试，推出了新特性。还对Xcode Server进行了集成。对整个签名的Workflow进行了极大的简化，基本上只需要一次点击就可以完成Xcode9以前几步的繁杂操作。

<!--more-->

Xcode Server对Automatic Signing和Customized Signing都做了改进，使之更简便快速稳定。这两者在Xcode 8中被推出，所以在对Xcode Server进行介绍前，我们来回顾下Xcode 8 对应用签名都做了什么。

## Xcode 8

在应用签名方面，Xcode 8 旨在解决Xcode 7 在签名错误时候对开发者的不友好性。大家可能都有印象，以前用Xcode 7的时候，在应用签名出现错误的时候都会弹出下面这个框：

![](http://7xs4ed.com1.z0.glb.clouddn.com/CodeSigning_fixissue.png)

通常都只是点击Fix issue来让Xcode解决问题，当然大多数情况都能解决，但是仿佛在黑匣子中操作，因为我们并不知道：

- 问题是什么，为什么会签名失败
- 点击Fix issue之后，Xcode做了什么
- 为什么Fix issue能帮我们解决问题

Xcode 8中，添加了Report Navigator。在每次修改签名配置和签名的时候都会有日志可以查看，可以很方便地知道Xcode在帮我们做什么操作。

![](http://7xs4ed.com1.z0.glb.clouddn.com/CodeSigning_report.png)

### Automatic Signing

开启Automatic Signing：在使用Xcode 8很容易就会发现项目配置里面`General`选项页有了很大的变化。如下图所示，勾选`automatically manage signing`即可，新创建的项目也会自动勾选，选择好开发团队（下方的Team就可以选择使用对应的证书签名）。

![](http://7xs4ed.com1.z0.glb.clouddn.com/CodeSigning_autosigning.png)

#### 特点

1. 修改App需要使用的系统功能只需要在TARGETS -> Capabilities中配置，Automatic Signing会自动更新App ID和Previsioning Profile。这里展示的是个人证书，所以Capabilities比较少。![](http://7xs4ed.com1.z0.glb.clouddn.com/CodeSigning_capabilities.png)
2. Automatic Signing只针对development signing，这样做的好处是与发布证书隔离开。
3. 只对Xcode创建的Provisioning Profile可用，如果是自己从开发者网站下载下来的Provisioning Profile，那就使用Customized Signing去做自定义签名。

### Customized Signing

切换到自定义签名，只需要将上述`Automatically manage signing`选项取消勾选就好了，这样配置会出现两个Signing的选项

![]()

#### 特点

使用Customized Signing的目的是可以应对不同的情况来选择不同的Profile从而决定使用不同的证书签名。    

有新的开发人员、添加了新的授权设备或者修改App需要使用的系统功能都会更改App 的 UUID，这样我们需要更新项目配置（下载最新的Provisioning profile，并在Xcode上选择使用它）





### Multiple Development Certificate 

一个值得提出的点是：Multiple development certificate conflict的问题。基本每个人都只有一个开发者账号，如果在一个设备上使用那自然没有问题，但是如果我们有另外一台设备上也需要使用这个开发者账号的话，可以将Keychain通过iCloud同步到另一台设备上使用，如果没有这样做，Xcode 7 会有如下的提示：

![]()

reset会使在之前那台设备上的证书无效，无法继续在之前那台设备上对应用签名，无法用于真机调试。    

Xcode 8 解决了这个问题，它会帮我们重新创建先前兼容的证书，使得之前设备的证书可以继续使用，而当前用于开发的设备也能使用相同的证书签名。



## Xcode 9



## 说多一点点

Xcode Server不仅可以使用来代码签名和打包，还可以完成编译、测试