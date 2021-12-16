<template>
  <div class="OpenedChat" :class="`${$store.state.OptionalMenu ? 'collapsed' : 'expanded'} ${!$store.state.openedChatMode && 'fullWidth'}`">
    <client-only>
      <VEmojiPicker :style="`display: ${display}`" @select="selectEmoji" />
    </client-only>
    <div class="recording-modal">
      <div class="modal-content">
        <i v-tooltip="'close'" class="fal fa-times close" @click="closeRecorder" />
        <h1><i class="fal fa-microphone-alt" /></h1>
        <p class="record-timer">
          {{ timer.minutes }} : {{ timer.seconds }} : {{ timer.milliseconds }}
        </p>
        <button v-tooltip="'Start recording'" class="controlBTN start" @click="startRecording">
          <i class="fad fa-microphone-alt" />
        </button>
        <button v-tooltip="'Stop recording'" class="controlBTN stop" @click="stopRecording">
          <i class="fad fa-stop" />
        </button>
        <div class="record-result">
          <hr>
          <audio src="" controls class="audio-records" />
          <button v-tooltip="'Delete record'" class="controlBTN delete" disabled="disabled" @click="deleteRecord">
            <i class="fad fa-trash" />
          </button>
          <button v-tooltip="'Send record'" class="controlBTN send" disabled="disabled" @click="sendRecord">
            <i class="fad fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
    <div v-if="$store.state.noChatOpen" class="nothing">
      <div class="icon">
        <img src="/imgs/chatLogoNothing-Light.png" alt="Icon">
        <h3>ChatUp</h3>
      </div>
      <h4>Click on a chat to show messages</h4>
    </div>
    <div v-else class="openchat">
      <div class="row chat-head">
        <!-- Head Menu -->
        <div class="menu-head">
          <img v-if="!chat.usersList.other" :src="chat.groupPhoto" alt="chat-img">
          <img v-else :src="chat.usersList.other.photo" alt="chat-img" @click="openProfile(chat.usersList.other)">
          <div class="top">
            <h5 v-if="chat.usersList.other" @click="openProfile(chat.usersList.other)">
              {{ chat.usersList.other.username }}
            </h5>
            <h5 v-else>
              {{ chat.groupName }}
            </h5>
            <p v-if="chat.usersList.other && chat.usersList.other.activeNow">
              <i class="fas fa-circle greenAlert" /> Active Now
            </p>
            <p v-else-if="chat.usersList.other && !chat.usersList.other.activeNow">
              Active {{ chat.usersList.other.lastActive | format }}
            </p>
            <p v-else>
              {{ Object.keys(chat.usersList).length }} Members
            </p>
          </div>
          <i v-if="$store.state.mobile" v-tooltip="'Back'" class="fas fa-arrow-left" @click="closeChat" />
          <i v-tooltip="'Start a call'" class="fas fa-phone" @click="call" />
          <i v-if="!chat.usersList.other" v-tooltip="'Group settings'" class="fas fa-ellipsis-h" @click="openGroupSettings" />
        </div>
      </div>
      <div class="chat-body" @scroll="scrolling" @click="closeAllModals">
        <UploadingLoader v-if="isUploading" />
        <div
          v-for="message in chat.messages"
          :key="message._id"
          :class="{
            me: message.user._id == currentUser._id,
            location: message.location && !message.deleted,
            file: message.file && !message.deleted,
            record: message.record && !message.deleted,
            voiceCall: message.voiceCall && !message.deleted,
            msg: message.msg.length > 0 || message.deleted }"
        >
          <img :src="message.user.photo" alt="chat-img" @click="openProfile(message.user)">

          <div class="content">
            <!-- ReplyTo -->
            <div v-if="!message.deleted && message.replyTo && message.replyTo.user" :id="message.replyTo.messageId" class="replyTo">
              <span class="user">{{ message.replyTo.user.username }}</span>
              <span class="content">{{ message.replyTo.messageContent }}</span>
            </div>
            <!-- ReplyTo -->

            <!-- NORMAL MESSAGE -->
            <p
              v-if="message.msg.length > 0 && !message.deleted"
              :id="message._id"
              :class="(message.replyTo && message.replyTo.user) && 'act_to_replay'"
              @dblclick="openReplayMsg(message.msg, message._id, message.user.username, message.user._id)">
              {{ message.msg }}
            </p>
            <p v-if="message.deleted" class="deleted">
              <i class="far fa-times" />
              Message Deleted
            </p>
            <!-- NORMAL MESSAGE -->

            <!-- VOICE CALL MESSAGE -->
            <div v-if="message.voiceCall && !message.deleted" :id="message._id" class="voiceCall-content" @dblclick="openReplayMsg('Voice Call', message._id, message.user.username, message.user._id)">
              <i v-if="message.voiceCall.missed" class="fas fa-phone-slash missed" />
              <i v-else class="fas fa-phone-square" />
              <span v-if="message.voiceCall.missed">Missed Voice Call</span>
              <span v-else>Voice Call <i>({{ message.voiceCall.duration | formatCallDuration }})</i></span>
            </div>
            <!-- VOICE CALL MESSAGE -->

            <!-- LOCATION MESSAGE -->
            <div v-if="message.location && !message.deleted" :id="message._id" class="location-content" @dblclick="openReplayMsg('Location Sent', message._id, message.user.username, message.user._id)">
              <i class="fas fa-map-marked-alt" />
              <span @click="goToLocation(message.location)">Open Location <i>({{ message.location.lat | formatCoords }}, {{ message.location.long | formatCoords }})</i></span>
            </div>
            <!-- LOCATION MESSAGE -->

            <!-- FILE MESSAGE -->
            <div v-if="message.file && !message.deleted" :id="message._id" class="file-content" @dblclick="openReplayMsg('File Sent', message._id, message.user.username, message.user._id)">
              <div class="iconOfFile">
                <div class="file-icon" :data-type="message.file | formatMimetype" />
              </div>
              <span @click="downloadOrPreviewFile(message.file)">{{ message.file | cutOff }}</span>
            </div>
            <!-- FILE MESSAGE -->

            <!-- RECORD MESSAGE -->
            <div v-if="message.record && !message.deleted" :id="message._id" class="record-content" @dblclick="openReplayMsg('Record Sent', message._id, message.user.username, message.user._id)">
              <i class="fas fa-file-audio" />
              <span>
                <av-waveform
                  :played-line-width="1"
                  played-line-color="#ABC123"
                  :playtime-with-ms="false"
                  :playtime-font-size="14"
                  :playtime-slider-width="2"
                  :noplayed-line-width="0.2"
                  :canv-width="160"
                  :canv-height="50"
                  :audio-src="message.record"
                />
              </span>
              <i class="fad fa-play playRecord" @click="playRecord" />
              <i class="fad fa-pause pauseRecord" @click="pauseRecord" />
            </div>
            <!-- RECORD MESSAGE -->

            <!-- MESSAGE MENU -->
            <i v-if="!message.deleted" class="fas fa-ellipsis-v" :class="(message.replyTo && message.replyTo.user) && 'act_to_replay'">
              <ul class="options-menu">
                <li v-if="message.msg.length" @click="translateText($event, message.msg, currentUser.defaultLanguage, message.replyTo && message.replyTo.user)">
                  <i class="fal fa-language" /> Translate
                </li>
                <li v-if="message.msg.length" @click="openReplayMsg(message.msg, message._id, message.user.username, message.user._id)">
                  <i class="fal fa-reply" /> Reply
                </li>
                <li v-if="message.msg.length" @click="hearMsg($event, message)">
                  <i class="fal fa-headphones-alt" /> Listen
                </li>
                <li v-if="message.user._id == currentUser._id" @click="deleteMsg(message._id)">
                  <i class="fal fa-trash-alt" /> Delete
                </li>
              </ul>
            </i>
            <!-- MESSAGE MENU -->

            <!-- MESSAGE STATUS -->
            <span :title="message.sentAt | formatTitle" style="direction: ltr">
              {{ message.sentAt | format }}
              <i v-if="message.user._id == currentUser._id" :class="`${message.sent === true ? 'fas fa-check-circle' : message.sent === 'Not Sent' ? 'fas fa-times-circle' : 'far fa-circle' }`" style="font-size:9px" :style="{color: message.sent === 'Not Sent' ? 'red' : ''}" />
            </span>
            <!-- MESSAGE STATUS -->
          </div>
        </div>
      </div>
      <div class="row chat-reply-footer">
        <span />
        <p class="msgReply" />
        <i v-tooltip="'Cancel'" class="fal fa-times" @click="closeReplayMsg" />
      </div>
      <div class="row chat-footer">
        <textarea v-model="msg" class="msgArea" placeholder="Type Something" @keyup="checkUniCodeOrSend" />
        <div class="right-buttons">
          <div class="btnDiv">
            <i v-tooltip="'More actions'" class="fal fa-plus buttons-menu-btn" @click="openButtonMenu" />
            <i v-tooltip="'Emojies'" class="fad fa-smile-beam" @click="openEmoji" />
            <i v-tooltip="'Voice record'" class="fal fa-microphone-alt recorderIcon" @click="openRecorder" />
          </div>
          <i v-tooltip="'Send message'" class="fad fa-paper-plane send" @click="send" />
        </div>
        <div class="additional-buttons-menu">
          <div class="btn-div" @click="openUploading">
            <i v-tooltip="'Attachments'" class="fal fa-paperclip" /><span>Attach File</span>
          </div>
          <div class="btn-div" @click="sendLocation">
            <i v-tooltip="'Send location'" class="fal fa-map-marker-alt" /><span>Location</span>
          </div>
          <div class="btn-div recorderBtn" @click="openRecorder">
            <i v-tooltip="'Voice record'" class="fal fa-microphone-alt" /><span>Voice Record</span>
          </div>
          <input type="file" class="uploadFileInput d-none" @change="uploadFile">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .OpenedChat {
    height: 100vh;
    text-align: center;
    position: relative;
    background: #fff;
    padding: 0;
    transition: 0s;
    #EmojiPicker {
      position: absolute;
      bottom: 75px;
      right: 20px;
      min-height: 120px;
      z-index: 999;
      .emoji {
        border: none!important;
        width: auto!important;
        height: auto!important;
      }
    }
    .recording-modal {
      &.show {
        transform: translate(-50%, -50%) scale(1);
      }
      transition: all 0.15s ease-in-out;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      z-index: 9999999999;
      background: var(--white);
      border: 2px solid #fff;
      width: 50%;
      overflow: hidden;
      border-radius: 10px;
      box-shadow: 0 0px 15px rgba($color: #000, $alpha: 0.15);
      @include xl {
        width: 60%;
      }
      @include lg {
        width: 65%;
      }
      @include md {
        width: 80%;
      }
      @include sm {
        width: 90%;
      }
      .modal-content {
        display: flex;
        justify-content: center;
        background: transparent;
        width: 100%;
        height: 100%;
        text-align: center;
        padding: 20px;
        border: none;
        position: relative;
        & > i {
          position: absolute;
          top: 10px;
          right: 12px;
          color: var(--mc);
          text-shadow: none;
          cursor: pointer;
        }
        h1 {
          color: var(--mc);
        }
        .record-timer {
          font-size: 34px;
          font-weight: bold;
          color: var(--mc);
        }
        & > .controlBTN {
          padding: 10px 20px;
          text-transform: uppercase;
          font-size: 32px;
          margin: 10px auto;
          display: block;
          border: none;
          border-radius: 10px;
          box-shadow: none;
          &:first-of-type {
            background: #F15946;
          }
          &:nth-of-type(2) {
            background: darkred;
            display: none;
          }
        }
        hr {
          width: 100%;
        }
        .record-result {
          display: none;
          .controlBTN {
            background: #F15946;
            display: inline;
            border: none;
            padding: 10px 20px;
            font-size: 26px;
            border-radius: 10px;
            margin-top: 15px;
            box-shadow: none;
            &:disabled {
              background: darkgrey!important;
            }
            &:first-of-type {
              background: transparent;
              color: darkred;
              box-shadow: none;
            }
          }
          .plyr {
            height: auto!important;
          }
          .plyr--audio{
              .plyr__controls {
                background: #404040!important;
                padding: 5px!important;
                color: white!important;
                border-radius: 5px;
                margin-bottom: 10px;
              }
          }
          .plyr button{
            box-shadow: none;
          }
          audio {
            display: block;
            margin: 0 auto 8px;
            outline: none;
          }
        }
      }
    }
    .nothing {
      background: var(--white);
      text-align: center;
      height: 100%;
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .icon {
        border-radius: 50%;
        margin-bottom: 20px;
        img {
          width: 128px;
          height: 128px;
          margin-left: 20px;
        }
        h3 {
          padding: 10px 25px 0;
          font-family: 'Rock Salt', cursive;
          color: #e5e5e5;
          margin: 3px 0 0 0;
        }
      }
      h4 {
        margin: 0;
        color: #ccc;
        border-radius: 10px;
      }
    }
    &.expanded, &.collapsed {
      flex: 0 0 53.5%;
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
    &.collapsed {
      @include lg {
        display: none;
      }
      @include md {
        display: none;
      }
      @include sm {
        display: none;
      }
    }
    &.fullWidth {
      flex: 0 0 73.5%;
      @include lg {
        flex: 0 0 67.5%;
      }
      @include md {
        flex: 0 0 61.5%;
      }
      @include sm {
        flex: 0 0 100%;
      }
      &.collapsed {
        flex: 0 0 53.5%;
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
    }
    .openchat {
      height: 100%;
      transition: 0s;
      .chat-head {
        height: 90px;
        position: relative;
        z-index: 3;
        background: var(--bg);
        .menu-head {
          background: var(--bg);
          box-shadow: 0 1px 1px rgba($color: #000000, $alpha: 0.1);
          width: 100%;
          align-items: center;
          padding: 5px 5px 5px 15px;
          display: flex;
          img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
            border-radius: 50%;
            border: 2px solid #ccc;
            cursor: pointer;
            aspect-ratio: 16/9;
          }
          .top {
            width: 80%;
            text-align: left;
            h5 {
              font-weight: bold;
              color: var(--mc);
              margin: 0;
              cursor: pointer;
              text-transform: capitalize;
              @include xs {
                font-size: 17px;
              }
            }
            p {
              margin: 0;
              font-size: 11px;
              color: var(--text);
              .greenAlert {
                color: green;
                font-size: 9px;
              }
            }
          }
          & > i {
            color: var(--white);
            background: var(--mc);
            padding: 8px;
            margin: 5px;
            border-radius: 50%;
            cursor: pointer;
            border-color: var(--bg);
            box-shadow: 0 0 4px rgba($color: #000, $alpha: 0.2);
            &:hover{
              background: var(--white);
              color: var(--mc);
            }
          }
        }
      }
      .chat-body {
        height: calc(100% - 160px);
        background: var(--white);
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        padding: 15px 10px;
        position: relative;
        z-index: 2;
        @include xs {
          height: calc(100% - 165px);
        }
        .msg {
          display: flex;
          padding: 5px;
          text-align: left;

          & > img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #ccc;
            cursor: pointer;
            aspect-ratio: 16/9;
          }

          .content {
            width: 100%;
            & > i {
              display: inline;
              font-size: 13px;
              color: rgb(135, 134, 134);
              cursor: pointer;
              position: relative;
              &.act_to_replay {
                top: -10px;
              }
              .options-menu {
                border-radius: 8px;
                overflow: hidden;
                direction: ltr;
                display: none;
                position: absolute;
                z-index: 9999999999999999;
                top: -80px;
                padding: 0;
                left: calc(100% + 5px);
                width: 130px;
                list-style: none;
                background: var(--white);
                box-shadow: 0 0 3px rgba($color: #000000, $alpha: 0.15);
                &.show {
                  display: inline-block;
                }
                li {
                  padding: 10px 15px;
                  cursor: pointer;
                  text-align: left;
                  font-weight: 100;
                  font-size: 14px;
                  color: var(--mc);
                  i {
                    font-size: 14px;
                    margin-right: 5px;
                    position: relative;
                    top: -1px;
                    color: var(--mc);
                  }
                  &:hover {
                    background: #eee;
                  }
                }
              }
            }
            p {
              direction: rtl;
              unicode-bidi: plaintext;
              font-family: 'Tajawal', sans-serif;
              margin: 0;
              display: inline-block;
              font-size: 16px;
              background: #F4F7FC;
              color: #212529;
              padding: 6px 15px;
              border-radius: 15px;
              box-shadow: none;
              max-width: 350px;
              box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
              &.deleted {
                color: #999;
                font-style: italic;
                i {
                  margin-right: 5px;
                  position: relative;
                  color: red;
                  top: 1px;
                }
              }
              &.act_to_replay {
                position: relative;
                z-index: 1;
                top: -10px;
              }
              #text {
                  direction: rtl;
              }
              #text:after {
                  content: 'a';
                  color: transparent;
              }
              &:after {
                  content: 'a';
                  color: transparent;
                  position: absolute;
              }
              img {
                max-width: 100px;
                max-height: 100px;
                border-radius: 4px;
                margin: 5px;
                border: 2px solid #ccc;
                cursor: pointer;
                  filter:grayscale(1);
                &:hover {
                  filter:grayscale(0);
                }
              }
              @include xs {
                padding: 8px 15px 3px;
              }
            }
            span {
              display: block;
              margin: 5px 0;
              font-size: 11px;
              color: var(--mc);
            }
          }
          &.me {
            direction: rtl;
            text-align: right;
            .content {
              & > i {
                .options-menu {
                  right: calc(100% + 5px);
                  top: -120px;
                }
              }
            }
            & > img {
              margin-right: 0;
              margin-left: 10px;
            }
            p {
              background: var(--msgs);
              color: #fff;
            }
          }

          &:first-of-type {
            .content {
              & > i {
                .options-menu {
                  top: -15px;
                }
              }
            }
          }
        }
        .voiceCall {
          display: flex;
          padding: 5px;
          text-align: left;

          & > img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #ccc;
            cursor: pointer;
            aspect-ratio: 16/9;
          }
          .content {
            width: 100%;
            & > span {
              display: block;
              margin: 5px 0;
              font-size: 11px;
              color: var(--mc);
            }
            & > i {
              display: none;
            }
            .voiceCall-content {
              display: flex;
              border-radius: 7px;
              overflow: hidden;
              & > i {
                padding: 10px;
                background: #e9ebef;
                font-size: 20px;
              }
              span {
                padding: 10px;
                font-family: 'Tajawal', sans-serif;
                margin: 0;
                font-size: 16px;
                background: #F4F7FC;
                color: #212529;
                border-radius: 0 7px 7px 0;
                font-weight: bold;
                line-height: 20px;
                i {
                  font-size: 14px;
                }
                &:hover {
                  background: #F4F7FC;
                }
                @include sm {
                  padding: 12px 10px 8px;
                }
              }
            }
          }
          &.me {
            text-align: right;
            direction: rtl;
            & > img {
              margin-right: 0;
              margin-left: 10px;
            }
            .voiceCall-content {
              & > i {
                color: #fff;
                background: #1e3750eb;
              }
              span {
                color: #fff;
                background: var(--msgs);
                border-radius: 7px 0 0 7px;
                &:hover {
                  background: #1e3750eb;
                }
              }
            }
          }
        }
        .location {
          display: flex;
          padding: 5px;
          text-align: left;

          & > img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #ccc;
            cursor: pointer;
            aspect-ratio: 16/9;
          }
          .content {
            width: 100%;
            & > span {
              display: block;
              margin: 5px 0;
              font-size: 11px;
              color: var(--mc);
            }
            & > i {
              display: none;
              font-size: 13px;
              color: rgb(135, 134, 134);
              cursor: pointer;
              position: relative;
              top: -2px;
              .options-menu {
                border-radius: 8px;
                overflow: hidden;
                direction: ltr;
                display: none;
                position: absolute;
                z-index: 9999999999999999;
                top: -15px;
                padding: 0;
                left: calc(100% + 5px);
                width: 130px;
                list-style: none;
                background: var(--white);
                box-shadow: 0 0 3px rgba($color: #000000, $alpha: 0.15);
                &.show {
                  display: inline-block;
                }
                li {
                  padding: 10px 15px;
                  cursor: pointer;
                  text-align: left;
                  font-weight: 100;
                  font-size: 14px;
                  color: var(--mc);
                  i {
                    font-size: 14px;
                    margin-right: 5px;
                    position: relative;
                    top: -1px;
                    color: var(--mc);
                  }
                  &:hover {
                    background: #eee;
                  }
                }
              }
            }
            .location-content {
              display: inline-flex;
              border-radius: 7px;
              overflow: hidden;
              & > i {
                padding: 10px;
                background: #e9ebef;
                font-size: 20px;
              }
              span {
                padding: 10px;
                font-family: 'Tajawal', sans-serif;
                margin: 0;
                font-size: 16px;
                background: #F4F7FC;
                color: #212529;
                cursor: pointer;
                border-radius: 0 7px 7px 0;
                font-weight: bold;
                line-height: 20px;
                i {
                  font-size: 14px;
                }
                &:hover {
                  background: #F4F7FC;
                }
                @include sm {
                  padding: 12px 10px 8px;
                }
              }
            }
          }
          &.me {
            text-align: right;
            direction: rtl;
            & > img {
              margin-right: 0;
              margin-left: 10px;
            }
            .content {
              & > i {
                display: inline;
                .options-menu {
                  right: calc(100% + 5px);
                }
              }
            }
            .location-content {
              & > i {
                color: #fff;
                background: #1e3750eb;
              }
              span {
                color: #fff;
                background: var(--msgs);
                border-radius: 7px 0 0 7px;
                &:hover {
                  background: #1e3750eb;
                }
              }
            }
          }
        }
        .record {
          display: flex;
          padding: 5px;
          text-align: left;

          & > img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #ccc;
            cursor: pointer;
            aspect-ratio: 16/9;
          }
          .content {
            width: 100%;
            & > span {
              display: block;
              margin: 5px 0;
              font-size: 11px;
              color: var(--mc);
            }
            & > i {
              display: none;
              font-size: 13px;
              color: rgb(135, 134, 134);
              cursor: pointer;
              position: relative;
              top: -2px;
              .options-menu {
                border-radius: 8px;
                overflow: hidden;
                direction: ltr;
                display: none;
                position: absolute;
                z-index: 9999999999999999;
                top: -15px;
                padding: 0;
                left: calc(100% + 5px);
                width: 130px;
                list-style: none;
                background: var(--white);
                box-shadow: 0 0 3px rgba($color: #000000, $alpha: 0.15);
                &.show {
                  display: inline-block;
                }
                li {
                  padding: 10px 15px;
                  cursor: pointer;
                  text-align: left;
                  font-weight: 100;
                  font-size: 14px;
                  color: var(--mc);
                  i {
                    font-size: 14px;
                    margin-right: 5px;
                    position: relative;
                    top: -1px;
                    color: var(--mc);
                  }
                  &:hover {
                    background: #eee;
                  }
                }
              }
            }
            .record-content {
              display: inline-flex;
              border-radius: 7px;
              & > i {
                padding: 19px 10px 10px;
                background: #e9ebef;
                font-size: 20px;
                border-radius: 7px 0 0 7px;
                &.playRecord, &.pauseRecord {
                  padding: 19px 10px 5px;
                  border-radius: 0 7px 7px 0;
                  cursor: pointer;
                }
                &.pauseRecord {
                  display: none;
                }
              }
              audio {
                display: none;
              }
              span {
                padding: 5px 0 0;
                font-family: 'Tajawal', sans-serif;
                margin: 0;
                font-size: 16px;
                background: #F4F7FC;
                color: #212529;
                cursor: pointer;
                border-radius: 0;
                font-weight: bold;
                i {
                  font-size: 14px;
                }
                &:hover {
                  background: #e9ebef;
                }
              }
              .plyr--audio{
                 .plyr__controls {
                   background: transparent!important;
                   padding: 0!important;
                   color: inherit!important;
                 }
              }
              .plyr button{
                box-shadow: none;
              }
            }
          }
          &.me {
            text-align: right;
            direction: rtl;
            & > img {
              margin-right: 0;
              margin-left: 10px;
            }
            .content {
              & > i {
                display: inline;
                .options-menu {
                  right: calc(100% + 5px);
                }
              }
            }
            .record-content {
              & > i {
                color: #fff;
                background: #1e3750eb;
                border-radius: 0 7px 7px 0;
                &.playRecord, &.pauseRecord {
                  border-radius: 7px 0 0 7px;
                }
              }
              span {
                color: #fff;
                background: var(--msgs);
                border-radius: 0;
                &:hover {
                  background: #1e3750eb;
                }
              }
            }
          }
        }
        .file {
          display: flex;
          padding: 5px;
          text-align: left;

          & > img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            border: 2px solid #ccc;
            cursor: pointer;
            aspect-ratio: 16/9;
          }
          .content {
            width: 100%;
            span {
              display: block;
              margin: 5px 0;
              font-size: 11px;
              color: var(--mc);
              line-height: 20px;
            }
            & > i {
              display: none;
              font-size: 13px;
              color: rgb(135, 134, 134);
              cursor: pointer;
              position: relative;
              top: -10px;
              .options-menu {
                border-radius: 8px;
                overflow: hidden;
                direction: ltr;
                display: none;
                position: absolute;
                z-index: 9999999999999999;
                top: -15px;
                padding: 0;
                left: calc(100% + 5px);
                width: 130px;
                list-style: none;
                background: var(--white);
                box-shadow: 0 0 3px rgba($color: #000000, $alpha: 0.15);
                &.show {
                  display: inline-block;
                }
                li {
                  padding: 10px 15px;
                  cursor: pointer;
                  text-align: left;
                  font-weight: 100;
                  font-size: 14px;
                  color: var(--mc);
                  i {
                    font-size: 14px;
                    margin-right: 5px;
                    position: relative;
                    top: -1px;
                    color: var(--mc);
                  }
                  &:hover {
                    background: #eee;
                  }
                }
              }
            }
            .file-content {
              display: inline-flex;
              border-radius: 7px;
              overflow: hidden;
              .iconOfFile {
                padding: 4px 5px 0 5px;
                background: #e9ebef;
                font-size: 20px;
                .file-icon {
                  &::before {
                      border-color: #e9ebef #e9ebef rgba(255,255,255,.35) rgba(255,255,255,.35);
                  }
                }
              }
              & > span {
                direction: ltr;
                padding: 10px;
                font-family: 'Tajawal', sans-serif;
                margin: 0;
                font-size: 16px;
                background: #F4F7FC;
                color: #212529;
                cursor: pointer;
                border-radius: 0 7px 7px 0;
                font-weight: bold;
                i {
                  font-size: 14px;
                }
                &:hover {
                  background: #e9ebef;
                }
                @include sm {
                  padding: 12px 10px 8px;
                }
              }
            }
          }
          &.me {
            text-align: right;
            direction: rtl;
            & > img {
              margin-right: 0;
              margin-left: 10px;
            }
            .content {
              & > i {
                display: inline;
                .options-menu {
                  right: calc(100% + 5px);
                }
              }
            }
            .file-content {
              .iconOfFile {
                color: #fff;
                background: #1e3750eb;
                .file-icon {
                  &::before {
                      border-color: #30475e #30475e rgba(255, 255, 255, 0.35) rgba(255, 255, 255, 0.35);
                  }
                }
              }
              & > span {
                color: #fff;
                background: var(--msgs);
                border-radius: 7px 0 0 7px;
                &:hover {
                  background: #1e3750eb;
                }
              }
            }
          }
        }
        .replyTo {
          background: var(--bg);
          width: fit-content;
          padding: 5px 5px 15px;
          text-align: left;
          position: relative;
          z-index: -1;
          top: -2px;
          border-radius: 5px;
          span.user {
            padding: 0 5px;
            font-size: 13px;
            margin: 5px 0!important;
            font-weight: bold;
            color: var(--mc);
          }
          span.content {
            direction: rtl;
            unicode-bidi: plaintext;
            border-radius: 5px;
            padding: 7px 15px;
            border: none;
            width: 100%;
            margin: 0;
            font-size: 15px;
            background: var(--borders);
            color: var(--mc);
            font-family: 'Tajawal', sans-serif;
            max-width: 350px;
          }
        }
      }
      .chat-reply-footer {
        background: var(--bg);
        box-shadow: 0 0px 3px rgba($color: #000000, $alpha: 0.1);
        position: absolute;
        bottom: -140px;
        width: 100%;
        z-index: 2;
        padding: 0 15px 10px;
        text-align: left;
        &.show {
          bottom: 70px;
          @include xs {
            bottom: 75px;
          }
        }
        span {
          padding: 5px;
          font-weight: bold;
          font-size: 14px;
          color: var(--mc);
        }
        p {
          border-radius: 3px;
          padding: 4px 15px;
          border: none;
          width: 100%;
          margin: 0;
          text-align: left;
          background: var(--borders);
          color: var(--mc);
          font-family: 'Tajawal', sans-serif;
        }
        i {
          position: absolute;
          right: 15px;
          top: 7px;
          color: var(--mc);
          cursor: pointer;
          &:hover {
            color: #000;
          }
        }
      }
      .chat-footer {
        height: 70px;
        background: var(--bg);
        box-shadow: 0 0px 3px rgba($color: #000000, $alpha: 0.1);
        position: relative;
        z-index: 2;
        padding: 10px;
        text-align: center;
        @include xs {
          height: 75px;
          padding: 13px 5px 7px;
        }
        textarea {
          direction: rtl;
          text-align: left;
          border-radius: 3px;
          padding: 7px 15px;
          border: none;
          width: calc(75% - 20px);
          margin: 0 10px;
          height: 50px;
          color: var(--bg);
          background: var(--mc);
          &::placeholder {
            color: var(--bg);
          }
          @include xs {
            margin: 0;
            width: calc(75% - 20px);
          }
        }
        .right-buttons {
          width: 25%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 50px;
          i {
            color: var(--mc);
            padding: 10px 0;
            font-size: 22px;
            margin: 0 5px;
            cursor: pointer;
            &.recorderIcon {
              @include lg {
                display: none;
              }
            }
            @include sm {
              padding: 7px 0 7px 8px;
              margin: 5px 0 7px 0;
              font-size: 20px;
            }
            @include xs {
              font-size: 18px;
            }
            &.rotateIt {
              transition: all 0.2s ease-in-out;
              transform: rotate(45deg);
              color: red;
            }
            &.send {
              color: var(--white);
              background: var(--mc);
              padding: 8px 10px 8px 8px;
              border-radius: 50%;
              &:hover {
                color: var(--mc);
                background: var(--white);
              }
              @include xs {
                padding: 6px 8px 6px 6px;
                margin: 0;
                position: relative;
                top: -2px;
              }
            }
          }
          @include xs {
            width: 28%;
          }
        }
        .additional-buttons-menu {
          height: 0;
          &.show {
            height: 80px;
            @include lg {
              height: 122px;
            }
          }
          overflow: hidden;
          border-radius: 7px;
          background: #fff;
          position: absolute;
          box-shadow: 0 0px 3px rgba($color: #000000, $alpha: 0.1);
          bottom: 75px;
          right: calc(20% - 20px);
          @include md {
            right: calc(20% - 40px);
          }
          @include xs {
            bottom: 80px;
          }
          .btn-div {
            display: block;
            padding: 11px 15px;
            cursor: pointer;
            text-align: left;
            &.recorderBtn {
              display: none;
              @include lg {
                display: block;
              }
            }
            &:hover {
              background: var(--wit);
            }
            span {
              position: relative;
              top: -2px;
              font-size: 15px;
              color: #1E3750;
              padding-left: 6px;
            }
            i {
              font-size: 18px;
              width: 20px;
              padding-right: 5px;
              color: #1E3750
            }
          }
        }
      }
    }
  }
</style>

<script>
/* eslint-disable */
import VEmojiPicker from "v-emoji-picker";
import UploadingLoader from "../Modals/uploading.vue";

const Recorder = () => {
  return new Promise((resolve) => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream
        const mediaRecorder = new MediaRecorder(stream)
        const audioChunks = []

        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data)
        })

        const start = () => {
          mediaRecorder.start()
        }

        const stop = () => {
          return new Promise((resolve) => {
            mediaRecorder.addEventListener('stop', () => {
              const audioBlob = new Blob(audioChunks, {type: 'audio/mp3'})
              const audioUrl = URL.createObjectURL(audioBlob)

              resolve({ audioBlob, audioUrl })
            })

            mediaRecorder.stop()
          })
        }

        resolve({ start, stop })
      })
  })
}

export default {
  data () {
    return {
      msg: '',
      showen: 30,
      preventMore: false,
      display: 'none',
      timer: {
        milliseconds: "00",
        seconds: "00",
        minutes: "00"
      },
      isUploading: false,
      Toast: Swal.mixin({ toast: true, showConfirmButton: false, timer: 5000 })
    }
  },
  components: {
    VEmojiPicker,
    UploadingLoader
  },
  computed: {
    currentUser () {
      return this.$store.state.user || false
    },
    chat () {
      return this.$store.state.openedChat
    }
  },
  mounted () {
    this.scrollDown();
  },
  watch: {
    chat(){
      setTimeout(async () => {
        const chatBody = document.querySelector('.chat-body')
        if (chatBody) { chatBody.scrollTop = chatBody.scrollHeight }

        if (document.querySelector('.recording-modal').classList.contains('show')) {
          document.querySelector('.recording-modal').classList.remove('show');
          clearInterval(window.timer);
          window.recorder.stop();
          window.stream.getAudioTracks()[0].stop();
          this.timer.milliseconds = '00'
          this.timer.seconds = '00'
          this.timer.minutes = '00'
          document.querySelector(".controlBTN.start").style.display = "block";
          document.querySelector(".controlBTN.stop").style.display = "none";
          document.querySelector(".record-result").style.display = "none";
          document.querySelector(".record-result").querySelector('audio').src = ''
        }
      }, 10)
    }
  },
  methods: {
    scrollDown () {
      setTimeout(() => {
        const chatBody = document.querySelector('.chat-body')
        if (chatBody) { chatBody.scrollTop = chatBody.scrollHeight }
      }, 50)
    },
    openReplayMsg (msg, msgID, username, userId) {
      document.querySelector(".msgReply").previousElementSibling.textContent = username;
      document.querySelector(".msgReply").previousElementSibling.id = userId;
      document.querySelector(".msgReply").textContent = msg;
      document.querySelector(".msgReply").parentElement.classList.add("show");
      document.querySelector(".msgReply").id = msgID;
    },
    closeReplayMsg() {
      document.querySelector(".msgReply").previousElementSibling.textContent = "";
      document.querySelector(".msgReply").previousElementSibling.removeAttribute("id");
      document.querySelector(".msgReply").textContent = "";
      document.querySelector(".msgReply").parentElement.classList.remove("show");
      document.querySelector(".msgReply").removeAttribute("id");
    },
    playRecord (e) {
      e.target.style.display = "none";
      e.target.nextElementSibling.style.display = "inline";
      e.target.parentElement.querySelector("audio").play();

      if (window.recordPlayTime) clearInterval(window.recordPlayTime);

      window.recordPlayTime = setInterval(() => {
        var current = e.target.parentElement.querySelector("audio").currentTime;
        var duration = e.target.parentElement.querySelector("audio").duration;
        if (current >= duration) {
          e.target.style.display = "inline";
          e.target.nextElementSibling.style.display = "none";
          clearInterval(window.recordPlayTime);
        }
      }, 5);
    },
    pauseRecord (e) {
      e.target.style.display = "none";
      e.target.previousElementSibling.style.display = "inline";
      e.target.parentElement.querySelector("audio").pause();
      if (window.recordPlayTime) clearInterval(window.recordPlayTime);
    },
    isUnicode(str) {
      var letters = [];
      for (var i = 0; i <= str.length; i++) {
        letters[i] = str.substring((i - 1), i);
        if (letters[i].charCodeAt() > 255) { return true; }
      }
      return false;
    },
    checkUniCode (e){
      var input = e.target
      if (this.isUnicode(input.value)) {
        input.style.direction = 'rtl';
      } else if (input.value == '') {
        input.style.direction = 'ltr';
      } else {
        input.style.direction = 'ltr';
      }
    },
    checkUniCodeOrSend(e) {
      const input = e.target
      if (e.keyCode == 13 && !e.ctrlKey) return this.send();
      if (e.keyCode == 13 && e.ctrlKey) return input.value += "\n";
      this.checkUniCode(e);
    },
    closeAllModals () {
      this.display = 'none'
      document.querySelector('.buttons-menu-btn').classList.remove('rotateIt')
      document.querySelector('.additional-buttons-menu').classList.remove('show')
      // document.querySelector('.recording-modal').classList.remove('show')
    },
    async translateText(e, msg, langTo, isThereReplay) {
      var translateUrl = 'https://api.mymemory.translated.net/get'
      var lang = await this.$axios.$post("/detectLang", {msg});
      if(lang != langTo){
        var { responseStatus, responseData: {translatedText} } = await this.$axios.$get(`${translateUrl}?langpair=${lang}|${langTo}&q=${msg}`);
        
        if (responseStatus == 200) {
          var CHILDREN = 0;
          if (isThereReplay) CHILDREN = 1;
          e.target.closest('.fa-ellipsis-v').parentElement.children[CHILDREN].textContent = translatedText;
          e.target.closest('.fa-ellipsis-v').parentElement.children[CHILDREN].title = 'Original: ' + msg;
        }
      }
    },
    async hearMsg(e, message) {
      var msg = e.path[3].children[0].textContent
      var lang = this.currentUser.defaultLanguage
      var voice = 'UK English Male';
      var says = "says";
      switch (lang) {
          case 'ar':
              voice = "Arabic Male";
              says = "يقول"
              break;
          case 'zh':
              voice = "Chinese Male";
              says = "他說"
              break;
          case 'nl':
              voice = "Dutch Male";
              says = "zegt"
              break;
          case 'en':
              voice = "UK English Male";
              says = "says"
              break;
          case 'fr':
              voice = "French Male";
              says = "dit"
              break;
          case 'de':
              voice = "Deutsch Male";
              says = "zegt"
              break;
          case 'hi':
              voice = "Hindi Male";
              says = "कहता है"
              break;
          case 'it':
              voice = "Italian Male";
              says = "dice"
              break;
          case 'ja':
              voice = "Japanese Male";
              says = "彼は言い​​ます"
              break;
          case 'fa':
              voice = "Arabic Male";
              says = "يقول"
              break;
          case 'pt':
              voice = "Portugese Male";
              says = "diz"
              break;
          case 'ru':
              voice = "Russian Male";
              says = "говорит"
              break;
          case 'es':
              voice = "Spanish Male";
              says = "dice"
              break;
          case 'tr':
              voice = "Turkish Male";
              says = "diyor"
              break;
          default:
              voice = "UK English Male";
              says = "says"
              break;
      }
      var msg = `${message.user.username} ${says}: ${msg}`;
      responsiveVoice.speak(msg, voice);
    },
    selectEmoji(emoji) {
      this.msg += emoji.data
    },
    async scrolling (e) {
      const ele = e.target
      if (ele.scrollTop == 0 && !this.preventMore && this.chat.messages[0].msg !== 'Welcome To The New Chat Room') {
        this.showen+=30
        this.preventMore = true
        const {chat_room} = await this.$axios.$get(`/api/chats/chat/${this.currentUser._id}?roomId=${this.chat._id}&limit=${this.showen}`)
        if(!chat_room){
          return;
        }
        const usersList = {}
        chat_room.usersList.forEach((user) => {
          if (user._id === this.currentUser._id) {
            usersList.me = user
          } else {
            usersList.other = user
          }
        })
        chat_room.usersList = usersList
        this.$store.state.openedChat = chat_room
        this.preventMore = false
      }
    },
    async openProfile (userObj) {
      var {user} = await this.$axios.$get(`/api/users/user?userId=${userObj._id}`)
      this.$store.commit('openOpMenu', user)
    },
    closeChat () {
      if (this.$store.state.mobile) { this.$store.commit('closeChat') }
    },
    openEmoji () {
      if (document.querySelector('.additional-buttons-menu').classList.contains('show')) {
        this.openButtonMenu();
        this.display = 'block';
      } else {
        if (this.display == 'block') this.display = 'none'
        else this.display = 'block';
      }
    },
    hideEmoji(){
      this.display = 'none'
    },
    async send () {
      this.display = 'none'
      document.querySelector('.buttons-menu-btn').classList.remove('rotateIt')
      document.querySelector('.additional-buttons-menu').classList.remove('show')

      const { msg, chat, currentUser, $socket } = this;

      var message = {};

      if (msg.trim() == '') return;

      if (chat.usersList.other) {

        var i = currentUser.blockList.findIndex(user => user._id == chat.usersList.other._id);

        if (i > -1) return Swal.fire({
          toast: true,
          icon: 'error',
          title: 'You blocked this contact, go to settings to unblock'
        });

        message = {
          msg,
          chatId: chat._id,
          userId: currentUser._id,
          userToId: chat.usersList.other._id,
          notSeen: [chat.usersList.other._id]
        }

      } else {
        message = {
          msg,
          chatId: chat._id,
          userId: currentUser._id,
          notSeen: []
        }

        Object.values(chat.usersList).forEach(contact => contact._id != currentUser._id && message.notSeen.push(contact._id));
      }

      const replyTo = document.querySelector(".msgReply").id;
      if (replyTo) {
        message.replyTo = {
          messageId: document.querySelector(".msgReply").id,
          messageContent: document.querySelector(".msgReply").textContent,
          userId: document.querySelector(".msgReply").previousElementSibling.id
        };
      }
        
      $socket.emit('msg', message);

      this.closeReplayMsg()

      this.msg = '';

      document.querySelector('.msgArea').focus();
    },
    deleteMsg(msgId) {
      const { chat: {_id: chatId}, currentUser: {_id: userId}, $socket } = this;

      $socket.emit("deleteMessage", {msgId, chatId, userId});
    },
    goToLocation(location){
      var {lat, long} = location
      window.open(`https://www.google.com/maps/?q=${lat},${long}`, '_blank')
    },
    async sendLocation () {
      this.display = 'none'
      document.querySelector('.buttons-menu-btn').classList.remove('rotateIt')
      document.querySelector('.additional-buttons-menu').classList.remove('show')

      const { chat, currentUser, $socket, $store } = this;

      var i = -1;
      if (chat.usersList.other) {
        i = currentUser.blockList.findIndex(user => user._id == chat.usersList.other._id);
      }

      if (i != -1) return Swal.fire({
        toast: true,
        icon: 'error',
        title: 'You blocked this contact, go to settings to unblock'
      });

      navigator.geolocation.getCurrentPosition(({coords}) => {

        const message = {
          msg: '',
          location: {
            lat: coords.latitude,
            long: coords.longitude,
          },
          chatId: chat._id,
          userId: currentUser._id,
          userToId: false,
          notSeen: []
        }

        if (chat.usersList.other) {
          message.userToId = chat.usersList.other._id;
          message.notSeen.push(chat.usersList.other._id);
        } else {
          Object.values(chat.usersList).forEach(contact => contact._id != currentUser._id && message.notSeen.push(contact._id));
        }

        $socket.emit('msg', message);
      })
    },
    openUploading(){
      var input = document.querySelector('.uploadFileInput').click()
      document.querySelector('.buttons-menu-btn').classList.remove('rotateIt')
      document.querySelector('.additional-buttons-menu').classList.remove('show')
    },
    async uploadFile(input){

      const { $axios, $socket, $store, currentUser, chat } = this;

      var i = -1;
      if (chat.usersList.other) {
        i = currentUser.blockList.findIndex(user => {
          return user._id == chat.usersList.other._id
        })
      }


      if (i != -1){
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'You blocked this contact, go to settings to unblock'
        })
      } else {
        this.isUploading = true;
        var file = input.srcElement.files[0] || false
        if(file){
          var formdata = new FormData()
          formdata.append('file', file)
          var {uploadedFile, err} = await $axios.$post('/api/uploadFileToChat', formdata)
          if (uploadedFile) {

            var message = {
              msg: '',
              userId: currentUser._id,
              chatId: chat._id,
              file: uploadedFile,
              userToId: false,
              notSeen: []
            }

            if (chat.usersList.other) {
              message.userToId = chat.usersList.other._id;
              message.notSeen.push(chat.usersList.other._id);
            } else {
              Object.values(chat.usersList).forEach(contact => contact._id != currentUser._id && message.notSeen.push(contact._id));
            }

            $socket.emit('msg', message);

          } else {
            Swal.fire({
              toast: true,
              icon: 'error',
              title: err
            })
          }
        }
        this.isUploading = false;
      }
    },
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
        this.download(file.filename, file)
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
    },
    openButtonMenu () {
      document.querySelector('.buttons-menu-btn').classList.toggle('rotateIt');
      document.querySelector('.additional-buttons-menu').classList.toggle('show');
      this.hideEmoji();
    },
    hideButtonMenu () {
      document.querySelector('.buttons-menu-btn').classList.remove('rotateIt');
      document.querySelector('.additional-buttons-menu').classList.remove('show');
      this.hideEmoji();
    },
    async openRecorder (e) {
      document.querySelector('.recording-modal').classList.toggle('show');
      
      if (window.recorder) {
        await window.recorder.stop();
        window.stream?.getAudioTracks()[0].stop();
        window.recorder = null;
        
        var resultElement = document.querySelector('.record-result');
        resultElement.style.display = 'none';
        document.querySelector(".controlBTN.stop").style.display = 'none';
        document.querySelector(".controlBTN.start").style.display = 'block';

        clearInterval(window.timer);
        this.timer.milliseconds = '00';
        this.timer.seconds = '00';
        this.timer.minutes = '00';
      }

      if (e.target.className !== 'fal fa-microphone-alt recorderIcon') {
        this.hideButtonMenu()
      }
    },
    async closeRecorder() {
      if (window.recorder) {
        await window.recorder.stop();
        window.stream?.getAudioTracks()[0].stop();
        window.recorder = null;
      }
      
      var resultElement = document.querySelector('.record-result');
      resultElement.style.display = 'none';
      document.querySelector(".controlBTN.stop").style.display = 'none';
      document.querySelector(".controlBTN.start").style.display = 'block';

      clearInterval(window.timer);
      this.timer.milliseconds = '00';
      this.timer.seconds = '00';
      this.timer.minutes = '00';
      
      document.querySelector('.recording-modal').classList.remove('show');
    },
    startRecordingAudio () {
      return new Promise(async resolve => {
        window.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        window.mediaRecorder = new MediaRecorder(stream);
        window.mediaRecorder.start();
        resolve();
      })
    },
    async startRecording(){
      var eleSrc = document.querySelector('.record-result audio').src
      var splitted = eleSrc.split('/')
      var isThereSrc = splitted[splitted.length - 1]
      if (isThereSrc != '') {
        var allsrc = document.querySelector('.record-result audio').src.split('/')
        var src = allsrc[allsrc.length - 1]
        await this.$axios.$delete(`/api/deleteFile?src=${src}`)
      }
      document.querySelector(".controlBTN.start").style.display = 'none'
      document.querySelector(".controlBTN.stop").style.display = 'block'
      var resultElement = document.querySelector('.record-result')
      resultElement.style.display = 'none'
      resultElement.querySelector('audio').src = ''
      
      // START RECORDING
      window.recorder = await Recorder();
      recorder.start();

      var milli = 0;
      window.timer = setInterval(() => {
        milli += 100
        var {_data} = moment.duration(milli)
        this.timer.milliseconds = _data.milliseconds / 10
        this.timer.seconds = _data.seconds < 10 ? '0'+_data.seconds : _data.seconds
        this.timer.minutes = _data.minutes < 10 ? '0'+_data.minutes : _data.minutes
      }, 100)
    },
    async stopRecording(e){
      var BUTTON = e.target;
      if (e.target.tagName == "I") {
        BUTTON = e.target.parentElement;
      }
      document.querySelector(".controlBTN.stop").style.display = 'none';
      document.querySelector('.record-result').style.display = 'block';

      clearInterval(window.timer);
      this.timer.milliseconds = '00';
      this.timer.seconds = '00';
      this.timer.minutes = '00';

      const {audioUrl} = await recorder.stop();
      
      setTimeout(() => {
        window.stream.getAudioTracks()[0].stop();
        window.recorder = null;
      }, 1000);

      document.querySelector('.record-result audio').src = audioUrl;
      Object.values(document.querySelectorAll('.record-result button')).forEach(btn => {
        btn.disabled = false
      })
    },
    async deleteRecord () {
      var resultElement = document.querySelector('.record-result');
      resultElement.style.display = 'none';
      document.querySelector(".controlBTN.start").style.display = 'block';
      resultElement.querySelector('audio').src = '';
      if (window.recorder) { window.recorder = null; };
    },
    async sendRecord () {
      /* Send Record Msg */
      const { $axios, $socket, currentUser, chat } = this;

      if (chat.usersList.other) {

        var isInBlockList = currentUser.blockList.find(user => {
          return user._id == chat.usersList.other._id
        });

        if (isInBlockList) return Swal.fire({
          toast: true,
          icon: 'error',
          title: 'You blocked this contact, go to settings to unblock'
        });

      }

      /* Close & Reset Modal */
      document.querySelector('.recording-modal').classList.toggle('show');
      document.querySelector('.record-result').style.display = 'none';
      document.querySelector(".controlBTN.start").style.display = 'block'
      
      // START UPLOADING
      this.isUploading = true;

      var formdata = new FormData();
      let blob = await fetch(document.querySelector('.record-result audio').src).then(r => r.blob());
      formdata.append('file', blob)

      var {uploadedFile, err} = await $axios.$post('/api/uploadFileToChat', formdata);

      var message = { 
        record: uploadedFile, 
        msg: '', 
        userId: currentUser._id, 
        chatId: chat._id,
        userToId: false,
        notSeen: []
      };

      if (chat.usersList.other) {
        message.userToId = chat.usersList.other._id
        message.notSeen.push(chat.usersList.other._id);
      } else {
        Object.values(chat.usersList).forEach(contact => contact._id != currentUser._id && message.notSeen.push(contact._id));
      }

      $socket.emit('msg', message);

      if (window.recorder) { window.recorder = null; }

      // CLEAR AUDIO RECORDER
      document.querySelector('.record-result audio').src = '';

      this.isUploading = false;
    },
    async call(){
      const { $store, $socket } = this;

      var idx = -1;
      if (this.chat.usersList.other) idx = this.currentUser.blockList.findIndex(user => user._id == chat.usersList.other._id);
      
      if (idx > -1) return this.Toast.fire({ icon: 'error', title: 'You blocked this contact, go to settings to unblock' });

      // Block Call if user is not active
      if (this.chat.usersList.other && !this.chat.usersList.other.activeNow) {
        return this.Toast.fire({ icon: 'error', title: 'Contact is not available' })
      }

      const receiverID = this.chat.usersList.other ? this.chat.usersList.other._id : this.chat._id;
      const contactType = this.chat.usersList.other ? "user" : "group"

      if (contactType == "group") {
        return $socket.emit("isOnGoingCall", { groupID: receiverID });
      };

      const call_info = {
        callerUserID: this.currentUser._id,
        contactType,
        receiverID
      }

      $socket.emit("startACall", call_info);

      $store.commit('startCall', {
        caller: true,
        statue: "ringing",
        contact: this.chat.usersList.other,
        contactType,
        callerUserID: this.currentUser._id
      });
      

      window.callTimeout = setTimeout(() => {
      
        this.Toast.fire({ icon: 'error', title: 'No Response' })

        $socket.emit('cancelCall', { otherUserID: receiverID });

        $store.commit('stopCall');

      }, 40 * 1000);

    },
    openGroupSettings(){
      Object.values(this.chat.usersList).forEach(user => {
        if (user._id == this.currentUser._id) this.$store.commit('openEditGroupModal')
      })
    }
  },
  sockets: {
    recieveMyMsg (msg) {
      if (msg.chatId == this.chat._id) this.scrollDown();
    },
    recieveFriendMsg (msg) {
      if (msg.chatId == this.chat._id) this.scrollDown();
    },
    isOnGoingCall ({ isOnGoingCall, callerUserID }) {
      const { $store, $socket } = this;

      if (!isOnGoingCall && !this.$store.state.inCall) {

        const receiverID = this.chat._id;
        const contactType = "group"

        const call_info = { callerUserID: this.currentUser._id, contactType, receiverID }
        
        $socket.emit("startACall", call_info);

        $store.commit('startCall', {
          caller: true,
          statue: "ringing",
          contact: this.chat,
          contactType,
          callerUserID: this.currentUser._id
        });
        

        window.callTimeout = setTimeout(() => {
        
          this.Toast.fire({ icon: 'error', title: 'No Response' })

          $socket.emit('cancelGroupCall', { groupID: receiverID });

          $store.commit('stopCall');

        }, 40 * 1000);

      } else if (isOnGoingCall && !this.$store.state.inCall) {

        const contact = this.chat;

        $store.commit('startCall', { caller: false, statue: "onGoingCall", contact, contactType: "group", callerUserID });

        $socket.emit("askToJoinGroupCall", { groupID: this.chat._id, askerUserID: this.currentUser._id });
        
      }
    }
  },
  filters: {
    format(v) {
      return moment(v).fromNow()
    },
    formatCallDuration(v) {
      var duration = v;

      if (isNaN(duration)) duration = Number(duration);

      const {_data} = moment.duration(duration, "seconds");
      
      var DURATION = "";

      DURATION = `00:${_data.seconds < 10 ? "0"+_data.seconds : _data.seconds}`;

      if (_data.minutes) {
        DURATION = `${_data.minutes < 10 ? "0"+_data.minutes : _data.minutes}:${_data.seconds < 10 ? "0"+_data.seconds : _data.seconds}`;
      }

      if (_data.hours) {
        DURATION = `${_data.hours < 10 ? "0"+_data.hours : _data.hours}:${_data.minutes < 10 ? "0"+_data.minutes : _data.minutes}:${_data.seconds < 10 ? "0"+_data.seconds : _data.seconds}`;
      }

      return DURATION;
    },
    formatTitle(v) {
      const date = new Date(v).toString();
      return moment(date).format("YYYY-MM-DD | hh:mm a")
    },
    formatCoords (v) {
      var coord = Number(v)
      return coord.toFixed(2)
    },
    cutOff(v) {
      var sp = v.split("/");
      var 
      name = sp[sp.length - 1]
      var lastName = name.split("_")
      var NameArr = []
      lastName.forEach((part, idx) => {if (idx == lastName.length - 1) return; NameArr.push(part)})
      var filename = NameArr.join("_")

      if (filename.slice(0, 15).length < filename.length) {
        var splited = filename.split('.');
        var ext = splited[splited.length - 1];
        return filename.slice(0, 15) + '.' + ext
      }
      else return filename.slice(0, 15)
    },
    formatMimetype (v) {
      var sp = v.split("/");
      var name = sp[sp.length - 1]
      var lastName = name.split("_")
      var NameArr = []
      lastName.forEach((part, idx) => {if (idx == lastName.length - 1) return; NameArr.push(part)})
      var filename = NameArr.join("_")
      var splited = filename.split('.');
      var ext = splited[splited.length - 1];
      return ext
    }
  }
}
</script>
