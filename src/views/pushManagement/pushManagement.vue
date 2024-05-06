<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="推送名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入推送名称"></el-input>
      </el-form-item>

      <el-form-item label="推送标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入推送标题"></el-input>
      </el-form-item>

      <el-form-item label="厂商平台" prop="platform">
        <el-select v-model="queryParams.platform" multiple>
          <el-option
            v-for="item in platformList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status">
          <el-option label="正常" :value="1"></el-option>
          <el-option label="停用" :value="2"></el-option>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleFile"
          v-hasPermi="['pushManagement:pushManagement:add']"
          >新增</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column label="推送名称" align="left" prop="name" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="推送标题" align="left" prop="title" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="通知内容" align="left" prop="content" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="平台类型"
        align="left"
        prop="type"
        min-width="80"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.platform }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="left"
        prop="type"
        min-width="60"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">{{
            scope.row.status == 1 ? "可用" : "不可用"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始执行时间" align="left" prop="startTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
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
            @click="open(scope.row)"
            v-hasPermi="['pushManagement:pushManagement:edit']"
            >{{ scope.row.status == 1 ? "禁用" : "启用" }}</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdateFile(scope.row)"
            v-hasPermi="['pushManagement:pushManagement:edit']"
            >修改</el-button
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

    <!-- 添加或修改版本 -->
    <el-dialog
      :title="form.id ? '编辑推送' : '新增推送'"
      :visible.sync="openFile"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="推送名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" show-word-limit maxlength='20'/>
        </el-form-item>
        <el-form-item label="推送标题：" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务名称" show-word-limit maxlength='20'/>
        </el-form-item>
        <el-form-item label="通知内容：" prop="content">
          <el-input v-model="form.content" placeholder="请输入通知内容" show-word-limit maxlength='50'/>
        </el-form-item>
        <el-form-item label="平台类型：" prop="platform">
          <el-select v-model="form.platform" multiple style="width: 100%">
            <el-option
              v-for="item in platformList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" :value="1"></el-option>
            <el-option label="停用" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始执行时间：" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择执行时间"
            default-time="12:00:00"
            :picker-options="pickerOptions"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormFile">确 定</el-button>
        <el-button @click="cancelFile">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateStopOrStart, queryList, insertOrUpdate } from "@/api/push/push";

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
        name: [{ required: true, message: "推送名称不能为空", trigger: "blur" }],
        title: [{ required: true, message: "推送标题不能为空", trigger: "blur" }],
        content: [{ required: true, message: "通知内容不能为空", trigger: "blur" }],
        platform: [{ required: true, message: "平台类型不能为空", trigger: ["blur","change"] }],
        status: [{ required: true, message: "状态不能为空", trigger: ["blur","change"] }],
        startTime: [{ required: true, message: "执行时间不能为空", trigger: "blur" }],
      },
      ids: [],
      platformList: [
        {
          value: "huawei",
        },
        {
          value: "xiaomi",
        },
        {
          value: "vivo",
        },
        {
          value: "oppo",
        },
        {
          value: "ios",
        },
        {
          value: "unknown",
        },
      ],
      categoryList: [
        {
          name: "通用",
          value: 0,
        },
        {
          name: "生成图片",
          value: 1,
        },
        {
          name: "写小说",
          value: 2,
        },
        {
          name: "写论文",
          value: 3,
        },
        {
          name: "写代码",
          value: 4,
        },
        {
          name: "运势",
          value: 5,
        },
      ],
      imageFileList: [],
      pickerOptions: {
        disabledDate(time) {
          const now = new Date();
          const nowTime = now.getTime();
          return time.getTime() < nowTime - 86400000;
        },
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    open(row) {
      this.$confirm(row.status == 1 ? "此操作将禁用该推送，是否继续?" : "此操作将启用该推送，是否继续?", '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateStopOrStart({
          id:row.id,
          status:row.status == 1 ? 2 : 1
        }).then((response) => {
          this.$modal.msgSuccess("修改成功");
          this.getList();
        });
      })
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
      this.form.platform = this.form.platform.split(",");
      this.openFile = true;
    },
    submitFormFile: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log("进来了");
          const data = new Date(this.form.startTime)
          const startTime = data.getTime()
          let query = {
            name: this.form.name,
            title: this.form.title,
            content: this.form.content,
            status: this.form.status,
            startTime: startTime || '',
            platform: this.form.platform.join(","),
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
        title: query.title,
        platform:
          this.queryParams.platform && this.queryParams.platform.length
            ? this.queryParams.platform.join(",")
            : "",
        status: query.status,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startTime: query.params.beginTime || "",
        endStartTime: query.params.endTime || "",
      };
      queryList(data).then((response) => {
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
      this.queryParams.name = "";
      this.queryParams.type = "";
      this.queryParams.platform = "";
      this.handleQuery();
    },
  },
  filters: {
    filtertype(val) {
      switch (val) {
        case 0:
          return "通用";
        case 1:
          return "生成图片";
        case 2:
          return "写小说";
        case 3:
          return "写论文";
        case 4:
          return "写代码";
        case 5:
          return "运势";
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
