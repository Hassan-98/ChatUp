<template>
  <div class="OptionalChatMenu" :class="$store.state.openedChatMode ? 'opend':'closed'">
    <div class="menu-head">
      <img v-if="$store.state.openedChat.roomType == 'Chats'" :src="openUser.photo" alt="chat-img">
      <img v-else :src="$store.state.openedChat.groupPhoto" alt="chat-img">
      <h4 v-if="$store.state.openedChat.roomType == 'Chats'">
        {{ openUser.username }}
      </h4>
      <h4 v-else>
        {{ $store.state.openedChat.groupName }}
      </h4>
      <span v-if="openUser.activeNow && $store.state.openedChat.roomType == 'Chats'">
        <i class="fas fa-circle greenAlert" /> Active Now
      </span>
      <span v-else-if="!openUser.activeNow && $store.state.openedChat.roomType == 'Chats'">
        Active {{ openUser.lastActive | format }}
      </span>
      <hr>
    </div>
    <div class="menu-body">
      <h5><i class="fal fa-paperclip" /> <span>Attachments</span></h5>
      <p v-if="!files.length" class="noFiles">
        No Files Yet
      </p>
      <p v-for="file in files" v-else :key="file._id" class="file" @click="downloadOrPreviewFile(file.file)">
        <i class="fad fa-file-alt" /> {{ file.file | cutOff }}
      </p>
      <h5><i class="fal fa-photo-video" /> <span>Media</span></h5>
      <p v-if="!media.length" class="noFiles">
        No Media Yet
      </p>
      <p v-else class="media">
        <img v-for="img in media" :key="img._id" :src="img.file" alt="media" @click="downloadOrPreviewFile(img.file)">
      </p>
    </div>
  </div>
</template>

<style lang="scss">
  .OptionalChatMenu {
    height: 100vh;
    background: var(--bg);
    padding: 5px 0;
    box-shadow: -1px 0 1px rgba($color: #000000, $alpha: 0.1);
    overflow-y: hidden;
    position: relative;
    transition: 0s;
    z-index: 5;
    &.opend {
      flex: 0 0 20%;
      @include lg {
        flex: 0 0 67.5%;
      }
      @include md {
        flex: 0 0 61.5%;
      }
      @include sm {
        flex: 0 0 100%;
      }
    }
    &.closed {
      flex: 0;
      padding: 0;
    }
    .menu-head {
      padding: 40px 0 0px;
      text-align: center;
      color: var(--wit);
      h4 {
        margin: 0;
        font-weight: bold;
        color: var(--mc);
      }
      span {
        font-size: 13px;
      }
      img {
        width: 100px;
        height: 100px;
        margin-right: 10px;
        margin-bottom: 10px;
        border-radius: 50%;
        border: 2px solid #ccc;
      }
      button {
        padding: 7px 15px;
        border-radius: 5px;
        border: none;
        font-weight: bold;
        box-shadow: none;
        color: var(--mc);
        background: var(--bg);
        i {
          color: var(--mc);
          position: relative;
          top: 1px;
          font-size: 16px;
        }
        &:hover {
          transform: none;
          background: #e7e7e7;
          color: var(--mc);
          i {
            color: var(--mc);
          }
        }
      }
    }
    .menu-body {
      padding: 0px 15px;
      color: var(--wit);
      h5 {
        padding: 0px;
        margin: 25px 0 5px;
        color: var(--mc);
        font-weight: bold;
        padding: 10px 20px;
        border-radius: 5px;
        background: rgba(0,0,0,0.07);
        font-size: 24px;
        display: flex;
        align-items: center;
        i {
          margin-right: 10px;
          font-size: 20px;
        }
        span {
          font-size: 18px;
        }
      }
      p {
        margin: 0;
        padding: 2px 10px;
        font-family: 'Open Sans', sans-serif;
        color: var(--mc);
        font-size: 14px;
        margin: 0 0 10px 0;
        cursor: pointer;
        i {
          color: var(--mc);
          margin: 0;
          margin-right: 5px;
          cursor: pointer;
          border-radius: 50%;
          font-size: 16px;
        }
        &.noFiles {
          padding: 20px 0;
          text-align: center;
        }
        &.file {
          max-width: 300px;
          @include lg {
            max-width: 200px;
          }
        }
        &.media {
          display: flex;
          flex-wrap: wrap;
          cursor: auto;
          img {
            cursor: pointer;
            margin: 10px 10px 0 0;
            border-radius: 8px;
            width: calc(50% - 10px);
            height: 100px;
          }
        }
        &:hover {
          color: var(--mc2);
          i {
            color: var(--mc2);
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
export default {
  computed: {
    openUser () {
      if (!this.$store.state.openedChatMode) return {};
      return this.$store.state.openedChat.roomType == "Chats" ? this.$store.state.openedChat.usersList.other : {}
    },
    cUser () {
      return this.$store.state.user
    },
    media () {
      var messages = this.$store.state.openedChat.messages;
      var revertedMessages = []
      for (var i = messages.length - 1; i >= 0; i--) {
        revertedMessages.push(messages[i])
      }
      var mediaCounter = 0;
      var maxMedia = 6;
      var media = revertedMessages.filter((message) => {
        if (mediaCounter >= maxMedia) return false;

        if (message.deleted) return false;
        
        if (message.file) {
          var sp = message.file.split("/");
          var name = sp[sp.length - 1]
          var lastName = name.split("_")
          var NameArr = []
          lastName.forEach((part, idx) => {if (idx == lastName.length - 1) return; NameArr.push(part)})
          var filename = NameArr.join("_")
          var splited = filename.split('.');
          var ext = splited[splited.length - 1];
          if (ext == 'png' || ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "svg" ||ext == 'bmp') {
            mediaCounter++;
            return true;
          } else {
            return false
          }
        }
      })
      return media;
    },
    files () {
      var messages = this.$store.state.openedChat.messages;
      var revertedMessages = [];

      for (var i = messages.length - 1; i >= 0; i--) { revertedMessages.push(messages[i]) }

      var filesCounter = 0;
      var maxFiles = 4;
      var files = revertedMessages.filter((message) => {
        if (filesCounter >= maxFiles) return false;

        if (message.deleted) return false;

        if (message.file) {
          filesCounter++;
          return true;
        }
      })
      return files;
    }
  },
  methods: {
    downloadOrPreviewFile(file){
      var sp = file.split("/");
      var name = sp[sp.length - 1]
      var lastName = name.split("_")
      var NameArr = []
      lastName.forEach((part, idx) => {if (idx == lastName.length - 1) return; NameArr.push(part)})
      var filename = NameArr.join("_")
      var splited = filename.split('.');
      var ext = splited[splited.length - 1];
      if (ext == 'png' || ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "svg" ||ext == 'bmp') {
        this.$store.commit('openPicModal', file)
      } else {
        this.download(filename, file, ext)
      }
    },
    download(filename, URL) {
      var element = document.createElement('a');
      element.setAttribute('href', URL);
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  },
  filters: {
    cutOff(v) {
      var sp = v.split("/");
      var name = sp[sp.length - 1]
      var lastName = name.split("_")
      var NameArr = []
      lastName.forEach((part, idx) => {if (idx == lastName.length - 1) return; NameArr.push(part)})
      var filename = NameArr.join("_")

      if (filename.slice(0, 15).length < filename.length) {
        var splited = filename.split('.');
        var ext = splited[splited.length - 1];
        return filename.slice(0, 15) + '...' + ext
      }
      else return filename.slice(0, 15)
    },
    format(v) {
      return moment(v).fromNow()
    }
  }
}
</script>
