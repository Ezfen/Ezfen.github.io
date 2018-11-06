---
title: Jenkins密林探索
date: 2018-04-27 18:39:08
tags: 
- CI
typora-copy-images-to: ipic
---

说到持续集成，Jenkins 是用得比较多的。本文说明了我从安装到配置再到打包 ipa 文件，从手动打包到点击一下按钮自动生成 ipa 所做的事情。

得益于 Jenkins ，让开发体验提升了不少。不多说，文内多图，来跟我一起密林探索吧 :]

<!--more-->

![Jenkins](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/aohum.png)

## Jenkins安装

本文以 *Jenkins* 当前时间 **2018.03.27** 的最近 weekly 版本 *2.113* 来说明， Jenkins 是 Java web 项目，在使用上有 Java 环境的限制：**jdk1.8 以上**。

对于 macOS10.9 和 10.10 来说，系统中自带有 jdk1.6 ，但这并不符合要求。而其他版本（ macOS10.11 以上）中貌似没有 jdk ，可以在命令行工具键入`java -version`来判断。

若出现以下提示，则表示没有配置 Java 环境或系统中没有安装 jdk ：

```Shell
No Java runtime present, requesting install.
```

若弹出安装对话框，点击 **『好』** 退出对话框。

不然，定位到`/Library/Java/JavaVirtualMachines`中可查看是否存在 jdk 。

如果都没有，或 jdk 版本不符，则需要重新安装。 macOS 的安装方式比较简单，在[Oracle的jdk下载地址](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html)上下载 dmg 安装包，直接安装 jdk1.8 到系统中。然后修改`~/.bashrc`文件配置一系列的系统变量，如果使用`zsh`，则修改`~/.zshrc`。在文件末尾添加：

```shell
# 通常通过dmg安装的jdk都是在/Library/Java/JavaVirtualMachines/下，需根据实际情况对JAVA_HOME进行配置
export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk1.8.0_161.jdk/Content/Home"
export CLASS_HOME="$JAVA_HOME/lib"
export PATH=".;$PATH:$JAVA_HOME/bin"
```

然后重置一下配置：

```shell
source ~/.bashrc
```

或者（使用`zsh`）

```Shell
source ~/.zshrc
```

再次使用`java - version`验证是否安装成功（全文部分截图是我使用公司电脑安装 Jenkins 时截下来的）：

![55B9E6EFD1C3099B8203D17D0089360C](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/ve0qh.png)

好了，然后安装 **Jenkins ** 。同样的，在[官网下载页面](https://jenkins.io/download/)上选择 **Weekly — Mac OS X** 下载 *pkg* 安装包。

![Jenkins Website](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/gz4yg.png)

以 **2.113** 为例，一步步安装。

![Jenkins Install Begin](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/9ez6l.png)

![Jenkins Install Step2](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/9dt4k.png)

安装完成后，会自动打开浏览器，跳转到`localhost:8080`可以看到 Jenkins 正在准备中...

如果提示打不开，使用 Safari 出现以下界面：

![Oops Jenkins Start Failed](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/gaawr.png)

则可能是 jdk 的配置出了问题，返回去看看前文关于 jdk 的配置，检查一遍是否正确。

> 注：如果此时重启系统，会发现多了一个名为『 jenkins 』的普通成员。

在 jenkins 初始化工作完成后，会跳转到另一个**解锁  jenkins ** 的界面，提示密码存放在`/Users/Shared/Jenkins/Home/secrets/initialAdminPassword`中，到其中查看，会发现`secret`文件夹被设置了权限，使用我们当前的用户无读写的权限。

![解锁jenkins](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/jc4l1.png)

此时使用命令行工具，键入如下命令，并输入电脑的管理员 root 密码（通常是我们自己的登录密码）后：

```shell
sudo cat /Users/Shared/Jenkins/Home/secrets/initialAdminPassword
```

可以看到 jenkins 的初始化密码：

![屏幕快照 2018-03-26 下午12.44.11](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/s09vt.png)

将该密码填入到网页中，完成解锁工作。**此密码同时是登录 jenkins 的 admin 账户的密码，见下文。**

之后，安装社区推荐的插件即可：

![屏幕快照 2018-03-26 下午12.45.24](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/lg2px.png)

然后创建第一个管理员用户，此处建议自行创建一个用户，当然也可以点击右下角的 **『使用 admin 账户继续』** ，密码是 jenkins 的解锁密码，也就是 initialAdminPassword 里面那个字符串。

![屏幕快照 2018-03-26 下午12.50.00](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/cio9r.png)

保存完成后，Congratulation~ 🎉🎉🎉 

行李已经收拾好了，可以继续 jenkins 密林探索之旅了。

## Jenkins配置

在安装完 Jenkins 后，就可以愉快地使用它来持续集成我们的项目了，如果对一些启动配置不感兴趣，不想看这一部分，可以愉快地略过，不修改配置也完全不影响使用。

需要修改配置的情况如下（包括但不完全包括）：

1. 默认地，当 jenkins 安装在服务器上时，监听的是服务器的 8080 端口。而我们知道，在做 Java Web 开发时，应用服务器 tomcat 的默认端口也是 8080 ，不修改配置的话，很容易造成冲突。
2. 我们在使用 Jenkins 会安装各种插件，同时运行很多个构建工作，都有可能造成内存溢出的问题。
3. 当我们需要配置 HTTPS ，证书等等。

### 启动与关闭

首先，针对使用 **pkg** 安装的方式（使用直接下载 war ，用`java -jar`运行不在本文的讨论范围内。），Jenkins 作为一个后台驻留程序（ *Daemon* ），在 Wins 下我们习惯叫服务，自然有开关。

一个后台驻留程序是运行在系统后台的，没有任何GUI的程序。在 macOS 下，一个后台驻留程序的配置保存在一个`plist`文件中，非系统驻留程序的`plist`文件都统一存放在`/Library/LaunchDaemons`之中。

我们知道，`plist`本质是 xml 文件，其中存放的都是键值对，里面的键都是 [launch.plist](x-man-page://5/launchd.plist) 中定义的，这个`plist`用于告知`launch`去哪里运行脚本，以及运行过程中一些路径和用户、组的配置。

所以，启动和关闭的命令看起来比较少见：

```shell
# 开启Jenkins
sudo launchctl load /Library/LaunchDaemons/org.jenkins-ci.plist
# 关闭Jenkins
sudo launchctl unload /Library/LaunchDaemons/org.jenkins-ci.plist
```

打开`org.jenkins-ci.plist`，看到`ProgramArguments`，写着运行脚本的位置：

![019DE0A84C235007987FE3CF18813083](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/ntvgu.png)

### JVM的配置

接下来，我们来看看 `jenkins-runner.sh` 这个脚本中的内容。

```shell
#!/bin/bash
#
# Startup script used by Jenkins launchd job.
# Mac OS X launchd process calls this script to customize
# the java process command line used to run Jenkins.
#
# Customizable parameters are found in
# /Library/Preferences/org.jenkins-ci.plist
#
# You can manipulate it using the "defaults" utility.
# See "man defaults" for details.

defaults="defaults read /Library/Preferences/org.jenkins-ci"

war=`$defaults war` || war="/Applications/Jenkins/jenkins.war"

javaArgs="-Dfile.encoding=UTF-8"

minPermGen=`$defaults minPermGen` && javaArgs="$javaArgs -XX:PermSize=${minPermGen}"
permGen=`$defaults permGen` && javaArgs="$javaArgs -XX:MaxPermSize=${permGen}"

minHeapSize=`$defaults minHeapSize` && javaArgs="$javaArgs -Xms${minHeapSize}"
heapSize=`$defaults heapSize` && javaArgs="$javaArgs -Xmx${heapSize}"

tmpdir=`$defaults tmpdir` && javaArgs="$javaArgs -Djava.io.tmpdir=${tmpdir}"

home=`$defaults JENKINS_HOME` && export JENKINS_HOME="$home"

add_to_args() {
    val=`$defaults $1` && args="$args --${1}=${val}"
}

args=""
add_to_args prefix
add_to_args httpPort
add_to_args httpListenAddress
add_to_args httpsPort
add_to_args httpsListenAddress
add_to_args httpsKeyStore
add_to_args httpsKeyStorePassword

echo "JENKINS_HOME=$JENKINS_HOME"
echo "Jenkins command line for execution:"
echo /usr/bin/java $javaArgs -jar "$war" $args
exec /usr/bin/java $javaArgs -jar "$war" $args
```

第一行我们看到，给`defaults`赋了值：

```shell
defaults read /Library/Preferences/org.jenkins-ci SETTING
```

> 注：`defaults` 命令可以用来读取其中的配置项`SETTING`的值。不写`SETTING`可以读取所有的配置。

其中，`/Library/Preferences/org.jenkins-ci`是 Jenkins 的配置文件所在的位置。

然后，用`defaults`读取`org.jenkins-ci`文件中`war`、`minPermGen`、`permGen`等值，最后使用`java -jar`来启动 Jenkins 。

Jenkins 是 Java 程序，运行在 JVM 上。通过上述分析，我们知道，修改`org.jenkins-ci`这中的键值对，可以达到配置 Jenkins 的目的。

下面介绍目前几个常用的配置项（当然如果你是一名 Java Web 程序开发者，对 JVM 比我更熟悉，应该可以按照`jenkins-runner.sh`脚本中的格式修改脚本添加一些自定义配置，这里只是抛砖引玉）：

* war :  war 包的指定位置，默认值：`/Applications/Jenkins/jenkins.war`
* minPermGen :  JVM 的非堆内存空间，将赋值给`XX:PermSize`
* permGen :  JVM 的最大非堆内存空间，将赋值给`XX:MaxPermSize`
* minHeapSize :  JVM 的堆内存空间，将赋值给`Xms`
* heapSize :  JVM 的最大堆内存空间，将赋值给`Xmx`
* tmpdir :  Jenkins 运行的临时存放空间，此值会作为变量赋值给 JVM 的环境变量`java.io.tmpdir`
* JENKINS_HOME :  Jenkins 目录，默认值：`/Users/Shared/Jenkins/Home`，保存着工作空间， war 包解压后存放在此，插件，用户，节点，日志等等
* prefix : 访问页面的前缀。上述安装后打开的 url 是`localhost:8080`，当配置 prefix 之后，若配置为`/objchris`（不可以漏掉`/`），则访问路径变成`localhost:8080/objchris`。
* httpPort、httpsport :  http、https 端口
* httpListenAddress、httpsListenAddress : 接收请求 IP ，默认为 0.0.0.0 ，即其他主机也可以访问到，接收任意 IP 发来的请求。若设置为 127.0.0.1 ，则只能本机访问。

对于配置项，有兴趣的同学可以参考[这里](https://wiki.jenkins.io/display/JENKINS/Starting+and+Accessing+Jenkins)，十分详细且有一些配置示例。

修改配置，可以使用以下命令：

```shell
sudo defaults write /Library/Preferences/org.jenkins-ci SETTING VALUE
```

做错了也没关系，重新 write 一遍或`defaults`也支持删除：

```shell
sudo defaults delete /Library/Preferences/org.jenkins-ci SETTING
```

## 卸载 Jenkins

要残忍舍弃 Jenkins 投奔其他 CI 工具的话：

```Shell
'/Library/Application Support/Jenkins/Uninstall.command'
```

同样针对使用 **pkg** 安装的方式。

下载 war 包，直接停止服务删除 war 包就好了。

使用 homebrew ，有 homebrew 自己的管理方式，不在此说明了。

> 有时候，遇到一些玄学才能解释的问题（例如文件损坏无法启动 Jenkins ...），卸载重装或许也是一个好方法，嗯[正经脸]。

## 插件安装

在密林探索开始以前，我们要带上一些工具，给 Jenkins 安装一些插件。

插件安装在『 系统管理 — 管理插件 』，图标是一块绿色的小拼图。点击进去可以看到可更新、可选插件、已安装、高级。都是望名知意，不多做解释了。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/gru5l.png)

选择 *可选插件* ，在过滤处输入想要安装的插件。对我们来说，版本管理工具 Git 或 SVN 用得最多，但是如果一开始安装 Jenkins 的时候已选择社区推荐插件的话，其实已经安装好了 GitHub 的相关插件 [GitHub plugin](http://wiki.jenkins-ci.org/display/JENKINS/Github+Plugin) 。 SVN 的话，我所使用的 Jenkins 2.113 版本在 war 包内部嵌入了 SVN 的插件 [Subversion Plug-in](https://wiki.jenkins.io/display/JENKINS/Subversion+Plugin) 。如果公司内部有 Git 服务器，通常是部署的开源 GitLab ，则需要安装`GitLab Plugin`用于管理源码和`Gitlab Hook Plugin`用于构建 GitLab 的触发器。

我的主要目的是 iOS 项目构建，因此还需要选择`Xcode integration`安装 Xcode 插件，和管理签名证书私钥和 PP 文件的`Keychains and Provisioning Profiles Management`。

安装完了这些，我们就可以配置一个构建项目了。

## 构建项目

### 基本项目配置

回到主界面上，点击左上角 *新建任务* ，进入新建任务界面。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/j5l33.png)

确定后，开始项目的通用配置：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/tpk2j.png)

我的项目是托管在公司内部 SVN 上的，所以`Github Project`不打勾，勾上`丢弃旧的构建`会将构建记录保留一定时间（根据自己需求设置天数）和最大保留个数。`参数化构建过程`可以为构建过程添加相应的参数。`关闭构建`主要针对定时任务（下面会说到），顾名思义就是关闭当前任务，自然不会启动定时任务。

### 源码管理—— SVN

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/7r6yz.png)

我所在的公司源码管理使用 SVN ，在 Module 中填上 SVN 的一些信息：

* Repository URL ：仓库地址
* Credentials ：用于登录、拉取代码的账户密码
* Local module directory ： 存放在工作空间的位置，每当新建一个任务， Jenkins 会在`$HOME`目录下的`workspace`中新建一个以任务名称命名的文件夹。因此，如果此项填入`.`（默认值就是`.`），则从 SVN 仓库地址拉取的代码将直接存放在其中。填写其他路径（如`./path/to/subfolder`），则放在对应的路径中。 **Jenkins 在运行脚本的时候所在的位置是`$HOME/workspace/[任务名称]`，所以如果此项修改了，添加了其他子文件夹，在下面写运行脚本位置时需要注意路径是否正确。**
* Repository depth ：拉取代码时的深度，分别有以下几个：
  * infinity ：遍历所有文件夹，拉取所有文件和文件夹
  * empty ：将本地路径初始化，不拉取任何文件
  * files ：当前文件夹和文件，不包含子文件夹
  * immediates ：当前文件夹、文件、子文件夹，但不遍历子文件夹
  * as-it-is ：继承原有的深度
* Ignore external ：拉取代码时忽略 external 的属性设置的库。
* Cancel process on externals fail ：拉取 external 的属性设置的库失败时停止。

`Check-out Strategy`是检出策略。可选择 ：尽可能多地使用`svn update`，每次都 checkout 一个新的，或使用脚本 checkout ，不需要 Jenkins 帮我们 checkout 等等。

### 构建环境

我们知道，打包 iOS 需要代码签名( *codesign* )，也就需要私钥，因此第一步，是先将 keychain 添加到 Jenkins 。

#### 添加 Keychain 和 Provisioning Profiles 

还记得上面安装插件的时候安装了`Keychains and Provisioning Profiles Management`吗？在构建环境这里，可以看到`Keychains and Code Signing Identities`选项：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/7r1ie.png)

但此时还没有配置，所以要先去 **系统管理 —— Keychains and Provisioning Profiles Management**添加 Keychain 和 Provisioning Profiles 。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/3n7n0.png)

提示我们 Upload Keychain ，选择`/Users/管理员用户名/Library/keychains/login.keychain`上传。然后输入 Keychain 的密码和签名使用的证书的 Code Signing Identity （ 如：iPhone Distribution: *** CO.,LTD (ABCD678EFG) ）

再上传 Provisioning Profiles ，上传的文件最终位置在`/Users/Shared/Jenkins/Home/kpp_upload/`。然后将`/Users/Shared/Jenkins/Library/MobileDevice/Provisioning Profiles`填写到页面的`Provisioning Profiles Directory Path`，然后保存就可以了。

这样的操作是让 Jenkins 在进行构建的时候将`kpp_upload`中的 Provisioning Profiles 拷贝到`MobileDevice/Provisioning Profiles`文件夹中，就跟我们平时安装 Provisioning Profiles 一样。

完成后大致是这样子：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/ac2j7.png)

这里添加了 Developer 和 Distribution 的开发者证书和 Development 和 Ad-hoc 的 Provisioning Profiles 。

#### 配置项目使用的 Keychain

回到项目配置中，此时就可以选择 Keychain and Code Signing Identity 了。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/4wmwm.png)

这里的 Provisioning Profiles 是需要 development 和 ad-hoc 的。

### 构建

项目构建最简单的方式就是使用脚本了，可以看我前面写过的[文章——iOS脚本打包 - xcodebuild](https://objchris.com/2018/04/02/iOS脚本打包/)。

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/l2gp4.png)

增加构建步骤，选择`Execute shell`，填入脚本：

```shell
#!/bin/sh -l
# 解决找不到pod和pod提示语言不对的问题
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export PATH="/usr/local/bin:$PATH"
echo $PATH
pod --version
# 解锁用户上传的Keychain
# KEYCHAIN_PATH 和 KEYCHAIN_PASSWORD 是配置构建环境时，Keychains and Provisioning Profiles Management插件提供，可直接使用
security list-keychains -s "${KEYCHAIN_PATH}"
security default-keychain -d user -s "${KEYCHAIN_PATH}"
# 告诉系统Keychain已解锁，无须再弹出UI
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "${KEYCHAIN_PASSWORD}" "${KEYCHAIN_PATH}"
security unlock-keychain -p "${KEYCHAIN_PASSWORD}"
security show-keychain-info "${KEYCHAIN_PATH}"
security find-identity -p codesigning -v
# 执行我们的打包脚本
sh KeyXBuild.sh
```

到这里就已经完成打包，得到 ipa 文件了。

一些构建后的操作就不多说了，或者通过 SVN 上传到某个目录，或者上传到蒲公英这种分发平台。

## 构建状态提示

每一次构建成功失败都会有提示：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/zm08o.png)

构建结束后可以查看日志输出：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/crs2g.png)

项目构建的成功与否决定了一个项目的分数， Jenkins 使用类似天气预报的样式呈现：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/2en18.jpg)

第一次使用 Jenkins ，尝试个四五十次应该就差不多了：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/m8t6x.png)



## Troubleshooting

### -bash: pod: command not found

前面说过，Jenkins 在安装完成后会创建一个名为 jenkins 的普通用户，我们可以通过 **系统偏好设置 -> 用户与群组** 来修改 jenkins 用户的密码，然后登入到其中。进行一些检查操作。

我的项目使用到 Cocoapods 来管理第三方库，且`Pods`这个文件夹没有上传到 SVN 上，只上传了`Podfile`和`Podfile.lock`。因此需要在 Jenkins 上进行一次`Pod install`。这就需要 Jenkins 用户安装 Pod ，这时候就需要登录 jenkins 去完成安装操作了。

### Code Signing Error: Provisioning profile "xxx" doesn't include signing certificate "iPhone Developer: xxx"

出现此问题是因为，使用 xcodebuild archive 时，指定的 Provisioning profile 和证书都必须是开发使用的。不能是 ad-hoc 或 app store 。

在 archive 后进行 export 的时候才是使用 ad-hoc 或 app store 的证书和 Provisioning profile 。

### codesign：unknown error -1=ffffffffffffffff

这个问题是没有访问 Keychain 的权限，因为我们的 Keychain 是从 Jenkins 上传的，每次构建时 Jenkins 都会将 Keychain 文件拷贝到工作项目路径中。

因此我们需要自己手动解锁：

```shell
security unlock-keychain -p "${KEYCHAIN_PASSWORD}"
```

在 macOS 10.12 前，这样就可以了。但是新版本中，解锁操作过后还是会弹出UI来解锁 Keychain 。而 Jenkins 是没有用户交互的，所以签名时才会有这个错误出现。

解决方法是：

```shell
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "${KEYCHAIN_PASSWORD}" "${KEYCHAIN_PATH}"
```

别忘了其中的`codesign:`，很多添加了类似命令还是不成功的原因可能是忽略了`codesign:`

### Something of Keychain

脚本打包时，会使用`~/Library/Keychain`中的 login.keychain 。因此，网上很多教程都是将打包使用的证书和私钥（ login.keychain ）直接拷贝到 Jenkins 中，但是这样不利于项目配置。因为不同的项目可能需要不同的证书签名，要添加新证书就需要再次复制 keychain 文件到 jenkins 的`~/Library/Keychains`下，覆盖原来的`login.keychain`。这样容易造成老项目无法成功打包（因为旧 keychain 被覆盖）。

因此，我一直在找如何直接使用 Jenkins 提供的配置去动态添加 keychain ，**Keychains and Provisioning Profiles Management** 插件帮我们完成 keychain 文件和 Provisioning Profiles 的位置问题，但是需要配合`Xcode`插件去使用。这样让脚本打包变得不方便。

为了解决这个问题，才有了上面构建脚本中对 Keychain 的一系列操作。

## 说在最后

可能在未来使用过程中会遇到问题，会回来补充。

つつく