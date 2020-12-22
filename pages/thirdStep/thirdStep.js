const util = require('../../utils/util.js');
var common = require('../common.js');
var that, mchId, aaaa, redType, redPacket_time = new Date().getTime();

Page({
  data: {
    show: false,
    tableCardImg:'',
    cancelReason:'',
    orderId:'',
    btn_show:true,
    redPacket_btn: false,
    complete_bg_hui:false,
    redBagStatus:false
  },
  onLoad: function (options) {
    
    common.init.apply(this, []); //公共登录
    that = this;
    console.log('充值成功页面onload', options)
    if (options.id) {
      mchId = options.id;
      that.getInfo(mchId);
    }
  },
  jumpPage(){//跳转  //navigateTo
    wx.reLaunch({
      url: '/pages/accountList/accountList'
    })
  },
  // 获取订单详细信息
  getInfo(mchId) {
    let url = '/v1/customermanager/getMchInfo.do';
    this.pro_getSession.then(resolve => {
      let data = {
        mchId: mchId,
        tableCardValue: '',
        session: wx.getStorageSync('session'),
      }
      util.request(url, 'post', data, '', (res) => {
        var obj = res.data.module;
        that.setData({
          ...obj,
          show: true
        })
        redType = obj.redType;
        if (obj.redType == 0) {
          let firstRedBagStatus = this.data.firstRedBagStatus;
          let secondRedBagStatus = this.data.secondRedBagStatus;
          if (obj.statusList[obj.statusList.length - 1].status == 1 && firstRedBagStatus == 2 && secondRedBagStatus == 2) {
            that.setData({
              btn_show: false
            })
            clearInterval(that.data.timeoutId)
          } else {
            that.setData({
              btn_show: true
            })
          }
        } else if(obj.redType == 1) {
          // redBagStatus 红包领取状态：-1：初始状态；0:可领取；1：准备领取；2：已领取；3：过期
          if (obj.redBagStatus == 0 || obj.redBagStatus == 1) {
            that.setData({
              redBagStatus: true,
              btn_show: true
            })
            return
          }else{
            that.setData({
              redBagStatus: false
            })
          }
          if (obj.status == 9) {
            that.setData({
              btn_show: false
            })
          }
        } else {
          that.setData({
            btn_show: false
          })
          if (obj.status == 9) {
            that.setData({
              complete_bg_hui: false
            })
          } else {
            that.setData({
              complete_bg_hui: true
            })
          }
        }
      }, (err) => {
        that.getList(mchId)
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    clearInterval(aaaa)
    aaaa =setInterval(function () {
      that.getInfo(mchId)
    }, 5000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(aaaa)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(aaaa)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})