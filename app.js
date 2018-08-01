import ss_interface from './common/ss-interface.js';
import {
  doWithGetUserInfo,
  wxShowToast,
  wxShowModal,
  compatible
} from './common/general.js';
// wx.setEnableDebug({
//   enableDebug: true
// })
//app.js
App({
  onLaunch: function () {
    // this.testAuth();
    this.ssCheckLogin();
  },
  getGlobalData() {
    return this.globalData;
  },
  /**业务检查token，是否需要登录 */
  ssCheckLogin() {
    // wx.removeStorageSync('access_token');
    // let access_token = wx.getStorageSync('access_token');
    // console.log('access_token', access_token);
    // this.wxLogin();
    // return;
    // if (access_token) {
      wx.checkSession({
        success: () => {
          console.log('session check success')
          this.wxGetUserInfo();
          this.checkSettingStatu();
          this.wxLogin();
        },
        fail: () => {
          //登录态过期
          console.warn('session check fail')
          this.wxLogin(); //重新登录
        }
      })
    // } else {
    //   console.error('there is no access_token')
    //   this.wxLogin();
    // }
  },
  wxGetSetting(callback) {
    wx.getSetting({
      success: res => {
        console.log('wxgetsetting success');
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.userLocation']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          console.log('authSetting')
          this.wxGetUserInfo(callback);
        } else {
          if (!wx.authorize){
            compatible();
            return;
          }
          this.checkSettingStatu();
          console.log('not auth ,go to auth userInfo');
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              // wx.startRecord()
              console.log('allow userLocation');
          
              // wx.authorize({
              //   scope: 'scope.userInfo',
              //   success: () => {
              //     // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              //     // wx.startRecord()
              //     console.log('allow userInfo');
              //     this.wxGetUserInfo(callback);
              //   },
              //   fail: (res) => {
              //     console.error('userInfo error', res);
              //   }
              // })
            },
            fail: (res) => {
              console.error('userLocation error', res);
            }
          })
        }
      },
      fail: (res) => {
        console.error('getSetting error', res);
      }
    })
  },
  checkSettingStatu(){
    var that = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        console.log(res.authSetting);
        var authSetting = res.authSetting;
        if (authSetting['scope.userInfo'] && authSetting['scope.userLocation']) {
          console.log('首次授权');
        } else {
          console.log('不是第一次授权', authSetting);
          // 没有授权的提醒
          if (authSetting['scope.userInfo'] === false) {
            wx.showModal({
              title: '用户信息未授权',
              content: '如需正常使用，请按确定并在授权管理中选中“用户信息”，然后点按确定。最后再重新进入小程序即可正常使用。',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('openSetting success', res.authSetting);
                    }
                  });
                }
              }
            })
          }
          if (authSetting['scope.userLocation'] === false) {
            wx.showModal({
              title: '用户定位未授权',
              content: '如需正常使用，请按确定并在授权管理中选中“用户定位”，然后点按确定。最后再重新进入小程序即可正常使用。',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('openSetting success', res.authSetting);
                    }
                  });
                }
              }
            })
          }
        }
      }
    });
  },
  wxGetUserInfo(callback) {
    wx.getUserInfo({
      withCredentials:true,
      success: res => {
        console.log('getUserInfo success')
        // 可以将 res 发送给后台解码出 unionId
        this.globalData.userInfo = res.userInfo;
        this.globalData.encryptedData = res.encryptedData;
        this.globalData.iv = res.iv;
        // let authData = {
        //   userInfo: res.userInfo,
        //   encryptedData: res.encryptedData,
        //   iv: res.iv
        // };
        // wx.setStorageSync('authData', JSON.stringify(authData));

        let json = {
          encryptedData: res.encryptedData,
          iv: res.iv
        }
        try{
          this.getSSUserInfo();
        }catch(e){
          
        }
        typeof callback == 'function' && callback(json)

        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
          console.log('has userInfoReadyCallback');
          this.userInfoReadyCallback(res, this.getSSUserInfo)
        }
      },
      fail: (res) => {
        console.error('getUserInfo fail', res)
      }
    })
  },
  wxLogin() {
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          this.globalData.code = res.code;
          // this.wxGetSetting();
          this.wxGetSetting((json) => {
            json.code = res.code;
            this.gotoLogin(json);
          });
          console.log('this.wxLogin success');
        } else {
          console.error('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: res => {
        console.error('wx.login fail', res)
      }
    })
  },
  gotoLogin(json) {
    const self = this;
    wx.removeStorageSync('access_token');
    //发起网络请求
    wx.request({
      url: ss_interface.login,
      data: json,
      method: 'post',
      success: r => {
        let result = r.data;
        if (result.errcode == 200) {
          let access_token = result.data.access_token;
          wx.setStorageSync('access_token', access_token);
          console.log('ss_interface.login errcode == 200')
          // self.globalData.ssCheckLogin = function (callback) {
          //   debugger
          //   callback(access_token);
          // }
        } else {
          console.error('ss_interface.login errcode != 200', result.errmsg)
          wxShowModal({
            content: '登录服务失败',
            code: r.data.errcode
          })
        }
      },
      fail: r => {
        console.error('登录请求失败', r);
      }
    })
  },
  globalData: {
    userInfo: {},
    encryptedData: null,
    iv: null,
    currentSign: {},
    ssCheckLogin: null,
    code:'',
    authList:['scope.userInfo', 'scope.userLocation']
  },
  gotoAuth:function(index){
    
    let scopeName = this.globalData.authList[index];
    console.log('scopeName ' + scopeName)
    return new Promise(function(resolve,reject){
      wx.getSetting({
        success(res) {
          if (!res.authSetting[scopeName]) {
            // 发起授权
            wx.authorize({
              scope: scopeName,
              success:()=>{
                resolve()
              }, fail:()=>{
                console.log(scopeName + '授权失败')
              }
            })
          }
        }
      })
    })
  },
  getSSUserInfo:function(){
    wx.request({
      url: ss_interface.getUserInfo,
      data: {
        access_token: wx.getStorageSync('access_token')
      },
      method: 'post',
      success: (res) => {
        let data = res.data.data;
        // if (res.errcode == 200){
          
        data && data.avatar && (this.globalData.userInfo.avatarUrl = data.avatar);
        data && data.nickname && (this.globalData.userInfo.nickName = data.nickname);
        // }
      }
    })
  },
  testAuth(){
    wx.authorize({
      scope: 'scope.userInfo',
      success: () => {
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        // wx.startRecord()
        console.log('allow userInfo');
        
        // this.wxGetUserInfo(callback);
      },
      fail: (res) => {
        console.error('userInfo error', res);
      }
    })
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        // wx.startRecord()
        console.log('allow userLocation');
        // this.wxGetUserInfo(callback);
      },
      fail: (res) => {
        console.error('userLocation error', res);
      }
    })
  }
})