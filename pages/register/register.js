var that;
const util = require('../../utils/util.js'); 
var cityAndPro = '';
var common = require('../common.js');

var list = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    show: false,
    multiArray: [['北京', '安徽', "福建", "甘肃", "广东", "广西", "贵州", "海南", "河北", "河南", "黑龙江", "湖北", "湖南", "吉林", "江苏", "江西", "辽宁", "内蒙古", "宁夏", "青海", "山东", "山西", "陕西", "上海", "四川", "天津", "西藏", "新疆", "云南", "浙江", "重庆", "香港", "澳门", "台湾"], ['北京']],
    objectMultiArray: [],
    region: [],
    multiIndex:[],
    customItem: '请选择',
    add_city:false,
    display: ''
  },
  // 20.获取省市配置接口
  getAreaConfig() {
    let url = '/api/getAreaConfig.do';
    let data = {
    }
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
        cityAndPro = res.data.module;
        this.setData({
          objectMultiArray: cityAndPro.city_message
        })
      }
    })
  },
  bindMultiPickerChange: function (e) {
    that.setData({
      add_city:true,
      "multiIndex[0]": e.detail.value[0],
      "multiIndex[1]": e.detail.value[1]
    })
  },
  bindMultiPickerColumnChange: function (e) {
    switch (e.detail.column) {
      case 0:
        list = []
        for (var i = 0; i < that.data.objectMultiArray.length; i++) {
          if (that.data.objectMultiArray[i].parid == that.data.objectMultiArray[e.detail.value].regid) {
            list.push(that.data.objectMultiArray[i].regname)
          }
        }
        that.setData({
          "multiArray[1]": list,
          "multiIndex[0]": e.detail.value,
          "multiIndex[1]": 0
        })

    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    common.init.apply(this, []); //公共登录   
    this.getAreaConfig();                    
    this.data.m_appId = options.m_appId;
    this.pro_getSession.then(resolve => {
      // 23.验证用户是否已注册为客户经理接口
      this.validateCusManagerIsRegist();
    })

  },
  // 23.验证用户是否已注册为客户经理接口
  validateCusManagerIsRegist() {
    let url = '/v1/customermanager/validateCusManagerIsRegist.do';
    let data = {
      session: wx.getStorageSync('session')
    }
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
        // isRegist  0 - 未注册 1 - 已注册
        if (res.data.module.isRegist == 0) {
          that.setData({
            show: true,
          })
        } else {
          wx.reLaunch({
            url: '../accountList/accountList',
          })
        }
      } else {
        that.setData({
          show: true,
        })
      }
    }, (err) => {
      that.setData({
        show: true
      })
    })
  },
  phone_input(e){
    this.data.phoneNumber = e.detail.value
  },
  // 注册
  register(){
    if (this.data.name == '') {
      that.showToast_fail('请输入姓名');
      return
    }
    if (!this.data.add_city) {
      that.showToast_fail('请选择所在地区');
      return
    }
    let url = '/v1/customermanager/addCustomerManagerInfo.do';
    var m_city_message = cityAndPro.m_city_message;
    var eparchyCode;
    m_city_message.forEach((item,idx)=>{
      if (item.areaname == this.data.multiArray[1][this.data.multiIndex[1]]){
        eparchyCode = item.areaid ;
      }
    })
    let data = {
      cusManagerName: this.data.name,
      eparchyCode,
      cusManagerPhone: this.data.phoneNumber,
      session: wx.getStorageSync('session')
    }
    util.request(url, 'post', data, '', (res) => {
      if (res.data.success) {
          wx.reLaunch({
            url: '../accountList/accountList',
          })
      } else {
        that.showToast_fail(res.data.errorMsg);
      }
    })
    
  },
  hideview: function () {
    this.setData({
      display: "none"
    })
  },
  coll() {
    wx.makePhoneCall({
      phoneNumber: '4001800956' //仅为示例，并非真实的电话号码
    })
  },
  name_input(e) {
    this.data.name = e.detail.value
  },
  getphonenumber(e) {
    console.log('e', e.detail);
    let url = '/v1/customermanager/getUserPhoneNumber.do';
    this.pro_getSession.then(resolve => {
      let data = {
        session: wx.getStorageSync('session'),
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }

      util.request(url, 'post', data, '', (res) => {
        that.setData({
          phoneNumber: res.data.module.phoneNumber
        })
      }, (err) => {

      })
    })
  },
  onShareAppMessage:function(){
    
  }
})