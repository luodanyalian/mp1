import { innerAudioContext} from './constan.js'
import { showErrorCode } from './constan.js';
import ss_interface from './ss-interface.js';

/**
 * 绘制带阴影的字体
 * @param:
 * id:canvas‘s id
 * text:文字文本
 * fontsize：字体大小
 * color：字体颜色
 * shadowColor：阴影颜色
 */
export function drawShadowText(param){
  let { text = '', id, fontSize = 30, color = "#ffffff", shadowColor = "#0d6387", pixelRatio, screenHeight, screenWidth} = param;
  let basePX = screenWidth/1080;
  fontSize = 60*basePX;
  let textBaseLineY = fontSize;
  // switch (pixelRatio) {
  //   case 2:
  //     textBaseLineY = 37;
  //     break;
  //   case 3:
  //     textBaseLineY = 22;
  //     break;
  //   case 3.5:
  //     textBaseLineY = 30;
  //     break;
  //   case 2.625:
  //     textBaseLineY = 30;
  //     break;
  // }
  var cxt_fillText = wx.createContext();//创建并返回绘图上下文context对象。
  cxt_fillText.beginPath();//开始一个新的路径
  cxt_fillText.setFontSize(fontSize);//设置填充文本字体的大小
  cxt_fillText.setShadow(-5, 5, 0, shadowColor);//设置阴影
  cxt_fillText.setFillStyle(color);//设置填充的样式
  cxt_fillText.fillText(text, 4, textBaseLineY);//设置填充文本fillText()第一个值为显示的文本，第二个值为文本的x坐标，第三个值为文本的y坐标
  cxt_fillText.closePath();//关闭当前路径
  wx.drawCanvas({
    canvasId: id,//画布标识，对应<canvas/>的cavas-id
    actions: cxt_fillText.getActions()//导出context绘制的直线并显示到页面
  })
}

/**
 * 根据经纬度计算2点距离
 * @params 
 * lat 纬度
 * lng 纬度
 */
//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
export function getDistance(lat1, lng1, lat2, lng2) {

  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
  Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;// EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000; //输出为公里
  //s=s.toFixed(4);
  return s;

  function Rad(d) {
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
  }
}

/**获取当前位置 */
export function getLocation(callback, bmap, mapCtx) {
  if (!mapCtx){
    mapCtx = new bmap.BMapWX({
      ak: "cOtIdSUkvqLhaYrjQ1PMlpVhl4khpzM0"
    });
  }
  // 发起regeocoding检索请求   
    mapCtx.regeocoding({
      fail: function (data) {
        console.log(data.statusCode + data.errMsg);
        wx.showToast({
          title: "未开启定位功能",
          duration: 3000
        })
      },
      success: function (data) {
        //返回数据内，已经包含经纬度  
        console.log(data);
        const wxMarkerData = data.wxMarkerData;
        var latitude = wxMarkerData[0].latitude
        var longitude = wxMarkerData[0].longitude
        var speed = 0
        var accuracy = 0
        var position = {
          lat:latitude,
          lng:longitude,
          speed:speed,
          accuracy: accuracy
        }
        console.log("纬度" + latitude + "经度" + longitude);
        callback(position)
      }
    });
  // wx.getLocation({
  //   success: function (res) {
  //     var latitude = res.latitude
  //     var longitude = res.longitude
  //     var speed = res.speed
  //     var accuracy = res.accuracy
  //     var position = {
  //       lat:latitude,
  //       lng:longitude,
  //       speed:speed,
  //       accuracy: accuracy
  //     }
  //     console.log("纬度" + latitude + "经度" + longitude);
  //     callback(position)
  //   },
  //   fail: function (res) {
  //     wx.showToast({
  //       title: "未开启定位功能",
  //       duration: 3000
  //     })
  //   },
  //   cancel: function (res) {
  //     wx.showToast({
  //       title: "用户拒绝授权获取地理位置",
  //       duration: 3000
  //     })
  //   }
  // })
}

/**设置语音 
 * @params
 * option Object
 * src 音频源
 * onPlay 播放事件回调
 * onError 播放错误事件回调
 * onTimeUpdate 播放进行事件回调
*/
export function setVoice(option,callback) {
  let { src, onPlay, onError, onTimeUpdate} = option;
  innerAudioContext.autoplay = false
  innerAudioContext.src = src;
  innerAudioContext.onPlay(() => {
    console.log('开始播放')
    onPlay && onPlay();
  })
  innerAudioContext.onTimeUpdate((res) => {
    onTimeUpdate && onTimeUpdate()
  })
  innerAudioContext.onError((res) => {
    console.log('音频播放错误', res.errMsg, res.errCode);
    onError && onError();
  })
}

/**格式化时间,毫秒 -> 分:秒 */
export function calculateTime(time){
  
  var s = parseFloat(time).toFixed(0);
  var m = 0;
  if(s>59){
    m++;
    s = 0;
  };
  
  return (m.toString() + ':' + (s < 10 ? 0 + s : s).toString());
}
/**格式化时间,毫秒 -> 分:秒 */
export function formatedPlayTime(time) {

  var s = parseFloat(time).toFixed(0);
  var m = 0;
  if (s > 59) {
    m++;
    s = 0;
  };

  return ('0'+m.toString() + ':' + (s < 10 ? 0 + s : s).toString());
}

/**处理获取用户信息
 * app为页面getApp()
 * callback是页面业务回调处理函数
 * callback参数为res。
 * 判断res是否存在，如果有res。直接res.userInfo获取信息，否则，直接app.globalData.userInfo获取
 * scope为页面this
 */
export function doWithGetUserInfo(app, callback, scope){
  if (app.globalData.userInfo) {
    callback();
  } else if (scope.canIUse) {
    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回  
    // 所以此处加入 callback 以防止这种情况  
    app.userInfoReadyCallback = res => {
      callback(res);
    }
  } else {
    // 在没有 open-type=getUserInfo 版本的兼容处理  
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        callback(res);
        // let json = {
        //   code: app.globalData.code,
        //   encryptedData: app.globalData.encryptedData,
        //   iv: app.globalData.iv
        // }
        // app.gotoLogin(json)
      }
    })
  } 
}

/**
 * 对微信showToast封装一层
 * 1.处理errcode的是否显示和隐藏
 */
export function wxShowToast(option, errorcode){
  let code = option.code || errorcode ||'';
  option.title = option.title + (showErrorCode ? code : '');
  wx.showToast(option)
}

/**
 * 对微信showModal封装一层
 * 1.处理errcode的是否显示和隐藏
 */
export function wxShowModal(option, errorcode) {
  let code = option.code || errorcode || '';
  if(!option.title){
    delete option.title
  }
  option.content = option.content + (showErrorCode ? code : '');
  option.showCancel = option.showCancel || false;
  wx.showModal(option)
}

/**
 * 兼容性错误提示
 */
export function compatible() {
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，无法使用，请升级到最新微信版本后重试。'
  })
}