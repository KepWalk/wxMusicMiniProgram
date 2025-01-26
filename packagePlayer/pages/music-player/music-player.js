// pages/music-player/music-player.js
import querySelect from "../../../utils/query-select"
import playerStore, { audioContext } from "../../../store/playerStore"
import { throttle } from 'underscore';

const app = getApp();
const modelNames = ["order", "repeat", "random"];

Page({
    data: {
        id: 0,

        stateKeys: ["id", "currentSong", "durationTime", "currentTime", "lyricInfos", "currentLyricText", "currentLyricIndex", "isPlaying", "playModelIndex"],

        currentSong: {},
        currentTime: 0,
        durationTime: 0,
        lyricInfos: [], 
        currentLyricText: "",
        currentLyricIndex: -1,

        isPlaying: true,

        pageTitles: ["歌曲", "歌词"],
        currentPage: 0,
        contentHeight: 0,

        sliderValue: 0,
        isSliderChanging: false,
        // 设置一个同步信号量，onTimeUpdate和onSliderChange必须同步执行
        isWaiting: false,

        lyricScrollTop: 0,

        // 播放列表和当前索引
        playSongIndex: 0,
        playSongList: [],

        isFirstPlay: true,
        // 0顺序播放，1单曲循环，2随机播放
        playModelIndex: 0,
        playModelName: "order"
    },
    onLoad(options) {

        // 获取内容高度
        this.setData({
            contentHeight: app.globalData.contentHeight
        })
        const id = options.id;

        // 根据id播放歌曲
        // this.setupPlaySong(id);
        if (id) playerStore.dispatch("playMusicWithSongIdAction", id); // 代码重构后歌曲数据全部放到Store，用于全局共享

        // 获取播放列表
        playerStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler);
        playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler);
    },

    onReady() {
        // 获取每行歌词的高度
        this.getLyricItemHeight();
    },

    onUnload() {
        playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler);
        playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler);
    },

    // 更新当前播放进度和进度条
    updateProgress: throttle(function(currentTime) {
        if (this.data.isSliderChanging) return;
        // 这里传进来的currentTime是audioContext.currentTime，拿到的是s，而durationTime是ms
        this.setData({
            currentTime,
            sliderValue: currentTime / this.data.durationTime * 100
        });
    }, 1000, {leading: false, trailing: false}),

    // 获取歌词高度
    getLyricItemHeight() {
        querySelect(".lyric-list .item", true).then(res => {
            const lyricItems = res[0];
            let sum = 0;
            // 获取歌词高度，通过前缀和存储每个index歌词需要滚动的高度
            for (let index = 1; index < lyricItems.length; index++) {
                const item = lyricItems[index - 1];
                sum += item.height;
                // 特判第一个item有padding，需要减掉
                if (index === 1) sum -= this.data.contentHeight / 2 - 66;
                this.data.lyricInfos[index].scrollTop = sum;
            }
        })
    },

    // 事件监听
    onNavBackTap() {
        wx.navigateBack();
    },
    onSwiperChange(event) {
        this.setData({
            currentPage: event.detail.current
        })
    },
    onNavTabItemTap(event) {
        const index = event.currentTarget.dataset.index;
        this.setData({
            currentPage: index
        });
    },
    onSliderChange(event) {
        // 事件一触发必须马上设置同步信号量，audioContext.seek(currentTime / 1000)执行完才能允许onTimeUpdate执行
        // 其实也有点bug，最好的办法应该是slider的value属性即将被修改时设置isWaiting为true，可以用Proxy或者自带的监听变量的方法
        this.data.isWaiting = true;

        // 获取滑块的位置
        const value = event.detail.value;
        const currentTime = value / 100 * this.data.durationTime;
        // 修改播放器
        audioContext.seek(currentTime / 1000);

        // 设置同步信号量，允许onTimeUpdate执行
        this.data.isWaiting = false;

        // 设置当前播放时间
        this.setData({
            currentTime,
            isSliderChanging: false
        })
    },
    // 这个东西执行的过于频繁，需要节流
    onSliderChanging: throttle(function(event) {
        // 获取滑块的位置
        const value = event.detail.value;
        const currentTime = value / 100 * this.data.durationTime;
        this.setData({
            currentTime
        })

        // 当前正在滑动
        this.setData({
            isSliderChanging: true
        });
    }, 100),
    onPlayOrPauseTap() {
        playerStore.dispatch("changeMusicStatusAction");
    },
    onPrevBtnTap() {
        playerStore.dispatch("playNewMusicAction", false);
    },
    onNextBtnTap() {
        playerStore.dispatch("playNewMusicAction", true);
    },
    onModelTap() {
        playerStore.dispatch("changePlayModelAction");
    },

    // Store方法
    getPlaySongInfosHandler({
        playSongList,
        playSongIndex
    }) {
        if (playSongList) {
            this.setData({
                playSongList
            });
        }
        if (playSongIndex !== undefined) {
            this.setData({
                playSongIndex
            });
        }
    },
    getPlayerInfosHandler({
        id, 
        currentSong,
        durationTime,
        currentTime,
        lyricInfos,
        currentLyricText,
        currentLyricIndex,
        isPlaying,
        playModelIndex,
    }) {
        if (id !== undefined) this.setData({id});
        if (currentSong) this.setData({currentSong});
        if (durationTime !== undefined) this.setData({durationTime});
        if (currentTime !== undefined) {
            // 根据当前时间改变进度条
            this.updateProgress(currentTime);
        }
        if (lyricInfos) this.setData({lyricInfos});
        if (currentLyricText) this.setData({currentLyricText});
        if (currentLyricIndex !== undefined && this.data.lyricInfos.length) this.setData({currentLyricIndex, lyricScrollTop: this.data.lyricInfos[currentLyricIndex].scrollTop});
        if (isPlaying !== undefined) this.setData({isPlaying});
        if (playModelIndex !== undefined) this.setData({playModelName: modelNames[playModelIndex]});
    }
})