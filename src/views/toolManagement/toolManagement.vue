<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="工具名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入渠道"></el-input>
      </el-form-item>

      <el-form-item label="工具类型" prop="type">
        <el-select v-model="queryParams.type">
          <el-option
            v-for="item in categoryList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="平台类型" prop="platform">
        <el-select v-model="queryParams.platform">
          <el-option
            v-for="item in platformList"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleFile"
          v-hasPermi="['toolManagement:toolManagement:add']"
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
          v-hasPermi="['toolManagement:toolManagement:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工具名称" align="left" prop="name" min-width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工具类型" align="left" prop="type" min-width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.type | filtertype }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台类型" align="left" prop="type" min-width="80" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.platform | filterplatform}}</span>
        </template>
      </el-table-column>
      <el-table-column label="工具图片" align="left" prop="type" min-width="70">
        <template slot-scope="scope">
          <el-image
            style="width: 60px; height: 60px"
            :src="scope.row.icon"
            :preview-src-list="[scope.row.icon]"
            v-if="scope.row.icon"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
        align="left"
        prop="sort"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="工具描述"
        align="left"
        prop="description"
        min-width="120"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="应用key"
        align="left"
        prop="apikey"
        min-width="100"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="请求地址"
        align="left"
        prop="apiUrl"
        min-width="100"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="提示词"
        align="left"
        prop="prompt"
        min-width="100"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="提示词描述"
        align="left"
        prop="promptDescriptive"
        min-width="100"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="用户提示词"
        align="left"
        prop="userPrompt"
        min-width="100"
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
            v-hasPermi="['toolManagement:toolManagement:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDeleteFile(scope.row)"
            v-hasPermi="['toolManagement:toolManagement:remove']"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="工具名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="工具类型：" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option
              v-for="item in categoryList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台类型：" prop="platform">
          <el-select v-model="form.platform" multiple style='width:100%'>
            <el-option
              v-for="item in platformList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工具图标：" prop="icon">
          <ImageUpload
            @input="changeImage"
            :limit="1"
            :fileSize="20"
            :value="imageFileList"
          ></ImageUpload>
        </el-form-item>
        <el-form-item label="应用key：" prop="apikey">
          <el-input v-model="form.apikey" placeholder="请输入用key" />
        </el-form-item>
        <el-form-item label="请求地址：" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入请求地址" />
        </el-form-item>
        <el-form-item label="工具描述：" prop="description">
          <el-input v-model="form.description" placeholder="请输入工具描述" />
        </el-form-item>
        <el-form-item label="提示词：" prop="prompt">
          <el-input v-model="form.prompt" placeholder="请输入提示词" />
        </el-form-item>
        <el-form-item label="查询问题：" prop="problem">
          <el-input v-model="form.problem" placeholder="请输入提示词" />
        </el-form-item>
        <el-form-item label="提示词描述：" prop="promptDescriptive">
          <el-input v-model="form.promptDescriptive" placeholder="请输入提示词描述" />
        </el-form-item>
        <el-form-item label="用户提示词：" prop="userPrompt">
          <el-input v-model="form.userPrompt" placeholder="请输入用户提示词" />
        </el-form-item>
        <el-form-item label="小程序appid：" prop="appid">
          <el-input v-model="form.appid" placeholder="请输入小程序appid" />
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
  queryList,
  batchDelete,
  insertOrUpdate,
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
      form: {
        apikey:'fastgpt-MbMdhsnWy5eaqoGulCyxYWAPT5dTAjBSczGqCOk6KwjOok6jNFiSUzp',
        apiUrl:'http://129.204.169.154:3000/api/v1/chat/completions',
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "工具名称不能为空", trigger: "blur" }],
        icon: [{ required: true, message: "工具头像不能为空", trigger: "blur" }],
        platform: [{ required: true, message: "平台类型不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "状态不能为空", trigger: "blur" }],
        apikey: [{ required: true, message: "工具key不能为空", trigger: "blur" }],
        apiUrl: [{ required: true, message: "请求地址不能为空", trigger: "blur" }],
        type: [{ required: true, message: "工具类型不能为空", trigger: "blur" }],
        description: [{ required: true, message: "工具简介不能为空", trigger: "blur" }],
        prompt: [{ required: true, message: "提示词不能为空", trigger: "blur" }],
        problem: [{ required: false, message: "提示词不能为空", trigger: "blur" }],
        promptDescriptive: [{ required: false, message: "提示词描述不能为空", trigger: "blur" }],
        userPrompt: [{ required: false, message: "用户提示词不能为空", trigger: "blur" }],
        appid: [{ required: false, message: "小程序appid不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "排序不能为空", trigger: "blur" }],
      },
      ids: [],
      platformList: [
        {
          name: "小程序",
          value: "wxapp",
        },
        {
          name: "安卓",
          value: "android",
        },
        {
          name: "IOS",
          value: "ios",
        },
        {
          name: "平台H5",
          value: "H5",
        },
        {
          name: "微信H5",
          value: "webH5Platform",
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
    };
  },
  created() {
    this.getList();
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
          return batchDelete(roleIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    cancelFile() {
      this.imageFileList = [];
      this.form = {};
      this.$refs.form.clearValidate()
      this.openFile = false;
    },
    handleUpdateFile(row) {
      this.form = { ...row };
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
      // replace('wxapp','小程序').replace('android','安卓').replace('ios','IOS').replace('H5','平台H5').replace('webH5Platform','微信H5')
      this.form.platform = this.form.platform.split(',')
      this.openFile = true;
    },
    submitFormFile: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log("进来了");
          let query = {
            name: this.form.name,
            icon: this.form.icon,
            platform: this.form.platform.join(','),
            apikey: this.form.apikey,
            apiUrl: this.form.apiUrl,
            type: this.form.type,
            description: this.form.description,
            prompt: this.form.prompt,
            problem: this.form.problem,
            promptDescriptive: this.form.promptDescriptive,
            userPrompt: this.form.userPrompt,
            appid: this.form.appid,
            sort: this.form.sort,
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
        type: query.type,
        platform: query.platform,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
        appid:""
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
      return val.replace('wxapp','小程序').replace('android','安卓').replace('ios','IOS').replace('H5','平台H5').replace('webH5Platform','微信H5')
    },
  },
};
</script>
<style lang="scss" scoped></style>
