<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="类型名称" prop="name">
        <el-input v-model='queryParams.name' placeholder='请输入类型名称'></el-input>
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
          v-hasPermi="['channel:channelType:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList">
      <el-table-column label="渠道名称" align="left" prop="name" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" prop="remark" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
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
            v-hasPermi="['channel:channelType:edit']"
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
    <el-dialog :title="form.id ? '编辑渠道类型': '新增渠道类型'" :visible.sync="openFile" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="渠道名称：" prop="name">
          <el-input  v-model="form.name" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input  v-model="form.remark" placeholder="请输入备注" />
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
import { insertOrUpChannelType,selectChannelType } from "@/api/channel/channel";

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
        name: '',
      },
      // 表单参数
      openFile:false,
      form: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: "渠道名称不能为空", trigger: "blur" }],
        remark: [{ required: false, message: "状态不能为空", trigger: "blur" }],
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
            name:this.form.name,
            remark:this.form.remark,
            id:this.form.id,
          }
          insertOrUpChannelType(query).then(response => {
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
    /** 查询渠道类型 */
    getList() {
      let query = this.addDateRange(this.queryParams, this.dateRange);
      console.log(query, "query");
      let data = {
        name: query.name,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
      };
      selectChannelType(data).then((response) => {
        console.log(response, "response");
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
      this.queryParams.name = ''
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
