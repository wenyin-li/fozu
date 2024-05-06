<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入渠道"></el-input>
      </el-form-item>

      <el-form-item label="应用类型" prop="categoryId">
        <el-select v-model="queryParams.categoryId">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status">
          <el-option label="可用" :value="1"></el-option>
          <el-option label="停用" :value="2"></el-option>
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
          v-hasPermi="['applicationManagement:detection:add']"
          >新增</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDeleteFile"
          v-hasPermi="['applicationManagement:detection:remove']"
          >停用</el-button
        >
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      :data="roleList"
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column label="标题" align="left" prop="name" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="left" prop="name" min-width="100">
        <template slot-scope="scope">
          <el-tag :type='scope.row.status == 1 ? "success" :"danger" '>{{scope.row.status == 1 ? "可用" :"停用"}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
        align="left"
        prop="sort"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="应用简介"
        align="left"
        prop="description"
        min-width="180"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        label="提示词"
        align="left"
        prop="prompt"
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
            v-hasPermi="['applicationManagement:detection:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDeleteFile(scope.row)"
            v-if="scope.row.status == 1"
            v-hasPermi="['applicationManagement:detection:remove']"
            >停用</el-button
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
      :title="form.id ? '编辑应用' : '新增应用'"
      :visible.sync="openFile"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="应用名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="应用头像：" prop="headImg">
          <ImageUpload @input='changeImage' :limit='1' :fileSize='20' :value='imageFileList'></ImageUpload>
        </el-form-item>
        <el-form-item label="应用key：" prop="apikey">
          <el-input v-model="form.apikey" placeholder="请输入用key" />
        </el-form-item>
        <el-form-item label="请求地址：" prop="apiUrl"> 
          <el-input v-model="form.apiUrl" placeholder="请输入请求地址" />
        </el-form-item>
        <el-form-item label="分类：" prop="categoryId">
          <el-select v-model="form.categoryId" style="width:100%">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style='width:100%'>
            <el-option label="可用" :value="1"></el-option>
            <el-option label="停用" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用简介：" prop="description">
          <el-input v-model="form.description" placeholder="请输入应用简介" />
        </el-form-item>
        <el-form-item label="提示词：" prop="prompt">
          <el-input v-model="form.prompt" placeholder="请输入提示词" />
        </el-form-item>

        <el-form-item label="提示词描述：" prop="promptDescriptive">
          <el-input v-model="form.promptDescriptive" placeholder="请输入提示词描述" />
        </el-form-item>

        <el-form-item label="用户提示词：" prop="userPrompt">
          <el-input v-model="form.userPrompt" placeholder="请输入用户提示词" />
        </el-form-item>
 
        <el-form-item prop="userPromptDTOList" v-for="(item, index) in form.userPromptDTOList"  :label="index == 0 ? '用户提示词：' : ''"  :key="index" class="prompt-list" >
            <div style='display:flex'>
              <el-input v-model="item.key" placeholder="用户提示词"  style='width:50%'/>
              <el-input v-model="item.value" placeholder="提示词答案"  style='width:50%;margin-left:20px'/>
              <el-button type='text' :disabled='form.userPromptDTOList.length == 1'  @click='delPromptList(index)'>删除</el-button>
            </div>
            <el-button type='text' v-if="index == form.userPromptDTOList.length-1" @click='addPromptList'>添加</el-button>
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
} from "@/api/applicationManagement/detection";

import {
  queryCateList,
} from "@/api/applicationManagement/cate";

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
        userPromptDTOList:[{key:'',value:''}],
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "应用名称不能为空", trigger: "blur" }],
        headImg: [{ required: true, message: "应用头像不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "状态不能为空", trigger: "blur" }],
        apikey: [{ required: true, message: "应用key不能为空", trigger: "blur" }],
        apiUrl: [{ required: true, message: "请求地址不能为空", trigger: "blur" }],
        categoryId: [{ required: false, message: "分类不能为空", trigger: "blur" }],
        description: [{ required: true, message: "应用简介不能为空", trigger: "blur" }],
        prompt: [{ required: true, message: "提示词不能为空", trigger: "blur" }],
        sort: [{ required: false, message: "排序不能为空", trigger: "blur" }],
      },
      ids: [],
      categoryList:[],
      imageFileList:[],
    };
  },
  created() {
    this.getList();
    this.queryCateList();
  },
  methods: {
    addPromptList(){
      this.form.userPromptDTOList.push({
        key:'',
        value:''
      })
    },
    delPromptList(index){
      if(this.form.userPromptDTOList.length==1){
        return
      }
      this.form.userPromptDTOList.splice(index,1)
    },
    changeImage(item){
      console.log(item,'itemmmmmmmmm')
      if(item&&item.length){
        this.form.headImg = item[0].url
      }else{
        this.form.headImg = ''
      }
    },
    /** 查询分类列表 */
    queryCateList() {
      let data = {
        name: '',
        pageNum: 1,
        pageSize: 50,
        startCreateTime:  null,
        endCreateTime:  null,
      };
      queryCateList(data).then((response) => {
        if (response.data && response.data.records) {
          this.categoryList = response.data.records;
        }
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.multiple = !selection.length;
      console.log(this.ids, "this.ids");
    },
    /** 停用按钮操作 */
    handleDeleteFile(row) {
      const roleIds = row && row.id ? [row.id] : this.ids;
      this.$modal
        .confirm("是否确认停用已选中分类的数据项？")
        .then(function () {
          return batchDelete(roleIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("停用成功");
        })
        .catch(() => {});
    },
    cancelFile() {
      this.imageFileList = []
      this.form = {
        userPromptDTOList:[{key:'',value:""}]
      };
      this.$refs.form.clearValidate()
      this.openFile = false;
    },
    handleUpdateFile(row) {
      this.form = { ...row };
      if(!this.form.userPromptDTOList){
        this.form.userPromptDTOList = [{key:"",value:""}]
      }
      if(row.headImg){
        this.imageFileList = [{
          url:row.headImg,
          newFileName:row.name + '.'  + row.headImg.split('.')[row.headImg.split('.').length-1],
          originalFilename:row.name + '.'  + row.headImg.split('.')[row.headImg.split('.').length-1],
        }]
      }
      this.openFile = true;
    },
    submitFormFile: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log("进来了");
          for(let i in this.form.userPromptDTOList){
            if((!this.form.userPromptDTOList[i].key && this.form.userPromptDTOList[i].value) || (this.form.userPromptDTOList[i].key && !this.form.userPromptDTOList[i].value)){
              this.$message.info('用户提示词必须同时存在问题跟答案')
              return
            }
          }
          let query = {
            name: this.form.name,
            headImg: this.form.headImg,
            apikey: this.form.apikey,
            apiUrl: this.form.apiUrl,
            categoryId: this.form.categoryId,
            status: this.form.status,
            description: this.form.description,
            prompt: this.form.prompt,
            promptDescriptive: this.form.promptDescriptive,
            userPromptDTOList: this.form.userPromptDTOList,
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
        categoryId: query.categoryId,
        status: query.status,
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        startCreateTime: query.params.beginTime || "",
        endCreateTime: query.params.endTime || "",
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
      this.queryParams.categoryId = "";
      this.queryParams.status = 1;
      this.handleQuery();
    },
  },
};
</script>
<style lang="scss" scoped></style>
