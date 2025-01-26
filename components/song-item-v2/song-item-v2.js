// components/song-item-v2/song-item-v2.js
Component({
    properties: {
        itemData: {
            type: Object,
            value: {}
        },
        index: {
            type: Number,
            value: -1
        }
    },
    methods: {
        onSongItemTap() {
            wx.navigateTo({
                url: `/packagePlayer/pages/music-player/music-player?id=${this.properties.itemData.id}`,
              })
        }
    }
})