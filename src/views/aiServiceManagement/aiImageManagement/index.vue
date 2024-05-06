<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="创意输入" prop="inDescribe">
        <el-input v-model="queryParams.inDescribe" placeholder="请输入创意"></el-input>
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
            label="正常"
            :value="1"
          ></el-option>
          <el-option
            label="已删除"
            :value="2"
          ></el-option>
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-table :data="roleList">
      <el-table-column label="创意输出" align="left" prop="inDescribe" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.inDescribe }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创作方式" align="left" prop="model" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.model == 1 ? '文字创作' : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片路径" align="left" prop="url" min-width="80">
        <template slot-scope="scope">
          <el-image
            style="width: 60px; height: 60px"
            :src="scope.row.url"
            :preview-src-list="[scope.row.url]"
            v-if="scope.row.url"
          >
          </el-image>
        </template>
      </el-table-column>
      <!-- <el-table-column label="openai图片路径" align="left" prop="openaiUrl" min-width="80">
        <template slot-scope="scope">
          <el-image
            style="width: 60px; height: 60px"
            :src="scope.row.openaiUrl"
            :preview-src-list="[scope.row.openaiUrl]"
            v-if="scope.row.openaiUrl"
          >
          </el-image>
        </template>
      </el-table-column> -->
      <el-table-column label="尺寸" align="left" prop="dimensions" min-width="80">
        <template slot-scope="scope">
          <span>{{scope.row.dimensions | filterdimensions}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="left" prop="status" min-width="60">
        <template slot-scope="scope">
          <span>{{scope.row.status == 1 ? '正常' : '已删除' }}</span>
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
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {
  queryAdminImageRecordList
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
        apikey:'fastgpt-MbMdhsnWy5eaqoGulCyxYWAPT5dTAjBSczGqCOk6KwjOok6jNFiSUzp',
        apiUrl:'http://129.204.169.154:3000/api/v1/chat/completions',
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
      platformList: [
        {
          name: "小程序",
          value: "wxapp",
        },
        {
          name: "安卓",
          value: "android",
        },
        {
          name: "IOS",
          value: "ios",
        },
        {
          name: "平台H5",
          value: "H5",
        },
        {
          name: "微信H5",
          value: "webH5Platform",
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
      this.form = { ...row };
      if (row.icon) {
        this.imageFileList = [
          {
            url: row.icon,
            newFileName:
              row.name + "." + row.icon.split(".")[row.icon.split(".").length - 1],
            originalFilename:
              row.name + "." + row.icon.split(".")[row.icon.split(".").length - 1],
          },
        ];
      }
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
        inDescribe: query.inDescribe,
        dimensions: query.dimensions,
        status: query.status,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        userId:''
      };
      queryAdminImageRecordList(data).then((response) => {
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
      this.queryParams.inDescribe = "";
      this.queryParams.dimensions = "";
      this.queryParams.status = "";
      this.handleQuery();
    },
  },
  filters: {
    filterdimensions(val) {
      switch (val) {
        case 1:
          return "1:1";
        case 2:
          return "9:16";
        case 3:
          return "16:9";
        case 4:
          return "3:4";
        case 5:
          return "4:3";
        default:
          return "";
      }
    },
    filterplatform(val) {
      return val.replace('wxapp','小程序').replace('android','安卓').replace('ios','IOS').replace('H5','平台H5').replace('webH5Platform','微信H5')
    },
  },
};
</script>
<style lang="scss" scoped></style>
