/** Pretrial risk assessment interactive!
 * by jake kara
 * jkara@trendct.org
 **/

var PR = PR || {};

var THROTTLE = function(){
    this.wait = 200;
    this.busy = false;
}

THROTTLE.prototype.go = function(f){
    clearTimeout(this.timeout);
    this.timeout = setTimeout(f, this.wait);
    return this;
}

PR.build = function(sel){
    this.d3selection = sel;
    this.sections = [];

    this.score = this.d3selection.append("div")
	.append("h3")
	.classed("score", true)
	.text(this.total());
    this.draw();
    
    return this;
}

PR.build.prototype.add_slider = function(){
    var s = new PR.slider();
    s.add_to(this);
    s.append();
    return s;
}

PR.build.prototype.draw = function(){
    for (var i in this.sections){
	this.sections[i].draw();
    }
}

PR.build.prototype.update = function(){
    this.score.text(this.total());
}

PR.build.prototype.total = function(){
    var ret = 0;
    for (var i in this.sections){
	if (this.sections[i] instanceof PR.slider){
	    ret += this.sections[i].value();
	}
    }
    return ret;
}

PR.explainer = function(){
    return this;
}

PR.explainer.prototype.html = function(html){
    if (typeof(html) == "undefined") return this.__html;
    this.__html = html;
    return this;
}

PR.explainer.prototype.add_to = function(pr){
    this.pr = pr;
    this.pr.sections.push(this);
}

PR.explainer.prototype.append = function(){
    this.d3selection = this.pr.d3selection.append("div")
	.classed("explainer-section", true);
    return this;
}

PR.slider = function(){
    this.throttle = new THROTTLE();
    this.domain = [-3,-2,-1,0,1,2,3];
    this.scale_function = d3.scaleLinear;
    this.snap = true;
    this.__initial_value = this.domain[Math.floor(this.domain.length / 2)];
    this.handle_radius = 10;
    this.bar_thickness = 3;
    this.horizontal_padding = 18;
    this.vertical_padding = 10;
    this.bar_color = "black";
    this.handle_color = "gray";
    return this;
}

PR.slider.prototype.add_to = function(pr){
    this.pr = pr;
    this.pr.sections.push(this);
    return this;
}

PR.slider.prototype.remove = function(){
    if (typeof(this.d3selection) != "undefined") {
	this.d3selection.remove();
    }
    return this;
}

PR.slider.prototype.append = function(){
    this.d3selection = this.pr.d3selection.append("svg")
	.classed("slider", true);
    return this;
}

PR.slider.prototype.geom = function(){
    var bbox = this.pr.d3selection.node().getBoundingClientRect();
    return {
	"x1": this.horizontal_padding,
	"x2": bbox.width - this.horizontal_padding
    }
}

PR.slider.prototype.draw = function(){

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

PR.slider.prototype.scale = function(){
    return this.scale_function()
	.domain([-3,3])
	.range([this.geom().x1,this.geom().x2])
}

PR.slider.prototype.scale_inverse = function(){
    return this.scale_function()
	.range([-3,3])
	.domain([this.geom().x1,this.geom().x2])
}

PR.slider.prototype.move_to = function(x){
    if (x < this.x1 || x > this.x2) return;
    this.handle.attr("cx", x);
    return this;
}

PR.slider.prototype.snap_to = function(x){
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
    
    // 	setTimeout(function(){
    // 	    that.pr.update.call(that.pr);
    // }, 500);
    return this;
}

PR.slider.prototype.value = function(){
    return Math.round(this.scale_inverse()(this.handle.attr("cx")));
}
