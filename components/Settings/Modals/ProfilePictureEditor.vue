<template>
  <div class="profile_picture_editor">
    <span class="goBack" @click="goBack"><i class="fad fa-arrow-square-left" /> Back</span>
    <h5>Change Profile Picture</h5>
    <img v-if="pickerOpened" :src="currentUser.photo" alt="current picture">
    <div v-if="pickerOpened" class="pick" @click="openPicker">
      <p>Pick A Picture</p>
    </div>
    <div class="cropper">
      <img src="" alt="user picture" class="cropper_image">
      <div class="preview_box" />
    </div>
    <div class="preview">
      <p>Profile Picture</p>
      <img src="" alt="user picture" class="preview_image">
      <button @click="pickAnother">
        Pick another picture
      </button>
    </div>
    <input type="file" class="profile_picture_input" accept="image/*" @change="openCropper">
    <button v-if="!isCropped && !pickerOpened" @click="crop">
      Crop
    </button>
    <button v-else-if="isCropped && !pickerOpened" @click="save">
      Save
    </button>
  </div>
</template>

<style lang="scss">
.profile_picture_editor {
    position: fixed;
    top: calc(10% + 5px);
    left: 5%;
    width: calc(100% - 10%);
    height: calc(90% - 50px);
    overflow: hidden;
    text-align: center;
    border-radius: 0 0 15px 15px;
    z-index: 10;
    background: var(--bg);

    @include sm {
      top: 0%;
      height: 100%;
      left: 0;
      width: 100%;
    }

    .goBack {
        position: absolute;
        top: 15px;
        left: 20px;
        font-size: 20px;
        cursor: pointer;
        padding: 7px 20px;
        background: #f1f1f1;
        border-radius: 10px;

        @include sm {
            padding: 5px 10px;
            font-size: 14px;
            left: 10px;
            top: 30px;
        }
    }

    h5 {
        padding: 10px 20px;
        background: var(--bg);
        border-radius: 10px;
        width: fit-content;
        margin: 25px auto 15px;
        color: var(--mc);
    }

    & > img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 2px dashed var(--wit);
    }

    .pick {
        padding: 50px;
        background: var(--bg);
        border: 1px dashed var(--mc);
        width: 50%;
        margin: 15px auto;
        border-radius: 5px;
        cursor: pointer;

        @include md {
            width: 70%;
        }

        @include sm {
            width: 90%;
        }

        p {
            color: var(--mc);
        }
    }

    .cropper, .preview {
        width: 50%;
        height: 70%;
        padding: 15px;
        margin: 5px auto 15px;
        display: none;

        * {
            transition: none;
        }

        &.show {
            display: block;
        }

        @include md {
            padding: 5px 15px;
            margin: 0 auto;
            width: 70%;
        }

        @include sm {
            width: 90%;
            height: 65%;
        }

        .cropper_image {
            width: 100%;
            height: 70%;
            border-radius: 5px;
            margin-bottom: 25px;
            border: 1px solid var(--wit);
            @include sm {
                margin-bottom: 15px;
            }
        }

        .preview_image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 2px dashed var(--wit);
        }

        button {
            display: block;
            margin: 20px auto;
            border-radius: 7px;
            background: var(--mc);
            color: var(--white);
            border: none;
            font-size: 16px;
            padding: 7px 20px;
            box-shadow: 0 0 5px rgba($color: #000, $alpha: 0.05);
            &:hover {
                transform: none;
            }
        }

    }

    .profile_picture_input {
        display: none;
    }

    & > button {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      margin: 20px auto;
      border-radius: 7px;
      background: var(--mc);
      font-weight: bold;
      color: var(--white);
      border: none;
      font-size: 18px;
      padding: 12px 50px;
      box-shadow: 0 0 5px rgba($color: #000, $alpha: 0.05);
      &:hover {
        box-shadow: none;
        transform: translateX(-50%);
      }
      @include sm {
        width: 95%;
        bottom: 10px;
      }
    }
}
</style>

<script>
/* eslint-disable */
import Cropper from "cropperjs";

export default {
  data() {
    return {
      pickerOpened: true,
      isCropped: false,
      cropper: null,
      croppedImageBlob: null
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.user || {};
    }
  },
  props: ['goBack'],
  methods: {
    openPicker() {
        document.querySelector(".profile_picture_input").click();
    },
    openCropper(e) {
        this.pickerOpened = false;

        var files = e.target.files;
        var cropperImage = document.querySelector(".cropper_image");

		if(files && files.length) {
			const reader = new FileReader();
			reader.readAsDataURL(files[0]);

			reader.onload = () => {
				const URL = reader.result;
                cropperImage.src = URL;

                this.cropper = new Cropper(cropperImage, {
                    aspectRatio: 1,
                    dragMode: "move",
                    cropBoxMovable: false,
                    viewMode: 0,
                    preview: ".preview_box"
                });

                e.target.value = ""
			};
		}

        document.querySelector(".cropper").classList.add("show");
    },
    crop() {
        this.isCropped = true;

        var previewImage = document.querySelector(".preview_image");

        var canvas = this.cropper.getCroppedCanvas({
			width: 120,
			height: 120
		});

		canvas.toBlob((blob) => {
            this.croppedImageBlob = blob;

			var reader = new FileReader();

			reader.readAsDataURL(blob);

			reader.onloadend = () => previewImage.src = reader.result;

            document.querySelector(".cropper").classList.remove("show")
            document.querySelector(".preview").classList.add("show")
            
            this.cropper.destroy();
            this.cropper = null;
		});
    },
    pickAnother() {
        this.pickerOpened = true;
        this.isCropped = false;
        this.croppedImageBlob = null;
    },
    async save() {
      const { $store, $axios, $socket, currentUser } = this;
      var formdata = new FormData();
      var img = this.croppedImageBlob;
      
      if (!img) return Swal.fire({ toast: true, icon: 'error', text: "An Error occured" });

      formdata.append('avatar', img);
      formdata.set('currentImage', currentUser.photo);

      const {err, success: user} = await $axios.$patch(`/api/users/change-picture/${currentUser._id}`, formdata)

      if (err) return Swal.fire({ toast: true, icon: 'error', text: err });
    
      $socket.emit('changeUserPicture', {newPhoto: user.photo, userId: user._id});

      $store.commit('changeUserPictureInChats', {newPhoto: user.photo, userId: user._id});

      $store.commit('setUser', user);

      this.goBack();
    }
  }
};
</script>
