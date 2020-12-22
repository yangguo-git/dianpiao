const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
// 网络请求
const request = function(url, method, data, msg, succ, fail, com) {
  // 小程序顶部显示Loading
  // wx.showNavigationBarLoading();
  if (msg != "") {
    wx.showLoading({
      title: msg
    })
  }
  data.client_v_no= '1.0.2';
  wx.request({
    url: getApp().url + url,
    data: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: method,
    success: res => {
      // console.log(url + ' 提交的data:', data);
      if (succ) succ(res);
    },
    fail: err => {
      wx.showToast({
        title: '网络错误，请稍后再试···',
        icon:'none'
      })
      if (fail) fail(err);
    },
    complete: com => {
      // wx.hideNavigationBarLoading();
      if (msg != "") {
        wx.hideLoading();
      }
      // console.log(url + ' 返回的data:', com.data);
    }
  })
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 判断全国号段
const regNumber = mobile => {
  var move = /^((134)|(135)|(136)|(137)|(138)|(139)|(147)|(150)|(151)|(152)|(157)|(158)|(159)|(178)|(182)|(183)|(184)|(187)|(188)|(198))\d{8}$/g; //移动
  var link = /^((130)|(131)|(132)|(155)|(156)|(145)|(185)|(186)|(176)|(175)|(170)|(171)|(166))\d{8}$/g; //联通
  var telecom = /^((133)|(153)|(173)|(177)|(180)|(181)|(189)|(199))\d{8}$/g; //电信
  if (move.test(mobile)) {
    return true;
  } else if (link.test(mobile)) {
    return true;
  } else if (telecom.test(mobile)) {
    return true;
  } else {
    return false;
  }
}
module.exports = {
  regNumber: regNumber,
  formatTime: formatTime,
  request: request
}