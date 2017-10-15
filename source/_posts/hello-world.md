---
title: Hello World Again
date: 2017-2-17 20:04:10
tags: 
- Mood
---
决定给博客的名字起为OAOA。

趁着最近没有动力看书，又不想脑袋生锈，又看腻了之前Hexo的yilia主题。所以换个博客主题，Hello World Again。

<!-- more -->

![](http://7xs4ed.com1.z0.glb.clouddn.com/helloworld_background.png)

## 开始捣鼓

不是前端er要自己写个主题出来还真不是简单的事情。所以借鉴了hollow主题，并在其上进行修改。



### 主页

主页大致上没有做太多的修改，因为一开始就是看上这种简简单单的，没有太多复杂成分的排版。厌倦了yilia，第一是：不想要左右版式的页面，显得左侧的菜单栏有点喧宾夺主。第二是：总把人脸留在左边显眼的位置，不太好意思～

hollow主题只是包含了主页，也就是现实文章序列和文章详情。其他的都没有。



### Categories

进入分类页面在主页右上角的钻石按钮，分类页面是显示所有博文的分类。

因为暂时不支持站内搜索，如果要找某一篇文章需要一页页地翻，感觉会很繁琐。所以建立了个分类页面。

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
                    <h1>Categories</h1>
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
                <% site.categories.each(function(category){ %>
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

修改完page.ejs后，执行`hexo new page "categories"`就可以创建categories页了。然后调整格式就可以了。



### About和Demo

这两个页面是自己添加的。

这两个页面是最复杂的。首先Hexo只支持index,page,post,layout,archive这几种自定义页面，所以修改了page后作为category页面之后就不能通过修改项目页面模板来添加新的自定义页面了。

但是好在Hexo还是比较人性化的。

除了修改Hexo的模板，有两种方法可以实现自定义页面

1. 先执行`hexo new page "xxx"`，在source中出现xxx文件夹，其中有xxx.md，然后在xxx.md前加上layout：false，可以绕过Hexo解析，直接将md中的内容显示出来，这样就可以在md里面写html代码了。详见[Hexo文档](https://hexo.io/zh-cn/docs/writing.html)
2. 执行`hexo new page "xxx"`，同样得到xxx文件夹，你可以将这个文件夹当作一个项目的根目录，然后在其中尽情创建html，css，js，whatever you want。然后记得在博客的主_config.yml中的skip_render项添加xxx/**，就可以了。

### 评论

评论就不加啦，毕竟清清爽爽还是最爱啊。

有问题在微博等社交平台联系吧。





## 写在后面

博客是在hollow主题的[创作家](https://github.com/zchen9/hexo-theme-hollow)的基础上进行修改的，表示真挚的感谢。

如果要自己写主题，[Hexo文档](https://hexo.io/zh-cn/docs/writing.html)记得多看看。

### 对于这次实践的总结：

不是很难，像我没学过Node.js的都可以弄出来。

html,css,js这些基础一定要会。

需要学习下ejs,stylus，都不是很难的东西。

多看看别人的代码，受受别人的启发。