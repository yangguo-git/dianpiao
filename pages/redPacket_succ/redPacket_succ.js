// pages/accountManager/submit_succ/submit_succ.js
const util = require('../../utils/util.js');
var common = require('../common.js');
var that, redType;
Page({
  data: {
    show_xibao:false
  },
  onShow() {
  },
  navigate() {
    wx.navigateTo({
      url: '/pages/contactPage/index',
    })
  },
  onHide() {},
  onLoad: function(options) {
    common.init.apply(this, []); //公共登录
    that = this;
    console.log('页面接收的参数', options)
    redType = options.redType;
    if (redType==2){
      that.getMyGoodNews()
    }else{
      var show_xibao = false;
      if (options.show_xibao || options.show_xibao =='false') {
        show_xibao = options.show_xibao;
        this.setData({
          show_xibao: options.show_xibao
        })
      }
      let orderNo = options.orderNo;
      let map = JSON.parse(options.map);

      this.pro_getSession.then(resolve => {
        wx.sendBizRedPacket({
          timeStamp: map.timeStamp,
          nonceStr: map.nonceStr,
          package: map.package,
          signType: map.signType,
          paySign: map.paySign,
          success: function (res) {
            console.log('红包success' + JSON.stringify(res))
            wx.showToast({
              title: '领取成功！',
              duration: 3000
            })

            let obj = {
              session: wx.getStorageSync('session'),
              orderNo
            }
            util.request('/v1/customermanager/selectRedBagByOrderNo.do', 'post', obj, '', (res) => {
              if (res.data.success == true) {
                if (redType == 1) {
                  that.getMyGoodNews()
                  return
                }
                if (show_xibao == 'false') {
                  wx.navigateBack({
                    delta: 1
                  })
                } else {
                  that.getMyGoodNews()
                }
              } else {
                that.showToast_fail(res.data.errorMsg)
              }
            })
          },
          fail: function (res) {
            that.showToast_fail('红包领取失败')
            console.log('红包fail', res)
            wx.navigateBack({
              delta: 1
            })
          },
          complete: function (res) {
            console.log('红包complete')
            // that.fc_sendSuccess()
          }
        })
      }, (err) => { })
    }
    
  },
  getMyGoodNews() {
    let obj = {
      session: wx.getStorageSync('session')
    }
    util.request('/v1/customermanager/getMyGoodNews.do', 'post', obj, '', (res) => {
      if (res.data.success == true) {
        that.setData({
          ...res.data.module,
          show_xibao:true
        })
      } else {
        that.showToast_fail(res.data.errorMsg)
      }
    })
  },
  // 返回客户经理首页
  submit() {
    wx.reLaunch({
      url: '../accountList/accountList',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    return {
      path: '/pages/register/register',
      success: function(res) {
        console.log(res)
      }
    }
  },
})