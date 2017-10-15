---
title: 简简单单说说PKI On iOS
date: 2016-04-09 20:16:05
tags: 
- Security

---


Hacker,问你惊未Σ( ° △ °|||)︴

<!--more-->

![神探夏洛克](http://7xs4ed.com1.z0.glb.clouddn.com/Crypto_Sherlock.jpg) 


看了很多侦探片之后，逐渐发现加解密的神奇所在。能够在别人无法察觉的情况下传递信息（我很喜欢看这些片子，哈哈哈）。无论是Morse Code还是对着某本书根据页码行数字数来确定表达信息，都能让我看到前人的智慧。说真的，我特别钟意神探夏洛克，就算英文渣渣也会在更新的时候到Youtube上看看，等翻译完再翻看一次。记得中国剧场那一集最后根据伦敦地图破解了藏在苏州码子里的暗号，So Sexy~··   
​    
今天来聊聊阿澤君的故事，顺便谈谈

1. CommonCryto中关于DES、AES的部分内容
2. iOS的Security框架里关于RSA加密的部分内容....

阿澤君是个大四🐶，最近在烦毕业论文的事情。辛辛苦苦撸了二十个年(xiao)头(shi)的论文，肯定要第一时间交到老师手里，让他看看，好舒缓阿澤君难产的心情。阿澤君知道有个Hacker君一直在觊觎阿澤君的论文，想拿过来一抄了之。而且Hacker君是一流的网络黑客，盗线偷取别人的信息是最在行的了。因此怎么发给千里之外的老师可难为阿澤君了。。。    

![沉思...](http://7xs4ed.com1.z0.glb.clouddn.com/common/focusOnCom.jpg)    

很快，阿澤君想到用加密的方法，利用对称加密的方法给论文加密后发送给老师。

![开心](http://7xs4ed.com1.z0.glb.clouddn.com/common/bucuowo.jpg)


# 对称加密    

采用单钥密码系统的加密方法，同一个密钥可以同时用作信息的加密和解密。加密算法中数DES、3DES、AES(块算法)和RC4(流算法)最为常用了。

## DES
DES 使用一个 56 位的密钥以及附加的 8 位奇偶校验位，产生最大 64 位的分组大小。这是一个迭代的分组密码，使用称为 Feistel 的技术，其中将加密的文本块分成两半。使用子密钥对其中一半应用循环功能，然后将输出与另一半进行“异或”运算；接着交换这两半，这一过程会继续下去，但最后一个循环不交换。DES 使用 16 个循环，使用异或，置换，代换，移位操作四种基本运算。    

![DES](http://7xs4ed.com1.z0.glb.clouddn.com/Crypto_DES.jpg)    

图片是度娘找的，将就看看哈~

### 3DES

3DES是在DES的基础上做了两次加密和一次解密。具体实现如下：设Ek()和Dk()代表DES算法的加密和解密过程，K代表DES算法使用的密钥，P代表明文，C代表密文，这样：  
3DES加密过程为：C=Ek3(Dk2(Ek1(P)))    
3DES解密过程为：P=Dk1(EK2(Dk3(C)))    
若**Ek1 == Ek2 == Ek3**，就是简单的DES了。

## AES
![AES](http://7xs4ed.com1.z0.glb.clouddn.com/Crypto_AES.png)    
图片来自网络，若有侵犯到权利之处，请告知，谢谢~    

AES加密过程涉及到4种操作：字节替代（SubBytes）、行移位（ShiftRows）、列混淆（MixColumns）和轮密钥加（AddRoundKey）。解密过程分别为对应的逆操作。由于每一步操作都是可逆的，按照相反的顺序进行解密即可恢复明文。加解密中每轮的密钥分别由初始密钥扩展得到。算法中16字节的明文、密文和轮密钥都以一个4x4的矩阵表示。    
算法详细已经有其他人写了，我就不再造轮子了。[密码算法详解——AES](http://www.blogfshare.com/aes-rijndael.html)    
还有算法及解密算法的[模式介绍](http://blog.csdn.net/searchsun/article/details/2516191)，可以了解了解~    

## RC4

不同于块算法的是，RC4等流算法不是对明文进行分组处理，而是字节流的方式依次加密明文中的每一个字节，解密的时候也是依次对密文中的每一个字节进行解密。

## CommonCrypto

对于身为iOS攻城狮的阿澤君来说，感觉还是这一部分比较重要。    

### CommonCrypto的一些主要的结构体

1. CCOperation：定义操作：加密或解密

``` 
enum {
    kCCEncrypt = 0, 
    kCCDecrypt,     
};
typedef uint32_t CCOperation;
```

2. CCAlgorithm：加解密算法，很明显就不详细说明了。

``` objc
enum {
    kCCAlgorithmAES128 = 0,
    kCCAlgorithmAES = 0,
    kCCAlgorithmDES,
    kCCAlgorithm3DES,       
    kCCAlgorithmCAST,       
    kCCAlgorithmRC4,
    kCCAlgorithmRC2,   
    kCCAlgorithmBlowfish    
};
typedef uint32_t CCAlgorithm;
```

3. CCOptions：选项：按照P7补足块算法的块长度或者选择ECB模式，关于模式请看上面AES中介绍的文章。对于RC4等流算法不适用。或者说不需要使用到

``` objc
enum {
    kCCOptionPKCS7Padding   = 0x0001,
    kCCOptionECBMode        = 0x0002
};
```

4. KeySize和BlockSize：规定加解密密钥的长度和明文密文块的长度

``` objc
enum {
    kCCKeySizeAES128          = 16,
    kCCKeySizeAES192          = 24,
    kCCKeySizeAES256          = 32,
    kCCKeySizeDES             = 8,
    kCCKeySize3DES            = 24,
    kCCKeySizeMinCAST         = 5,
    kCCKeySizeMaxCAST         = 16,
    kCCKeySizeMinRC4          = 1,
    kCCKeySizeMaxRC4          = 512,
    kCCKeySizeMinRC2          = 1,
    kCCKeySizeMaxRC2          = 128,
    kCCKeySizeMinBlowfish     = 8,
    kCCKeySizeMaxBlowfish     = 56,
};
enum {
    /* AES */
    kCCBlockSizeAES128        = 16,
    /* DES */
    kCCBlockSizeDES           = 8,
    /* 3DES */
    kCCBlockSize3DES          = 8,
    /* CAST */
    kCCBlockSizeCAST          = 8,
    kCCBlockSizeRC2           = 8,
    kCCBlockSizeBlowfish      = 8,
};
```

### 通过代码实现

#### 导入CommonCrypto的头文件。

``` objc
#import <CommonCrypto/CommonCrypto.h>
```

#### symCrypt

``` objc
/*!
    @function   symCrypt
    @abstract   对称解密
    @param      operation       加密或解密
    @param      data            需要加解密的数据
    @param      algorithm       加解密所采用的算法
    @param      key             加解密时提供的密钥
    @param      iv              Initialization Vector(CBC模式下需要)
    @param      options         加密数据字节数不是block的整数倍时需要制定padding
                                详情参见CommonCryptor头文件
    @param      status          加解密成功与否所返回的状态
    @result     解密后得到的结果
 */
- (NSData *)symCrypt:(CCOperation)operation
         processData:(NSData *)data
      UsingAlgorithm:(CCAlgorithm)algorithm
                 key:(NSData *)key
 initalizationVector:(NSData *)iv
             options:(CCOptions)options
              status:(CCCryptorStatus *)status
{
    NSData *result = nil;
    NSMutableData *cKey = [key mutableCopy], *cIV = [iv mutableCopy];
    [self fixKeyLengthsByAlgorithm:algorithm keyData:cKey ivData:cIV];//1
    size_t bufferSize = [data length] + [self blockSizeByAlgorithm:algorithm]; // 2
    void *buffer = malloc(bufferSize); //3
    size_t encryptedSize = 0;
    *status = CCCrypt(operation, algorithm, options, [cKey bytes], [cKey length], [cIV bytes], [data bytes], [data length], buffer, bufferSize, &encryptedSize); //4
    if (*status == kCCSuccess) {
        result = [NSData dataWithBytes:buffer length:encryptedSize];  //5
    } else {
        NSLog(@"[ERROR] failed to encrypt|CCCryptoStatus: %d", *status);
    }
    free(buffer);  //6
    return result;  //7
}
```

1. 根据加解密算法检查Key和iv的长度是否符合要求，详细请看下面列出的函数fixKeyLength
2. 加密后的数据总小于等于数据长度加上block的大小
3. 申请bufferSize的空间以保存加密或解密后的数据
4. 调用CCCrypt函数实现加解密。
``` objc
CCCryptorStatus CCCrypt(
    CCOperation op,         /* 加密或解密：kCCEncrypt, etc. */
    CCAlgorithm alg,        /* 加解密采用的算法：kCCAlgorithmAES128, etc. */
    CCOptions options,      /* kCCOptionPKCS7Padding, etc. */
    const void *key,        /* 密钥 */
    size_t keyLength,       /* 密钥长度 */
    const void *iv,         /* iv，使用与CBC模式下，明文后32位和iv异或后做为下一阶段的前32位 */
    const void *dataIn,     /* 要加密或解密的数据 */
    size_t dataInLength,    /* 数据长度 */
    void *dataOut,          /* 注意传入的是指针，加解密后的数据将从此处返回 */
    size_t dataOutAvailable,/* 为dataOut申请的可写长度 */
    size_t *dataOutMoved    /* 结果所占的长度 */
    )    
    __OSX_AVAILABLE_STARTING(__MAC_10_4, __IPHONE_2_0);
```
5. 若成功，则将(void *)类型的数据封装到NSData中。
6. 释放申请的buffer内存
7. 返回。

#### fixKeyLength

``` objc
/*!
    @function   fixKeyLength
    @abstract   修改密钥长度至与算法匹配
    @param      algorithm       加解密所采用的算法
    @param      keyData         密钥
    @param      ivData          Initialization Vector
    @result     将密钥长度和iv修改至与算法匹配的长度
 */
- (void)fixKeyLengthsByAlgorithm:(CCAlgorithm)algorithm
                         keyData:(NSMutableData *)keyData
                          ivData:(NSMutableData *)ivData
{
    NSUInteger keyLength = [keyData length];
    switch (algorithm) {
        case kCCAlgorithmAES:
        {
            if (keyLength < kCCKeySizeAES128) {
                keyData.length = kCCKeySizeAES128;
            } else if (keyLength < kCCKeySizeAES192) {
                keyData.length = kCCKeySizeAES192;
            } else {
                keyData.length = kCCKeySizeAES256;
            }
            break;
        }
        case kCCAlgorithmDES:
        {
            keyData.length = kCCKeySizeDES;
            break;
        }
        case kCCAlgorithm3DES:
        {
            keyData.length = kCCKeySize3DES;
            break;
        }
        case kCCAlgorithmRC4:
        {
            keyData.length = kCCKeySizeMaxRC4;
            break;
        }
        default:
            break;
    }
    ivData.length = keyData.length;
}
```

#### blockSizeByAlgorithm

``` objc 
/*!
    @function   blockSizeByAlgorithm
    @abstract   根据算法获取每个block的大小
    @param      algorithm       加密所采用的算法
    @result     该算法对应的block大小
 */
- (size_t)blockSizeByAlgorithm:(CCAlgorithm)algorithm {
    switch (algorithm) {
        case kCCAlgorithmAES:
            return kCCBlockSizeAES128;
        case kCCAlgorithmDES:
        case kCCAlgorithm3DES:
        case kCCAlgorithmRC4:
            return kCCBlockSizeDES;
        default:
            return 0;
    }
}
```

上述两个函数主要是为了规范密钥的长度和获取明文密文块的长度，很好理解就不详细介绍了。这样还是不能傻瓜式地调用，因此阿澤君创建了DESCipherActor继承于SymCipherActor，进一步进行封装：
　　DESCipherActor.h
　　``` objc
    - (NSString *)encryptInCBC:(NSString *)plainText key:(NSString *)key iv:(NSData *)iv;
    - (NSString *)decryptInCBC:(NSString *)cipherText key:(NSString *)key iv:(NSData *)iv;
    - (NSString *)encryptInEBC:(NSString *)plainText key:(NSString *)key;
    - (NSString *)decryptInEBC:(NSString *)cipherText key:(NSString *)key;
　　```
　　还有AES、RC4的实现大致相同，具体可参考Demo，已经上传[Github](https://github.com/objchris/PKIDemo)


　　果然，采用加密算法加密后的论文顺利发到老师那里，问题是解密用密钥还在阿澤君手上，老师还是无法看到论文内容，密钥不能通过网络传输给老师，因为Hacker君还在监听着阿澤君和老师的通讯。难道要阿澤君不惧千里（其实不是很远，哈哈哈。我就夸张那么一点点~）去到老师那边，那为何不直接将论文交给老师呢？！！！    
　　What the ****！！！💔💔阿澤君此时心里千万只草泥马在奔腾。        

![掀桌子](http://7xs4ed.com1.z0.glb.clouddn.com/common/desk.jpg)    

　　但是阿澤君不会这样轻易地狗带，因为还可以通过非对称加密来解决...


# 非对称加密

对称加密算法在加密和解密时使用的是同一个秘钥；而非对称加密算法需要两个密钥来进行加密和解密，这两个秘钥是公开密钥（public key，简称公钥）和私有密钥（private key，简称私钥）。
如甲乙双方需要加密通信：

1. 乙方生成一对密钥（公钥和私钥）并将公钥向其它方公开。
2. 得到该公钥的甲方使用该密钥对机密信息进行加密后再发送给乙方。
3. 乙方再用自己保存的另一把专用密钥（私钥）对加密后的信息进行解密。乙方只能用其专用密钥（私钥）解密由对应的公钥加密后的信息。

　　在传输过程中，即使攻击者截获了传输的密文，并得到了乙的公钥，也无法破解密文，因为只有乙的私钥才能解密密文。
　　同样，如果乙要回复加密信息给甲，那么需要甲先公布甲的公钥给乙用于加密，甲自己保存甲的私钥用于解密。
　　说到非对称加密，不得不说RSA（其实是阿澤君只接触过这个。。。）

![](http://7xs4ed.com1.z0.glb.clouddn.com/common/yaoMing.png)

## RSA

### 算法原理

1. 选取两个质数p和q, 计算`n = p * q` 。p和q要尽量大
2. 根据质数`φ(p)=p-1`和欧拉方程满足乘法结合率的规律求出φ(n),即`φ(n)=(p-1)(q-1)`
3. 选取质数e作为公钥指数, e的范围`1<e<φ(n)`,且 e 与 φ(n) 互质
4. 出e对φ(n)的模反元素d，求解公式：`ed ≡ 1 (mod φ(n))`即可得出
   这样计算后(n,e)是公钥，(n,d)是私钥。
>公钥加密公式    
>m^e ≡ c (mod n) 即 c = m^e mod n     
>私钥解密公式    
>c^d ≡ m (mod n) 即 m = c^d mod n    

RSA加密常用的填充方式有下面3种：    

1. RSA_PKCS1_PADDING 填充模式，最常用的模式    
   输入：必须 比RSA钥模长(modulus)短至少11个字节，也就是RSA_size(rsa) – 11。如果输入的明文过长，必须切割，然后填充    
   输出：和modulus一样长    
   根据这个要求，对于1024bit的密钥，block length = 1024/8 – 11 = 117 字节     
2. RSA_PKCS1_OAEP_PADDING    
   输入：RSA_size(rsa) – 41    
   输出：和modulus一样长    
3. for RSA_NO_PADDING 不填充    
   输入：可以和RSA钥模长一样长，如果输入的明文过长，必须切割，然后填充    
   输出：和modulus一样长    

特别推荐的是阮一峰的日志两篇日志，写得非常好，我也是参考这个写的：    
[RSA算法原理（一）](http://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html)  
[RSA算法原理（二）](http://www.ruanyifeng.com/blog/2013/07/rsa_algorithm_part_two.html)

### iOS Security.framework

#### encryptWithPublicKey

``` objc
- (NSString *)encrypt:(NSString *)stringToEncrypt withPublicKey:(SecKeyRef)publicKey{
    OSStatus status = noErr;
    size_t cipherBufferSize;
    uint8_t *cipherBuffer;
    uint8_t *dataToEncrypt = (uint8_t *)[stringToEncrypt cStringUsingEncoding:NSUTF8StringEncoding];
    size_t dataLength = stringToEncrypt.length;
    NSLog(@"dataLength: %zu", dataLength);
    cipherBufferSize = SecKeyGetBlockSize(publicKey);       // 1
    cipherBuffer = malloc(cipherBufferSize);
    size_t totalBufferSize = 0;
    NSMutableData *data = [[NSMutableData alloc] init];    // 2
    //使用kSecPaddingPKCS1作为加密的padding
    if ((cipherBufferSize - 11) < dataLength) {            // 3
        //若需要加密的数据长度过长，需要分块加密
        size_t toEncryptDataLength = dataLength;
        while ((cipherBufferSize - 11) < toEncryptDataLength) { // 4
            status = SecKeyEncrypt(publicKey,
                                   kSecPaddingPKCS1,
                                   dataToEncrypt + (dataLength - toEncryptDataLength),
                                   cipherBufferSize - 11,
                                   cipherBuffer,
                                   &cipherBufferSize);          // 5
            toEncryptDataLength = toEncryptDataLength - (cipherBufferSize - 11);        //6
            //CipherBuffer是通过malloc创建，没有对内存空间进行初始化，有很多其他数据
            //转储成NSData，确保对正确长度的cipherBuffer的获取
            [data appendData:[NSData dataWithBytes:cipherBuffer length:cipherBufferSize]];    //7
            totalBufferSize += cipherBufferSize;    //8
        }
        //对剩余的数据进行加密
        status = SecKeyEncrypt(publicKey,
                               kSecPaddingPKCS1,
                               dataToEncrypt + (dataLength - toEncryptDataLength),
                               toEncryptDataLength,
                               cipherBuffer,
                               &cipherBufferSize);
        [data appendData:[NSData dataWithBytes:cipherBuffer length:cipherBufferSize]];               
        totalBufferSize += cipherBufferSize;
    } else {
        //需要加密的数据长度小于SecKeyGetBlockSize(publicKey)－11，直接加密
        status = SecKeyEncrypt(publicKey, kSecPaddingPKCS1, dataToEncrypt, dataLength, cipherBuffer, &cipherBufferSize);
        [data appendData:[NSData dataWithBytes:cipherBuffer length:cipherBufferSize]];
    }
    if (publicKey) {
        CFRelease(publicKey);
    }
    NSString *encryptedString = [GTMBase64 stringByEncodingData:[data copy]];            //9
    free(cipherBuffer);            //10
    return encryptedString;
}
```

1. 根据Key判断加解密块大小（若使用kSecPaddingPKCS1，需要手动调整块大小小于这个返回值 - 11）
2. 创建MutableData用以下面操作添加Data
3. 判断数据总大小是否大于SecKeyGetBlockSize(publicKey) - 11，是则拆分成多个块加解密，否则直接加解密。
4. while循环多次操作
5. 使用SecKeyEncrypt进行加解密
``` objc
OSStatus SecKeyEncrypt(
    SecKeyRef           key,                //加解密使用的密钥
    SecPadding          padding,            //padding，一般为kSecPaddingPKCS1，需要注意数据块的大小问题
    const uint8_t       *plainText,          //明文
    size_t              plainTextLen,        //明文长度
    uint8_t             *cipherText,        //返回的密文
    size_t              *cipherTextLen)     //返回的密文长度
    __OSX_AVAILABLE_STARTING(__MAC_10_7, __IPHONE_2_0);
```
6. 将已经加解密过的数据剔除
7. 往MutableData中添加数据
8. 计算总的BufferSize，这里只是做个统计
9. 将得到的数据进行Base64转码
10. 记得释放cipherBuffer


#### decryptWithPrivateKey

``` objc 
- (NSString *)decrypt: (NSString *)stringToDecrypt withPrivateKey:(SecKeyRef)privateKey {
    NSData *dataToDecrypt = [GTMBase64 decodeString:stringToDecrypt];
    OSStatus status = noErr;
    size_t cipherBufferSize = [dataToDecrypt length];
    uint8_t *cipherBuffer = (uint8_t *)[dataToDecrypt bytes];
    size_t plainBufferSize;
    uint8_t *plainBuffer;
    plainBufferSize = SecKeyGetBlockSize(privateKey);
    plainBuffer = malloc(plainBufferSize);
    NSMutableData *data = [[NSMutableData alloc] init];
    size_t decryptLengthPer = SecKeyGetBlockSize(privateKey);
    if (decryptLengthPer < cipherBufferSize) {
        size_t toDecryptDataLength = cipherBufferSize;
        size_t totalBufferSize = 0;
        while (decryptLengthPer < toDecryptDataLength) {
            status = SecKeyDecrypt(privateKey,
                                   kSecPaddingPKCS1,
                                   cipherBuffer + (cipherBufferSize - toDecryptDataLength),
                                   decryptLengthPer,
                                   plainBuffer,
                                   &plainBufferSize);
            toDecryptDataLength = toDecryptDataLength - decryptLengthPer;
            if (status == noErr) {
                [data appendData:[NSData dataWithBytes:plainBuffer length:plainBufferSize]];
            }
            totalBufferSize += plainBufferSize;
        }
        status = SecKeyDecrypt(privateKey,
                               kSecPaddingPKCS1,
                               cipherBuffer + (cipherBufferSize - toDecryptDataLength),
                               decryptLengthPer,
                               plainBuffer,
                               &plainBufferSize);
        if (status == noErr) {
            [data appendData:[NSData dataWithBytes:plainBuffer length:plainBufferSize]];
        }
        totalBufferSize += plainBufferSize;
    } else {
        status = SecKeyDecrypt(privateKey, kSecPaddingPKCS1, cipherBuffer, cipherBufferSize, plainBuffer, &plainBufferSize);
        if (status == noErr) {
            [data appendData:[NSData dataWithBytes:plainBuffer length:plainBufferSize]];
        }
    }
    if (privateKey) {
        CFRelease(privateKey);
    }
    NSString *decryptedString = [[NSString alloc] initWithData:[data copy] encoding:NSUTF8StringEncoding];
    free(plainBuffer);
    return decryptedString;
}
```

解密和加密的方式基本一样，此处不多加赘述。
[Demo](https://github.com/objchris/PKIDemo)


**Hacker君，问你惊未，哈哈哈哈哈。**    
非对称加密对阿澤君来说完全解决了问题(づ￣ 3￣)づ，使用老师的公钥加密论文后发送回给他。Hacker君就算截取到也无济于事，因为Hacker君没有老师的私钥，无法获取到其中的内容。老师获取到阿澤君发送的论文后自然可以解密查看。    

![哈哈哈哈](http://7xs4ed.com1.z0.glb.clouddn.com/common/hahahahaha.jpg)    
从中阿澤君也学到了很多，所以分享给大家❤️。故事有(fei)点(chang)弱智，希望大家不要在意，关注加解密算法就好了~
　　

题外话：PKI基础最近才接触，学得不深，有些东西写错请大家见谅。    
更多的算法，eg：数字摘要、数字签名、口令认证等等都在[Github](https://github.com/objchris/PKIDemo)上了，有兴趣请移步。     
关于加解密，貌似OpenSSL会经常用，具体阿澤君也不清楚，还需要更加深入的学习，共勉吧！！！！
