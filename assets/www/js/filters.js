angular.module('citymobi.filters', [])
  .filter('dataOrFilter', function() {
    return function(data, params) {
      var args = Array.prototype.slice.call(arguments);
      var _idx = args.length;
      if(_idx == 1){
        return data;
      }else{
        var output = [];
        var source_ary = args[1].split(',');
        var _val = '';
        var _flag = 0;

        for(var j=2;j<_idx;j++){
          if(angular.isDefined(args[j])&&args[j]!=''){_flag = 1;break;}
        }
        if(_flag == 0)
          return data;

        var item = '';
        for(var k=0;k<data.length;k++){
          item = data[k];
          _flag = 0;
          for(var i=0;i<source_ary.length;i++){
            if(_flag == 1)break;
            if(angular.isDefined(item[source_ary[i]])){
              alert(angular.isString(item[source_ary[i]]));
              _val = (item[source_ary[i]]).toString().toUpperCase();
              for(var j=2;j<_idx;j++){
                if(args[j]!=''){
                  if(_val.indexOf(args[j].toString().toUpperCase())!=-1){
                    output.push(item);
                    _flag = 1;
                  }
                }
                if(_flag == 1)break;
              }
              if(_flag == 1)break;
            }
          }
        }
        return output;
      }
    };
  })
  .filter('dataAndFilter', function() {
    return function(data) {
      var args = Array.prototype.slice.call(arguments);
      var _idx = args.length;
      if(_idx == 1){
        return data;
      }else{
        var output = [];
        var source_ary = args[1].split(',');
        var _val = '';
        var _flag = 0;

        for(var j=2;j<_idx;j++){
          if(angular.isDefined(args[j])&&args[j]!=''){_flag = 1;break;}
        }
        if(_flag == 0)
          return data;

        var item = '';
        var _c = 0;
        for(var k=0;k<data.length;k++){
          item = data[k];
          _flag = 0;
          _c=0;
          for(var i=0;i<source_ary.length;i++){
            if(_flag >= _idx-2 )break;
            if(angular.isDefined(item[source_ary[i]])){
              _val = (item[source_ary[i]]).toString().toUpperCase();
              for(var j=2;j<_idx;j++){
                if(args[j]!=''){
                  if(_val.indexOf(args[j].toString().toUpperCase())!=-1){
                    _flag = _flag + 1;
                    if(_flag >= _idx-2 ){output.push(item);break;}
                  }
                }else{
                  if(_c==0){_c = 1;_flag = _flag + 1;if(_flag >= _idx-2 ){output.push(item);break;}}
                }
                if(_flag >= _idx-2 )break;
              }
              if(_flag >= _idx-2)break;
            }
          }
        }
        return output;
      }
    };
  })
