/**
 * @name: JOYUITMPL loader
 * @function: 针对JOYUI模块分组，修改模板并引入子模块的样式和逻辑
*/ 
var log = require('npmlog');

var hashstr = function(s){
    var hash = 0;
    if (s.length == 0) return hash;
    var char;
    for (var i = 0; i < s.length; i++) {
      char = s.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

var fs = require('fs');
var path = require('path');

module.exports = function(content) {
	this.cacheable && this.cacheable();
	var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var joyuiBase = path.join(home,'.spon/mobi/');
	var digest = hashstr(content);
	var slab = process.slabs[digest];

	// 有占位符的UI模块
	if(slab){
      var slabsInTemplate = content.match(/<joyui:view>/ig);

      if(!slabsInTemplate || slab.slabs.length != slabsInTemplate.length){
        log.error('spon:loader: 当前模块 '+ slab.name + ' 模板中占位符数量与传入数据的数量不相等！');
        process.exit(1);
      }

      // 替换JOYUI模板中的占位符
      slab.slabs.forEach(function(s,i){
        // 此处的正则表达式与 joyuiSlabReg 的区别在于没有“g”的标示
        var uiName = s.split('/')[1];

        // 占位符对应的JOYUI模块的模板
        var slabContent = fs.readFileSync(path.join(joyuiBase,s,uiName + '.tmpl'),'utf8');
        content = content.replace(/<joyui:view>/i,slabContent);
      });

	}

	this.value = content;
	return "module.exports = " + JSON.stringify(content);
};
