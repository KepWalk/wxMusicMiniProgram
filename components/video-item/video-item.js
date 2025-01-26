// components/video-item/video-item.js
Component({
  properties: {
    itemData: {
        type: Object,
        value: {}
    }
  },
  methods: {
    // 监听视频点击
    onVideoItemTap() {
        const item = this.properties.itemData;
        wx.navigateTo({
          url: `/packageVideo/pages/detail-video/detail-video?id=${item.id}`,
        })
    }
  }
})