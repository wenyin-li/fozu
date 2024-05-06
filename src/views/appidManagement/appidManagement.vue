<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="app名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="mpAppid" prop="mpAppid">
        <el-input v-model="queryParams.mpAppid" placeholder="请输入mpAppid"></el-input>
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
          v-hasPermi="['applicationManagement:cate:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5"> </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList" @selection-change="handleSelectionChange">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="app名称" align="left" prop="name" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="appid" align="left" prop="mpAppid" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.mpAppid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源类型" align="left" prop="sourceType" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceType | filterSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="left" prop="createTime" min-width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="left" prop="updateTime" min-width="120">
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
            v-hasPermi="['applicationManagement:cate:edit']"
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
      :title="form.id ? '编辑分类' : '新增分类'"
      :visible.sync="openFile"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="app名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="mpAppid" prop="mpAppid">
          <el-input v-model="form.mpAppid" placeholder="请输入mpAppid"></el-input>
        </el-form-item>
        <el-form-item label="来源类型" prop="sourceType">
          <el-select v-model="form.sourceType" style='width:100%'>
            <el-option
              v-for="item in sourceTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
import {
  queryListCountPageSourceAppid,
  insertOrUpdateCountPageSourceAppid,
} from "@/api/appidManagement/appidManagement";

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
      name: "",
      // 日期范围
      dateRange: [],
      // 数据范围选项
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: "",
        mpAppid: "",
        sourceType: "",
      },
      // 表单参数
      openFile: false,
      form: {
        
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "状态不能为空", trigger: "blur" }],
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
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
      console.log(this.ids, "this.ids");
    },
    cancelFile() {
      this.openFile = false;
      this.form = {};
    },
    handleUpdateFile(row) {
      this.form = { ...row };
      this.openFile = true;
    },
    submitFormFile: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log("进来了");
          let query = {
            name: this.form.name,
            mpAppid: this.form.mpAppid,
            sourceType: this.form.sourceType,
            id: this.form.id,
          };
          insertOrUpdateCountPageSourceAppid(query).then((response) => {
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
        mpAppid: query.mpAppid,
        sourceType: query.sourceType,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
      };
      queryListCountPageSourceAppid(data).then((response) => {
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
      this.queryParams.mpAppid = 1;
      this.queryParams.sourceType = 1;
      this.handleQuery();
    },
  },
  filters: {
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
  }
};
</script>
<style lang="scss" scoped></style>
