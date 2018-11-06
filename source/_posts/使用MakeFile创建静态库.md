---
title: 使用makefile创建静态库
date: 2017-08-08 22:17:57
id: 42F1A99632F0B88D
tags: 
- Library
---

最近工作上需要将 Win 上的一个 C 库移植到 iOS 上以支持业务的开展，修改代码后需要编译成静态库供 iOS 使用，不想每次别人修改完在 Mac 上编译时还要打开 Xcode ，学习了一下makefile ，直接执行 make 命令就可以了。    

<!--more-->

说来惭愧，自己的 C/C++ 水平还没有到达很高的水平，最开始想到的最简单的方式就是创建`Cocoa Touch Static Library`项目，然后直接将所需要的代码文件无脑添加到项目里面，编译，合成。    

但是为了让其他同事更快捷地完成工作，学习了如何使用 makefile 来编译静态库。

本文只是皮毛，主要是在此次工作中的一些历程。     

## 静态库特点

> - 静态库对函数库的链接是放在编译时期完成的。
> - 程序在运行时与函数库再无关系，移植方便。
> - 浪费空间和资源，因为所有相关的目标文件与牵涉到的函数库被链接合成一个可执行文件。
> - 更新困难。当程序所依赖的静态库有任何更新，整个程序就要重新链接。

留下疑问：是否可以理解为：只需要其他库的头文件？

## makefile

makefile 本身只是一个文件，用来辅助 make 命令执行时，告诉 make 命令怎么去编译和链接程序。    

那编译和链接的规则是：

> - 如果这个工程没有编译过，那么我们的所有 C 文件都要编译并被链接。
> - 如果这个工程的某几个 C 文件被修改，那么我们只编译被修改的 C 文件，并链接目标程序。
> - 如果这个工程的头文件被改变了，那么我们需要编译引用了这几个头文件的 C 文件，并链接目标程序。

Google 可以搜索到很多 makefile 的好文章，这里简略介绍一下：

### 基本语句

```
target : prerequisites
	command
```

- target : 编译或链接最终得到的目标文件，例如 .o 结尾的中间文件、由 .o 文件链接而成的 Win 下的可执行文件， .o 文件打包而成的静态库文件
- prerequisites : 依赖，也就是编译成 .o 的 .c 、.cpp、.m 和 .h ，链接成动态库、静态库、可执行文件的 .o
- command : 命令，即如何将上述的依赖编译或链接成我们要的 target ，需要注意的是， command 前必须要有一个制表符 ( tab ) ，不能是一连串的空格，也不能缺失。





#### Phony Target

PHONY 目标并非实际的文件名：只是在显式请求时执行命令的名字。    

像平常我们需要自己编译第三方库的时候，在执行完链接后需要清楚产生的中间文件或其他配置等，需要执行`make clean`，这里的 clean 就是 makefile 中被定义的 Phony Target 。下面例子会说到。    

一个 makefile 只能有一个总的 Target (编译链接得到我们最终需要的文件)，如果需要多个 Target ，可以使用 Phony Target 来实现。当然，上述说到的除编译链接之外的操作用 Phony Target 也是很好的选择。



### 变量

像写程序一样直接定义变量，变量在左侧，值在右侧，等号分开，然后通过`${变量}`使用，例如：

```
DEVICE=OS
DEV_PATH=/Applications/Xcode.app/Contents/Developer/Platforms/iPhone${DEVICE}.platform/Developer
```



### 文件名及使用

当然，既然叫 makefile ，文件名最好就叫 makefile 啦， Makefile 也是可以的，但是是在 makefile 不存在的时候， make 命令才会去使用。

如果再不喜欢，文件名写成 chris 也可以，只是 make 的时候加上`-f`和文件名就好了~

`make -f chris`



## 栗子🌰

好啦，说起来简单，但是实际操作却需要些许耐心~

以下是我写的一个简单的 makefile ，用于编译资源文件和打包成静态库，还有一个脚本，结合 makefile ，打包 armv7, armv7s , arm64 , i386 , x86_64 这五个平台的静态库，并使用 lipo 合成为 " Fat Library " 。

### makefile

```cmake
OUT_D=out
ARCH_D=${OUT_D}/${ARCH}
OBJ_D=tmp
# DEVICE 和 ARCH 是外部传入的值，用于区分是OS还是SIMULATOR，平台是哪种
# 如果C代码中使用到了CoreFoundation和跨平台编译使用到__APPLE__、TARGET_OS_IPHONE等宏，所以需要引入iOS的SDK
DEV_PATH=/Applications/Xcode.app/Contents/Developer/Platforms/iPhone${DEVICE}.platform/Developer
SDK_PATH=${DEV_PATH}/SDKs/iPhone${DEVICE}10.3.sdk

CPP=clang
CC=clang

INC_PATH_FLAG=-I. 
# iOS平台的编译选项
IOS_FLAG=-arch ${ARCH} -isysroot ${SDK_PATH} -miphoneos-version-min=8.0
CFLAG=-Wall -O2  ${INC_PATH_FLAG} ${IOS_FLAG}
CPPFLAG=-Wall -O2  ${INC_PATH_FLAG} ${IOS_FLAG}

IOS_LINK_FLAG=-framework CoreFoundation 

RM=rm
MKDIR=mkdir

# OBJECTS变量，后文会通过${OBJECTS}来使用
OBJECTS=${OBJ_D}/string.o 
	
# 最终target，make解析makefile的时候会将第一个遇到的target作为最终target来执行本次操作
all:${ARCH_D}/libutil.a

#下面是对资源文件的编译，生成.o中间文件        
${OBJ_D}/string.o:unix/string.c
	${CC} ${CFLAG} -c unix/string.c -o ${OBJ_D}/string.o

$(OBJ_D):
	${MKDIR} ${OBJ_D}

$(OUT_D):
	${MKDIR} ${OUT_D}

$(ARCH_D):
	${MKDIR} ${ARCH_D}

# 对应于上面的all，依赖项是${OUT_D} ${ARCH_D} ${OBJ_D}对应的文件夹的创建和${OBJECTS} 对应的资源文件的编译
${ARCH_D}/libutil.a: ${OUT_D} ${ARCH_D} ${OBJ_D} ${OBJECTS} 
	libtool -static ${IOS_LINK_FLAG} -o ${ARCH_D}/libutil.a ${OBJECTS} #此处其实也可以使用Linux的 ar 命令
	
# Phony Target: realclean 依赖于clean的执行，调用make realclean会先调用make clean清除编译过程中的中间文件，再清除目标文件(为了多平台)
realclean: clean
	${RM} -rf ${OUT_D}

clean:
	${RM} -rf ${OBJ_D}
```

### Shell

```shell
LIB_NAME=libutil.a
LIB_OS_NAME=libutil_os.a
LIB_SIMULATOR_NAME=libutil_simulator.a

OUT_D=out
HEADER_D=${OUT_D}/include

ARCH_OS_LIST=("armv7" "armv7s" "arm64")
# 得到ARCH_OS_LIST的数量
ARCH_OS_COUNT=${#ARCH_OS_LIST[@]}
# 组合ARCH_OS_LIST中每一个元素和LIB_OS_NAME，得到数组("armv7/libnetca_util.2.5.1_os.a",...)
LIB_OS_PATHS=(${ARCH_OS_LIST[@]/%//${LIB_NAME}})

ARCH_SIM_LIST=("i386" "x86_64")
ARCH_SIM_COUNT=${#ARCH_SIM_LIST[@]}
LIB_SIM_PATHS=(${ARCH_SIM_LIST[@]/%//${LIB_NAME}})

#Compile 使用-f指定makefile，Phony Target realclean清除所有中间文件和目标文件
make -f makefile.ios realclean

#定义函数
arch_make() {
	make -f makefile.ios clean
	make -f makefile.ios ARCH=$1 DEVICE=$2
}

#遍历上面定义的数组，为OS的每个架构创建.a文件
for ((i=0; i < ${ARCH_OS_COUNT}; i++))
do
	arch_make ${ARCH_OS_LIST[i]} "OS"
done
#遍历上面定义的数组，为SIMULATOR的每个架构创建.a文件
for ((i=0; i < ${ARCH_SIM_COUNT}; i++))
do
	arch_make ${ARCH_SIM_LIST[i]} "Simulator"
done

#HEADER FILE 头文件提取出来
mkdir ${HEADER_D}
cp *.h ${HEADER_D}/

#LIPO 合成为"Fat Library"
cd ${OUT_D}
lipo -create ${LIB_OS_PATHS[@]} -output ${LIB_OS_NAME}
lipo -create ${LIB_SIM_PATHS[@]} -output ${LIB_SIMULATOR_NAME}


```

## 总结

1. 感觉 makefile 还是有必要学会，因为编译和链接可以由自己掌握。
2. 此次编写 makefile 的工作不是很难，因为这只是要移植部分里面最简单最小的一个库。
3.  makefile 在 iOS 上的使用方面，最主要的困难还是如何指定 SDK ，毕竟移植到 iOS 的时候，Win 上或 Linux 上的代码并不是都可用，像这次就需要用到 iOS 的 SDK 里 CoreFoundation 的内容去替换一些已有的实现。



