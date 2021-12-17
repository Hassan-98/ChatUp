<template>
  <div class="open-setting">
    <ProfilePictureEditor v-if="openPictureEditor" :go-back="goBack" />
    <h4>Account Settings</h4>
    <div class="Inputs">
      <div class="input-group">
        <label>Native Language <i v-tooltip="'Native Language is used for messages translations and hearing'" class="fal fa-info-circle" style="position: relative;top:2pxleft:2px" /></label>
        <span class="input">
          <i class="fas fa-language" />
          <select v-model="defaultLanguage">
            <option v-for="lang in langs" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
          </select>
        </span>
      </div>
      <div class="input-group">
        <label>Full Name</label>
        <span class="input">
          <i class="fas fa-user-alt" />
          <input v-model="username" type="text" placeholder="Full Name" :disabled="isGoogleUser">
        </span>
      </div>
      <div class="input-group">
        <label>Address</label>
        <span class="input">
          <i class="fas fa-address-card" />
          <input v-model="address" type="address" placeholder="City">
        </span>
      </div>
      <div class="input-group">
        <label>Phone</label>
        <span class="input">
          <i class="fas fa-phone-square" />
          <input v-model="phone" type="tel" placeholder="Phone">
        </span>
      </div>
      <div class="input-group">
        <label>Website</label>
        <span class="input">
          <i class="fas fa-globe" />
          <input v-model="website" type="url" placeholder="Website">
        </span>
      </div>
      <div class="input-group">
        <label>Email Address</label>
        <span class="input">
          <i class="fas fa-at" />
          <input v-model="email" type="email" disabled>
        </span>
      </div>
      <div class="input-group">
        <label>Social Media</label>
        <span class="input">
          <i class="fab fa-facebook-square" />
          <input v-model="facebook" type="url" placeholder="Facebook Profile">
        </span>
        <span class="input">
          <i class="fab fa-twitter-square" />
          <input v-model="twitter" type="url" placeholder="Twitter Profile">
        </span>
        <span class="input">
          <i class="fab fa-linkedin" />
          <input v-model="linkedin" type="url" placeholder="Twitter Profile">
        </span>
      </div>
      <div class="input-group">
        <label>About Me</label>
        <span class="input">
          <textarea v-model="aboutMe" type="url" placeholder="Type something about you..." rows="5" />
        </span>
      </div>
    </div>
    <label class="avatar">Avatar</label>
    <span class="input input-file">
      <div class="avatar-image changable">
        <img :src="currentUser.photo" alt="user">
        <span v-if="!isGoogleUser" v-tooltip="'Change Picture'" class="overlay" @click="openProfilePictureEditor">
          <i class="fad fa-camera-alt" />
        </span>
      </div>
      <input v-if="!isGoogleUser" type="file" class="editImg">
    </span>
    <button @click.prevent="save">
      Save
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .open-setting {
    padding: 0 5px;
    h4 {
      margin: 0 0 8px 0;
      padding: 0 0 8px 0;
      border-bottom: 1px solid #ccc;
      font-weight: bold;
      color: var(--mc);
    }
    .Inputs {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      .input-group {
        width: 50%;
        @include md {
          width: 100%;
        }
        label {
          font-weight: bold;
          color: #aaa;
          padding: 0 1rem;
          margin-top: 5px;
          @include md {
            padding: 0 3rem;
          }
          @include sm {
            padding: 0rem;
            font-size: 14px;
          }
        }
        span.input {
          display: flex;
          padding: 0 1rem;
          width: 100%;
          @include md {
            padding: 0 3rem;
          }
          @include sm {
            padding: 0rem;
          }
          i {
            padding: 7px 10px;
            margin: 0 0 5px;
            background: #f2f2f2;
            border-radius: 10px 0 0 10px;
            border: 2px solid #f2f2f2;
            border-right: 0;
            font-size: 25px;
            color: #aaa;
            @include sm {
              padding: 4px 8px;
              font-size: 20px;
            }
          }
          select {
            border: none;
          }
          input, select {
            background: #F8F8F8;
            outline: none;
            padding: 7px 12px;
            font-size: 15px;
            display: block;
            margin: 0 0 5px;
            width: 100%;
            border-radius: 0 10px 10px 0;
            border-left: 0;
            &:focus {
              border-color: #f2f2f2;
              & i {
                border-color: var(--mc2);
              }
            }
            @include sm {
              font-size: 14px;
              padding: 4px 12px;
            }
          }
          textarea {
            padding: 7px 12px;
            font-size: 15px;
            display: block;
            margin: 0 0 5px;
            width: 100%;
            border-radius: 10px;
            &:focus {
              border-color: #f2f2f2;
            }
          }
          &.input-file {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            img {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              margin: 5px 0 15px;
              border: 2px dashed var(--wit);
            }
          }
        }
      }
    }
    label.avatar {
      font-weight: bold;
      color: #aaa;
      padding: 0 1rem;
      width: 100%;
      margin: 20px 0 5px;
      display: block;
      text-align: center;
      font-size: 18px;
      @include md {
        padding: 0 3rem;
      }
      @include sm {
        padding: 0rem;
      }
    }
    span.input {
      display: flex;
      padding: 0 1rem;
      width: 100%;
      @include md {
        padding: 0 3rem;
      }
      @include sm {
        padding: 0rem;
      }
      i {
        padding: 7px 10px;
        margin: 0 0 5px;
        background: #f2f2f2;
        border-radius: 0;
        border: 2px solid #f2f2f2;
        border-right: 0;
        font-size: 25px;
        color: #aaa;
      }
      &.input-file {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        .editImg {
          display: none;
        }
        .avatar-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px dashed var(--wit);
          margin: 5px 0 15px;
          position: relative;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
          &.changable {
            .overlay {
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.4);
              display: flex;
              justify-content: center;
              align-items: center;
              position: absolute;
              top: 0;
              left: 0;
              cursor: pointer;
              transition: all 0.3s ease;
              opacity: 0;
            }
            i {
              transition: all 0.3s ease;
              background: none;
              border: none;
              color: #ccc;
              font-size: 30px;
              position: relative;
              top: 3px;
            }
            &:hover {
              .overlay {
                opacity: 1;
              }
            }
          }
        }
      }
    }
    button {
      display: block;
      margin: 20px auto;
      border-radius: 10px;
      background: var(--mc);
      font-weight: bold;
      border: none;
      box-shadow: none;
      padding: 10px 30px;
      font-size: 18px;
      color: var(--borders);
    }
  }
</style>

<script>
/* eslint-disable */
import ProfilePictureEditor from "../Modals/ProfilePictureEditor.vue"
export default {
  data () {
    return {
      username: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      aboutMe: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      defaultLanguage: 'en',
      langs: [
        { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
        { code: 'zh', name: 'Chinese', nativeName: '中文 (Zhōngwén)' },
        { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'fr', name: 'French', nativeName: 'français' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語' },
        { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
        { code: 'ru', name: 'Russian', nativeName: 'русский' },
        { code: 'es', name: 'Spanish', nativeName: 'español' },
        { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
      ],
      openPictureEditor: false
    }
  },
  computed: {
    currentUser () {
      return this.$store.state.user || {}
    },
    isGoogleUser () {
      return this.$store.state.user.google_user_id ? true : false
    }
  },
  components: {
    ProfilePictureEditor
  },
  mounted () {
    if (this.currentUser) {
      this.username = this.currentUser.username
      this.email = this.currentUser.email || ''
      this.website = this.currentUser.website || ''
      this.phone = this.currentUser.phone || ''
      this.address = this.currentUser.address || ''
      this.aboutMe = this.currentUser.aboutMe || ''
      this.facebook = this.currentUser.facebookLink || ''
      this.twitter = this.currentUser.twitterLink || ''
      this.linkedin = this.currentUser.linkedInLink || ''
      this.defaultLanguage = this.currentUser.defaultLanguage || 'en'
    }
  },
  methods: {
    openProfilePictureEditor() {
      this.openPictureEditor = true;
    },
    goBack() {
      this.openPictureEditor = false;
    },
    async save (e) {
      e.target.innerHTML = this.$store.state.loadingElement
      const { username, website, phone, address, aboutMe, facebook, twitter, linkedin, defaultLanguage, currentUser, $store, $axios } = this;

      const {err, success: user} = await $axios.$patch(`/api/users/${currentUser._id}`, { 
        username, website,
        phone, address,
        aboutMe, facebookLink: facebook,
        twitterLink: twitter, linkedInLink: linkedin,
        defaultLanguage 
      });

      if(err) {
        e.target.innerHTML = 'Save';
        return Swal.fire({ toast: true, icon: 'error', title: err })
      }

      e.target.innerHTML = 'Save';

      $store.commit('setUser', user)

      Swal.fire({ toast: true, icon: 'success', title: 'Profile settings edited successfully' });
      
    }
  }
}
</script>
