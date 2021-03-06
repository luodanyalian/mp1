//index.js
//获取应用实例
const app = getApp()

Page({
  onReady: function () {
    // 页面渲染完成  
    var cxt_fillText = wx.createContext();//创建并返回绘图上下文context对象。  
    cxt_fillText.beginPath();//开始一个新的路径  
    cxt_fillText.setFontSize(60);//设置填充文本字体的大小  
    cxt_fillText.setLineWidth(6);//设置线条的宽度  
    cxt_fillText.setShadow(0, 10, 30, '#33ffff');//设置阴影  
    cxt_fillText.setStrokeStyle('#33ff66');//设置线条的样式  
    cxt_fillText.setFillStyle('#3300ff');//设置填充的样式  
    cxt_fillText.fillText("TITF", 50, 100);//设置填充文本fillText()第一个值为显示的文本，第二个值为文本的x坐标，第三个值为文本的y坐标  
    cxt_fillText.moveTo(40, 105);//设置线条的起始路径坐标  
    cxt_fillText.lineTo(180, 105);//设置线条的终点路径坐标  
    cxt_fillText.stroke();//对当前路径进行描边  
    cxt_fillText.closePath();//关闭当前路径  
    wx.drawCanvas({
      canvasId: 'canvasFillText',//画布标识，对应的cavas-id  
      actions: cxt_fillText.getActions()//导出context绘制的直线并显示到页面  
    })
  }  
})
