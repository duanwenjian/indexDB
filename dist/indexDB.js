'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var indexDB = function () {
    function indexDB(props) {
        _classCallCheck(this, indexDB);

        this.indexDB = {
            name: props.name, //DB name
            version: this._getLocalStroage() || props.version || 1, //版本号
            indexDBSupport: false, //indexDB 支持度校验
            indexDBTables: props.table || [], //需要新建的表
            indexDBActive: false, // 是否打开
            jurisdictionv: {
                readonly: 'readonly',
                readwrite: 'readwrite'
            }
        };
        return this._init();
    }
    /**
     * 初始化执行操作
     * @param null
     * */


    _createClass(indexDB, [{
        key: '_init',
        value: function _init() {
            var _this = this;

            console.log(1, ' init');
            //创建数据库
            this._openDatabase(function (e) {
                //初始化表
                _this._createTable(e, _this._getValue('indexDBTables'));
            });
            return {
                createTable: function createTable(table) {
                    _this._openDatabase(function (e) {
                        _this._createTable(e, table);
                    });
                },
                insert: function insert(tableName, data) {
                    _this._insert(tableName, data);
                }
            };
        }
        /**
         * 获取参数
         * @paranm {string} name
         * */

    }, {
        key: '_getValue',
        value: function _getValue(name) {
            if (!name) {
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

    }, {
        key: '_setValue',
        value: function _setValue(name, value) {
            if (!name) {
                console.log('name connot undefined');
                return;
            }
            this.indexDB[name.toString()] = value;
        }
        /**
         * localstroage存储version
         * @param null
         * */

    }, {
        key: '_setLocalStroage',
        value: function _setLocalStroage() {
            localStorage.setItem('indexDBversion', this._getValue('version'));
        }
        /**
         * 获取version
         * @param null
         * */

    }, {
        key: '_getLocalStroage',
        value: function _getLocalStroage() {
            return localStorage.getItem('indexDBversion');
        }
        /**
         * 获取indexDB的支持度
         * @param null
         * */

    }, {
        key: '_getIndexDB',
        value: function _getIndexDB() {
            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            // ,IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
            // ,IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
            if (indexedDB) {
                this.indexDB.indexDBSupport = true;
            }
            if (!indexedDB) {
                window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
            }
            return indexedDB;
        }
        /**
         * 新版本打开database
         * @param {function} callback 回调函数
         * */

    }, {
        key: '_openDatabase',
        value: function _openDatabase(callback) {
            var _this2 = this;

            this._createDatabase(this._getValue('name'), this._getValue('version'), function (e) {
                //存储成功当前版本
                _this2._setLocalStroage();
                _this2._setValue('version', _this2._getValue('version') + 1);
                typeof callback === 'function' ? callback(e) : '';
            });
        }
        /**
         * 创建database
         * @param {string} name : database name
         * @param {number} version : database vsersion
         * @param {function} callback : success callback
         * */

    }, {
        key: '_createDatabase',
        value: function _createDatabase(name, version, callback) {
            var _this3 = this;

            var indexedDB = this._getIndexDB();
            // 创建 DB
            var req = indexedDB.open(name, version); //名字 版本号
            console.log(version);

            // 成功回调
            req.onsuccess = function (e) {
                _this3._DB = e.target.result;
                _this3._setValue('indexDBActive', true); //数据打开
                //关闭回调
                _this3._DB.onclose = function (e) {};
                // 错误回调
                _this3._DB.onerror = function (e) {
                    _this3._DBCLose(e);
                };
                //关于
                _this3._DB.onabort = function (e) {
                    _this3._DBOnabout(e);
                };
                //版本变化回调
                _this3._DB.onversionchange = function (e) {
                    _this3._DBOnversionchange(e);
                };
                console.log(3, 'indexDB onsuccess');
            };
            // 失败回调
            req.onerror = function (e) {
                console.log(1, e.target.errorCode);
            };

            // 版本改变时候的 回调
            req.onupgradeneeded = function (e) {
                console.log(1, 'indexDB.onupgradeneeded');
                typeof callback === 'function' ? callback(e) : '';
            };
        }
    }, {
        key: '_DBOnversionchange',

        /**
         * 数据版本变更
         * @param e
         * */
        value: function _DBOnversionchange(e) {
            this._DB.close();
            //删除引用
            // delete this._DB;
            this._setValue('indexDBActive', false);
            console.log("A new version of this page is ready. Please reload!");
        }
        /**
         * DB about
         * @param e
         * */

    }, {
        key: '_DBOnabout',
        value: function _DBOnabout(e) {}
        /**
         * DB close
         * @param e
         * */

    }, {
        key: '_DBCLose',
        value: function _DBCLose(e) {}
        /**
         * 创建表
         * @param {object} _createTablee : database change result
         * @param {array} table : create table info
         * */

    }, {
        key: '_createTable',
        value: function _createTable(e, table) {
            for (var i = 0, len = table.length; i < len; i++) {
                var _name = table[i].name,
                    _keyPath = table[i].id && table[i].id.name || 'id',
                    _autoIncrement = table[i].id && table[i].id.autoIncrement || true;
                var store = this._creatrTablestore(e, _name, _keyPath, _autoIncrement);
                this._createTableIndex(store, table[i].index || []);
            }
        }
        /**
         * 创建 table store
         * @param {object} e
         * @param {string} name : store name
         * @param {string} keypath :  主键
         * @param {boolean} autoIncrement : 主键是否自动增长
         * */

    }, {
        key: '_creatrTablestore',
        value: function _creatrTablestore(e, name, keyPath, autoIncrement) {
            //对象存储控件 表
            var store = e.currentTarget.result.createObjectStore(name, { keyPath: keyPath, autoIncrement: autoIncrement });
            return store;
        }

        /**
         * 创建表索引
         * @param {object} store : 表
         * @param {array} index : 所应详细
         * */

    }, {
        key: '_createTableIndex',
        value: function _createTableIndex(store, index) {
            // console.log('index create');
            for (var j = 0, len = index.length; j < len; j++) {
                var _name = index[j].name,
                    _nameIndex = index[j].nameIndex || _name,
                    _unique = index[j].unique || false;
                store.createIndex(_name, _nameIndex, { unique: _unique });
            }
        }
        /**
         * 创建操作事务
         * @param {string} tableName : 打开的table
         * @param {string} Jurisdictionv : 操作权限 读写：readwrite readonly：只读
         * */

    }, {
        key: '_createTransaction',
        value: function _createTransaction(tableName, Jurisdictionv) {
            if (!this._DB) {
                this._openDatabase(function (e) {
                    console.log('open database');
                });
            }
            var tx = this._DB.transaction(tableName, Jurisdictionv);
            return tx.objectStore(tableName);
        }

        /**
         * 插入数据
         * @param {string} tablename : 需要插入的表
         * @param {array} data : 数据
         * */

    }, {
        key: '_insert',
        value: function _insert(tablename, data) {
            var Jurisdictionv = this._getValue('jurisdictionv').readwrite;
            var objectStore = this._createTransaction(tablename, Jurisdictionv);

            // 所有的索引
            var indexNames = objectStore.indexNames;

            if (!data || data.length <= 0) {
                console.log('insert data cannot undefined or length 0');
            }
            for (var i = 0, len = data.length; i < len; i++) {
                var req = objectStore.add(data[i]);
                req.oncomplete = function (e) {
                    console.log('oncomplete');
                };
                req.onerror = function (e) {
                    console.log('onerror');
                };
                req.onsuccess = function (e) {
                    console.log('onsuccess');
                };
            }
        }
    }]);

    return indexDB;
}();
