// pages/main-music/main-music.js
import {
    getMusicBanner,
    getSongMenuList
} from "../../services/music"
import recommendStore from "../../store/recommendStore"
import rankingStore from "../../store/rankingStore"
import playerStore from "../../store/playerStore"
import querySelect from "../../utils/query-select"
// import throttle from "../../utils/throttle"
import {
    throttle
} from 'underscore'

// 用节流提高一下性能，没必要执行这么频繁
const querySelectThrottle = throttle(querySelect, 1000, {
    trailing: false
});

const app = getApp();

Page({
    data: {
        screenWidth: 0,
        searchValue: "",
        banners: [],
        // 动态设置轮播图的高度
        bannerHeight: 135,
        recommendSongs: [],

        // 歌单数据
        hotMenuList: [],
        recommendMenuList: [],
        
        // 巅峰榜数据
        rankingInfos: {},

        // 当前正在播放的歌曲信息
        currentSong: {},
        isPlaying: false
    },

    onLoad() {
        this.fetchMusicBanner();
        // this.fetchRecommendSongs();
        this.fetchHotSongMenuList();
        
        // 获取热门歌单数据
        recommendStore.onState("recommendSongsInfo", this.handleRecommendSongs);
        recommendStore.dispatch("fetchRecommendSongsAction");

        // 获取巅峰榜数据
        rankingStore.onState("newRanking", this.getRankingHandler("newRanking"));
        rankingStore.onState("originRanking", this.getRankingHandler("originRanking"));
        rankingStore.onState("upRanking", this.getRankingHandler("upRanking"));
        rankingStore.dispatch("fetchRankingDataAction");

        playerStore.onStates(["currentSong", "isPlaying"], this.handlePlayInfos);

        // 获取屏幕尺寸
        this.setData({screenWidth: app.globalData.screenWidth})
    },

    // 卸载对Store的监听
    onUnload() {
        recommendStore.offState("recommendSongsInfo", this.handleRecommendSongs);
        rankingStore.offState("newRanking", this.getRankingHandler("newRanking"));
        rankingStore.offState("originRanking", this.getRankingHandler("originRanking"));
        rankingStore.offState("upRanking", this.getRankingHandler("upRanking"));

        playerStore.offStates(["currentSong", "isPlaying"], this.handlePlayInfos);
    },

    async fetchMusicBanner() {
        const res = await getMusicBanner();
        this.setData({
            banners: res.banners
        })
    },

    // 这里改成全局数据共享
    // async fetchRecommendSongs() {
    //     const res = await getPlayListDetail(3778678);
    //     console.log(res);
    //     const playList = res.playlist;
    //     const recommendSongs = playList.tracks.slice(0, 6);
    //     this.setData({
    //         recommendSongs
    //     })
    // },

    async fetchHotSongMenuList() {
        // 这里不能使用await，因为会导致这几个数据不能异步获取
        // 请求热门歌单
        getSongMenuList().then(res => {
            this.setData({hotMenuList: res.playlists})
        })
        // 请求推荐歌单
        getSongMenuList("华语").then(res => {
            this.setData({recommendMenuList: res.playlists})
        })
    },

    // 界面的事件监听方法
    onSearchClick() {
        wx.navigateTo({
            url: '/pages/detail-search/detail-search',
        })
    },
    onBannerImageLoad(event) {
        // 动态设置轮播图的高度
        querySelectThrottle(".banner-image").then(res => {
            this.setData({
                bannerHeight: res[0].height
            })
        })
    },
    onRecommendMoreClick() {
        wx.navigateTo({
            url: '/pages/detail-song/detail-song?type=recommend',
        })
    },
    onSongItemTap(event) {
        // 获取推荐歌曲播放列表，并存入Store
        playerStore.setState("playSongList", this.data.recommendSongs);
        playerStore.setState("playSongIndex", event.currentTarget.dataset.index);
    },
    onPlayOrPauseBtnTap() {
        playerStore.dispatch("changeMusicStatusAction");
    },
    onPlayBarAlbumTap() {
        // 不传值，music-player获取不到id，就不会重新获取歌曲信息
        wx.navigateTo({
          url: '/packagePlayer/pages/music-player/music-player',
        })
    },

    // Store方法
    handleRecommendSongs(value) {
        if (!value.tracks) return
        this.setData({recommendSongs: value.tracks.slice(0, 6)});
    },
    // handleNewRanking(value) {
    //     const newRankingInfos = {...this.data.rankingInfos, newRanking: value};
    //     this.setData({rankingInfos: newRankingInfos})
    // },
    // handleOriginRanking(value) {
    //     const newRankingInfos = {...this.data.rankingInfos, OriginRanking: value};
    //     this.setData({rankingInfos: newRankingInfos})
    // },
    // handleUpRanking(value) {
    //     const newRankingInfos = {...this.data.rankingInfos, UpRanking: value};
    //     this.setData({rankingInfos: newRankingInfos})
    // }

    // 上述代码的优化方案
    getRankingHandler(ranking) {
        return value => {
            // [ranking]动态表示属性名
            const newRankingInfos = {...this.data.rankingInfos, [ranking]: value}
            this.setData({rankingInfos: newRankingInfos})
        }
    },
    handlePlayInfos({ currentSong, isPlaying }) {
        if (currentSong) this.setData({currentSong});
        if (isPlaying !== undefined) this.setData({isPlaying});
    }
})