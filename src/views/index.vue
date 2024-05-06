<template>
  <div class="app-container home">
    <p class="title-p">欢迎来到，元悟世界后台管理系统</p>
  </div>
</template>

<script>
import axios from 'axios';
import { getToken } from "@/utils/auth";
export default {
  data() {
    return {
    };
  },
  methods: {
    devBook() {
				axios.request({
				  url: 'https://api.firedigit.cn/users/userDialogStream', // 替换为你的流式API地址
				  method: 'POST',
				  // responseType: 'stream',
				  data: {
				  	"sessionId": 2,
				  	"content": "你是谁",
				  	"sessionType": 1,
				  	"type": 1
				  },
				  header: {
				  	"Accept": "text/event-stream",
				  	"Content-Type": "application/json;charset=UTF-8;",
				  	// "Content-Type": "application/x-www-form-urlencoded",
				  	"Connection": "keep-alive",
					  "forKey": "Accept",
            "Authorization": "Bearer " + getToken(),
				  },
          
				  responseType: "text",
				  enableChunked: true,

				  success: (res) => {
				    // 获取数据流
				    const stream = res.data;

				    // 处理数据流
				    stream.on('data', chunk => {
				      console.log('收到数据块:', chunk);
				      // 在这里处理接收到的数据块
				    });

				    stream.on('error', err => {
				      console.log('数据流出错:', err);
				    });

				    stream.on('end', () => {
				      console.log('数据流结束');
				    });
				  },
				  fail: (err) => {
				    console.log('请求失败:', err);
				  }
				});
			},
  },
  created(){
    this.devBook()
  },
};
</script>

<style scoped lang="scss">
.title-p {
  font-size: 26px;
  padding-left: 30px;
}
</style>
