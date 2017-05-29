//创建登录的模块
var loginApp = angular.module('loginApp',[]);
loginApp.controller('loginController',function($scope,$http){
    //先创建数据
    $scope.formData = {};
    //处理登录的函数
    $scope.postForm = function(){
        //传递的数据里面有一个action的参数，让服务器知道，这个请求是
        //用来请求登录的
        $scope.formData.action = 'login';
        $http({
            method:'POST',
            url:'get.php',
            data:$.param($scope.formData),//用户名、密码、action参数
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).success(function(data){
            //console.log(data);
            if(!data.success){
                //没有成功
                if(!data.errors){
                    //用户名密码错了
                    $scope.message = data.message;
                }else{
                    //用户名没填，或者是密码没填，或者是都没填
                    $scope.errorUsername = data.errors.username;
                    $scope.errorPassword = data.errors.password;
                }
            }else{
                //成功了
                window.location.href='#/0';
            }
        })
    }
})
//创建文章列表的模块
var pageList = angular.module('pageList',[]);
pageList.controller('ListTypeCtrl',function($scope,$http){
    //发送一个请求，请求返回所有的文章分类
    $http({
        method:'GET',
        url:'get.php?action=get_arctype&where=reid=0'
    }).success(function(data){
        //console.log(data);
        $scope.lists = data;
    })
})
pageList.controller('arcListCtrl',function($scope,$http,$location){
    //首先获取当前路径上的参数 /0,/1,/2
    $scope.typeid = $location.path().replace('/','');
    //1.首先先获取文章的总数
    if($scope.typeid == 0){
        //要获取的就是全部文章的总数
        $get_total_url = 'get.php?action=get_total'
    }else{
        //要获取的就是某个分类下面的文章总数
        $get_total_url = 'get.php?action=get_total&where=typeid=' + $scope.typeid
    }
    //发送请求
    $http({
        method:'GET',
        url:$get_total_url
    }).success(function(data){
        //console.log(data)
        $scope.paginationConf.totalItems = data.total;
    })
    //2.创建一个分页的对象，里面存储了分页的配置信息
    $scope.paginationConf = {
        currentPage:1,//当前默认的第几页
        itemsPerPage:5,//每页多少条
        pagesLength:5,//分页的长度
        perPageOptions:[10, 20, 30, 40, 50],//分页的那个下拉列表
        rememberPerPage:'perPageItems',
        //当数据修改或者删除的时候会触发onchange这个函数
        //对当前的数据进行重新的分页
        onChange:function(){
            //1.获取分页的开始数
            if($scope.paginationConf.currentPage == 1){
                $scope.limit = 0;
            }else{
                $scope.limit = $scope.paginationConf.currentPage * $scope.paginationConf.itemsPerPage - $scope.paginationConf.itemsPerPage;
            }
            //2.根据当前的typeid的值，显示不同分类下的文章
            if($scope.typeid == 0){
                $geturl = 'get.php?action=get_list&offset='+$scope.limit + '&rows='
                + $scope.paginationConf.itemsPerPage + '&orderField=id&orderBy=DESC';
            }else{
                $geturl = 'get.php?action=get_list&offset='+$scope.limit + '&rows='
                + $scope.paginationConf.itemsPerPage + '&where=typeid=' + $scope.typeid
                + '&orderField=id&orderBy=DESC';
            }
            //3.把请求发过去
            $http({
                method:'GET',
                url:$geturl
            }).success(function(data){
                $scope.lists = data;
            })
        }
    }
})
var addCont = angular.module('addCont',[]);
addCont.controller('addContCtrl',function($scope,$http){
    //1.拿到文章的分类
    $http({
        method:'GET',
        url:'get.php?action=get_arctype&where=reid=0'
    }).success(function(data){
        $scope.lists = data;
    })
    //2.执行写入的操作
    $scope.formData = {};
    $scope.formData.action = 'add_article';
    $scope.postForm = function(){
        $http({
            method:'POST',
            url:'get.php',
            data:$.param($scope.formData),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).success(function(data){
            //console.log(data);
            $scope.errorBye = function(){
                $('#errorbox').fadeOut();
            }
            $scope.errorShow = function(){
                $('#errorbox').fadeIn();
            }
            if(!data.errors){
                //成功了
                $scope.meg_success = '插入成功!正在返回列表页面';
                $scope.meg_error = '';
                setTimeout(function(){location.href='#/0'},1000)
            }else{
                //不成功的时候
                $scope.meg_success = '';
                var get_error = '';
                //标题没有写
                if(data.errors.hasOwnProperty('title')){
                    get_error = data.errors.title;
                }
                //内容没有写
                if(data.errors.hasOwnProperty('content')){
                    get_error = get_error + (get_error ? "&":'') + data.errors.content;
                }
                //分类没有写
                if(data.errors.hasOwnProperty('typeid')){
                    get_error = get_error + (get_error ? '&' : '') + data.errors.typeid
                }
                $scope.meg_error = get_error;
                $scope.errorShow();
            }
        })
    }
})
var modifyCont = angular.module('modifyCont',[]);
modifyCont.controller('modifyContCtrl',function($scope,$http,$stateParams){
    //1.获取分类
    $http({
        method:'GET',
        url:'get.php?action=get_arctype&where=reid=0'
    }).success(function(data){
        $scope.types = data;
    })
    //2.拿到旧的文章内容,是要通过路径上的ID值找到对应的文章
    console.log($stateParams);
    $http({
        method:'GET',
        url:"get.php?action=get_article&id=" + $stateParams.Id
    }).success(function(data){
        $scope.lists = data;
    })
    //3.处理文章的更新
    $scope.formData = {};
    $scope.postForm = function(){
        $scope.formData.action = 'update_article';
        $scope.formData.id = $stateParams.Id;
        $scope.formData.title = form.title.value;
        $scope.formData.content = form.content.value;
        $scope.formData.typeid = $('#typeid option:selected').val()
        $http({
            method:'POST',
            url:'get.php',
            data:$.param($scope.formData),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).success(function(data){
            if(data.code === 101){
                //添加成功
                $scope.meg_success = '修改成功！正在返回列表页面'
                $scope.meg_error = '';
                setTimeout(function(){location.href='#/0'},1000)
            }else{
                //添加失败
                var get_errors = '';
                $scope.meg_success = '';
                $scope.errorBye = function(){
                    $('#errorbox').fadeOut();
                }
                $scope.errorShow = function(){
                    $('#errorbox').fadeIn();
                }
                if(data.errors){
                    if(data.errors.hasOwnProperty('title')){
                        get_errors = data.errors.title;
                    }
                    if(data.errors.hasOwnProperty('content')){
                        get_errors = get_errors + (get_errors ? '&':'') + data.errors.content;
                    }
                    $scope.meg_error = get_errors;
                    $scope.errorShow();
                }else{
                    $scope.meg_error = '修改失败，无改动!';
                    $scope.errorShow();
                }
            }
        })
    }
})
var showCont = angular.module('showCont',[]);
showCont.controller('showContCtrl',function($scope,$http,$stateParams){
    $http({
        method:'GET',
        url:'get.php?action=get_article&id=' + $stateParams.Id
    }).success(function(data){
        $scope.list = data;
    })
})
