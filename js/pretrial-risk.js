// Throttle object for preventing rapid-fire calls to functions
// (namely redraw on resize)

var THROTTLE = function(){
    this.wait = 200;
    this.busy = false;
}

THROTTLE.prototype.go = function(f){
    clearTimeout(this.timeout);
    this.timeout = setTimeout(f, this.wait);
    return this;
}

// SVG/D3 Slider library, because HTML sliders are so meh!
var SR = SR || {};

SR.build = function(sel){
    this.d3selection = sel;
    this.sections = [];
    this.header_element = "div";
    this.update_function = function (){};
    
    this.score = this.d3selection.append("h3")
	.append(this.header_element)
	.classed("score", true)
	.text(this.total());

    this.recommendation =
	this.d3selection.append("h3")
	.append(this.header_element)
	.classed("recommendation", true)

    this.draw();
    
    return this;
}

SR.build.prototype.add_toggle = function(){
    var t = new SR.toggle();
    t.add_to(this);
    t.append();
    return t;
}

SR.build.prototype.add_explainer = function(){
    var e = new SR.explainer();
    e.add_to(this)
    e.append();
    return e;
}

SR.build.prototype.add_slider = function(){
    var s = new SR.slider();
    s.add_to(this);
    s.append();
    return s;
}

SR.build.prototype.draw = function(){
    for (var i in this.sections){
	this.sections[i].draw();
    }
}

SR.build.prototype.update = function(){
    this.update_function.call(this);
    // this.score.text(this.total());
}

SR.build.prototype.total = function(){
    var ret = 0;
    for (var i in this.sections){
	if (this.sections[i] instanceof SR.slider){
	    ret += this.sections[i].value();
	}
    }
    return ret;
}

SR.explainer = function(){
    this.header_element = "h5";
    return this;
}

SR.explainer.prototype.html = function(html){
    if (typeof(html) == "undefined") return this.__html;
    this.__html = html;
    return this;
}

SR.explainer.prototype.add_to = function(pr){
    this.pr = pr;
    this.pr.sections.push(this);
}

SR.explainer.prototype.append = function(){
    this.d3selection = this.pr.d3selection.append("div")
	.classed("explainer-section", true);
    return this;
}

SR.explainer.prototype.header = function(h){
    if (typeof(h) == "undefined") return this.__header;
    this.__header = h;
    return this;
}

SR.explainer.prototype.subhed = function(s){
    if (typeof(s) == "undefined") return this.__subhed;
    this.__subhed = s;
    return this;
}

SR.explainer.prototype.draw = function(){
    this.d3selection.html("");
    if (this.header() != null){
	this.d3selection.append(this.header_element)
	    .text(this.header())
    }
    if (this.subhed() != null){
	this.d3selection.append("p")
	    .append("text")
	    .text(this.subhed())
    }
    
}

SR.slider = function(){
    this.throttle = new THROTTLE();
    this.domain = [-3,-2,-1,0,1,2,3];
    this.scale_function = d3.scaleLinear;
    this.snap = true;
    this.__initial_value = this.domain[Math.floor(this.domain.length / 2)];
    this.handle_radius = 10;
    this.bar_thickness = 3;
    this.horizontal_padding = this.handle_radius + this.bar_thickness;
    this.vertical_padding = 2;
    this.bar_color = "black";
    this.handle_color = "gray";
    return this;
}

SR.slider.prototype.add_to = function(pr){
    this.pr = pr;
    this.pr.sections.push(this);
    return this;
}

SR.slider.prototype.remove = function(){
    if (typeof(this.d3selection) != "undefined") {
	this.d3selection.remove();
    }
    return this;
}

SR.slider.prototype.append = function(){
    this.d3selection = this.pr.d3selection.append("svg")
	.classed("slider", true);
    return this;
}

SR.slider.prototype.geom = function(){
    var bbox = this.pr.d3selection.node().getBoundingClientRect();
    return {
	"x1": this.horizontal_padding,
	"x2": bbox.width - this.horizontal_padding
    }
}

SR.slider.prototype.draw = function(){

    var bbox = this.pr.d3selection.node().getBoundingClientRect();
    var height = this.handle_radius * 2 + this.vertical_padding * 2;
    this.d3selection.attr("height", 0);
    this.d3selection.html("");
    var g = this.d3selection.append("g");

    var that = this;

    this.x_axis = g.append("g")
	.classed("axis",true)
	.call(d3.axisBottom(this.scale())
	      .ticks(6)
	      .tickSize(this.handle_radius + 4))
	.attr("transform","translate(0,"
	      + (this.vertical_padding + this.handle_radius)
	      + ")");
    
    this.d3selection.on("click",function(){
	that.snap_to(d3.event.x);
    });

    var drag_started = function(){
    };
    var dragged = function(){
	that.move_to(d3.event.x);
    };
    var drag_ended = function(){
	if (that.snap == true) {
	    that.snap_to(d3.event.x);
	}
    };
    this.handle = g.append("circle")
	.classed("handle", true)
	.attr("r",this.handle_radius)
	.attr("cy", this.vertical_padding + this.handle_radius)
	.attr("cx", bbox.width / 2)
	.call(d3.drag()
	      .on("start",drag_started)
	      .on("drag",dragged)
	      .on("end",drag_ended))

    var svg_height = this.d3selection.node().getBoundingClientRect().height;
    var g_height = g.node().getBBox().height;
    this.d3selection.attr("height", this.vertical_padding + g_height);
    d3.select(window).on("resize." + Math.floor(Math.random() * 100000),
			 function(){
			     that.throttle.go(function(){
				 that.draw.call(that);
			     });
			   });
    this.value(this.__initial_value);
}

SR.slider.prototype.scale = function(){
    return this.scale_function()
	.domain([this.domain[0],this.domain[this.domain.length - 1]])
	.range([this.geom().x1,this.geom().x2])
}

SR.slider.prototype.scale_inverse = function(){
    return this.scale_function()
    	.range([this.domain[0],this.domain[this.domain.length - 1]])
	.domain([this.geom().x1,this.geom().x2])
}

SR.slider.prototype.move_to = function(x){
    if (x < this.x1 || x > this.x2) return;
    this.handle.attr("cx", x);
    return this;
}

SR.slider.prototype.snap_to = function(x){
    var min = this.domain[0];
    var max = this.domain[this.domain.length - 1];

    var f_val = this.scale_inverse()(x);
    var i_val = Math.min(max,Math.max(min,Math.round(f_val)));
    var i_x = this.scale()(i_val);
    var that = this;
    this.handle.transition().duration(100)
	.attr("cx", i_x)
	.each(function(){
	    setTimeout(function(){that.pr.update.call(that.pr)},250);
	});
    return this;
}

SR.slider.prototype.value = function(v){
    if (typeof(v) == "undefined"){
	return Math.round(this.scale_inverse()(this.handle.attr("cx")));
    }

    this.snap_to(this.scale()(v));
}

SR.toggle = function(sel){
    this.__options = [];
    this.d3selection = sel;
    return this;
}

SR.toggle_option = function(){
    this.__default = false;
    return this;
}

SR.toggle_option.prototype.label = function(l){
    if (typeof(l) == "undefined") return this.__label;
    this.__label = l;
    return this;
}

SR.toggle_option.prototype.value = function(v){
    if (typeof(v) == "undefined") return this.__value;
    this.__value = v;
    return this;
}

SR.toggle_option.prototype.select = function(){
    var that = this;
    this.__toggle.__options.forEach(function(opt){
	opt.__selected = false;
    });
    this.__selected = true;
    return this;
}

SR.toggle_option.prototype.draw = function(){
    var that = this;
}

SR.toggle.prototype.add_option = function(){
    var opt = new SR.toggle_option();
    opt.__toggle = this;
    this.__options.push(opt);
    return opt;
}

SR.toggle.prototype.draw = function(){
    this.d3selection.html("");

    var that = this;
    var toggle_selected = function(d){
	d.select();
	that.draw();
	that.__sr.update();
    };

    this.d3selection.selectAll(".toggle_option")
	.data(this.__options)
	.enter()
	.append("div")
	.classed("toggle_option", true)
	.text(function(d){
	    return d.__label;
	})
	.attr("data-value", function(d){
	    return d.__value;
	})
	.classed("selected", function(d){
	    return d.__selected;
	})
	.on("click", toggle_selected)
	.on("touchend", toggle_selected)
    
    this.d3selection.append("div").classed("clear_both", true);
}

SR.toggle.prototype.add_to = function(sr){
    this.__sr = sr;
    this.__sr.sections.push(this);
    return this;
}

SR.toggle.prototype.append = function(){
    this.d3selection = this.__sr.d3selection.append("div")
	.classed("toggle-option", true);
    return this;
}

SR.toggle.prototype.value = function(){
    var selected = this.__options.filter(function(opt){
	return opt.__selected;
    });

    if (selected.length != 1){
	console.error("Could not find selected toggle option");
    }

    return selected[0].value();
}
