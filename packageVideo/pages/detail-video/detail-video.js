// pages/detail-video/detail-video.js
import { getMVUrl, getMVInfo, getMVrelated } from "../../../services/video"

Page({
    data: {
        id: 0,
        mvUrl: null,
        mvInfo: {},
        relatedVideo: [],
        danmuList: [
            {text: "第一", color: "white", time: 3},
            {text: "zcf到此一游", color: "white", time: 5},
            {text: "原神，启动！", color: "white", time: 10},
        ]
    },
    onLoad(options) {
        // options存储url查询键值对
        const id = options.id;
        this.setData({id});

        // 请求获取视频数据
        this.fetchMVUrl();
        this.fetchMVInfo();
        this.fetchMVRelated();
    },

    async fetchMVUrl() {
        const res = await getMVUrl(this.data.id);
        this.setData({mvUrl: res.data.url});
    },

    async fetchMVInfo() {
        const res = await getMVInfo(this.data.id);
        this.setData({mvInfo: res.data})
    },

    async fetchMVRelated() {
        const res = await getMVrelated(this.data.id);
        this.setData({relatedVideo: res.playlists});
    }
})