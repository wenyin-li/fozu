<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="小说名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入创意"></el-input>
      </el-form-item>

      <el-form-item label="作者" prop="author">
        <el-input v-model="queryParams.author" placeholder="请输入创意"></el-input>
      </el-form-item>

      <el-form-item label="渠道" prop="channel">
        <el-input v-model="queryParams.channel" placeholder="请输入创意"></el-input>
      </el-form-item>

      <el-form-item label="工具类型" prop="dimensions">
        <el-select v-model="queryParams.dimensions">
          <el-option
            v-for="item in dimensionList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status">
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="来源类型" prop="sourceType">
        <el-select v-model="queryParams.sourceType">
          <el-option
            v-for="item in sourceTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="roleList">
      <el-table-column label="小说名称" align="left" prop="name" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" align="left" prop="author" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="封面图" align="left" prop="url" min-width="80">
        <template slot-scope="scope">
          <el-image
            style="width: 60px; height: 60px"
            :src="scope.row.image"
            :preview-src-list="[scope.row.image]"
            v-if="scope.row.image"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="生成状态" align="left" prop="status" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.status | filterstatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源类型" align="left" prop="sourceType" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceType | filterSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="left" prop="payStatus" min-width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.payStatus == 1 ? "未支付" : "已支付" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="left" prop="updateTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" fixed="right" width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdateFile(scope.row)"
            v-hasPermi="['aiServiceManagement:aiNovelManagement:detail']"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      :title="form.id ? '编辑工具' : '新增工具'"
      :visible.sync="openFile"
      width="700px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="小说名称：" prop="name">
          <span>{{ form.name }}</span>
        </el-form-item>
        <el-form-item label="封面图：" prop="image">
          <el-image
            style="width: 60px; height: 60px"
            :src="form.image"
            :preview-src-list="[form.image]"
            v-if="form.image"
          >
          </el-image>
        </el-form-item>
        <el-form-item label="背景：" prop="setting">
          <span>{{ form.setting }}</span>
        </el-form-item>
        <el-form-item label="作者：" prop="author">
          <span>{{ form.author }}</span>
        </el-form-item>
        <el-form-item label="创作内容：" prop="content">
          <div style="white-space: pre-wrap;">{{ form.content }}</div>
        </el-form-item>
        <el-form-item label="简介：" prop="blurb">
          <div style="white-space: pre-wrap;">{{ form.blurb }}</div>
        </el-form-item>
        <el-form-item label="字数：" prop="wordCount">
          <span>{{ form.wordCount }}</span>
        </el-form-item>
        <el-form-item label="小说文件路径：" prop="url">
          <a :href="form.url" target='none' v-if="form.url">点击查看</a>
        </el-form-item>
        <el-form-item label="小说生成内容：" prop="status">
          <a :href="'/webadmin/lookbook?id=' + form.id" target='none' v-if="form.novelContent">点击查看</a>
        </el-form-item>
        <el-form-item label="生成状态：" prop="status">
          <span>{{ form.status | filterstatus }}</span>
        </el-form-item>
        <el-form-item label="支付状态：" prop="status">
          <span>{{ form.payStatus == 1 ? "未支付" : "已支付" }}</span>
        </el-form-item>
        <el-form-item label="价格：" prop="price">
          <span>{{ form.price }}</span>
        </el-form-item>
        <el-form-item label="渠道：" prop="channel">
          <span>{{ form.channel }}</span>
        </el-form-item>
        <el-form-item label="来源类型：" prop="sourceType">
          <span>{{ form.sourceType | filterSourceType }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="openFile = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  queryAdminNovelList,
  getAdminNovelDetail,
} from "@/api/AiServiceManagement/AiServiceManagement";

export default {
  name: "Role",
  dicts: ["sys_normal_disable"],
  components: {},
  data() {
    return {
      value: "",
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 日期范围
      dateRange: [],
      // 数据范围选项
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: "",
      },
      // 表单参数
      openFile: false,
      form: {
        apikey: "fastgpt-MbMdhsnWy5eaqoGulCyxYWAPT5dTAjBSczGqCOk6KwjOok6jNFiSUzp",
        apiUrl: "http://129.204.169.154:3000/api/v1/chat/completions",
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "工具名称不能为空", trigger: "blur" }],
        icon: [{ required: true, message: "工具头像不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "状态不能为空", trigger: "blur" }],
        apikey: [{ required: true, message: "工具key不能为空", trigger: "blur" }],
        apiUrl: [{ required: true, message: "请求地址不能为空", trigger: "blur" }],
        type: [{ required: true, message: "工具类型不能为空", trigger: "blur" }],
        description: [{ required: true, message: "工具简介不能为空", trigger: "blur" }],
        prompt: [{ required: true, message: "提示词不能为空", trigger: "blur" }],
        problem: [{ required: false, message: "提示词不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "排序不能为空", trigger: "blur" }],
      },
      ids: [],
      sourceTypeList: [
        {
          value: "wxapp",
          label: "小程序",
        },
        {
          value: "android",
          label: "安卓",
        },
        {
          value: "ios",
          label: "IOS",
        },
        {
          value: "H5",
          label: "平台H5",
        },
        {
          value: "webH5Platform",
          label: "微信H5",
        },
      ],
      statusList: [
        {
          name: "待生产",
          value: 0,
        },
        {
          name: "生成中",
          value: 1,
        },
        {
          name: "已完成",
          value: 2,
        },
        {
          name: "生成异常",
          value: 3,
        },
        {
          name: "已支付待生成",
          value: 4,
        },
        {
          name: "已支付生成中",
          value: 5,
        },
        {
          name: "已支付生成完成",
          value: 6,
        },
      ],
      dimensionList: [
        {
          name: "1:1",
          value: 1,
        },
        {
          name: "9:16",
          value: 2,
        },
        {
          name: "16:9",
          value: 3,
        },
        {
          name: "3:4",
          value: 4,
        },
        {
          name: "4:3",
          value: 5,
        },
      ],
      imageFileList: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    changeImage(item) {
      console.log(item, "itemmmmmmmmm");
      if (item && item.length) {
        this.form.icon = item[0].url;
      } else {
        this.form.icon = "";
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
      console.log(this.ids, "this.ids");
    },
    /** 删除按钮操作 */
    handleDeleteFile(row) {
      const roleIds = row && row.id ? [row.id] : this.ids;
      // this.$modal.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？').then(function() {
      this.$modal
        .confirm("是否确认删除已选中分类的数据项？")
        .then(function () {
          return batchDelete(roleIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    cancelFile() {
      this.openFile = false;
      this.imageFileList = [];
      this.form = {};
    },
    handleUpdateFile(row) {
      console.log(row, "rowwwwwwwww");
      getAdminNovelDetail({
        id: row.id,
      }).then((response) => {
        console.log(response, "responseresponse");
        this.form = response.data;
      });
      this.openFile = true;
    },
    submitFormFile: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log("进来了");
          let query = {
            name: this.form.name,
            icon: this.form.icon,
            apikey: this.form.apikey,
            apiUrl: this.form.apiUrl,
            type: this.form.type,
            description: this.form.description,
            prompt: this.form.prompt,
            problem: this.form.problem,
            sort: this.form.sort,
            id: this.form.id,
          };
          insertOrUpdate(query).then((response) => {
            if (this.form.id) {
              this.$modal.msgSuccess("修改成功");
            } else {
              this.$modal.msgSuccess("新增成功");
            }
            this.cancelFile();
            this.getList();
          });
        }
      });
    },
    /** 新增 */
    handleFile() {
      this.openFile = true;
    },
    /** 查询角色列表 */
    getList() {
      let query = this.addDateRange(this.queryParams, this.dateRange);
      console.log(query, "query");
      let data = {
        name: query.name,
        author: query.author,
        status: query.status,
        payStatus: query.payStatus,
        channel: query.channel,
        sourceType: query.sourceType,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || null,
        endCreateTime: query.params.endTime || null,
        userId: "",
      };
      queryAdminNovelList(data).then((response) => {
        console.log(response, "response");
        if (response.data && response.data.records) {
          this.roleList = response.data.records;
          this.total = response.data.total;
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {}
      this.handleQuery();
    },
  },
  filters: {
    filterstatus(val) {
      switch (val) {
        case 0:
          return "待生产";
        case 1:
          return "生成中";
        case 2:
          return "已生成";
        case 3:
          return "生成异常";
        case 4:
          return "已支付待生成";
        case 5:
          return "已支付生成中";
        case 6:
          return "已支付生成完成";
        default:
          return "";
      }
    },
    filterSourceType(val) {
      switch (val) {
        case "wxapp":
          return "小程序";
        case "android":
          return "安卓";
        case "ios":
          return "IOS";
        case "H5":
          return "平台H5";
        case "webH5Platform":
          return "微信H5";
        default:
          return "";
      }
    },
    filterplatform(val) {
      return val
        .replace("wxapp", "小程序")
        .replace("android", "安卓")
        .replace("ios", "IOS")
        .replace("H5", "平台H5")
        .replace("webH5Platform", "微信H5");
    },
  },
};
</script>
<style lang="scss" scoped></style>
