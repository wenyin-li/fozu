<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="版本号" prop="version">
        <el-input v-model='queryParams.version' placeholder='请输入'></el-input>
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
          v-hasPermi="['version:version:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList">
      <el-table-column
        label="版本号"
        prop="version"
        :show-overflow-tooltip="true"
        min-width="100"
      />
      <el-table-column label="来源类型" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceType | filterSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <el-tag :type='scope.row.status == 1 ? "info" : "success"'>{{ scope.row.status == 1 ? "审核中" : "审核成功" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="left" prop="createTime" min-width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="left" prop="updateTime" min-width="120">
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
            v-hasPermi="['version:version:edit']"
          >修改</el-button>
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
    <el-dialog :title="form.id ? '编辑审核版本': '新增审核版本'" :visible.sync="openFile" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="版本号：" prop="version">
          <span v-if="form.id ">{{form.version}}</span>
          <el-input v-else v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="来源类型：" prop="sourceType">
          <span v-if="form.id ">{{form.sourceType | filterSourceType}}</span>
          <el-select v-else v-model="form.sourceType" placeholder="请选择" style='width:100%'>
            <el-option
              v-for="item in sourceTypeList"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="status">
            <el-radio-group v-model="form.status">
                <el-radio :label="1">审核中</el-radio>
                <el-radio :label="2">审核通过</el-radio>
            </el-radio-group>
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
import { queryListAppVersion,insertOrUpAppVersion } from "@/api/version/version";

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
        version: '',
      },
      // 表单参数
      openFile:false,
      form: {},
      // 表单校验
      rules: {
        version: [{ required: true, message: "版本号不能为空", trigger: "blur" }],
        sourceType: [{ required: true, message: "来源类型不能为空", trigger: "blur" }],
        status: [{ required: true, message: "状态不能为空", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
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
  methods: {
    cancelFile(){
      this.openFile = false;
      this.form = {}
    },
    handleUpdateFile(row){
      this.form = {...row}
      this.openFile = true;
    },
    submitFormFile: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log('进来了')
          let query = {
            version:this.form.version,
            id:this.form.id,
            sourceType:this.form.sourceType,
            status:this.form.status
          }
          insertOrUpAppVersion(query).then(response => {
            if(this.form.id){
              this.$modal.msgSuccess("修改成功");
            }else{
              this.$modal.msgSuccess("新增成功");
            }
            this.cancelFile()
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
      this.loading = true;
      let query = this.addDateRange(this.queryParams, this.dateRange);
      console.log(query, "query");
      let data = {
        sourceType: query.sourceType ? query.sourceType : null,
        version: query.version,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
      };
      queryListAppVersion(data).then((response) => {
        console.log(response, "response");
        this.loading = false;
        if(response.data && response.data.records){
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
      this.queryParams.sourceType = null
      this.queryParams.version = ''
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
