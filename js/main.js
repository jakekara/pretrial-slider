(function(){

    var items = [{
	"header": "marital status",
    },{
	"header": "employment",
	"subhed": "Here's some explanation"
    },{},{},{}];
		 
    p = new PR.build(d3.select("#viz"));

    for (var i in items){
	var item = items[i];
	var e = p.add_explainer();
	e.header(item.header || null)
	    .subhed(item.subhed || null);
	var s = p.add_slider();
    }
    // s = p.add_slider();
    // e = p.add_explainer();
    // e
    // 	.subhed("Here's where you would put the explainer copy")
    // 	.header("Category name");

    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();
    // p.add_slider();

    p.draw();

})();
