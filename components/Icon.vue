<template>
  <div class="icon">
    <img src="~static/imgs/chat-logo-nopen.png" alt="Icon">
    <h6>ChatUp</h6>
  </div>
</template>

<style lang="scss" scoped>
  .icon {
    border-radius: 50%;
    width: 130px;
    height: 130px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: auto;
    background: #fff;
    position: absolute;
    top: -65px;
    left: 40px;
    box-shadow: inset 0 -5px 5px rgba($color: #000, $alpha: 0.07);
    z-index: 1;
    padding-bottom: 10px;
    @include md {
      left: 30px;
    }
    @include sm {
      width: 100px;
      height: 100px;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
    }
    @include xs {
      width: 80px;
      height: 80px;
      top: -40px;
    }
    img{
      width: 60px;
      height: 60px;
      @include sm {
        width: 50px;
        height: 50px;
      }
      @include xs {
        width: 40px;
        height: 40px;
      }
    }
    h6 {
      font-family: 'Rock Salt', cursive;
      color: #BAC1C7;
      font-weight: bold;
      margin: 3px 0 0 0;
      @include xs {
        font-size: 10px;
      }
    }
  }
</style>
