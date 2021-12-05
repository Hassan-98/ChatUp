<template>
  <div class="chat-modal" @click.stop="closeModal">
    <h1><span>ChatUp</span></h1>
    <div class="lds-ring">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-modal {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999999;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--mc);
  font-size: 45px;
  font-weight: bold;
  h1 {
    span {
      font-family: "Rock Salt", cursive;
    }
  }
  .lds-ring {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid var(--mc);
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: var(--mc) transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .chat-modal-body {
    background: rgba($color: #000, $alpha: 0.5);
    width: 65%;
    height: 99%;
    @include xs {
      width: 95%;
      height: 80%;
    }
    padding: 2px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 1px 1px 10px rgba($color: #000, $alpha: 0.2);
    position: relative;
    i {
      position: absolute;
      top: 15px;
      right: 25px;
      color: #fff;
      font-size: 28px;
      border-radius: 50%;
      box-shadow: 0 0 5px rgba($color: #000, $alpha: 0.2);
      cursor: pointer;
      &:hover {
        color: var(--mc);
      }
    }
    img {
      width: 100%;
      height: 100%;
      border-radius: 10px;
    }
  }
}
</style>

<script>
export default {
  methods: {
    closeModal (e) {
      if (e.target.classList.contains('chat-modal') || e.target.tagName === 'I') {
        this.$store.commit('closeModal')
      }
    }
  }
}
</script>
