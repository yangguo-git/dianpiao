var common = require('../common.js');
const util = require('../../utils/util.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    orderId: '',
    // orderId: '2019070810025',20102341006
    tableCardCode: '',
    name: '',
    items: [{
        detail: '沃云T平台售价365元/年，包含纸质发票传递抬头功能。',
        value: '商企版',
        disabled:false
      },
      {
        detail: '沃云T平台售价2500元/年，包含纸质发票传递抬头功能及电子发票传递抬头功能。',
        value: '拓展版',
        disabled:false
      },
      {
        detail: '已购买过商企版产品的老用户升级拓展版功能。',
        value: '升级包',
        disabled:false
      },
    ]
  },
  radioChange(e) {//单选按钮切换事件
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var {proStatus1,proStatus2,proStatus3}=options;
    this.setData({
      tableCardCode: options.tableCardCode,
      ['items[0].disabled']:proStatus1==0?false:true,
      ['items[1].disabled']:proStatus2==0?false:true,
      ['items[2].disabled']:proStatus3==0?false:true,
    })
    that = this;
  },

  showCancelOrder: function () {//点击最下面确定按钮
    if(this.data.name==''){
      wx.showToast({
        title: '请选择',
        icon: 'none'
      })
      return
    }
    if(this.data.name=='商企版'){//2
      wx.navigateTo({
        url: '/pages/relation_from/relation_from?tableCardCode='+this.data.tableCardCode,
      })
      return
    }
    
    // this.setData({
    //   showModal: true
    // })
    //选择拓展版 1
    let chooseType = 1;
    wx.navigateTo({
      url: '/pages/associatedTable/associatedTable?tableCardCode=' + that.data.tableCardCode+'&chooseType='+chooseType,
    })
  },
  modal_click_Hidden: function () {//点击弹窗取消按钮
    this.setData({
      showModal: false,
    })
  },
  // 点击弹窗确定按钮
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

      common.init.apply(this, []); //公共登录   
      this.pro_getSession.then(resolve => {
        this.checkOrderIsDoneByUser();
      })
    }
  },
  changeCancelReason: function (e) {//弹窗中输入框输入事件
    this.setData({
      orderId: e.detail.value
    })
  },
  //功能未知
  checkOrderIsDoneByUser: function () {

    let url = '/v1/customermanager/validateOrderIsTrue.do';
    let data = {
      orderId: this.data.orderId,
      session: wx.getStorageSync('session'),
      type:this.data.name=='拓展版'?1:2
    }
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
        this.setData({
          showModal: false
        })

        wx.navigateTo({
          url: '/pages/upImg/upImg?tableCardCode=' + that.data.tableCardCode+'&orderId='+that.data.orderId,
        })
      } else {
        wx.showToast({
          title: res.data.errorMsg,
          icon: 'none'
        })
      }
    })

  },
})