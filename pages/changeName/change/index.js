const app = getApp();

Page({
  data: {
    winHeight: 0,
    winWidth: 0,
    userName:''
  },
  /**events */
  onLoad: function () {
    this.initPageImagesSize();
    this.initPageInfo();
  },
  nameInput:function(e){
    this.setData({
      userName:e.detail.value
    })
  },
  save:function(){
    let userName = this.data.userName;
    app.globalData.userInfo.nickName = userName;
    wx.navigateBack();
  },
  /**methods */
  initPageImagesSize: function () {
    wx.getSystemInfo({
      success: function (res) {
        this.setData({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth,
        })
      }.bind(this)
    })
  },
  initPageInfo: function () {
    this.setData({
      userName: app.globalData.userInfo.nickName
    })
  }
})