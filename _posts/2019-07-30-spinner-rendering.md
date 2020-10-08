---
title: Spinner 动画的绘制方法
categories:
  - 技术文章
  - 图形渲染
---

在 LCUI 中想在界面上表示“加载中”状态挺麻烦的，为此准备给 LC Design 组件库添加 Spinner 组件，效果和 Bootstrap 的同名组件一致。

<!-- more -->

[![Border spinner](/static/images/devlog/bootstrap-spinner.gif "Border spinner")](/static/images/devlog/bootstrap-spinner.gif)

从上图可看出 Spinner 只是一个简单的有缺口的圆环，目前能想到的绘制方法有两种：

1. 先绘制一个带缺口的圆环，然后用图像旋转算法旋转这个圆环
1. 绘制时计算当前像素点与水平直线组成的扇形角度，取值在 0 ~ 360 范围内，如果该值在缺口角度范围内（例如：0 ~ 30），则填充透明

第一种方法需要一个自带抗锯齿功能的图像旋转算法，花时间研究它也没多大意义，所以决定采用第二种方法，而这方法的核心问题是如何将像素点坐标转换成一个 0 ~ 360 范围内的值，即：已知圆心坐标 O(0, 0)、点 A(x, 0) 和点 B(x, y)，B 为当前填充的像素点，求 A、B 两点到圆心的连线间的夹角角度。

计算方法如下：

```c
radians = arctan((y2 - y0) / (x2 - x0)) - arctan((y1 - y0) / (x1 - x0))
```

假设圆心坐标为(0,0)，那么可简化为：

```c
radians = arctan(y2 / x2)
```

无脑套用这代码后，绘制出来的圆环有两个缺口，稍微想了一下，这代码有个问题：点 (1, 1) 和点 (-1, -1) 的弧度是相等的，解决方法是加个判断，点在坐标系左边则 +180，在下边则 +360。最终代码如下：

```c
#define M_PI 3.14159265358979323846

double line_angle(double x, double y)
{
        double radians = atan(y / x);

        if (x < 0) {
                radians += M_PI;
        } else if (y < 0) {
                radians += 2 * M_PI;
        }
        return radians * 180 / M_PI;
}
```

测试结果：

```c
line_angle(1, 1);   // 45
line_angle(-1, 1);  // 135
line_angle(-1, -1); // 225
line_angle(1, -1);  // 315
```

绘制效果：

[![LC Design spinner](/static/images/devlog/lc-design-spinner.gif "Border spinner")](/static/images/devlog/lc-design-spinner.gif)

完整的实现代码可在 [src/ui/components/spinner.c](https://github.com/lc-ui/lc-design/blob/develop/src/ui/components/spinner.c) 中找到。
