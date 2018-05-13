class indexDB {
    constructor(props) {
        this.indexDB = {
            name: props.name,   //DB name
            version: this._getLocalStroage() || props.version || 1, //版本号
            indexDBSupport: false,  //indexDB 支持度校验
            indexDBTables : props.table || [], //需要新建的表
            indexDBActive : false, // 是否打开
            jurisdictionv : {
                readonly:'readonly',
                readwrite:'readwrite'
            }
        };
        return this._init();
    }
    /**
     * 初始化执行操作
     * @param null
     * */
    _init(){
        console.log(1,' init');
        //创建数据库
        this._openDatabase((e)=>{
            //初始化表
            this._createTable(e,this._getValue('indexDBTables'));
        })
        return {
            createTable: (table)=>{
                this._openDatabase((e)=>{
                    this._createTable(e,table);
                })
            },
            insert:(tableName,data)=>{
                this._insert(tableName,data);
            }
        }
    }
    /**
     * 获取参数
     * @paranm {string} name
     * */
    _getValue (name) {
        if(!name){
            console.log('name connot undefined');
            return;
        }
        return this.indexDB[name.toString()];
    }

    /**
     * 设置参数
     * @param {string} name
     * @param {string | boolean | number} value
     * */
    _setValue (name,value){
        if(!name ){
            console.log('name connot undefined');
            return;
        }
        this.indexDB[name.toString()] = value;
    }
    /**
     * localstroage存储version
     * @param null
     * */
    _setLocalStroage (){
        localStorage.setItem('indexDBversion',this._getValue('version'));
    }
    /**
     * 获取version
     * @param null
     * */
    _getLocalStroage (){
        return localStorage.getItem('indexDBversion');
    }
    /**
     * 获取indexDB的支持度
     * @param null
     * */
    _getIndexDB(){
        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            // ,IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
            // ,IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        if(indexedDB){
            this.indexDB.indexDBSupport = true;
        }
        if (!indexedDB) {
            window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
        }
        return indexedDB;
    }
    /**
     * 新版本打开database
     * @param {function} callback 回调函数
     * */
    _openDatabase(callback){
        this._createDatabase(this._getValue('name'),this._getValue('version'),(e)=>{
            //存储成功当前版本
            this._setLocalStroage();
            this._setValue('version',(this._getValue('version') + 1));
            typeof callback === 'function' ? callback(e) :'';
        });
    }
    /**
     * 创建database
     * @param {string} name : database name
     * @param {number} version : database vsersion
     * @param {function} callback : success callback
     * */
    _createDatabase (name,version,callback) {
        let indexedDB = this._getIndexDB();
        // 创建 DB
        let req = indexedDB.open(name,version); //名字 版本号
        console.log(version);

        // 成功回调
        req.onsuccess = (e)=> {
            this._DB = e.target.result;
            this._setValue('indexDBActive',true);//数据打开
            //关闭回调
            this._DB.onclose = (e)=>{
            }
            // 错误回调
            this._DB.onerror = (e)=>{
                this._DBCLose(e);
            }
            //关于
            this._DB.onabort = (e)=>{
                this._DBOnabout(e);
            }
            //版本变化回调
            this._DB.onversionchange = (e) =>{
                this._DBOnversionchange(e);
            }
            console.log(3,'indexDB onsuccess')
        }
        // 失败回调
        req.onerror = (e)=> {
            console.log(1,e.target.errorCode)
        }

        // 版本改变时候的 回调
        req.onupgradeneeded = (e)=> {
            console.log(1,'indexDB.onupgradeneeded');
            typeof  callback === 'function'? callback(e):'';
        }
    };
    /**
     * 数据版本变更
     * @param e
     * */
    _DBOnversionchange(e){
        this._DB.close();
        //删除引用
        // delete this._DB;
        this._setValue('indexDBActive',false);
        console.log("A new version of this page is ready. Please reload!");
    }
    /**
     * DB about
     * @param e
     * */
    _DBOnabout(e){

    }
    /**
     * DB close
     * @param e
     * */
    _DBCLose(e){

    }
    /**
     * 创建表
     * @param {object} _createTablee : database change result
     * @param {array} table : create table info
     * */
    _createTable(e,table){
        for(let i =0,len = table.length;i<len;i++){
            let _name = table[i].name,
                _keyPath = table[i].id && table[i].id.name || 'id',
                _autoIncrement = table[i].id && table[i].id.autoIncrement || true;
            let store = this._creatrTablestore(e,_name,_keyPath,_autoIncrement);
            this._createTableIndex(store,table[i].index || []);
        }
    }
    /**
     * 创建 table store
     * @param {object} e
     * @param {string} name : store name
     * @param {string} keypath :  主键
     * @param {boolean} autoIncrement : 主键是否自动增长
     * */
    _creatrTablestore(e,name,keyPath,autoIncrement){
        //对象存储控件 表
        let store = e.currentTarget.result.createObjectStore(
            name,{keyPath:keyPath,autoIncrement:autoIncrement}
        );
        return store;
    }

    /**
     * 创建表索引
     * @param {object} store : 表
     * @param {array} index : 所应详细
     * */
    _createTableIndex(store,index){
        // console.log('index create');
        for(let j = 0,len = index.length;j<len;j++){
            let _name = index[j].name,
                _nameIndex = index[j].nameIndex || _name,
                _unique = index[j].unique || false;
            store.createIndex(_name,_nameIndex,{unique:_unique});
        }
    }
    /**
     * 创建操作事务
     * @param {string} tableName : 打开的table
     * @param {string} Jurisdictionv : 操作权限 读写：readwrite readonly：只读
     * */
    _createTransaction(tableName,Jurisdictionv){
        if(!this._DB){
            this._openDatabase((e)=>{
                console.log('open database');
            });
        }
        let tx = this._DB.transaction(tableName,Jurisdictionv);
        return tx.objectStore(tableName);
    }

    /**
     * 插入数据
     * @param {string} tablename : 需要插入的表
     * @param {array} data : 数据
     * */
    _insert (tablename,data) {
        let Jurisdictionv = this._getValue('jurisdictionv').readwrite;
        let objectStore = this._createTransaction(tablename,Jurisdictionv);

        // 所有的索引
        let indexNames  = objectStore.indexNames;

        if(!data || data.length <= 0){
            console.log('insert data cannot undefined or length 0');
        }
        for(let i =0,len = data.length;i<len;i++){
            let req = objectStore.add(data[i]);
            req.oncomplete = (e)=>{
                console.log('oncomplete');
            }
            req.onerror = (e)=>{
                console.log('onerror');
            }
            req.onsuccess = (e)=>{
                console.log('onsuccess');
            }
        }
    }
}