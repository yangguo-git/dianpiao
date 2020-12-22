// pages/replace/replace.js
var that;
const util = require('../../utils/util.js');
var common = require('../common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code_1: '',
    code_2: ''
  },
  // 返回客户经理首页
  submit() {
    wx.reLaunch({
      url: '../accountList/accountList',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.code_1){
      this.setData({
        code_1: options.code_1,
        code_2: options.code_2,
      })
    }
    common.init.apply(this, []); //公共登录

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
})