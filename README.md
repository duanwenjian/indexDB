# indexDB
基于 H5 indexDB 封装的前端数据存储库

## 安装
*   [下载脚本](https://github.com/duanwenjian/indexDB/tree/master/dist/indexDB.js) 到项目目录引入<br/>

```html
<script  src="./indexDB.js"></script>
```

## 使用方式
* 初始化 <br/>
```js
var params = {
    name:'database Name',   // 新建indexDB库名字
    version:1,
    table:[
        //tabel1
        {
            name:'T1',  //table name
            id:{    //主键 可为空
                name:'id',  //名字
                autoIncrement:true  //是否自动增长
            },
            index:[
                {
                    name:'index1',  //索引名称
                    nameIndex:'',   //索引字段名字 可为空
                    unique:true     //是否唯一
                }
            ],
            data:[  //默认数据
                {
                    //data 1
                },
                {
                    //data 2
                }
            ]
        }
        //  ...more table
    ]
};

var indexDB = new indexDB(params);
```
*    新增 table
```js
var table = [
    //tabel3
            {
                name:'T3',  //table name
                id:{    //主键 可为空
                    name:'id',  //名字
                    autoIncrement:true  //是否自动增长
                },
                index:[//索引
                    {
                        name:'index3',  //索引名称
                        nameIndex:'',   //索引字段名字 可为空
                        unique:true     //是否唯一
                    }
                ],
                data:[//默认数据
                    {
                        //data 1
                    },
                    {
                        //data 2
                    }
                ]
            }
            //  ...more table
];

indexDB.createTable(table)
```

*   插入数据
```javascript
var data = [
    {
        //item info
    }
    // .. more item
];
var tableName = 'T1';   //插入的表名
indexDB.insert(tableName,data);
```
### 后续正在更新...