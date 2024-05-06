<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="工具类型" prop="toolId">
        <el-select v-model="queryParams.toolId">
          <el-option
            v-for="item in toolNameListAll"
            :key="item.id"
            :label="item.name"
            :value="item.id"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleFile"
          v-hasPermi="['tipsManagement:tipsManagement:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDeleteFile"
          v-hasPermi="['tipsManagement:tipsManagement:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工具名称" align="left" prop="toolName" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.toolName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
        align="left"
        prop="sort"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="提示内容"
        align="left"
        prop="context"
        min-width="120"
        :show-overflow-tooltip="true"
      ></el-table-column>
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
            @click="handleUpdateFile(scope.row)"
            v-hasPermi="['tipsManagement:tipsManagement:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDeleteFile(scope.row)"
            v-hasPermi="['tipsManagement:tipsManagement:remove']"
            >删除</el-button
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
      :title="form.id ? '编辑工具' : '新增工具'"
      :visible.sync="openFile"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="工具类型：" prop="toolId">
          <el-select v-model="form.toolId" style='width:100%'>
            <el-option
              v-for="item in toolNameListAll"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提示内容：" prop="context">
          <el-input v-model="form.context" placeholder="提示内容" />
        </el-form-item>
        <el-form-item label="排序：" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
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
  queryToolTipsList,
  batchDeleteToolTips,
  insertToolTipsOrUpdate,
  queryToolNameListAll,
} from "@/api/toolManagement/toolManagement";

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
      form: {},
      // 表单校验
      rules: {
        toolId: [{ required: true, message: "工具不能为空", trigger: "blur" }],
        context: [{ required: true, message: "提示内容不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "状态不能为空", trigger: "blur" }],
      },
      ids: [],
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
      toolNameListAll: [],
    };
  },
  created() {
    this.getList();
    this.queryToolNameList();
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
          return batchDeleteToolTips(roleIds);
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
      for(let i in this.toolNameListAll){
        if(this.toolNameListAll[i].name == this.form.toolName){
            this.form.toolId = this.toolNameListAll[i].id
        }
      }
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
            toolId:this.form.toolId,
            context:this.form.context,
            sort: this.form.sort,
            id: this.form.id,
          };
          insertToolTipsOrUpdate(query).then((response) => {
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
        toolId: query.toolId,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
      };
      queryToolTipsList(data).then((response) => {
        console.log(response, "response");
        if (response.data && response.data.records) {
          this.roleList = response.data.records;
          this.total = response.data.total;
        }
      });
    },
    queryToolNameList() {
      queryToolNameListAll({}).then((response) => {
        console.log(response, "responsevresponse");
        if (response.data) {
          this.toolNameListAll = response.data;
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
      this.queryParams.toolId = "";
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
  },
};
</script>
<style lang="scss" scoped></style>
