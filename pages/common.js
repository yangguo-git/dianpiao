const util = require('../utils/util.js');

function init() {
  var that = this;
  // session定时器
  that.sessionIsExpire = (resolve) => {
    const session = wx.getStorageSync('session');
    const deadLine = wx.getStorageSync('deadline');
    const nowDate = new Date().getTime();
    if (session && deadLine) {
      if (nowDate - deadLine >= 1000 * 60 * 60 * 24) {
        that.login(resolve)
      } else {
        wx.checkSession({
          success() {

            // 判断是否更改地址
            var reqUrlVersion = wx.getStorageSync('reqUrlVersion');
            if (reqUrlVersion != getApp().reqUrlVersion) {
              wx.clearStorageSync();
              that.login(resolve)
            } else {
              // session_key 未过期，并且在本生命周期一直有效,没有更改请求更改地址
              resolve(session)
            }

          },
          fail() {
            // session_key 已经失效，需要重新执行登录流程
            that.login(resolve)
          }
        })
      }
    } else {
      that.login(resolve)
    }
  }
  // wx.login
  that.login = (resolve) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          that.loginRequest(res.code, resolve);
        }
      },
    })
  }
  // 请求login.do接口得到session
  that.loginRequest = (code, resolve) => {
    var url = '/v1/user/login.do';
    var data = {
      code,
      // minipId: 'worder'//联通整个的
      minipId: 'wow_worder'//江西电信的 yg修改
    };
    util.request(url, 'post', data,'', (res) => {
      
      if (res.data.success == true) {
        const session = res.data.module.session;
        resolve(session)
        wx.setStorageSync('session', session);
        wx.setStorageSync('deadline', new Date().getTime());
        console.log('登录了')
        // console.log('getApp().reqUrlVersion', getApp().reqUrlVersion)
        wx.setStorageSync('reqUrlVersion', getApp().reqUrlVersion);
      } else {
        resolve(1)
      }
    }, (fail) => {
      resolve(1)
    })
  }
  // 获取session
  that.pro_getSession = new Promise((resolve) => {
    that.sessionIsExpire(resolve)
  })
  // 成功的提示
  that.showToast_scss = (e) => {
    wx.showToast({
      title: e
    })
  }
  // 失败的提示
  that.showToast_fail = (e,time=1500) => {
    wx.showToast({
      title: e,
      icon: 'none',
      duration:time
    })
  }

  //获取formid
  that.formSubmit = function(e) {
    console.log('获取formid')
    var date = Date.parse(new Date());
    var if_date = wx.getStorageSync('formId_time')
    if ((date - if_date) > 1000 * 3) {
      wx.setStorageSync('formId_time', date);
      if (e && e.detail && e.detail.formId) {
        let data = {
          session: wx.getStorageSync("session"),
          formId: e.detail.formId,
          btnName: 'btn'
        };
        util.request('/v1/customermanager/saveFormid.do', 'post', data, '', (res) => {
          wx.setStorageSync('formId_time', new Date())
        });
      }
    }
  }
}
module.exports = {
  init: init
}