<template>
  <div class="open-setting">
    <h4>General Settings</h4>
    <label>Group Name</label>
    <span class="input">
      <i class="fas fa-user-alt" />
      <input v-model="groupName" type="text" placeholder="Group Name">
    </span>
    <label>Group Avatar</label>
    <span class="input input-file">
      <img :src="currentChat.groupPhoto" alt="">
      <input type="file" class="editImg">
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
    label {
      font-weight: bold;
      color: #aaa;
      padding: 0 7rem;
      margin-top: 20px;
      @include md {
        padding: 0 3rem;
      }
      @include sm {
        padding: 0rem;
      }
    }
    span.input {
      display: flex;
      padding: 0 7rem;
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
        border-radius: 0;
        border-left: 0;
        &:focus {
          border-color: #f2f2f2;
          & i {
            border-color: var(--mc2);
          }
        }
      }
      textarea {
        padding: 7px 12px;
        font-size: 15px;
        display: block;
        margin: 0 0 5px;
        width: 100%;
        border-radius: 0;
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
    button {
      display: block;
      margin: 20px auto;
      border-radius: 10px;
      background: var(--borders);
      font-weight: bold;
      border: none;
      box-shadow: none;
      padding: 10px 30px;
      font-size: 18px;
      color: var(--mc);
      &:hover {
        transform: none;
      }
    }
  }
</style>

<script>
export default {
  data () {
    return {
      groupName: ''
    }
  },
  computed: {
    currentChat () {
      return this.$store.state.openedChat || false
    }
  },
  mounted () {
    if (this.currentChat) {
      this.groupName = this.currentChat.groupName
    }
  },
  methods: {
    /* eslint-disable */
    async save (e) {
      e.target.innerHTML = this.$store.state.loadingElement
      const { groupName, currentChat, $store, $axios, $socket } = this
      var formdata = new FormData()
      var img = document.querySelector('.editImg').files[0]
      var groupPhoto = currentChat.groupPhoto
      if (img){
        formdata.append('groupPhoto', img)
        formdata.set('currentImage', currentChat.groupPhoto)
        formdata.set('chatId', currentChat._id)
        const {uploadedImg, err} = await $axios.$patch(`/api/chats/group/updatePic`, formdata)
        groupPhoto = uploadedImg
        if(err) {
          e.target.innerHTML = 'Save'
          return Swal.fire({
            toast: true,
            icon: 'error',
            title: err
          })
        }
      }

      $socket.emit('editGroup', {
        groupId: currentChat._id,
        edits: {
          groupName,
          groupPhoto
        }
      });

      e.target.innerHTML = 'Save';

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Group edited successfully'
      });
    }
  }
}
</script>
