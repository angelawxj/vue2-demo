<template>
  <div id="app" class="container">
    <!-- 左侧操作按钮 -->
    <div class="controls">
      <!-- 切换主题按钮 -->
      <div class="theme-section">
        <h4>切换主题</h4>
        <el-radio-group v-model="currentTheme" @change="handleThemeChange">
          <el-radio label="light">浅色主题</el-radio>
          <el-radio label="dark">深色主题</el-radio>
        </el-radio-group>
        <div class="current-theme">当前主题: {{ currentTheme }}</div>
      </div>

      <!-- 问答输入区域 -->
      <div class="input-section">
        <h4>发送问答</h4>
        <el-input
          v-model="questionInput"
          type="textarea"
          :rows="3"
          placeholder="请输入问题"
        ></el-input>
        <div class="file-inputs" style="margin-top: 10px;">
          <el-input
            v-model="fileName"
            placeholder="文件名（可选）"
            style="margin-bottom: 5px;"
          ></el-input>
          <el-input
            v-model="filePath"
            placeholder="文件路径（可选）"
            style="margin-bottom: 5px;"
          ></el-input>
          <div class="range-inputs" style="display: flex; gap: 5px; margin-bottom: 10px;">
            <el-input
              v-model.number="startLine"
              type="number"
              placeholder="起始行"
              style="flex: 1;"
            ></el-input>
            <el-input
              v-model.number="endLine"
              type="number"
              placeholder="结束行"
              style="flex: 1;"
            ></el-input>
          </div>
        </div>
        <el-button @click="askQuestion" type="primary" style="margin-top: 10px;">发送问题</el-button>
      </div>

      <!-- 接收插入代码区域 -->
      <div class="input-section">
        <h4>接收到的代码</h4>
        <el-input
          v-model="receivedCode"
          type="textarea"
          :rows="3"
          readonly
          placeholder="这里将显示从 wxj-widget 接收到的代码"
        ></el-input>
        <div style="margin-top: 10px; display: flex; gap: 5px;">
          <el-button @click="copyCode" type="success" size="small">复制代码</el-button>
          <el-button @click="clearCode" type="warning" size="small">清空代码</el-button>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #666;">
          代码来自 wxj-widget 的插入功能
        </div>
      </div>

      <!-- 弹出 wxj-widget 按钮 -->
      <el-button @click="toggleWidgetVisibility" type="info">
        {{ isWidgetVisible ? '隐藏' : '显示' }} wxj-widget
      </el-button>

      <!-- 设置窗口状态 -->
      <div class="window-section">
        <h4>窗口状态</h4>
        <el-radio-group v-model="windowState" @change="handleWindowStateChange">
          <el-radio :label="true">打开窗口</el-radio>
          <el-radio :label="false">关闭窗口</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 右侧 wxj-widget 弹框 -->
    <div 
      v-if="isWidgetVisible" 
      class="widget-container"
      :style="{ width: widgetWidth + 'px' }"
    >
      <!-- 拖动条 -->
      <div 
        class="resize-handle"
        @mousedown="startResize"
      ></div>
      
      <!-- 传递主题参数给 wxj-widget -->
      <wxj-widget 
        ref="wxjWidget"
        :theme="currentTheme"
        @insert-code="handleInsertCode"
      ></wxj-widget>
    </div>
  </div>
</template>

<script>
import { WxjWidget } from 'wxj-widget';

export default {
  name: 'App',
  components: {
    WxjWidget
  },
  data() {
    return {
      isWidgetVisible: false, // 控制 wxj-widget 是否显示
      currentTheme: 'light', // 默认主题是 'light'
      windowState: true, // 窗口状态
      
      // 输入框数据
      questionInput: '',
      fileName: '',
      filePath: '',
      startLine: 1,
      endLine: 5,
      
      // 接收到的代码
      receivedCode: '',
      
      // 窗口宽度相关
      widgetWidth: 400, // 默认宽度
      isResizing: false,
      startX: 0,
      startWidth: 0
    }
  },
  mounted() {
    // 初始化时设置主题和窗口状态
    this.setTheme(this.currentTheme);
    this.setWindowState(this.windowState);
    
    // 添加全局事件监听
    document.addEventListener('mousemove', this.handleResize);
    document.addEventListener('mouseup', this.stopResize);
  },
  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    // 处理主题切换
    handleThemeChange(theme) {
      if (theme === 'light' || theme === 'dark') {
        this.setTheme(theme);
      }
    },

    // 设置主题方法 - 供外部调用
    setTheme(theme) {
      if (theme === 'light' || theme === 'dark') {
        this.currentTheme = theme;
        
        // 传递给 wxj-widget
        const widget = this.$refs.wxjWidget;
        if (widget && widget.setTheme) {
          widget.setTheme(theme);
        }
        
        console.log(`主题已切换为: ${theme}`);
        this.$message.success(`主题已切换为${theme === 'light' ? '浅色' : '深色'}`);
      } else {
        console.warn('主题参数必须是 "light" 或 "dark"');
        this.$message.warning('主题参数必须是 "light" 或 "dark"');
      }
    },

    // 处理窗口状态变化
    handleWindowStateChange(state) {
      this.setWindowState(state);
    },

    // 设置窗口状态方法 - 供外部调用
    setWindowState(state) {
      this.windowState = Boolean(state);
      this.isWidgetVisible = this.windowState;
      
      console.log(`窗口状态已设置为: ${this.windowState ? '打开' : '关闭'}`);
      this.$message.success(`窗口已${this.windowState ? '打开' : '关闭'}`);
    },

    // 处理从 wxj-widget 接收到的插入代码
    handleInsertCode(code) {
      if (code && typeof code === 'string') {
        this.receivedCode = code;
        console.log('接收到插入的代码:', code);
        this.$message.success('已接收到插入的代码');
        
        // 这里可以处理接收到的代码，比如保存到文件、显示在编辑器等
        this.processReceivedCode(code);
      }
    },

    // 处理接收到的代码
    processReceivedCode(code) {
      // 在这里添加处理代码的逻辑
      // 例如：保存到本地存储、发送到后端、显示在编辑器等
      console.log('处理接收到的代码:', code);
      
      // 示例：保存到本地存储
      try {
        localStorage.setItem('lastInsertedCode', code);
      } catch (e) {
        console.warn('无法保存到本地存储:', e);
      }
    },
    
    // 复制代码到剪贴板
    copyCode() {
      if (!this.receivedCode.trim()) {
        this.$message.warning('没有可复制的代码');
        return;
      }
      
      navigator.clipboard.writeText(this.receivedCode).then(() => {
        this.$message.success('代码已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = this.receivedCode;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.$message.success('代码已复制到剪贴板');
        } catch (e) {
          this.$message.error('复制失败');
        }
        document.body.removeChild(textArea);
      });
    },
    
    // 清空代码
    clearCode() {
      this.receivedCode = '';
      this.$message.info('已清空代码');
    },
    
    // 发送问答到 wxj-widget
    askQuestion() {
      if (!this.questionInput.trim()) {
        this.$message.warning('请输入问题');
        return;
      }
      
      const widget = this.$refs.wxjWidget;
      if (widget && widget.askQuestions) {
        const files = [];
        
        // 如果有文件信息，添加到files数组中
        if (this.fileName || this.filePath) {
          const fileInfo = {
            name: this.fileName || '',
            ...(this.filePath && { filePath: this.filePath }),
            ...(this.startLine && this.endLine && { 
              range: {
                startLine: Number(this.startLine),
                endLine: Number(this.endLine)
              }
            })
          };
          files.push(fileInfo);
        }
        
        widget.askQuestions({
          prompt: this.questionInput,
          type: 'text',
          files: files
        });
        
        // 清空输入框
        this.questionInput = '';
        this.fileName = '';
        this.filePath = '';
        this.startLine = 1;
        this.endLine = 5;
        
        this.$message.success('问题发送成功');
      }
    },
    
    // 切换 wxj-widget 显示/隐藏
    toggleWidgetVisibility() {
      this.isWidgetVisible = !this.isWidgetVisible;
      this.windowState = this.isWidgetVisible;
    },

    // 供外部调用的方法 - 设置主题
    externalSetTheme(theme) {
      this.setTheme(theme);
    },

    // 供外部调用的方法 - 设置窗口状态
    externalSetWindowState(state) {
      this.setWindowState(state);
    },

    // 供外部调用的方法 - 发送问答
    externalAskQuestions(params) {
      if (params && typeof params === 'object') {
        // 填充表单数据
        if (params.prompt) {
          this.questionInput = params.prompt;
        }
        if (params.files && params.files.length > 0) {
          const file = params.files[0];
          this.fileName = file.name || '';
          this.filePath = file.filePath || '';
          if (file.range) {
            this.startLine = file.range.startLine || 1;
            this.endLine = file.range.endLine || 5;
          }
        }
        // 自动发送
        this.$nextTick(() => {
          this.askQuestion();
        });
      }
    },

    // 开始调整宽度
    startResize(event) {
      this.isResizing = true;
      this.startX = event.clientX;
      this.startWidth = this.widgetWidth;
      event.preventDefault();
    },

    // 处理调整宽度
    handleResize(event) {
      if (!this.isResizing) return;
      
      const deltaX = this.startX - event.clientX;
      const newWidth = this.startWidth + deltaX;
      
      // 限制最小和最大宽度
      if (newWidth >= 300 && newWidth <= 800) {
        this.widgetWidth = newWidth;
      }
    },

    // 停止调整宽度
    stopResize() {
      this.isResizing = false;
    }
  }
}
</script>

<style>
/* 容器布局 */
.container {
  display: flex;
  height: 100vh; /* 满屏高度 */
}

.controls {
  width: 350px; /* 增加左侧区域宽度以容纳输入框 */
  background-color: #f5f5f5;
  padding: 20px 5px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: flex-start;
  overflow-y: auto; /* 添加滚动条以防内容过多 */
}

.theme-section,
.window-section,
.input-section {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-section h4,
.window-section h4,
.input-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.current-theme {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  font-weight: bold;
}

/* 弹框样式 */
.widget-container {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%; /* 满高 */
  background-color: white;
  border-left: 2px solid #ddd;
  box-shadow: -4px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: transform 0.3s ease;
  min-width: 300px; /* 最小宽度 */
  max-width: 800px; /* 最大宽度 */
}

/* 拖动条样式 */
.resize-handle {
  position: absolute;
  left: -5px;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
  z-index: 1001;
}

.resize-handle:hover {
  background-color: rgba(66, 133, 244, 0.1);
}

.resize-handle:active {
  background-color: rgba(66, 133, 244, 0.2);
}

.widget-container wxj-widget {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.el-button {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .controls {
    width: 100%;
    height: auto;
  }
  
  .widget-container {
    width: 100% !important;
    position: relative;
  }
  
  .resize-handle {
    display: none; /* 在移动端隐藏拖动条 */
  }
}
</style>