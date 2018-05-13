class indexDB {
    constructor(props) {
        this.indexDB = {
            name: props.name,   //DB name
            version: this._getLocalStroage() || props.version || 1, //版本号
            indexDBSupport: false,  //indexDB 支持度校验
            indexDBTables : props.table || [], //需要新建的表
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
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
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
        var indexedDB = this._getIndexDB();
        // 创建 DB
        var req = indexedDB.open(name,version); //名字 版本号
        console.log(version);

        // 成功回调
        req.onsuccess = (e)=> {
            this._DB = e.target.result;
            this._DB.onversionchange = (e) =>{
                this._DB.close();
                console.log("A new version of this page is ready. Please reload!");
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
     * 创建表
     * @param {object} _createTablee : database change result
     * @param {array} table : create table info
     * */
    _createTable(e,table){
        for(var i =0,len = table.length;i<len;i++){
            var _name = table[i].name,
                _keyPath = table[i].id && table[i].id.name || 'id',
                _autoIncrement = table[i].id && table[i].id.autoIncrement || true;
            var store = this._creatrTablestore(e,_name,_keyPath,_autoIncrement);
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
        var store = e.currentTarget.result.createObjectStore(
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
        for(var j = 0,len = index.length;j<len;j++){
            var _name = index[j].name,
                _nameIndex = index[j].nameIndex || _name,
                _unique = index[j].unique || false;
            store.createIndex(_name,_nameIndex,{unique:_unique});
        }
    }

}