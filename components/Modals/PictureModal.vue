<template>
  <div class="chat-modal" @click.stop="closeModal">
    <div class="chat-modal-body">
      <i v-tooltip="'close'" class="fas fa-times" @click="closeModal" />
      <img :src="$store.state.modalImg" alt="chat-img">
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .chat-modal {
    width: 100%;
    height: 100%;
    background: rgba($color: #000, $alpha: 0.8);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999999;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    .chat-modal-body {
      background: rgba($color: #000, $alpha: 0.5);
      width: 75%;
      height: 90%;
      display: flex;
      justify-content: center;
      align-items: center;
      @include xl {
        width: 95%;
        height: 95%;
      }
      @include lg {
        width: 90%;
        height: 90%;
      }
      @include md {
        width: 95%;
        height: 70%;
      }
      @include xs {
        width: 98%;
        height: 50%;
      }
      padding: 2px;
      overflow: hidden;
      box-shadow: 1px 1px 10px rgba($color: #000, $alpha: 0.2);
      position: relative;
      i{
        position: absolute;
        top: 10px;
        right: 15px;
        color: #fff;
        font-size: 24px;
        border-radius: 50%;
        box-shadow: 0 0 5px rgba($color: #000, $alpha: 0.2);
        cursor: pointer;
        &:hover{
          color: var(--mc);
        }
      }
      img{
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
</style>

<script>
export default {
  methods: {
    closeModal (e) {
      if (e.target.classList.contains('chat-modal') || e.target.tagName === 'I') { this.$store.commit('closeModal') }
    }
  }
}
</script>
