---
title: 使用makefile创建静态库
date: 2017-08-08 22:17:57
tags: 
- Library
---

说来惭愧，自己的C/C++水平还没有到达很高的水平，但是最近工作上需要将Win上的一个C库移植到iOS上以支持业务的开展，修改代码后需要编译成静态库供iOS使用。     

一种很简单的方式就是创建Cocoa Touch Static Library项目，然后直接将所需要的代码文件无脑添加到项目里面，编译，合成，结束~    

但是为了使用Windows或Linux的同事在修改完代码后也能编译出静态库而无需再搬到Mac上操作，所以学习了一下makefile，完成了这项工作。    

<!--more-->

本文只是皮毛，写点在此次工作中的一些历程。     

## 静态库特点

> - 静态库对函数库的链接是放在编译时期完成的。
> - 程序在运行时与函数库再无关系，移植方便。
> - 浪费空间和资源，因为所有相关的目标文件与牵涉到的函数库被链接合成一个可执行文件。
> - 更新困难。当程序所依赖的静态库有任何更新，整个程序就要重新链接。

留下疑问：是否可以理解为：只需要其他库的头文件？

## makefile

makefile本身只是一个文件，用来辅助make命令执行时，告诉make命令怎么去编译和链接程序。    

那编译和链接的规则是：

> - 如果这个工程没有编译过，那么我们的所有C文件都要编译并被链接。
> - 如果这个工程的某几个C文件被修改，那么我们只编译被修改的C文件，并链接目标程序。
> - 如果这个工程的头文件被改变了，那么我们需要编译引用了这几个头文件的C文件，并链接目标程序。

Google可以搜素到很多makefile的好文章，这里简略介绍一下：

### 基本语句

```
target : prerequisites
	command
```

- target : 编译或链接最终得到的目标文件，例如.o结尾的中间文件、由.o文件链接而成的Win下的可执行文件，.o文件打包而成的静态库文件
- prerequisites : 依赖，也就是编译成.o的.c、.cpp、.m和.h，链接成动态库、静态库、可执行文件的.o
- command : 命令，即如何将上述的依赖编译或链接成我们要的target，需要注意的是，command前必须要有一个制表符(tab)，不能是一连串的空格，也不能缺失。





#### Phony Target

PHONY 目标并非实际的文件名：只是在显式请求时执行命令的名字。    

像平常我们需要自己编译第三方库的时候，在执行完链接后需要清楚产生的中间文件或其他配置等，需要执行`make clean`，这里的clean就是makefile中被定义的Phony Target。下面例子会说到。    

一个makefile只能有一个总的Target(编译链接得到我们最终需要的文件)，如果需要多个Target，可以使用Phony Target来实现。当然，上述说到的除编译链接之外的操作用Phony Target也是很好的选择。



### 变量

像写程序一样直接定义变量，变量在左侧，值在右侧，等号分开，然后通过`${变量}`使用，例如：

```
DEVICE=OS
DEV_PATH=/Applications/Xcode.app/Contents/Developer/Platforms/iPhone${DEVICE}.platform/Developer
```



### 文件名及使用

当然，既然叫makefile，文件名最好就叫makefile啦，Makefile也是可以的，但是是在makefile不存在的时候，make命令才会去使用。

如果再不喜欢，文件名写成`chris`也可以，只是make的时候加上-f和文件名就好了~

`make -f chris`



## 栗子🌰

好啦，说起来简单，但是实际操作却需要些许耐心~

以下是我写的一个简单的makefile，用于编译资源文件和打包成静态库，还有一个脚本，结合makefile，打包armv7,armv7s,arm64,i386,x86_64这五个平台的静态库，并使用lipo合成为"Fat Library"。

### makefile

```cmake
OUT_D=out
ARCH_D=${OUT_D}/${ARCH}
OBJ_D=tmp
# DEVICE 和 ARCH 是外部传入的值，用于区分是OS还是SIMULATOR，平台是哪种
# 由于C代码中使用到了CoreFoundation和跨平台编译使用到__APPLE__、TARGET_OS_IPHONE等宏，所以需要引入iOS的SDK
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
OBJECTS=${OBJ_D}/string.o \
	${OBJ_D}/lock.o \
    ${OBJ_D}/time.o \
    ${OBJ_D}/NETCA_Alloc.o \
    ${OBJ_D}/NETCA_ArrayList.o \
    ${OBJ_D}/NETCA_BigInteger.o \
    ${OBJ_D}/NETCA_BitSet.o \
    ${OBJ_D}/NETCA_Error.o \
    ${OBJ_D}/NETCA_Stream.o \
	${OBJ_D}/NETCA_Stream_Base64.o \
    ${OBJ_D}/NETCA_Stream_File.o \
    ${OBJ_D}/NETCA_Stream_Hex.o \
    ${OBJ_D}/NETCA_Stream_HMAC.o \
    ${OBJ_D}/NETCA_Stream_MD.o \
    ${OBJ_D}/NETCA_Stream_Mem.o \
    ${OBJ_D}/NETCA_Stream_Null.o \
    ${OBJ_D}/NETCA_Time.o \
    ${OBJ_D}/NETCA_UString.o \
    ${OBJ_D}/NETCA_Util.o \
	${OBJ_D}/NETCA_JSON.o
	
# 最终target，make解析makefile的时候会将第一个遇到的target作为最终target来执行本次操作
all:${ARCH_D}/libnetca_util.2.5.1.a

#下面是对资源文件的编译，生成.o中间文件        
${OBJ_D}/string.o:unix/string.c
	${CC} ${CFLAG} -c unix/string.c -o ${OBJ_D}/string.o

${OBJ_D}/time.o:unix/time.c
	${CC} ${CFLAG} -c unix/time.c -o ${OBJ_D}/time.o

${OBJ_D}/lock.o:unix/lock.c
	${CC} -D_GNU_SOURCE ${CFLAG} -c unix/lock.c -o ${OBJ_D}/lock.o

${OBJ_D}/NETCA_Alloc.o:NETCA_Alloc.c
	${CC} ${CFLAG} -c NETCA_Alloc.c -o ${OBJ_D}/NETCA_Alloc.o

${OBJ_D}/NETCA_ArrayList.o:NETCA_ArrayList.c
	${CC} ${CFLAG} -c NETCA_ArrayList.c -o ${OBJ_D}/NETCA_ArrayList.o
	
${OBJ_D}/NETCA_BigInteger.o:NETCA_BigInteger_Openssl.c
	${CC} ${CFLAG} -Wno-deprecated-declarations -c NETCA_BigInteger_Openssl.c -o ${OBJ_D}/NETCA_BigInteger.o

${OBJ_D}/NETCA_BitSet.o:NETCA_BitSet.c
	${CC} ${CFLAG} -c NETCA_BitSet.c -o ${OBJ_D}/NETCA_BitSet.o

${OBJ_D}/NETCA_Error.o:NETCA_Error.c
	${CC} ${CFLAG} -c NETCA_Error.c -o ${OBJ_D}/NETCA_Error.o

${OBJ_D}/NETCA_Stream.o:NETCA_Stream.c
	${CC} ${CFLAG} -c NETCA_Stream.c -o ${OBJ_D}/NETCA_Stream.o

${OBJ_D}/NETCA_Stream_Base64.o:NETCA_Stream_Base64.c
	${CC} ${CFLAG} -c NETCA_Stream_Base64.c -o ${OBJ_D}/NETCA_Stream_Base64.o

${OBJ_D}/NETCA_Stream_File.o:NETCA_Stream_File.c
	${CC} ${CFLAG} -c NETCA_Stream_File.c -o ${OBJ_D}/NETCA_Stream_File.o

${OBJ_D}/NETCA_Stream_Hex.o:NETCA_Stream_Hex.c
	${CC} ${CFLAG} -c NETCA_Stream_Hex.c -o ${OBJ_D}/NETCA_Stream_Hex.o

${OBJ_D}/NETCA_Stream_HMAC.o:NETCA_Stream_HMAC.c
	${CC} ${CFLAG} -c NETCA_Stream_HMAC.c -o ${OBJ_D}/NETCA_Stream_HMAC.o

${OBJ_D}/NETCA_Stream_MD.o:NETCA_Stream_MD.c
	${CC} ${CFLAG} -c NETCA_Stream_MD.c -o ${OBJ_D}/NETCA_Stream_MD.o

${OBJ_D}/NETCA_Stream_Mem.o:NETCA_Stream_Mem.c
	${CC} ${CFLAG} -c NETCA_Stream_Mem.c -o ${OBJ_D}/NETCA_Stream_Mem.o

${OBJ_D}/NETCA_Stream_Null.o:NETCA_Stream_Null.c
	${CC} ${CFLAG} -c NETCA_Stream_Null.c -o ${OBJ_D}/NETCA_Stream_Null.o

${OBJ_D}/NETCA_Time.o:NETCA_Time.c
	${CC} ${CFLAG} -std=c99 -c NETCA_Time.c -o ${OBJ_D}/NETCA_Time.o

${OBJ_D}/NETCA_UString.o:NETCA_UString.c NETCA_UString_Unicode_Data.c
	${CC} ${CFLAG} -c NETCA_UString.c -o ${OBJ_D}/NETCA_UString.o


${OBJ_D}/NETCA_Util.o:NETCA_Util.c
	${CC} ${CFLAG} -c NETCA_Util.c -o ${OBJ_D}/NETCA_Util.o

${OBJ_D}/NETCA_JSON.o:NETCA_JSON.c
	${CC} ${CFLAG} -c NETCA_JSON.c -o ${OBJ_D}/NETCA_JSON.o


$(OBJ_D):
	${MKDIR} ${OBJ_D}

$(OUT_D):
	${MKDIR} ${OUT_D}

$(ARCH_D):
	${MKDIR} ${ARCH_D}

# 对应于上面的all，依赖项是${OUT_D} ${ARCH_D} ${OBJ_D}对应的文件夹的创建和${OBJECTS} 对应的资源文件的编译
${ARCH_D}/libnetca_util.2.5.1.a: ${OUT_D} ${ARCH_D} ${OBJ_D} ${OBJECTS} 
	libtool -static ${IOS_LINK_FLAG} -o ${ARCH_D}/libnetca_util.2.5.1.a ${OBJECTS} #此处其实也可以使用Linux的 ar 命令
	
# Phony Target: realclean 依赖于clean的执行，调用make realclean会先调用make clean清除编译过程中的中间文件，再清除目标文件(为了多平台)
realclean: clean
	${RM} -rf ${OUT_D}

clean:
	${RM} -rf ${OBJ_D}
```

### Shell

```shell
LIB_NAME=libnetca_util.2.5.1.a
LIB_OS_NAME=libnetca_util.2.5.1_os.a
LIB_SIMULATOR_NAME=libnetca_util.2.5.1_simulator.a

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
cp NETCA_*.h ${HEADER_D}/

#LIPO 合成为"Fat Library"
cd ${OUT_D}
lipo -create ${LIB_OS_PATHS[@]} -output ${LIB_OS_NAME}
lipo -create ${LIB_SIM_PATHS[@]} -output ${LIB_SIMULATOR_NAME}


```

## 总结

1. 感觉makefile还是有必要学会，因为编译和链接可以由自己掌握。
2. 此次编写makefile的工作不是很难，因为这只是要移植部分里面最简单最小的一个库。
3. makefile在iOS上的使用方面，最主要的困难还是如何指定SDK，毕竟移植到iOS的时候，Win上或Linux上的代码并不是都可用，像这次就需要用到iOS的SDK里CoreFoundation的内容去替换一些已有的实现。



