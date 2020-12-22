const util = require('../../utils/util.js');
var common = require('../common.js');
var that, mchId, aaaa, redType, redPacket_time = new Date().getTime();
//利用slice
function truncate(arr) {
  return arr.slice(0, -1);
}
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
  nav_aa(){//咨询服务
    wx.navigateTo({
      url: '/pages/contactPage/index',
    })
  },
  nav_electronicTable(){//电子桌牌
    wx.navigateTo({
      url: '../electronicTable/electronicTable?laiyuan=true&tableCardCode='+this.data.tableCardCode+'&tableCardImage='+this.data.tableCardImg,
    })
  },
  submitdingdan(){
    this.setData({
      showModal:true
    })
  },
  showCancelOrder: function () {
    this.setData({
      showModal: true
    })
  },
  modal_click_Hidden: function () {
    this.setData({
      showModal: false,
    })
  },
  // 确定
  Sure: function () {
    console.log(this.data.text)
    if (this.data.orderId == '') {
      wx.showToast({
        title: '请填写订单号',
        icon: 'none'
      })
      return
    } else {
      // 提交到后端
      this.checkOrderIsDoneByUser();
    }
  },
  changeCancelReason: function (e) {
    this.setData({
      orderId: e.detail.value
    })
  },
  checkOrderIsDoneByUser: function () {

    let url = '/v1/customermanager/checkOrderIsDoneByUser.do';
    let data = {
      orderId: this.data.orderId,
      companyId: this.data.companyId,
      tableCard: this.data.tableCardCode,
      session: wx.getStorageSync('session'),
    }
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
        wx.showToast({
          title: '确认成功'
        })
        this.setData({
          showModal: false
        })
      }else{
        wx.showToast({
          title: res.data.errorMsg,
          icon:'none'
        })
      }
    })
    
  },
  onShow() {
    clearInterval(aaaa)
    aaaa =setInterval(function () {
      that.getInfo(mchId)
    }, 5000)
  },
  onHide: function () {
    clearInterval(aaaa)
  },
  onLoad: function(options) {

    common.init.apply(this, []); //公共登录
    that = this;
    console.log('充值成功页面onload', options)
    if (options.id) {
      mchId = options.id;
      that.getInfo(mchId);
    }
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
  // 领取红包
  redPacket(e) {
    console.log(e)
    if (redPacket_time+1000 > new Date().getTime()){
      redPacket_time = new Date().getTime()
      return
    }
    let firstRedBagStatus = this.data.firstRedBagStatus;
    let _type = firstRedBagStatus == 0 || firstRedBagStatus==1?1:2;
    let url = '/v1/customermanager/getMyRedBag.do';
    this.pro_getSession.then(resolve => {
      let data = {
        mchFormId: mchId,
        type: _type,
        session: wx.getStorageSync('session'),
      }
      util.request(url, 'post', data, '加载中', (res) => {
        if (res.data.success == true) {
          var map = JSON.stringify(res.data.module.map);
          var orderNo = res.data.module.orderNo;
          var show_xibao = true;
          truncate(that.data.statusList).forEach((item,index)=>{
            console.log('00000000000', item)
            if (item.status == 0 || item.status == 1){
              show_xibao = false;
            }
          })
          console.log('1111111111111', show_xibao)
          wx.navigateTo({
            url: '../redPacket_succ/redPacket_succ?orderNo=' + orderNo + '&status=' + _type + '&map=' + map + '&show_xibao=' + show_xibao + '&redType=' + redType,
          })
        } else {
          console.log('res.data.errorMsg', res.data,res.data.errorMsg)
          that.showToast_fail(res.data.errorMsg,3500)
        }
      })
    })
  },
  fc_sendSuccess: function(no_fc_sendSuccess) {

    var that = this
    var timestamp = Date.parse(new Date());
    let url = '/v1/group/sendSuccess.do';
    var data = {
      mchFormId: id,
      session: wx.getStorageSync('session'),
      time: timestamp
    }
    util.request(url, 'post', data, '', function(res) {
      setTimeout(function() {
        if (res.data.body == 'RECEIVED') {
          return false;
        } else {
          if (!sendSuccess) {
            that.fc_sendSuccess()
          } else {
            if (!no_fc_sendSuccess && no_fc_sendSuccess != undefined) {
              var no_fc_sendSuccess = true
              that.fc_sendSuccess(no_fc_sendSuccess)
            }
          }
        }
      }, 1000)
    })
  },
  // 跳转喜报页面
  submit() {
    if (this.data.complete_bg_hui){
      return
    }
    wx.navigateTo({
      url: '../redPacket_succ/redPacket_succ?redType=2',
    })
  },
  // 复制企业ID
  copy_companyId() {
    var companyId = '企业ID:' + this.data.companyId + '\r\n' + '注册码:' + this.data.registerId + '\r\n' + '桌牌ID:' + this.data.tableCardCode
    wx.setClipboardData({
      data: companyId,
      success: function(res) {
        wx.showToast({
          title: '复制成功',
        })
      },
      fail: function (err) {
        that.showToast_fail('操作失败，请稍后再试···')
      }
    })
  },
})