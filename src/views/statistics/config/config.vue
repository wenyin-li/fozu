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
      <el-form-item label="渠道" prop="channel">
        <el-input v-model="queryParams.channel" placeholder="请输入渠道"></el-input>
      </el-form-item>
      <el-form-item label="统计类型" prop="countTypeName">
        <el-select v-model="queryParams.countTypeName" placeholder="请选择" style="width: 100%">
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
      <!-- <el-form-item label="所属app" prop="sourceAppidId">
        <el-select v-model="queryParams.sourceAppidId" placeholder="请选择">
          <el-option
            v-for="item in allPageAppid"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item> -->
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

    <!-- <el-row :gutter="10" class="mb8">
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
    </el-row> -->

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
      <el-table-column label="统计类型" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.countTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源类型" align="left" prop="createTime" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceType | filterSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="渠道"
        prop="channel"
        :show-overflow-tooltip="true"
        min-width="100"
      />
      <el-table-column label="统计时间" align="left" prop="updateTime" min-width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.countTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="pv数量"
        prop="pvNumber"
        :show-overflow-tooltip="true"
        min-width="100"
      />
      <el-table-column
        label="uv数量"
        prop="uvNumber"
        :show-overflow-tooltip="true"
        min-width="100"
      />
      <el-table-column
        label="平均访问时长"
        align="left"
        prop="updateTime"
        min-width="80"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.avgVisitTime) }}</span>
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
import { queryListCountPageData,selectAllCountPageType } from "@/api/statistics/page";
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
        channel: "",
        title: "",
        url: "",
        // sourceAppidId: "",
      },
      // 表单参数
      openFile: false,
      form: {},
      // 表单校验
      allCountList:[],
      allPageAppid:[],
    };
  },
  created() {
    this.getList();
    this.getListAllCountPageAppid()
    this.selectAllCountPageType()
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
        sourceType: query.sourceType ? query.sourceType : null,
        countTypeName: query.countTypeName,
        // sourceAppidId: query.sourceAppidId,
        title: query.title,
        url: query.url,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCountTime: query.params.beginTime || null,
        endCountTime: query.params.endTime || null,
      };
      queryListCountPageData(data).then((response) => {
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
      this.queryParams.channel = "";
      this.queryParams.title = "";
      this.queryParams.url = "";
      // this.queryParams.sourceAppidId = "";
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
