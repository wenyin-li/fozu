<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="书籍名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:role:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:role:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:role:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:role:export']"
        >导出</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleFile"
          v-hasPermi="['fozu:fozu:add']"
        >新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdateFile"
          v-hasPermi="['system:role:edit']"
        >修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDeleteFile"
          v-hasPermi="['system:role:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="书籍图片" align="left" prop="incon" min-width="180">
        <template slot-scope="scope">
          <!-- <img :src='scope.row.incon' class='img-icon'></img> -->
          <el-image 
            style="width: 50px; height: 50px"
            :src="scope.row.incon" 
            :preview-src-list="[scope.row.incon]">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="书籍名称" prop="name" :show-overflow-tooltip="true" min-width="180" />
      <el-table-column label="书籍文件" align="left" prop="incon" min-width="180">
        <template slot-scope="scope">
          <el-link :href="`${scope.row.bookUrl}`" :underline="false" target="_blank" v-if='scope.row.bookUrl'>
            <i class='el-icon-tickets' style="font-size:30px;cursor:pointer" ></i>
          </el-link>
          <span v-else>暂未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="音频文件" align="left" prop="incon" min-width="180">
        <template slot-scope="scope">
          <el-link :href="`${scope.row.bookAudioUrl}`" :underline="false" target="_blank" v-if='scope.row.bookAudioUrl'>
            <i class='el-icon-headset' style="font-size:30px;cursor:pointer" ></i>
          </el-link>
          <span v-else>暂未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="left" prop="createTime" min-width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdateFile(scope.row)"
            v-hasPermi="['system:role:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDeleteFile(scope.row)"
            v-hasPermi="['system:role:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改佛经 -->
    <el-dialog title="新增佛祖" :visible.sync="openFile" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="书籍名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入书籍名称" />
        </el-form-item>
        <el-form-item label="书籍图片：" prop="incon">
          <ImageUpload @input='changeImage' :limit='1' :value='imageFileList'></ImageUpload>
        </el-form-item>
        <el-form-item label="书籍文件：" prop='bookUrl'>
          <FileUpload @input='changeFile' :limit='1' :value='textFileList'></FileUpload>
        </el-form-item>
        <el-form-item label="音频文件：" prop='bookAudioUrl'>
          <!-- <input type="file" @change="uploadAudio" accept="audio/*"> -->
          <FileUpload @input='changeAudio' :fileType='fileTypeDoc' :fileSize='50' type='audio' :limit='1'  :value='audioFileList'></FileUpload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormFile">确 定</el-button>
        <el-button @click="cancelFile">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menu"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色数据权限对话框 -->
    <el-dialog :title="title" :visible.sync="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="form.dataScope == 2">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="dept"
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
        <el-button @click="cancelDataScope">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, getRole, delRole, addRole, updateRole, dataScope, changeRoleStatus, deptTreeSelect } from "@/api/system/role";
import { insertOrUpdate,selectSakyamuniBookList,deleteSakyamuniBook } from "@/api/fozu/fozu";
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";
import ImageUpload from "@/components/ImageUpload/index"
import FileUpload from "@/components/FileUpload/index"

export default {
  name: "Role",
  dicts: ['sys_normal_disable'],
  components:{
    ImageUpload,
    FileUpload
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      openFile: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 日期范围
      dateRange: [],
      // 数据范围选项
      dataScopeOptions: [
        {
          value: "1",
          label: "全部数据权限"
        },
        {
          value: "2",
          label: "自定数据权限"
        },
        {
          value: "3",
          label: "本部门数据权限"
        },
        {
          value: "4",
          label: "本部门及以下数据权限"
        },
        {
          value: "5",
          label: "仅本人数据权限"
        }
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "书籍名称不能为空", trigger: "blur" }
        ],
        incon: [
          { required: true, message: "书籍图片不能为空", trigger: "blur" }
        ],
        bookUrl: [
          { required: true, message: "书籍路径不能为空", trigger: "blur" }
        ],
        bookAudioUrl: [
          { required: false, message: "书籍音频路径不能为空", trigger: "blur" }
        ],
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" }
        ],
        roleKey: [
          { required: true, message: "权限字符不能为空", trigger: "blur" }
        ],
        roleSort: [
          { required: true, message: "角色顺序不能为空", trigger: "blur" }
        ]
      },
      fileTypeDoc:['cda','mp3','wav','aif','aiff','mid','wma','ra','vqf','ape'],
      textFileList:[],
      audioFileList:[],
      imageFileList:[],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    changeImage(item){
      console.log(item,'itemmmmmmmmm')
      if(item&&item.length){
        this.form.incon = item[0].url
      }else{
        this.form.incon = ''
      }
    },
    changeFile(item){
      console.log(item,'itemmmmmmmmm')
      if(item&&item.length){
        this.form.bookUrl = item[0].url
      }else{
        this.form.bookUrl = ''
      }
    },
    changeAudio(item){
      console.log(item,'itemmmmmmmmm')
      if(item&&item.length){
        this.form.bookAudioUrl = item[0].url
      }else{
        this.form.bookAudioUrl = ''
      }
    },
    uploadAudio(event) {
      console.log(event,'event')
      const file = event.target.files[0];
      if (!file) {
        console.log('No file selected');
        return;
      }
 
      // 创建一个FileReader对象
      const reader = new FileReader();
 
      // 文件读取成功后执行的回调
      reader.onload = (e) => {
        console.log(e,'eeeeeeee')
        const audioData = e.target.result;
 
        // 在这里执行上传操作，例如使用Axios发送二进制数据
        // 假设你有一个uploadAudioFile的方法来处理上传逻辑
        this.uploadAudioFile(audioData);
      };
 
      // 以二进制形式读取文件
      reader.readAsArrayBuffer(file);
    },
    uploadAudioFile(audioData) {
      // 这里是你的上传逻辑，可以是向后端发送请求等
      // 示例使用Axios
      console.log(audioData,'audioData')
      const formData = new FormData();
      formData.append('audio', new Blob([audioData]), 'filename.wav');
 
      // 使用Axios上传文件
      // axios.post('/upload/audio', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // })
      // .then(response => {
      //   console.log('Audio uploaded successfully', response);
      // })
      // .catch(error => {
      //   console.error('Error uploading audio', error);
      // });
    },
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      let query = this.addDateRange(this.queryParams, this.dateRange)
      console.log(query,'query')
      let data = {
        name:query.name,
        pageNum:query.pageNum,
        pageSize:query.pageSize,
        startCreateTime: query.params.beginTime || '',
        endCreateTime: query.params.endTime || '',
      }
      selectSakyamuniBookList(data).then(response => {
        console.log(response,'response')
          this.roleList = response.data.records;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = response.data;
      });
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.menu.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    // 所有部门节点数据
    getDeptAllCheckedKeys() {
      // 目前被选中的部门节点
      let checkedKeys = this.$refs.dept.getCheckedKeys();
      // 半选中的部门节点
      let halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.menus;
        return response;
      });
    },
    /** 根据角色ID查询部门树结构 */
    getDeptTree(roleId) {
      return deptTreeSelect(roleId).then(response => {
        this.deptOptions = response.depts;
        return response;
      });
    },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.roleName + '"角色吗？').then(function() {
        return changeRoleStatus(row.id, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    // 取消按钮
    cancelFile() {
      this.openFile = false;
      this.resetFile();
    },
    // 表单重置
    resetFile() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.menuExpand = false,
      this.menuNodeAll = false,
      this.deptExpand = true,
      this.deptNodeAll = false,
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: "0",
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {};
      this.resetForm("form");
      this.imageFileList = []
      this.textFileList = []
      this.audioFileList = []
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        let treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      } else if (type == 'dept') {
        let treeList = this.deptOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions: []);
      } else if (type == 'dept') {
        this.$refs.dept.setCheckedNodes(value ? this.deptOptions: []);
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == 'menu') {
        this.form.menuCheckStrictly = value ? true: false;
      } else if (type == 'dept') {
        this.form.deptCheckStrictly = value ? true: false;
      }
    },
    submitFormFile: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id) {
            console.log('进来了')
            let query = {
              name:this.form.name,
              id:this.form.id,
              incon:this.form.incon,
              bookUrl:this.form.bookUrl,
              bookAudioUrl:this.form.bookAudioUrl,
              sort:this.form.sort
            }
            insertOrUpdate(query).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.openFile = false;
              this.getList();
            });
          } else {
            // this.form.menuIds = this.getMenuAllCheckedKeys();
            let query={
              name:this.form.name,
              id:'',
              incon:this.form.incon,
              bookUrl:this.form.bookUrl,
              bookAudioUrl:this.form.bookAudioUrl,
              sort:'',
            }
            insertOrUpdate(query).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.openFile = false;
              this.getList();
            });
          }
        }
      });
    },

    /** 新增 */
    handleFile() {
      this.reset();
      // this.getMenuTreeselect();
      this.openFile = true;
    },
    handleUpdateFile(row) {
      this.reset();
      const roleId = row && row.id ? [row.id] : this.ids
      this.form = {...row}
      
      if(row.incon){
        this.imageFileList = [{
          url:row.incon,
          newFileName:row.name + '.'  + row.incon.split('.')[row.incon.split('.').length-1],
          originalFilename:row.name + '.'  + row.incon.split('.')[row.incon.split('.').length-1],
        }]
      }

      if(row.bookUrl){
        this.textFileList = [{
          url:row.bookUrl,
          newFileName:row.name + '.'  + row.bookUrl.split('.')[row.bookUrl.split('.').length-1],
          originalFilename:row.name + '.'  + row.bookUrl.split('.')[row.bookUrl.split('.').length-1],
        }]
      }

      if(row.bookAudioUrl){
        this.audioFileList = [{
          url:row.bookAudioUrl,
          newFileName:row.name + '.' + row.bookAudioUrl.split('.')[row.bookAudioUrl.split('.').length-1],
          originalFilename:row.name + '.'  + row.bookAudioUrl.split('.')[row.bookAudioUrl.split('.').length-1],
        }]
      }
      this.openFile = true
      console.log(this.imageFileList,this.textFileList,this.audioFileList,'this.audioFileList')
    },
    /** 删除按钮操作 */
    handleDeleteFile(row) {
      const roleIds = row && row.id ? [row.id] : this.ids;
      // this.$modal.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？').then(function() {
      this.$modal.confirm('是否确认删除已选中佛祖的数据项？').then(function() {
        return deleteSakyamuniBook(roleIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getMenuTreeselect();
      this.open = true;
      this.title = "添加角色";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const roleId = row.id || this.ids
      const roleMenu = this.getRoleMenuTreeselect(roleId);
      getRole(roleId).then(response => {
        this.form = response.data;
        this.open = true;
        this.$nextTick(() => {
          roleMenu.then(res => {
            let checkedKeys = res.checkedKeys
            checkedKeys.forEach((v) => {
                this.$nextTick(()=>{
                    this.$refs.menu.setChecked(v, true ,false);
                })
            })
          });
        });
        this.title = "修改角色";
      });
    },
    /** 选择角色权限范围触发 */
    dataScopeSelectChange(value) {
      if(value !== '2') {
        this.$refs.dept.setCheckedKeys([]);
      }
    },
    /** 分配数据权限操作 */
    handleDataScope(row) {
      this.reset();
      const deptTreeSelect = this.getDeptTree(row.id);
      getRole(row.id).then(response => {
        this.form = response.data;
        this.openDataScope = true;
        this.$nextTick(() => {
          deptTreeSelect.then(res => {
            this.$refs.dept.setCheckedKeys(res.checkedKeys);
          });
        });
        this.title = "分配数据权限";
      });
    },
    /** 分配用户操作 */
    handleAuthUser: function(row) {
      const roleId = row.id;
      this.$router.push("/system/role-auth/user/" + roleId);
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.roleId != undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys();
            updateRole(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys();
            addRole(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮（数据权限） */
    submitDataScope: function() {
      if (this.form.roleId != undefined) {
        this.form.deptIds = this.getDeptAllCheckedKeys();
        dataScope(this.form).then(response => {
          this.$modal.msgSuccess("修改成功");
          this.openDataScope = false;
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.id || this.ids;
      this.$modal.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？').then(function() {
        return delRole(roleIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/role/export', {
        ...this.queryParams
      }, `role_${new Date().getTime()}.xlsx`)
    },
  }
};
</script>