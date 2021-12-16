<template>
  <div class="voice_call">
    <div class="call-body">
      <div v-if="call_info.statue === 'ringing'" class="call-head">
        <h5 v-if="call_info.caller">
          Calling...
        </h5>
        <h5 v-else>
          Call From
        </h5>
      </div>
      <div v-else class="call-head">
        <h5>
          OnGoing Call
        </h5>
      </div>
      <img :src="call_info.contactType == 'user' ? call_info.contact.photo : call_info.contact.groupPhoto" alt="user_image">
      <h3> {{ call_info.contactType == 'user' ? call_info.contact.username : call_info.contact.groupName }} </h3>
      <div v-if="call_info.statue === 'onGoingCall'" class="call-timer">
        <p>
          {{ timer.minutes }} : {{ timer.seconds }}
        </p>
      </div>
      <div v-if="call_info.contactType === 'group'" class="users">
        <p v-for="user in call_info.joinedUsers" :key="user._id" class="user">
          <img :src="user.photo" alt="user photo">
          <span> {{ user.username }} </span>
        </p>
      </div>
    </div>
    <footer>
      <i v-if="call_info.caller || call_info.statue === 'onGoingCall'" v-tooltip="'Mute your voice'" class="far fa-microphone-alt-slash" @click="muteOrUnmuteVoice" />
      <i v-else v-tooltip="'Accept call'" class="fas fa-phone-alt" @click="acceptCall" />
      <i v-if="call_info.statue === 'onGoingCall'" v-tooltip="'Call quality'" :class="`far ${call_quality_class} call_quality quality_${call_quality}`" />
      <i v-if="call_info.statue === 'onGoingCall'" v-tooltip="'End call'" class="fas fa-phone-slash" @click="closeCall" />
      <i v-else v-tooltip="'Cancel call'" class="fad fa-phone-slash" @click="cancelCall" />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.voice_call {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999999;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--mc);
  font-size: 45px;
  background: rgba(255,255,255,0.9);
  .call-body {
    box-shadow: 0 0 7px rgba(0,0,0,0.1);
    padding: 45px;
    border-radius: 8px;
    width: 50%;
    height: 60vh;
    background: #fff;
    @include xl {
      width: 70%;
    }
    @include sm {
      width: 95%;
      padding: 10px 15px;
    }
    h5 {
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 25px;
      @include sm {
        margin-bottom: 20px;
      }
    }
    img {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      @include sm {
        width: 100px;
        height: 100px;
      }
    }
    h3 {
      font-weight: bold;
      @include sm {
        margin-bottom: 0px;
      }
    }
    p {
      @include sm {
        margin-top: 5px;
      }
    }
    .users {
      display: flex;
      flex-wrap: wrap;
      border-top: 1px solid #ccc;
      margin: 15px 0;
      padding: 5px 0;
      max-height: 250px;
      overflow-y: scroll;
      @include sm {
        max-height: 140px;
      }
      .user {
        width: 25%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        @include sm {
          width: 33.334%;
        }
        img {
          width: 55px;
          height: 55px;
          @include sm {
            width: 45px;
            height: 45px;
          }
        }
        span {
          font-size: 13px;
          font-weight: bold;
          @include sm {
            font-size: 12px;
          }
        }
      }
    }
  }
  footer {
    margin-top: 10px;
    box-shadow: 0 0 7px rgba(0,0,0,0.1);
    padding: 10px 50px;
    border-radius: 8px;
    width: 50%;
    display: flex;
    justify-content: space-between;
    background: #fff;
    @include xl {
      width: 70%;
    }
    @include sm {
      padding: 10px;
      width: 95%;
    }
    i {
      border-radius: 50%;
      width: 60px;
      height: 60px;
      line-height: 60px;
      font-size: 26px;
      cursor: pointer;
      @include sm {
        width: 40px;
        height: 40px;
        line-height: 40px;
        font-size: 18px;
      }
      &:last-of-type {
        background: red;
        color: #fff;
        &:hover {
          background: darkred;
        }
      }
      &.call_quality {
        font-size: 38px;
        cursor: auto;
        @include sm {
          font-size: 28px;
        }
        &.quality_1 {
          color: #00660a;
        }
        &.quality_2 {
          color: #014408;
        }
        &.quality_3 {
          color: #8a8700;
        }
        &.quality_4 {
          color: #310000;
        }
        &.quality_5 {
          color: #8a0000;
        }
        &.quality_6 {
          color: #8a0000;
        }
      }
      &.fa-microphone-alt-slash {
        font-size: 30px;
        color: var(--mc);
        &:hover {
          color: #000;
        }
        @include sm {
          font-size: 26px;
        }
      }
      &.fa-microphone-alt {
        font-size: 30px;
        color: #00660a;
        @include sm {
          font-size: 26px;
        }
        &:hover {
          color: #013807;
        }
      }
      &.fa-phone-alt {
        background: green;
        color: #fff;
        &:hover {
          color: #fff;
          background: darkgreen;
        }
      }
    }
  }
}
</style>

<script>
/* eslint-disable */
import moment from "moment";

export default {
  data () {
    return {
      timer: {
        seconds: "00",
        minutes: "00"
      }, 
      RemoteStream: null,
      call_quality: 1,
      call_quality_class: "fa-signal",
      Toast: Swal.mixin({
              toast: true,
              showConfirmButton: false,
              timer: 5000
            })
    }
  },
  computed: {
    call_info(){
      return this.$store.state.call_info 
    },
    currentUser () {
      return this.$store.state.user || false
    }
  },
  methods: {
    findAndConvertChatMembers(chatID){
      var chat = {};

      if (this.call_info.contactType == 'group') {
        chat = this.$store.state.chats.find(chat => {
          if (chat.usersList.length) {
              const usersList = {}

              chat.usersList.forEach((user, i) => {
                if (user._id === this.currentUser._id) usersList.me = user;
                else usersList[`userNum${i}`] = user;
              })

              chat.usersList = usersList
          }
          return chat._id == chatID;
        });

        if (chat.usersList.length) {
            const usersList = {}

            chat.usersList.forEach((user, i) => {
              if (user._id === this.currentUser._id) usersList.me = user;
              else usersList[`userNum${i}`] = user;
            })

            chat.usersList = usersList
        }

      } else {
        chat = this.$store.state.chats.find(chat => {
          if (chat.usersList.length) {
            const usersList = {}

            chat.usersList.forEach((user) => {
              if (user._id === this.currentUser._id) usersList.me = user;
              else usersList.other = user;
            })

            chat.usersList = usersList
          }
          return chat.usersList.other._id == chatID && chat.roomType == "Chats";
        });

        if (chat.usersList.length) {
            const usersList = {}

            chat.usersList.forEach((user) => {
              if (user._id === this.currentUser._id) usersList.me = user;
              else usersList.other = user;
            })

            chat.usersList = usersList
        }
      }

      return chat;
    },
    async acceptCall() {
      const { $store, $socket } = this;

      const Ringtone = document.querySelector(".ringtone_element")
      
      Ringtone.pause();

      //  GROUP CALLS ONLY
      if (this.call_info.contactType == 'group') return $socket.emit("isOnGoingCall", { groupID: this.call_info.contact._id });

      const channel = `voiceCall-${this.call_info.contact._id}`;

      // SINGLE USER CALLS ONLY
      var call_info = { callerUserID: this.call_info.contact._id, channel }

      $socket.emit("acceptCall", call_info);

      // START THE CALL WITH AGORA
      this.handleCallStart(channel);

      $store.commit('acceptCall');

      setTimeout(() => {
        var milli = 0;
        window.callTimer = setInterval(() => {
          milli += 1000
          var {_data} = moment.duration(milli)
          this.timer.seconds = _data.seconds < 10 ? '0'+_data.seconds : _data.seconds
          this.timer.minutes = _data.minutes < 10 ? '0'+_data.minutes : _data.minutes
        }, 1000);
      }, 1500);

    },
    cancelCall() {
      const Ringtone = document.querySelector(".ringtone_element")
      Ringtone.pause();

      if (window.callTimeout) clearTimeout(window.callTimeout);

      if (this.call_info.caller) {
        var chat = this.findAndConvertChatMembers(this.call_info.contact._id);

        const message = {
          msg: '',
          voiceCall: {
            missed: true,
            duration: 0
          },
          chatId: chat._id,
          userId: this.currentUser._id,
          userToId: false,
          notSeen: []
        }
        

        if (chat.usersList.other) {
          message.userToId = chat.usersList.other._id;
          message.notSeen.push(chat.usersList.other._id);
        } else {
          Object.values(chat.usersList).forEach(contact => contact._id !=  this.currentUser._id && message.notSeen.push(contact._id));
        }

        this.$socket.emit('msg', message);
      }

      if (this.call_info.contactType == 'group') {
        if (!this.call_info.caller) return this.$store.commit('stopCall');
        return this.$socket.emit('cancelGroupCall', { groupID: this.call_info.contact._id });
      }

      this.$socket.emit('cancelCall', { otherUserID: this.call_info.contact._id });
      this.$store.commit('stopCall');
    },
    async closeCall () {
      const call_info = { otherUserID: this.call_info.contact._id };
      
      if (this.call_info.caller) {
        const chat = this.findAndConvertChatMembers(this.call_info.contact._id);
        const stats = window.client.getRTCStats();

        const message = {
          msg: '',
          voiceCall: {
            missed: false,
            duration: stats.Duration
          },
          chatId: chat._id,
          userId: this.currentUser._id,
          userToId: false,
          notSeen: []
        }
        

        if (chat.usersList.other) {
          message.userToId = chat.usersList.other._id;
          message.notSeen.push(chat.usersList.other._id);
        } else {
          Object.values(chat.usersList).forEach(contact => contact._id !=  this.currentUser._id && message.notSeen.push(contact._id));
        }

        this.$socket.emit('msg', message);
      }
      
      clearInterval(window.callTimer);
      this.timer.milliseconds = '00'
      this.timer.seconds = '00'
      this.timer.minutes = '00'

      if (this.call_info.contactType == 'group') {

        if (this.call_info.joinedUsers.length <= 2) {

          var lastUser = this.call_info.joinedUsers.find(user => user._id !== this.$store.state.user._id);

          if (lastUser) {
            var lastUserID = lastUser._id;

            this.$socket.emit("closeGroupCall", { groupID: this.call_info.contact._id, lastUserID });
          }

        } 
        
        else this.$socket.emit("removeAUserFromGroupCall", { groupID: this.call_info.contact._id, removedUserID: this.$store.state.user._id });

      }
  
      else this.$socket.emit("closeCall", call_info);

      this.$store.commit('stopCall');

    },
    muteOrUnmuteVoice (e) {
      if (e.target.classList.contains("fa-microphone-alt-slash")) {
        if (!window.localAudioTrack) return;
        window.localAudioTrack.setVolume(0);
        e.target.classList.remove("fa-microphone-alt-slash")
        e.target.classList.add("fa-microphone-alt")
        e.target.title = "Unmute Your Voice"
      } else {
        if (!window.localAudioTrack) return;
        window.localAudioTrack.setVolume(100);
        e.target.classList.remove("fa-microphone-alt")
        e.target.classList.add("fa-microphone-alt-slash")
        e.target.title = "Mute Your Voice"
      }
    },
    async handleCallStart(channel){
      var options = { appId: process.env.AgoraAppID, channel };

      window.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

      await client.join(options.appId, options.channel, null, null);
      
      // Create an audio track from the audio sampled by a microphone.
      window.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      client.on("user-published", async (user, mediaType) => {
        // Subscribe to a remote user.
        await client.subscribe(user, mediaType);
        
        // If the subscribed track is audio.
        if (mediaType === "audio") {
          // Get `RemoteAudioTrack` in the `user` object.
          const remoteAudioTrack = user.audioTrack;
          // Play the audio track. No need to pass any DOM element.
          remoteAudioTrack.play();
        }
      });

      // Publish the local audio track to the channel.
      await client.publish([localAudioTrack]);

      // Keep Tracing The Network Quality
      client.on("network-quality", (stats) => {
          this.call_quality = stats.downlinkNetworkQuality;
          switch (stats.downlinkNetworkQuality) {
            case 1: {
              this.call_quality_class = "fa-signal"
              break;
            }
            case 2: {
              this.call_quality_class = "fa-signal-4"
              break;
            }
            case 3: {
              this.call_quality_class = "fa-signal-3"
              break;
            }
            case 4: {
              this.call_quality_class = "fa-signal-2"
              break;
            }
            case 5: {
              this.call_quality_class = "fa-signal-1"
              break;
            }
            case 6: {
              this.call_quality_class = "fa-signal-1"
              break;
            }
            default: {
              this.call_quality_class = "fa-signal"
              break;
            }
          }
      });
    }
  },
  sockets: {
    async callAccepted ({channel}) {
      if (window.callTimeout) clearTimeout(window.callTimeout);

      this.$store.commit('acceptCall');

      // START THE CALL WITH AGORA
      this.handleCallStart(channel);

      setTimeout(() => {
        var milli = 0;
        window.callTimer = setInterval(() => {
          milli += 1000
          var {_data} = moment.duration(milli)
          this.timer.seconds = _data.seconds < 10 ? '0'+_data.seconds : _data.seconds
          this.timer.minutes = _data.minutes < 10 ? '0'+_data.minutes : _data.minutes
        }, 1000);
      }, 1500);
    },
    async callClosed () {
      this.Toast.fire({ icon: 'error', title: 'Call Ended' });

      if (this.call_info.caller) {
        const chat = this.findAndConvertChatMembers(this.call_info.contact._id);
        const stats = window.client.getRTCStats();

        const message = {
          msg: '',
          voiceCall: {
            missed: false,
            duration: stats.Duration
          },
          chatId: chat._id,
          userId: this.currentUser._id,
          userToId: false,
          notSeen: []
        }
        

        if (chat.usersList.other) {
          message.userToId = chat.usersList.other._id;
          message.notSeen.push(chat.usersList.other._id);
        } else {
          Object.values(chat.usersList).forEach(contact => contact._id !=  this.currentUser._id && message.notSeen.push(contact._id));
        }

        this.$socket.emit('msg', message);
      }

      this.$store.commit('stopCall');

      clearInterval(window.callTimer);
      this.timer.milliseconds = '00'
      this.timer.seconds = '00'
      this.timer.minutes = '00'
    },
    async groupCallClosed ({ groupID }) {
      
      if (groupID != this.call_info.contact._id) return;
      
      this.Toast.fire({ icon: 'error', title: 'Call Ended' });

      const chat = this.findAndConvertChatMembers(this.call_info.contact._id);
      const stats = window.client.getRTCStats();

      const message = {
        msg: '',
        voiceCall: {
          missed: false,
          duration: stats.Duration
        },
        chatId: chat._id,
        userId: this.call_info.callerUserID,
        userToId: false,
        notSeen: []
      }

      if (chat.usersList.other) {
        message.userToId = chat.usersList.other._id;
        message.notSeen.push(chat.usersList.other._id);
      } else {
        Object.values(chat.usersList).forEach(contact => contact._id != this.currentUser._id && message.notSeen.push(contact._id));
      }

      this.$socket.emit('msg', message);

      this.$store.commit('stopCall');
      
      clearInterval(window.callTimer);
      this.timer.milliseconds = '00'
      this.timer.seconds = '00'
      this.timer.minutes = '00'
    },
    callCancelled ({ groupID }) {

      if (groupID && groupID != this.call_info.contact._id) return;

      if (window.callTimeout) clearTimeout(window.callTimeout);

      const Ringtone = document.querySelector(".ringtone_element")
      Ringtone.pause();

      if (this.call_info.caller) {
        var chat = this.findAndConvertChatMembers(this.call_info.contact._id);

        const message = {
          msg: '',
          voiceCall: {
            missed: true,
            duration: 0
          },
          chatId: chat._id,
          userId: this.currentUser._id,
          userToId: false,
          notSeen: []
        }
        

        if (chat.usersList.other) {
          message.userToId = chat.usersList.other._id;
          message.notSeen.push(chat.usersList.other._id);
        } else {
          Object.values(chat.usersList).forEach(contact => contact._id !=  this.currentUser._id && message.notSeen.push(contact._id));
        }

        this.$socket.emit('msg', message);
      }

      this.Toast.fire({ icon: 'error', title: 'Call Cancelled' });

      this.$store.commit('stopCall');
      
      clearInterval(window.callTimer);
      this.timer.milliseconds = '00'
      this.timer.seconds = '00'
      this.timer.minutes = '00'
    },
    contactBusy () {
      if (window.callTimeout) clearTimeout(window.callTimeout);

      this.Toast.fire({ icon: 'error', title: 'This Contact is in another call' });

      this.$store.commit('stopCall');
    },
    isOnGoingCall ({ isOnGoingCall }) {
      if (this.$store.state.inCall) {
        var groupID = this.call_info.contact._id;
        var myID = this.$store.state.user._id;
        var callerUserID = this.call_info.callerUserID;

        if (isOnGoingCall) {
          return this.$socket.emit("askToJoinGroupCall", { groupID, askerUserID: myID });
        }

        this.$socket.emit("startAGroupCall", { groupID, accepterUserID: myID, callerUserID });
      }
    },
    startAGroupCall ({ group_call_info }) {
      if (window.callTimeout) clearTimeout(window.callTimeout);

      const { groupID, channel, joinedUsersIDs } = group_call_info;

      // Transform Users IDs to Users Objects
      var joinedUsers = joinedUsersIDs.map(userID => {
        var chat = this.$store.state.chats.find(chat => chat._id == groupID);
        if (!chat) return {};
        return Object.values(chat.usersList).find(user => user._id == userID)
      });

      // START THE CALL WITH AGORA
      this.handleCallStart(channel);

      // Set Call Info To Vuex
      this.$store.commit('acceptGroupCall', joinedUsers);

      setTimeout(() => {
        var milli = 0;
        window.callTimer = setInterval(() => {
          milli += 1000
          var {_data} = moment.duration(milli)
          this.timer.seconds = _data.seconds < 10 ? '0'+_data.seconds : _data.seconds
          this.timer.minutes = _data.minutes < 10 ? '0'+_data.minutes : _data.minutes
        }, 1000);
      }, 1500);
    },
    addAUserToGroupCall ({askerUserID}) {
      this.$store.commit('addAUserToGroupCall', askerUserID);
    },
    async removeAUserFromGroupCall ({removedUserID}) {
      if (this.call_info.joinedUsers.length <= 2) {

        this.Toast.fire({ icon: 'error', title: 'Call Ended' });

        this.$store.commit('stopCall');
        
        clearInterval(window.callTimer);
        this.timer.milliseconds = '00';
        this.timer.seconds = '00';
        this.timer.minutes = '00';

        return;
      }
      this.$store.commit('removeAUserFromGroupCall', removedUserID);
    }
  }
}
</script>
