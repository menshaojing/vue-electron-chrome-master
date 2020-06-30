<template>
    <div class="initParams">
        <el-select v-model="value"  placeholder="请选择">
            <el-option
                    v-for="item in options"
                    :key="item.url"
                    :label="item.label"
                    :value="item.url">
            </el-option>
        </el-select>
        <el-button type="primary" @click="checkButton">启用</el-button>
    </div>
</template>

<script>
    export default {
      data () {
        return {
          options: this.$config.APP_URL_LIST,
          value: 'http://128.196.119.182:8101/ecpweb/page/eism/menu/menunav.jsp'
        }
      },
      methods: {
        checkButton () {
          let that = this
          if (!that.value) {
            that.$message.warning('请选择')
          }
          that.$router.push({
            name: 'webview',
            params: {url: that.value}
          })
        },
        currentWindow () {
          return this.$electron.remote.getCurrentWindow()
        }
      },
      mounted () {
        var win = this.currentWindow()
    
        win.unmaximize()
      }
    }
</script>

<style type="text/css">
    .initParams {
        position: relative;
        top: 50%;
        bottom: 50%;
        text-align: center;
    }
</style>