/** Pretrial risk assessment interactive!
 * Uses SVG slider library codename "SR"
 * 
 * by jake kara
 * jkara@trendct.org
 **/

(function(){
    var go = function(offense_table){

	var clean_num = function(str){
	    if (typeof(str) == "undefined") return;
	    return Number(str.replace(",","").replace("$","").trim());
	}

	var clean_str = function(str){
	    return str.trim().toUpperCase();
	}

	// Calculate the score based on slider inputs
	var calculate_score = function(){
	    
	}

	// Convert score and offense type/class to bond amount 
	var calculate_bond = function(score, offense_type, offense_class){
	    var record =  offense_table.filter(function(d){
		if (clean_str(d["type"]) != clean_str(offense_type)) return false;
		if (clean_str(d["class"]) != clean_str(offense_class)) return false;
		return true;
	    })

	    if (record.length != 1) {
		console.error("Unable to find record for ",
			      offense_type,
			      offense_class)
		return null;
	    }

	    lim_score = score;
	    if (score > 6){
		var lim_score = 6;
	    }
	    if (score < -6){
		var lim_score = -6;
	    }
	    var score_str = numeral(lim_score).format("+0");
	    if (score == 0) score_str = "0";
	    return clean_num(record[0][score_str]);
	}


	var items = [{
	    "header": "Item 1",
	},{
	    "header": "Item 2",
	},{
	    "header": "Item 3",
	},{
	    "header": "Item 4",
	},{
	    "header": "Item 5",
	},{
	    "header": "Item 6",
	},,{
	    "header": "Item 7",
	},{
	    "header": "Item 8",
	},,{
	    "header": "Item 9",
	},,{
	    "header": "Item 10",
	},{
	    "header": "Item 11",
	}];
	
	var p = new SR.build(d3.select("#viz"));

	var type_toggle = p.add_toggle();
	
	type_toggle.add_option()
	    .label("Misdemeanor")
	    .value("MISDEMEANOR")
	    .select();
	
	type_toggle.add_option()
	    .label("Felony")
	    .value("FELONY");


	var class_toggle = p.add_toggle();
	class_toggle.add_option()
	    .label("Class A")
	    .value("Class A")
	    .select();

	class_toggle.add_option()
	    .label("Class B")
	    .value("Class B")

	class_toggle.add_option()
	    .label("Class C")
	    .value("Class C")

	class_toggle.add_option()
	    .label("Unclassified")
	    .value("Unclassified")

	
	p.update_function = function(){

	    var bond = calculate_bond(this.total(),
				      type_toggle.value(),
				      class_toggle.value());

	    var score_text = "Risk score: " + numeral(this.total())
		.format("+1");;

	    var rec_text = "Recommendation: ";
	    if (this.total() >= 0){
		rec_text += "Promise to appear";
	    }
	    else {
		rec_text += numeral(bond)
		    .format("$0,0");
	    }

	    this.score.text(score_text);
	    this.recommendation.text(rec_text);
	};

	items.forEach(function(item){
	    var e = p.add_explainer();
	    e.header(item.header || null)
		.subhed(item.subhed || null);
	    var s = p.add_slider();
	});

	p.draw();
    }

    d3.tsv("js/bond_amount_table.tsv", go);
})();
