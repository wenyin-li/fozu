<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号"></el-input>
      </el-form-item>
      <el-form-item label="交易号" prop="tradeNo">
        <el-input v-model="queryParams.tradeNo" placeholder="请输入订单号"></el-input>
      </el-form-item>
      <el-form-item label="订单商品类型" prop="type">
        <el-select v-model="queryParams.type">
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.name"
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
      <el-table-column label="商品名称" align="left" prop="name" min-width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="left" prop="orderNo" min-width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易号" align="left" prop="tradeNo" min-width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.tradeNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单商品类型" align="left" prop="type" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.type | filtertType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际支付金额" align="left" prop="payMoney" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.payMoney }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="left" prop="price" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠金额" align="left" prop="discountAmount" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.discountAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="left" prop="discountAmount" min-width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status == 0 ? 'info' : 'success'">{{scope.row.status == 0 ? '待支付' : '已支付'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付类型" align="left" prop="payType" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.payType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="left" prop="payTime" width="120">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.payTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" fixed="right" width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
            v-hasPermi="['order:order:edit']"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单详情 -->
    <el-dialog
      title="订单详情"
      :visible.sync="openFile"
      width="700px"
      append-to-body
      style="border-radius:8px"
      custom-class="dialog"
    >
      <div class='detail-info'>
        <el-row :gutter="40">
          <el-col :span="12" style='margin-bottom:10px'>
            <span>商品名称：</span>
            <span style="color:#000">{{detailInfo.name}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>订单类型：</span>
            <span style="color:#000">{{detailInfo.type == 1 ? '小说' : detailInfo.type == 2 ? '论文' : '金币充值'}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>订单号：</span>
            <span style="color:#000">{{detailInfo.orderNo}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>交易号：</span>
            <span style="color:#000">{{detailInfo.tradeNo}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>实际支付金额：</span>
            <span style="color:#000">{{detailInfo.payMoney}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>价格：</span>
            <span style="color:#000">{{detailInfo.price}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>订单状态：</span>
            <span style="color:#000">{{detailInfo.status == 0 ? '待支付' : '支付成功'}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>交易类型：</span>
            <span style="color:#000">{{detailInfo.tradeType == 0 ? '待支付' : '支付成功'}}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>下单时间：</span>
            <span style="color:#000">{{ parseTime(detailInfo.createTime) }}</span>
          </el-col>
          <el-col :span="12" style='margin-bottom:10px'>
            <span>修改时间：</span>
            <span style="color:#000">{{ parseTime(detailInfo.updateTime) }}</span>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="openFile=false">关闭</el-button>
      </div>
    </el-dialog>

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
import { orderAdminList, orderAdminDetail } from "@/api/order/order";

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
      form: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: "渠道名称不能为空", trigger: "blur" }],
        remark: [{ required: false, message: "状态不能为空", trigger: "blur" }],
      },
      typeList:[
        {name:'小说',value:1},
        {name:'论文',value:2},
        {name:'金币充值',value:3},
      ],
      detailInfo:{},
      openFile:false
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
    filtertType(val) {
      switch (val) {
        case 1:
          return "小说";
        case 2:
          return "论文";
        case 3:
          return "金币充值";
        default:
          return "其他";
      }
    },
  },
  methods: {
    handleDetail(row){
      this.detailInfo = row
      this.openFile = true
    },
    /** 查询渠道类型 */
    getList() {
      let query = this.addDateRange(this.queryParams, this.dateRange);
      console.log(query, "query");
      let data = {
        orderNo: query.orderNo,
        tradeNo: query.tradeNo,
        type: query.type,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
      };
      orderAdminList(data).then((response) => {
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
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss">
.dialog{
  border-radius: 8px;
  margin-bottom: 0;
  margin-top: 4vh !important;
  .el-dialog__header {
    padding-top: 14px;
  }
  .el-dialog__body {
  }
}
</style>
