const util = require('../../utils/util.js');
var common = require('../common.js');
var that, aaaa;

Page({
  data: {
    scanCode_rawData: '',
    input_search:'',
    showModal:false,
    showModalbtn:false,
    list: []
  },
  input_search(e){
    this.data.input_search = e.detail.value
    console.log('input_search', this.data.input_search)
    if (this.data.input_search==''){
      this.search();
    }
  },
  showCancelOrder: function() {
    this.setData({
      showModal:true
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
    if (this.data.name==''){
      wx.showToast({
        title: '请填写姓名',
        icon:'none'
      })
      return
    }else if (this.data.idCard==''){
      wx.showToast({
        title: '请填写身份证',
        icon:'none'
      })
      return
    }else{
      // 提交到后端
      this.up_perfectMyInfos();
    }
  },
  changename: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  changeidCard(e){
    this.setData({
      idCard: e.detail.value
    })
  },
  up_perfectMyInfos(){
    let url = '/v1/customermanager/perfectMyInfos.do';
    this.pro_getSession.then(resolve => {
      let data = {
        session: wx.getStorageSync('session'),
        name:this.data.name,
        idCard:this.data.idCard,
      }
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '认证成功',
            icon:'none'
          })
          that.setData({
            showModalbtn:false
          })
          that.modal_click_Hidden();
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      }, (err) => {

      })
    })
  },
  search(){
    let url = '/v1/customermanager/getMchInfoByName.do';
    this.pro_getSession.then(resolve => {
      let data = {
        name: this.data.input_search,
        session: wx.getStorageSync('session'),
        
      }
      console.log('data', data)
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
          that.setData({
            list: res.data.module
          })
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      }, (err) => {

      })
    })
  },
  name_input(e) {
    this.data.name = e.detail.value
  },
  phone_input(e) {
    this.data.phone = e.detail.value
  },
  bind_table_card(){
    // that.scanCode()
        wx.showActionSheet({
          itemList: ['实体桌牌', '申领电子桌牌'],
          success (res) {
            console.log(res.tapIndex)
            if(res.tapIndex==0){
              that.scanCode()
            }else{
              wx.navigateTo({
                url: '/pages/electronicTable/electronicTable',
              })
            }
          },
          fail (res) {
            console.log(res.errMsg)
          }
        })
    return
    wx.requestSubscribeMessage({
      tmplIds: ['y15XhE5e0wmSYui2tYMVcFZcH4O4x4UB8TqNXJ3k1LE'],
      success (res) {

        wx.showActionSheet({
          itemList: ['实体桌牌', '申领电子桌牌'],
          success (res) {
            console.log(res.tapIndex)
            if(res.tapIndex==0){
              that.scanCode()
            }else{
              wx.navigateTo({
                url: '/pages/electronicTable/electronicTable',
              })
            }
          },
          fail (res) {
            console.log(res.errMsg)
          }
        })
       }
    })
  },
  scanCode() {
    wx.scanCode({
      onlyFromCamera: false,
      success(res) {
        console.log(res)
       
        if (res.result) {
          that.get_code(res.result,1)
        } 
        else {
          let scanCode_rawData = res.rawData;
          that.setData({
            scanCode_rawData
          })
          that.get_code(scanCode_rawData, 1)
        }
      }
    })
  },
  tap_order(e){
    console.log(e)
    var item = e.currentTarget.dataset.item
    that.get_code(e.currentTarget.id, 2, item)
  },
  // 根据二维码里面的内容获取code
  get_code(val, _type, item='') {
    console.log('val', val,_type)
    let url = '/v1/customermanager/getMchInfo.do';
    this.pro_getSession.then(resolve => {
      let data = {
        mchId: '', tableCardValue:'',
        session: wx.getStorageSync('session'),
      }
      console.log('_type', _type)
      // _type 1 识别桌牌   2 点击列表
      if (_type==1){
        data.tableCardValue = val
      } else {
        data.mchId = val
      }
      console.log('data', data)
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
          var {proStatus1,proStatus2,proStatus3}=res.data.module;
          var pro = '&proStatus1='+proStatus1+'&proStatus2='+proStatus2+'&proStatus3='+proStatus3
          if (_type == 1) {   
            wx.navigateTo({
              url: '../packageChoice/packageChoice?tableCardCode=' + res.data.module.tableCardCode+pro,
            })
            return
          }
          if (res.data.errorMsg){
            that.showToast_fail('res.data.errorMsg',3500);
            return
          }
          if (res.data.module.status == '-1') {
            wx.navigateTo({
              url: '../relation_from/relation_from?tableCardCode=' + res.data.module.tableCardCode,
            })
          }
          //  else if (res.data.module.status == '0') {
          //   that.showToast_fail('急速开票桌牌试用中');
          // } 
          else {
            if (_type == 1) {   
              wx.navigateTo({
                url: '../submit_succ/submit_succ?id=' + res.data.module.mchId,
              })
            } else {
              wx.navigateTo({
                url: '../submit_succ/submit_succ?id=' + item.id,
              })
            }
          }
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      }, (err) => {

      })
    })
  },
  submit() {
    wx.navigateTo({
      url: '../submit_succ/submit_succ',
    })
  },
  onLoad: function(options) {
    that = this;
    common.init.apply(this, []); //公共登录
    this.list();
    this.getCusManageInfos();
  },
  getCusManageInfos(){
    this.pro_getSession.then(resolve => {
      let url = '/v1/customermanager/getCusManageInfos.do';
      let data = {
        session: wx.getStorageSync('session'),
      }
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
          let data_module = res.data.module;
          that.setData({
            ...data_module
           })
           
          if(data_module.name&&data_module.idCard){
            that.setData({
              showModal:false,
              showModalbtn:false,
             })
          }else{
            that.setData({
              showModalbtn:true,
             })
            if(!wx.getStorageSync('userId_showModal')){
              wx.showModal({
                content:'因国家政策要求，\r\n领取销售佣金需进行实名认证，\r\n未实名认证无法获得销售佣金。',
                confirmText:'实名认证',
                success:function(){
                  that.setData({
                    showModal:true
                  })
                }
              })
              wx.setStorageSync('userId_showModal',true)
            }
          }
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      })
    })
  },
  onShow() {
    clearInterval(aaaa)
    aaaa = setInterval(function () {
      that.list()
    }, 5000)
  },
  onHide:function() {
    clearInterval(aaaa)
  },
  list() {
    this.pro_getSession.then(resolve => {
      let url = '/v1/customermanager/getMchInfoList.do';
      let data = {
        session: wx.getStorageSync('session'),
      }
      util.request(url, 'post', data, '', (res) => {
        if (res.data.success) {
         that.setData({
           list: res.data.module
         })
        } else {
          that.showToast_fail(res.data.errorMsg);
        }
      })
    })
  },

  /**
   * 用户点击右上角分享
   */

  onShareAppMessage: function (res) {
    return {
      path: '/pages/register/register',
      success: function (res) {
        console.log(res)
      }
    }
  },
})

function base64_decode(input) { // 解码，配合decodeURIComponent使用
  var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  while (i < input.length) {
    enc1 = base64EncodeChars.indexOf(input.charAt(i++));
    enc2 = base64EncodeChars.indexOf(input.charAt(i++));
    enc3 = base64EncodeChars.indexOf(input.charAt(i++));
    enc4 = base64EncodeChars.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  return utf8_decode(output);
}


function utf8_decode(utftext) { // utf-8解码
  var string = '';
  let i = 0;
  let c = 0;
  let c1 = 0;
  let c2 = 0;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c1 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
      i += 2;
    } else {
      c1 = utftext.charCodeAt(i + 1);
      c2 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
      i += 3;
    }
  }
  return string;
}