---
title: Google 面试准备记录
description: ''
category: Tech
subcategories:
  - Algorithm
tags: []
publishedAt: '2025-07-01T00:00:00+08:00'
updatedAt: '2025-07-29T00:00:00+08:00'
order: 10
draft: false
legacyUrls:
  - /algorithm/gugu-interview/
  - /notes/algorithm/gugu-interview/
---
> 2025.7.1

三月初找到实习，四五月份放松，六月下旬去实习。实习一周多，忽然意识到又该刷算法题了——秋招近在眼前了。

实习公司虽说还不错，福利待遇也很好，但是岗位还是有点小众了——音视频客户端。这样下去不好跳槽也不好润啊。

上网一看，大部分公司招聘的 Software Engineer 还是后端知识为主。况且任何公司业务的核心也都是后端，所以秋招还是润去后台开发了。

于是开了leetcode会员，看到了这本[小册子](https://leetcode.cn/leetbook/read/google-interview/xkx0d6/)——不错，有意思！刷题同时还能了解国外企业的招聘流程！那就开始吧~

其他有意思的小册子：

1. 后端
   1. https://leetcode.cn/leetbook/detail/7-day-interview-hou-duan/
   2. https://leetcode.cn/leetbook/detail/da-han-hou-duan-gang-ti-mu-he-ji-shang/
   3. https://leetcode.cn/leetbook/detail/2024-hou-duan-mian-shi-gong-lue/
2. 算法
   1. https://leetcode.cn/leetbook/detail/arithmetic-interview-cheat-sheet/
3. 数据库
   1. https://leetcode.cn/leetbook/detail/database-handbook/
4. 并发
   1. https://leetcode.cn/leetbook/detail/concurrency/
5. 极客时间
   1. https://uaxe.github.io/geektime-docs/%E5%90%8E%E7%AB%AF-%E6%9E%B6%E6%9E%84/

## 编码问题

谷歌（Google）技术面试非常困难而且富有挑战性。想要获得电话面试，你需要将简历提交到他们的 在线申请 系统或者通过内部员工进行推荐。

面试过程的第一步，你可能会收到一个在线评估链接。 评估有效期为 7 天，包含两个编码问题，需要在一小时内完成。 以下是一些供你练习的在线评估问题。



### [686. 重复叠加字符串匹配](https://leetcode.cn/problems/repeated-string-match/)



给定两个字符串 `a` 和 `b`，寻找重复叠加字符串 `a` 的最小次数，使得字符串 `b` 成为叠加后的字符串 `a` 的子串，如果不存在则返回 `-1`。

**注意：**字符串 `"abc"` 重复叠加 0 次是 `""`，重复叠加 1 次是 `"abc"`，重复叠加 2 次是 `"abcabc"`。



**示例 1：**

```
输入：a = "abcd", b = "cdabcdab"
输出：3
解释：a 重复叠加三遍后为 "abcdabcdabcd", 此时 b 是其子串。
```

**示例 2：**

```
输入：a = "a", b = "aa"
输出：2
```

**示例 3：**

```
输入：a = "a", b = "a"
输出：1
```

**示例 4：**

```
输入：a = "abc", b = "wxyz"
输出：-1
```



好久没做题，看蒙了。思路感觉是不断从b中减去a，但具体细节就有点难以想到了。

> 看错题目了，原来重叠就是不断append

一看题解，KMP算法，失敬失敬！

https://leetcode.cn/problems/repeated-string-match/solutions/1170729/gong-shui-san-xie-yi-ti-san-jie-qia-chan-3hbr/

https://zq99299.github.io/dsalg-tutorial/dsalg-java-hsp/14/04.html#kmp-%E6%80%9D%E8%B7%AF%E5%88%86%E6%9E%90

https://oi-wiki.org/string/kmp/

kmp算法循环匹配即可。
