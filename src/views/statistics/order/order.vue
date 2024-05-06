<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="渠道" prop="name">
        <el-input v-model='queryParams.channel' placeholder="请输入渠道"></el-input>
      </el-form-item>
      <el-form-item label="来源类型" prop="name">
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
      <el-form-item label="统计时间">
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
      <el-table-column label="来源类型" align="left" prop="createTime" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.sourceType | filterSourceType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="渠道" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计时间" align="left" prop="createTime" min-width="100">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.countTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="提交订单数"
        prop="submitNumber"
        :show-overflow-tooltip="true"
        min-width="80"
      />
      <el-table-column
        label="订单人数（去重）"
        prop="userNumber"
        :show-overflow-tooltip="true"
        min-width="80"
      />
      <el-table-column
        label="提交订单金额"
        prop="submitMoney"
        :show-overflow-tooltip="true"
        min-width="80"
      />
      <el-table-column
        label="支付订单数"
        prop="payNumber"
        :show-overflow-tooltip="true"
        min-width="80"
      />
      <el-table-column
        label="支付订单人数（去重）"
        prop="payUserNumber"
        :show-overflow-tooltip="true"
        min-width="80"
      />
      <el-table-column
        label="支付率%"
        prop="payRatio"
        :show-overflow-tooltip="true"
        min-width="80"
      />
      <el-table-column
        label="支付订单金额"
        prop="payMoney"
        :show-overflow-tooltip="true"
        min-width="80"
      />
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
import { queryListCountOrderData } from "@/api/statistics/order";

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
        channel: '',
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "书籍名称不能为空", trigger: "blur" }],
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
    /** 查询角色列表 */
    getList() {
      let query = this.addDateRange(this.queryParams, this.dateRange);
      console.log(query, "query");
      let data = {
        sourceType: query.sourceType ? query.sourceType : null,
        channel: query.channel,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCountTime: query.params.beginTime || "",
        endCountTime: query.params.endTime || "",
      };
      queryListCountOrderData(data).then((response) => {
        console.log(response, "response");
        this.roleList = response.data.records;
        this.total = response.data.total;
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
      this.queryParams.channel = ''
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss" scoped></style>
