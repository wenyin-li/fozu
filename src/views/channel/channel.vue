<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="渠道" prop="channel">
        <el-input v-model="queryParams.channel" placeholder="请输入渠道"></el-input>
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
          v-hasPermi="['channel:channel:add']"
          >新增</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList">
      <el-table-column label="渠道名称" align="left" prop="channel" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="left" prop="sort" min-width="100"></el-table-column>
      <el-table-column label="渠道平台" align="left" prop="platform" min-width="100"></el-table-column>
      <el-table-column label="渠道描述" align="left" prop="channelDesc" min-width="100"></el-table-column>
      <el-table-column label="重定向路径" align="left" prop="redirectUrl" min-width="100"></el-table-column>
      <el-table-column label="短链" align="left" prop="shortUrl" min-width="100"></el-table-column>
      <el-table-column label="渠道类型名称" align="left" prop="channelTypeName" min-width="100"></el-table-column>
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
            v-hasPermi="['channel:channel:edit']"
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
      :title="form.id ? '编辑渠道类型' : '新增渠道类型'"
      :visible.sync="openFile"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="渠道名称：" prop="channel">
          <span v-if="form.id">{{form.channel}}</span>
          <el-input v-else v-model="form.channel" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="排序：" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="渠道描述：" prop="channelDesc">
          <el-input v-model="form.channelDesc" placeholder="请输入渠道描述" />
        </el-form-item>
        <el-form-item label="重定向路径：" prop="redirectUrl">
          <el-input v-model="form.redirectUrl" placeholder="请输入重定向路径" />
        </el-form-item>
        <el-form-item label="短链：" prop="shortUrl">
          <el-input v-model="form.shortUrl" placeholder="请输入短链" />
        </el-form-item>
        <el-form-item label="渠道类型：" prop="shortUrl">
          <span v-if="form.id">{{form.channelTypeName}}</span>
          <el-select v-else v-model="form.channelTypeId" style='width:100%'>
            <el-option
              v-for="item in channelTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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
import { insertOrUpChannel, selectChannel,selectChannelType } from "@/api/channel/channel";

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
        name: "",
      },
      // 表单参数
      openFile: false,
      form: {},
      // 表单校验
      rules: {
        channel: [{ required: true, message: "渠道名称不能为空", trigger: "blur" }],
        remark: [{ required: false, message: "状态不能为空", trigger: "blur" }],
      },
      channelTypeList:[]
    };
  },
  created() {
    this.getList();
    this.selectChannelType();
  },
  methods: {
    /** 查询角色列表 */
    selectChannelType() {
      let data = {
        name: '',
        pageNum: 1,
        pageSize: 50,
        startCreateTime:  "",
        endCreateTime:  "",
      };
      selectChannelType(data).then((response) => {
        if(response.data && response.data.records){
            this.channelTypeList = response.data.records;
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
            channel: this.form.channel,
            sort: this.form.sort,
            id: this.form.id,
            channelDesc: this.form.channelDesc,
            redirectUrl: this.form.redirectUrl,
            shortUrl: this.form.shortUrl,
            channelTypeId: this.form.channelTypeId,
          };
          insertOrUpChannel(query).then((response) => {
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
        channel: query.channel,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
      };
      selectChannel(data).then((response) => {
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
      this.queryParams.channel = "";
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss" scoped></style>
