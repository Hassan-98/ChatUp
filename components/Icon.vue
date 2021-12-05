<template>
  <div class="icon">
    <img src="~static/imgs/chat-logo-nopen.png" alt="Icon">
    <h6>ChatUp</h6>
  </div>
</template>

<style lang="scss" scoped>
  .icon {
    border-radius: 50% 50% 0 0;
    width: 150px;
    height: 150px;
    margin: auto;
    padding: 15px;
    background: #fff;
    position: relative;
    top: 90px;
    border-top: 5px solid #f3f3f3;
    @include sm {
      top: 55px;
    }
    img{
      width: 50px;
      height: 50px;
    }
    h6 {
      font-family: 'Rock Salt', cursive;
      color: #BAC1C7;
      font-weight: bold;
      margin: 3px 0 0 0;
    }
  }
</style>
