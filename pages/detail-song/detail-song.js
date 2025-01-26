// pages/detail-song/detail-song.js
import recommendStore from "../../store/recommendStore"
import rankingStore from "../../store/rankingStore"
import { getPlayListDetail } from "../../services/music"
import playerStore from "../../store/playerStore"

Page({
    data: {
        type: "ranking",
        key: "newRanking",
        id: "",
        songInfo: {}
    },
    onLoad(options) {
        // 获取榜单数据
        this.setData({type: options.type})
        if (this.data.type === "ranking") {
            this.data.key = options.key;
            rankingStore.onState(this.data.key, this.handleRanking)
        } else if (this.data.type === "recommend") {
            this.data.key = "recommendSongsInfo";
            recommendStore.onState(this.data.key, this.handleRanking);
        } else if (this.data.type === "menu") {
            this.data.id = options.id;
            this.fetchMenuSongInfo();
        }
    },
    onUnload() {
        if (this.data.type === "ranking") {
            rankingStore.offState(this.data.key, this.handleRanking)
        } else if (this.data.type === "recommend") {
            recommendStore.offState(this.data.key, this.handleRanking);
        }
    },

    // 点击歌单跳转展示数据
    async fetchMenuSongInfo() {
        const res = await getPlayListDetail(this.data.id);
        this.setData({songInfo: res.playlist})
    },

    // 事件监听
    onSongItemTap(event) {
        playerStore.setState("playSongList", this.data.songInfo.tracks);
        playerStore.setState("playSongIndex", event.currentTarget.dataset.index);
    },

    // Store方法
    handleRanking(value) {
        this.setData({
            songInfo: value
        });
        wx.setNavigationBarTitle({
            title: value.name
        })
    }
})