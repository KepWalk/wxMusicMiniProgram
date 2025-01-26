import { HYEventStore } from "hy-event-store"
import { getSongDetail, getSongLyric } from "../services/player"
import { parseLyric } from "../utils/parse-lyric"

// 创建播放器
export const audioContext = wx.createInnerAudioContext();

const playerStore = new HYEventStore({
    state: {
        playSongList: [],
        playSongIndex: 0,

        id: 0,
        currentSong: {},
        currentTime: 0,
        durationTime: 0,
        lyricInfos: {}, 
        currentLyricText: "",
        currentLyricIndex: -1,
        isFirstPlay: true,
        isPlaying: false,
        playModelIndex: 0   //0顺序播放，1单曲循环，2随机播放

    },

    actions: {
        playMusicWithSongIdAction(context, id) {
            // 原先数据重置
            context.currentSong = {};
            context.durationTime = 0;
            context.currentTime = 0;
            context.currentLyricIndex = 0;
            context.currentLyricText = "";
            context.lyricInfos = [];

            // 保存id
            context.id = id;
            context.isPlaying = true;
    
            // 根据id获取歌曲的详情
            getSongDetail(id).then(res => {
                context.currentSong = res.songs[0];
                context.durationTime = res.songs[0].dt;
            })
    
            // 获取歌词的信息
            getSongLyric(id).then(res => {
                const lrcString = res.lrc.lyric;
                // 解析歌词
                const lyricInfos = parseLyric(lrcString);
                context.lyricInfos = lyricInfos;
            })
    
            // 播放当前的歌曲
            audioContext.stop();
            audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
            audioContext.autoplay = true;
    
            // audioContext只需要监听一次，切换歌曲时不能再次执行以下代码
            if (context.isFirstPlay) {
                context.isFirstPlay = false;
    
                // 滑块存在一点点bug，就是onTimeUpdate和onSliderChange是异步的，currentTime和audioContext.currentTime并不是实时绑定的，会导致滑块闪现
                // 另一个bug是audioContext.seek并不能做到实时更新audioContext.currentTime
                audioContext.onTimeUpdate(() => {
                    // 获取当前播放时间
                    context.currentTime = audioContext.currentTime * 1000;
    
                    // 匹配歌词，实时获取歌词的索引和文本
                    if (!context.lyricInfos.length) return;
                    let index = context.lyricInfos.length - 1;
                    for (let i = 0; i < context.lyricInfos.length; i++) {
                        const info = context.lyricInfos[i];
                        if (info.time > audioContext.currentTime * 1000) {
                            index = i - 1;
                            break;
                        }
                    }
                    const currentLyricText = context.lyricInfos[index].text;
                    // 同一句歌词不必更新
                    if (index === context.currentLyricIndex) return;
                    context.currentLyricText = currentLyricText;
                    context.currentLyricIndex = index;
                })
                // bug：拖动进度条后，音频需要一个缓冲，这时将不监听onTimeUpdate，需要添加以下代码解决。现在已经修复。
                audioContext.onWaiting(() => {
                    audioContext.pause();
                })
                audioContext.onCanplay(() => {
                    audioContext.play;
                })
                audioContext.onEnded(() => {
                    // 单曲循环不需要切换下一首歌
                    if (audioContext.loop) return

                    // 自动播放下一首
                    this.dispatch("playNewMusicAction");
                })
            }
        },
        changeMusicStatusAction(context) {
            if (!audioContext.paused) {
                audioContext.pause();
                context.isPlaying = false;
            } else {
                audioContext.play();
                context.isPlaying = true;
            }
        },
        changePlayModelAction(context) {
            let ModelIndex = context.playModelIndex + 1;
            if (ModelIndex === 3) ModelIndex = 0;

            // 特判是否单曲循环
            if (ModelIndex === 1) audioContext.loop = true;
            else audioContext.loop = false;

            // 保存当前模式
            context.playModelIndex = ModelIndex;
        },
        playNewMusicAction(context, isNext) {
            let index = context.playSongIndex;
            let len = context.playSongList.length;
            switch (context.playModelIndex) {
                case 0: // 顺序播放
                case 1: // 单曲循环
                    index = isNext ? index + 1 : index - 1;
                    if (index === len) index = 0;
                    else if (index === -1) index = len - 1;
                    break;
                case 2: // 随机播放
                    do {
                        index = Math.floor(Math.random() * len);
                    } while (index === context.playSongIndex);
                    break;
            }
    
            const newSong = context.playSongList[index];

            // 切换歌曲
            this.dispatch("playMusicWithSongIdAction", newSong.id);
    
            // 保存最新的索引
            context.playSongIndex = index;
        }
    }
});

export default playerStore;