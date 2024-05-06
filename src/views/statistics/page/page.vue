<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="页面或按钮标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入页面或按钮标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="页面或按钮地址" prop="url">
        <el-input v-model="queryParams.url" placeholder="请输入页面或按钮地址"></el-input>
      </el-form-item>
      <el-form-item label="统计类型" prop="typeId">
        <el-select v-model="queryParams.typeId" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in allCountList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="来源类型" prop="sourceType">
        <el-select v-model="queryParams.sourceType" placeholder="请选择">
          <el-option
            v-for="item in sourceTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属app" prop="sourceAppidId">
        <el-select v-model="queryParams.sourceAppidId" placeholder="请选择">
          <el-option
            v-for="item in allPageAppid"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
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
          v-hasPermi="['statistics:page:add']"
          >新增</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList">
      <el-table-column
        label="页面或按钮标题"
        prop="title"
        :show-overflow-tooltip="true"
        min-width="100"
      />
      <el-table-column
        label="页面或按钮地址"
        prop="url"
        :show-overflow-tooltip="true"
        min-width="140"
      />
      <el-table-column
        label="统计类型名称"
        prop="typeName"
        :show-overflow-tooltip="true"
        min-width="100"
      />
      <el-table-column
        label="关联id"
        prop="elementId"
        :show-overflow-tooltip="true"
        min-width="120"
      />
      <el-table-column label="来源类型" align="left" prop="sourceType" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceType | filterSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="left" prop="updateTime" min-width="100">
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
            v-hasPermi="['statistics:page:edit']"
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
      :title="form.id ? '编辑审核版本' : '新增审核版本'"
      :visible.sync="openFile"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="统计类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allCountList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源类型" prop="sourceType">
          <el-select v-model="form.sourceType" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in sourceTypeList"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="页面或按钮标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入页面或按钮标题" />
        </el-form-item>
        <el-form-item label="页面或按钮地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入页面或按钮地址" />
        </el-form-item>
        <el-form-item label="关联id" prop="elementId">
          <el-input v-model="form.elementId" placeholder="请输入关联id" />
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
  queryListCountPageConfig,
  insertOrUpCountPageConfig,
  selectAllCountPageType,
} from "@/api/statistics/page";
import { getListAllCountPageSourceAppid } from "@/api/appidManagement/appidManagement";

export default {
  name: "Role",
  dicts: ["sys_normal_disable"],
  components: {},
  data() {
    return {
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
      value: "",
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
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
        sourceType: null,
        sourceAppidId: "",
        typeId: "",
        title: "",
        url: "",
      },
      // 表单参数
      openFile: false,
      form: {},
      // 表单校验
      rules: {
        title: [{ required: true, message: "页面或按钮标题不能为空", trigger: "blur" }],
        url: [{ required: false, message: "页面或按钮地支不能为空", trigger: "blur" }],
        sourceType: [{ required: true, message: "来源类型不能为空", trigger: "blur" }],
        elementId: [{ required: false, message: "关联id不能为空", trigger: "blur" }],
        typeId: [{ required: true, message: "统计类型不能为空", trigger: "blur" }],
      },
      allCountList: [], //统计类型
      allPageAppid: [], //程序列表
    };
  },
  created() {
    this.getList();
    this.selectAllCountPageType();
    this.getListAllCountPageAppid()
  },
  methods: {
    getListAllCountPageAppid(){
      getListAllCountPageSourceAppid({}).then((response) => {
        console.log(response, "response");
        if (response.data && response.data.length) {
          this.allPageAppid = response.data;
        }
      });
    },
    selectAllCountPageType() {
      selectAllCountPageType({}).then((response) => {
        console.log(response, "response");
        if (response.data && response.data.length) {
          this.allCountList = response.data;
        }
      });
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
            title: this.form.title,
            url: this.form.url,
            id: this.form.id,
            elementId: this.form.elementId,
            typeId: this.form.typeId,
            sourceType: this.form.sourceType,
          };
          insertOrUpCountPageConfig(query).then((response) => {
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
        sourceType: query.sourceType ? query.sourceType : null,
        typeId: query.typeId,
        sourceAppidId: query.sourceAppidId,
        title: query.title,
        url: query.url,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || null,
        endCreateTime: query.params.endTime || null,
      };
      queryListCountPageConfig(data).then((response) => {
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
      this.queryParams.sourceType = null;
      this.queryParams.typeId = "";
      this.queryParams.sourceAppidId = "";
      this.queryParams.title = "";
      this.queryParams.url = "";
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
  },
};
</script>
<style lang="scss" scoped></style>
