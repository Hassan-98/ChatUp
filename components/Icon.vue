<template>
  <div class="icon">
    <img src="/imgs/chatLogoWhite.png" alt="Icon">
    <h4>ChatUp</h4>
  </div>
</template>

<style lang="scss" scoped>
  .icon {
    border-radius: 50%;
    width: 120px;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: auto;
    background: #fff;
    position: absolute;
    top: -60px;
    left: 40px;
    box-shadow: inset 0 -5px 5px rgba($color: #000, $alpha: 0.07);
    z-index: 1;
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
      width: 55px;
      height: 55px;
      @include sm {
        width: 45px;
        height: 45px;
      }
      @include xs {
        width: 35px;
        height: 35px;
      }
    }
    h4 {
      padding: 0 5px;
      font-family: 'Rock Salt', cursive;
      font-weight: bolder;
      color: #1b3c5a;
      margin: 5px 0 0 0;
      font-size: 13px;
      @include xs {
        font-size: 9px;
      }
    }
  }
</style>
