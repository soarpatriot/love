const app = getApp()

Page({
  onShareAppMessage() {
    return {
      title: '发起支付',
      path: 'pages/explain/pay'
    }
  },

  onLoad() {},

  requestPayment() {
    const self = this

    self.setData({
      loading: true
    })

    // 此处需要先调用wx.login方法获取code，然后在服务端调用微信接口使用code换取下单用户的openId
    // 具体文档参考https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html?t=20161230#wxloginobject
        const openid = app.globalData.openid
        wx.cloud.callFunction({
          name: 'pay',
          data: {
            action: 'unifiedorder',
            userInfo: {
              openId: openid
            },
            price: 0.01
          },
          success: res => {
            console.warn('[云函数] [openapi] templateMessage.send 调用成功：', res)
            const data = res.result.data
            wx.requestPayment({
              timeStamp: data.time_stamp,
              nonceStr: data.nonce_str,
              package: `prepay_id=${data.prepay_id}`,
              signType: 'MD5',
              paySign: data.sign,
              success: () => {
                wx.showToast({ title: '支付成功' });
              }
            });
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '支付失败',
            })
            console.error('[云函数] [openapi] templateMessage.send 调用失败：', err)
          }
        })
    
  }
})