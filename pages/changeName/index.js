import ss_interface from '../../common/ss-interface.js';
import conf from '../../common/config.js';
import {
  wxShowToast,
  wxShowModal,
} from '../../common/general.js'; 
const app = getApp();

Page({
  data: {
    winHeight: 0,
    winWidth: 0,
    userAvatar: '',
    userName: ''
  },
  uploadToken:'',
  appid:'',
  uploadedFileName:'',
  /**events */
  onLoad: function () {
    this.initPageImagesSize();
    this.initPageInfo();
    this.getUploadToken();
  },
  onShow:function(){
    this.initPageInfo();
  },
  changeAvatar:function(){
    wx.chooseImage({
      count:1,
      success:(res)=>{
        var tempFilePaths = res.tempFilePaths;
        // var ss = ss_interface.uploadAvatar;
        // console.log(ss);
        wx.showLoading({
          title: '上传中',
          mask: true
        })
        wx.uploadFile({
          url: ss_interface.uploadAvatar, //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: { "Content-Type": "multipart/form-data" },
          formData: {
            appid: this.appid,
            uploadToken: this.uploadToken,
            filename:'avatar'
          },
          success: (res) => {
            var data = JSON.parse(res.data);
            //do something
            console.log('upload',res);
            if (res.statusCode == 200){
              var uploadedFileName = data.hash+'.'+data.ext;
              console.log(uploadedFileName);
              this.uploadedFileName = uploadedFileName;
              console.log(conf.photoUrl + uploadedFileName);
              app.globalData.userInfo.avatarUrl = conf.photoUrl + uploadedFileName;
              // this.updateUserInfo();
              wx.hideLoading();
              wxShowModal({
                title:'上传成功'
              })
              this.setData({
                userAvatar: tempFilePaths
              })
            }else{
              wxShowModal({
                content: '上传头像失败',
                code: res.data.errcode
              })
            }
          },
          fail:(res)=>{
            console.log(res);
            wxShowModal({
              content: '上传头像失败',
              code: res.data.errcode
            })
          }
        })
        
      }
    })
  },
  changeName:function(){
    wx.navigateTo({
      url: './change/index'
    })
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
  initPageInfo:function(){
    this.setData({
      userAvatar: app.globalData.userInfo.avatarUrl,
      userName: app.globalData.userInfo.nickName
    })
  },
  getUploadToken:function(){
    wx.request({
      url: ss_interface.getUploadToken,
      data: { access_token: wx.getStorageSync('access_token')},
      method: 'post',
      success:(res)=>{
        if (res.data.errcode == 200) {
          let data = res.data.data;
          this.uploadToken = data.uploadToken;
          this.appid = data.appid;
        } else {
          wxShowModal({
            content: '获取上传信息失败',
            code: res.data.errcode
          })
        }
      }
    })
  },
  updateUserInfo:function(){
    var json = {
      access_token: wx.getStorageSync('access_token'),
      avatar: this.uploadedFileName,
      nickname: app.globalData.userInfo.nickName
    }
    wx.request({
      url: ss_interface.userUpdate,
      data:json,
      method: 'post',
      success:(res)=>{
        if (res.data.errcode == 200){
          wx.navigateBack();
        }else{
          wxShowToast({
            title: '更新头像失败',
            icon: 'success',
            mask: true,
            code: r.data.errcode
          })
        }
      }
    })
  }
})