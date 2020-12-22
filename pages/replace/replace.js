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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    common.init.apply(this, []); //公共登录

  },
  // 18.替换桌牌接口
  changeTabelCard(e) {
    let url = '/v1/customermanager/changeTabelCard.do';
    let code_1 = this.data.code_1;
    let code_2 = this.data.code_2;
    if (code_1 != '' && code_2 != '') {

      this.pro_getSession.then(resolve => {

        let data = {
          oldTableCard: code_2,
          newTableCard: code_1,
          session: wx.getStorageSync('session'),
        }
        console.log('data', data)
        util.request(url, 'post', data, '', (res) => {
          if (res.data.success) {
            that.setData({
              code_1: '',
              code_2: ''
            })
            wx.navigateTo({
              url: './replace_scee?code_1=' + code_1 + '&code_2=' + code_2,
            })
          } else {
            that.showToast_fail(res.data.errorMsg);
          }
        }, (err) => {
          that.showToast_fail('网络错误');
        })
      })
    } else {
      that.showToast_fail('请识别新旧桌牌');
    }
  },
  // 识别桌牌码
  scanCode(e) {
    var _type = e.currentTarget.id;
    console.log('e', e)
    wx.scanCode({
      onlyFromCamera: false,
      success(res) {
        console.log(res)
        if (res.result) {
          that.get_code(res.result, _type)
        } else {
          that.get_code(res.rawData, _type)
        }
      }
    })
  },
  //  17.扫码获取替换桌牌ID接口
  get_code(val, _type) {
    // _type 1 识别新桌牌   2 识别旧桌牌
    console.log('val', val, _type)
    let url = '/v1/customermanager/getTabelCardForChange.do';
    this.pro_getSession.then(resolve => {
      let data = {
        tableCardValue: val,
        session: wx.getStorageSync('session'),
      }
      console.log('data', data)
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
          if (_type == '1') {
            that.setData({
              code_1: res.data.module
            })
          } else {
            that.setData({
              code_2: res.data.module
            })
          }
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      }, (err) => {
        that.showToast_fail('网络错误');
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  }
})