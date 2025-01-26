// pages/main-video/main-video.js
import {
    getTopMV
} from "../../services/video"

Page({
    data: {
        videoList: [],
        offset: 0,
        hasMore: true
    },
    onLoad() {
        this.fetchTopMV();
    },

    // 获取数据
    // async/await取代promise代码更易读
    async fetchTopMV() {
        const res = await getTopMV(this.data.offset);
        const newVideoList = [...this.data.videoList, ...res.data]
        // 设置全新数据
        this.setData({
            videoList: newVideoList,
        });
        this.data.offset = this.data.videoList.length;
        this.data.hasMore = res.hasMore;
    },

    // 监听上拉和下拉
    onReachBottom() {
        if(this.data.hasMore)
            this.fetchTopMV();
    },
    async onPullDownRefresh() {
        this.setData({videoList: []});
        this.data.offset = 0;
        this.data.hasMore = true;

        // 重新请求数据
        await this.fetchTopMV();
        wx.stopPullDownRefresh();
    }
})