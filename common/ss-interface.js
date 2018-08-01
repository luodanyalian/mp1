import conf from './config.js';

const ss_interface = {
  getSignList: conf.requireUrl + '/location/index/index',
  getSignInfo: conf.requireUrl + '/location/index/view',
  login: conf.requireUrl + '/user/index/login',
  getVehicles: conf.requireUrl + '/location/index/vehicle',
  getMissionList: conf.requireUrl + '/location/index/task',//获取任务列表
  getMission: conf.requireUrl + '/location/index/taskDetail',//获取任务详情
  taskComplete: conf.requireUrl + '/location/index/taskComplete',//扫码完成任务
  activeTask: conf.requireUrl + "/location/index/activeTask",//激活任务
  userUpdate: conf.requireUrl + '/user/index/update',//修改个人信息
  getUploadToken: conf.requireUrl + '/user/index/getUploadToken', //获取上传图片的tokenn
  setVehicle: conf.requireUrl + '/location/index/setVehicle',//设置选择的交通工具
  uploadAvatar: conf.uploadUrl + '/upload',//上传头像
  getUploadToken: conf.requireUrl + '/user/index/getUploadToken',
  getUserInfo: conf.requireUrl + '/user/index/info'
}

export default ss_interface;