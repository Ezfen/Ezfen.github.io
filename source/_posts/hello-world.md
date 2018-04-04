---
title: Hello World Again
date: 2017-2-17 20:04:10
tags: 
- Mood
typora-copy-images-to: ipic
---
决定给博客的名字起为**童年CHILDHOOD**。

**如童年般纯真，热爱，不朽。**

趁着最近没有动力看书，又不想脑袋生锈，又看腻了之前Hexo的yilia主题。所以换个博客主题，Hello World Again。

<!-- more -->

## 开始捣鼓

不是前端er要自己写个主题出来还真不是简单的事情。所以借鉴了hollow主题，并在其上进行修改。

### 主页

主页大致上没有做太多的修改，因为一开始就是看上这种简简单单的，没有太多复杂成分的排版。厌倦了yilia，第一是：不想要左右版式的页面，显得左侧的菜单栏有点喧宾夺主。第二是：总把人脸留在左边显眼的位置，纯粹的不喜欢。

hollow主题只是包含了主页，也就是显示文章序列和文章详情。其他的都没有。

### Tags

进入标签页面在主页右上角的 *井号* 按钮，标签页面是显示所有标签。

因为暂时不支持站内搜索（还在构思中...），如果要找某一篇文章需要一页页地翻，感觉会很繁琐。所以建立了个标签页面。

我是通过修改page.ejs来达到目的。

``` html
<section class="article-container">
<!-- Back Home -->
<%- partial('_partial/backhome') %>

<!-- Page Header -->
<header class="intro-header">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                <div class="post-heading">
                    <h1>TAGS</h1>
                </div>
            </div>
        </div>
    </div>
</header>

<!-- Post Content -->
<article>
    <div class="container">
        <div class="row">
            <!-- Post Main Content -->
            <div class="post-content col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
                <% site.tags.each(function(category){ %>
                    <a class="category" href="<%-category.name%>"><%-category.name%></a>
                <% }); %>
            </div>
        </div>
    </div>
</article>
</section>
<!-- Back to top -->
<%- partial('_partial/backtop') %>
```

修改完page.ejs后，执行`hexo new page "tags"`就可以创建tags页了。然后调整格式就可以了。

### About（最近修改中...）

这个页面是自己添加的。

这个页面是最复杂的。首先Hexo只支持`index`,`page`,`post`,`layout`,`archive`这几种自定义页面，所以修改了`page`后作为category页面之后就不能通过修改项目页面模板来添加新的自定义页面了。

但是好在Hexo还是比较人性化的。

除了修改Hexo的模板，有两种方法可以实现自定义页面

1. 先执行`hexo new page "xxx"`，在source中出现xxx文件夹，其中有xxx.md，然后在xxx.md前加上layout：false，可以绕过Hexo解析，直接将md中的内容显示出来，这样就可以在md里面写html代码了。详见[Hexo文档](https://hexo.io/zh-cn/docs/writing.html)
2. 执行`hexo new page "xxx"`，同样得到xxx文件夹，你可以将这个文件夹当作一个项目的根目录，然后在其中尽情创建html，css，js，whatever you want。然后记得在博客的主_config.yml中的skip_render项添加xxx/**，就可以了。

### 评论

评论就不加啦，毕竟清清爽爽还是最爱啊。

而且好像也没有很多人来过这个博客，等以后有需要再加上评论吧。

厌倦了多说等评论管理平台的话，推荐一个 [Gitment](https://github.com/imsun/gitment)，观望了很久还是觉得这个比较简洁，不需要依赖其他第三方平台，它是将评论放在Github的issue里面，很适合托管在第三方服务器空间的博客使用。

有问题在微博等社交平台联系吧。

### 域名和全站HTTPS

域名在万网上购买，实名认证，解析到github page。都是很简单的操作。

在实现全站HTTPS的时候走了不少弯路。主要想实现的有如下几点：

- [x] 全站小绿锁


- [x] 怕HTTPS慢，所以上CDN


- [ ] ~~自定义SSL证书~~ (无解)

因为博客是托管在Github上的，要强制HTTPS，Coding可以做到，但是没有必要再部署一套到Coding上。所以就想到使用CDN来实现，顺便解决网页的访问速度问题。

CDN有国内几家云服务厂商有免费流量，又拍云、腾讯云等。都支持上传自定义SSL证书。但我的博客没有国内的服务器空间，自然没有私钥，无法申请证书。

工信部的备案系统虽然减少了很多黑网站，但也让我们这些只有域名没有空间的人徒增了许多麻烦。所以最后选了国外的CDN厂商[Cloudflare](https://www.cloudflare.com/)来解析我的域名，Cloudflare和百度云合作，在国内也有CDN服务器，先试试速度如何，且免费版本基本能够满足要求，配置也不难。

在Cloudflare成功解析后，在Page rules中定义重定向，将`http`301永久重定向到`https`。Cloudflare还可以设置缓存时间，设置用户与DNS、DNS与我们博客的服务器之间是否使用SSL，压缩CSS、JS，永久在线（不定时向服务器请求数据），安全级别（防DDoS）等。

设置完后，看到了久违的小绿锁：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/rwfkq.png)

但是，点击文章，可以看到：

![](https://oaoa-1256157051.cos.ap-guangzhou.myqcloud.com/blog/dw1rg.png)

访问时就有『并非完成安全』的提示，这涉及一个小问题，就是图床，我的图片资源是托管在七牛云上的，之前七牛云还提供`https`的二级域名，但现在已经关闭，要使用`https`需要自定义域名，这又回到上面所说的备案问题。纠结之余，将七牛云迁移到腾讯云COS上，腾讯云COS就有支持SSL的图床测试域名，且提供CDN服务，同样是每月免费空间，免费流量，对于我这个小站来说，足够了。

所以，Congratulations~😄😄😄🎉🎉🎉~

## 写在后面

总有一些奇思妙想，所以本文仍在不断更新...

博客是在hollow主题的[创作家](https://github.com/zchen9/hexo-theme-hollow)的基础上进行修改的，对此表示最真挚的感谢，开源万岁。

如果要自己写主题，[Hexo文档](https://hexo.io/zh-cn/docs/writing.html)记得多看看。

对于域名购买和Cloudflare、腾讯云的使用，Google可以搜到许多精彩且详细的文章，此处就不再赘述了。

### 对于这次实践的总结：

* 虽然是Node.js小白，但勉强做得出来，因为一行nodejs的代码都没写到
* HTML、CSS、JS可以做很多事情
* 需要学习下ejs、stylus，都不是很难
* 多看看别人的代码，很受启发