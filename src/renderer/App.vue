<template>
    <div   id="app"
           :style="{
    border: theme.windowBorder,
    'border-color': theme.windowBorderColor
  }"
    >
        <el-container class="browser">
            <el-header class="browser-header" :height="theme.titleBarHeight"
                       :style="{
      'line-height': theme.titleBarHeight,
      'background-color': theme.titleBarBgColor,
      'color': theme.titleBarTextColor,
      'margin-top': hideTitleBar ? ('-' + theme.titleBarHeight) : ''
    }"
            >
                <div class="browser-title">
                    <img src="./assets/logo.png" alt="" class="app-icon">
                    <span class="app-name">{{name}}</span>
                    <!-- <span class="app-title"v-if="title">&nbsp;-&nbsp;{{title}}</span> -->
                </div>
                <div class="header-right">
                    <div title="刷新" @click="refresh" class="ctrl-icon el-icon-refresh"></div>
                    <div title="返回" @click="goBack" class="ctrl-icon el-icon-arrow-left"></div>
                    <div title="清理缓存" @click="clearCache" class="ctrl-icon el-icon-delete"></div>
                    <div title="最小化窗口" @click="handleMinimize" class="ctrl-icon el-icon-minus"></div>
                    <div title="最大化窗口" @click="handleMaximize" class="ctrl-icon el-icon-full-screen"></div>
                    <div  title="关闭" @click="handleClose" class="ctrl-icon el-icon-close"></div>
                </div>
            </el-header>
            <el-container>
                <!-- <el-aside class="browser-aside" :width="sideWidth">Aside</el-aside> -->
                <el-main class="browser-body">
                    <router-view></router-view>
                    <el-dialog
                            :visible.sync="showAppInfo"
                            :modal-append-to-body="true"
                    >
                        <app-info></app-info>
                    </el-dialog>
                </el-main>
            </el-container>
           <!--  <el-footer class="browser-footer"
              :height="theme.footerBarHeight"
              :style="{

              }"
              >
                 <el-progress :percentage="percentage" :color="customColors"></el-progress>
             </el-footer>-->
        </el-container>



    </div>
</template>

<script>
    import AppInfo from '@/components/app-info'
    export default {
      name: 'vue-electron-chrome',
      components: {
        AppInfo
      },
      data () {
        return {
          theme: {
            titleBarHeight: (this.$config.APP_TITLE_BAR_HEIGHT || 30) + 'px',
            titleBarBgColor: this.$config.APP_TITLE_BAR_BGCOLOR,
            titleBarTextColor: this.$config.APP_TITLE_BAR_TEXTCOLOR,
            footerBarHeight: (this.$config.APP_FOOTER_BAR_HEIGHT || 30) + 'px',
            windowBorderColor: this.$config.APP_WINDOWN_BORDER_COLOR,
            windowBorder: this.$config.APP_WINDOWN_BORDER
          },
          hideTitleBar: this.$config.APP_TITLE_BAR_HIDE === 'true',
          sideWidth: '150px',
          name: this.$config.APP_NAME,
          title: this.$config.APP_TITLE,
          menu: null,
          showAppInfo: false,
          filename: null,
          loading: null

        }
      },
      methods: {
        currentWindow () {
          return this.$electron.remote.getCurrentWindow()
        },
        handleFullScreen () {
          var win = this.currentWindow()
          if (win.isFullScreen()) {
            win.setFullScreen(false)
          } else {
            win.setFullScreen(true)
          }
        },
        handleMinimize () {
          var win = this.currentWindow()
          win.minimize()
        },
        handleMaximize () {
          var win = this.currentWindow()
          if (win.isMaximized()) {
            win.unmaximize()
          } else {
            win.maximize()
          }
        },
        clearCache () {
          var that = this
          const clearObj = {
            storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers']
          }
          var win = this.currentWindow()
          that.$root.webview.getWebContents().session.clearStorageData(clearObj, () => {
            that.$root.webview.reload()
          })
        },
        refresh () {
          var that = this
          that.$root.webview && that.$root.webview.reload()
        },
        goBack () {
          var that = this
          that.$root.webview && that.$root.webview.goBack()
        },
        handleClose () {
          var win = this.currentWindow()
          this.$confirm('你确定要关闭应用吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            win.close()
          }).catch(() => {
          })
        },
        handleShowMenu () {
          this.menu.popup(this.currentWindow(), 0, 31)
        },
        initMenu: function () {
          var that = this
          var contextMenu
          if (that.$config.contextmenu) {
            var Menu = this.$electron.remote.Menu
            var contextMenuItem = [
              {label: '重新加载应用', role: 'reload'},

              {label: '强制加载应用', role: 'forcereload'},
              {label: '应用控制台', role: 'toggledevtools'},
              {
                label: '审查元素',
                click () {
                  if (that.$root.webview) {
                    if (that.$root.webview.isDevToolsOpened()) {
                      that.$root.webview.closeDevTools()
                    } else {
                      that.$root.webview.openDevTools()
                    }
                  }
                }
              },

              {type: 'separator'},
              {
                label: '关于',
                click () {
                  that.showAppInfo = true
                }
              }
            ]

            contextMenu = Menu.buildFromTemplate(contextMenuItem)
            Menu.setApplicationMenu(contextMenu)
            document.addEventListener('contextmenu', (e) => {
              contextMenu.popup(this.currentWindow(), e.x, e.y)
            })
          }
          this.menu = contextMenu
        }
      },
      created () {
        this.initMenu()
      },
      mounted () {
        var mainWindow = this.currentWindow()
        mainWindow.webContents.session.on('will-download', (e, item) => {
          /* // 获取文件的总大小
          const totalBytes = item.getTotalBytes()
          // 设置文件的保存路径，此时默认弹出的 save dialog 将被覆盖
          const filePath = path.join(app.getPath('downloads'), item.getFilename())
          item.setSavePath(filePath)
      */ // 监听下载过程，计算并设置进度条进度
          item.on('updated', () => {
            /* mainWindow.setProgressBar(item.getReceivedBytes() / totalBytes) */
          })
          // 监听下载结束事件
          item.on('done', (e, state) => {
            this.$notify({
              title: '提示',
              message: item.getFilename() + '文件下载成功',
              position: 'bottom-left'
            })
            /*   // 如果窗口还在的话，去掉进度条
            if (!mainWindow.isDestroyed()) {
              mainWindow.setProgressBar(-1)
            }
            // 下载被取消或中断了
            if (state === 'interrupted') {
              electron.dialog.showErrorBox('下载失败', `文件 ${item.getFilename()} 因为某些原因被中断下载`)
            } */
            // 下载完成，让 dock 上的下载目录Q弹一下下
          /*  if (state === 'completed') {
                app.dock.downloadFinished(filePath)
            } */
          })
        })
  }

    }
</script>
<style type="text/css">
    #app{
        margin: 0 auto;
        position: absolute;
        width: 100%;
        height: 100%;
        border: solid 1px #181A1F;
    }
    #app  a:hover {text-decoration: none} /* 鼠标悬浮在上的链接 蓝色 */
    .browser{
        height: 100%;
    }
    .browser-aside{
        background: #21252B;
        border-right: solid 1px #181A1F;
        padding: 5px;
        color: #F0F0F2;
    }
    .browser-header{
        background: #21252B;
        color: #F0F0F2;
        line-height: 30px;
        padding: 0 8px;
        font-size: 13px;
        /*border-bottom: solid 1px #181A1F;*/
        box-sizing: border-box;
        -webkit-app-region: drag;
        user-select:none;
    }
    .browser-footer{
        background: #21252B;
        color: #F0F0F2;
        line-height: 30px;
    }
    .app-icon{
        width: 20px;
        height: 20px;
        vertical-align: middle;
        margin-top: -5px;
        margin-right: 5px;
        -webkit-app-region: no-drag;
    }
    .header-left{
        float: left;
    }
    .browser-title{
        float: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .header-right{
        float: right;
    }
    .browser-body{
        padding: 0;
    }
    .ctrl-icon{
        display: inline-block;
        outline: none;
        border: none;
        -webkit-app-region: no-drag;
        margin-left: 5px;
    }
    .ctrl-icon:active{
        opacity: 0.7;
    }
    .ctrl-icon:last-child{
        margin-right: 0;
    }
    .ctrl-icon.minimize{
        background: #35CB4B;
        font-size: 19px;
        line-height: 5px;
        padding-left: 4px;
        font-weight: bold;
    }
    .ctrl-icon.maximize{
        background: #FDBD41;
        padding-left: 4.5px;
        padding-bottom: 2px;
        padding-top: 2px;
    }
    .ctrl-icon .maxDiv{
        border: 1.5px double;
        width: 7px;
        height: 7px;
    }
    .ctrl-icon.close{
        background: #FC625D;
        font-size: 14px;
        line-height: 5px;
        padding-left: 4px;
        font-weight: bold;
    }
</style>
