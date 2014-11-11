var surveyData = [];
var filteredData = [];
var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];

// var pieColors = ["#7fc97f","#fdc086","#ffff99"];
// var pieColors = ["#66c2a5", "#fdae61", "#ffffbf"];
var pieColors = ["#4393c3","#f4a582","#fddbc7"];

var activeProvince = "ALL";
var activeMunicipality = "ALL";
var activeBarangay = "ALL";

var formatPerc = d3.format(".0%");

function getSurveyData() {
  d3.csv("data/cbhfa_baseline_final_2014_10_28.csv", function(data){
    surveyData = data;
    buildProvinceDropdown();
  });
}

function buildProvinceDropdown() {
  var provinceList = [];
  $.each(surveyData, function(index, survey){
    var thisProvince = survey["province"];
    if($.inArray(thisProvince, provinceList) === -1){
      provinceList.push(thisProvince);
    }
  });
  // sort so that the regions appear in alphabetical order in dropdown
  provinceList = provinceList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < provinceList.length; i++) {
      var item = provinceList[i];
      var listItemHtml = '<li><a href="#" onClick="provinceSelect(' +"'"+ item +"'"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-province').append(listItemHtml);       
  }
  analyzeData();
  $("#loading").fadeOut(300);
}

function resetAdmin() {
  activeProvince = "ALL";
  activeMunicipality = "ALL";
  activeBarangay = "ALL";          
  $('#dropdown-menu-municipality').html('<li class="disabled"><a role="menuitem" href="#">First select a province</a></li>');
  $('#dropdown-menu-barangay').html('<li class="disabled"><a role="menuitem" href="#">First select a municipality</a></li>');
  $("#selected-admin-label").html("All surveyed areas");
  analyzeData();
}

function provinceSelect(province){
  activeProvince = province;
  activeMunicipality = "ALL";
  activeBarangay = "ALL";
  $("#selected-admin-label").html(province);
  buildMunicipalityDropdown();
  analyzeData();
}

function municipalitySelect(municipality){
  activeMunicipality = municipality;
  activeBarangay = "ALL";
  $("#selected-admin-label").html(activeProvince + ", " + activeMunicipality);
  $("#selected-barangay-text").empty();
  buildBarangayDropdown();
  analyzeData();
}

function barangaySelect(barangay){
  activeBarangay = barangay;
  $("#selected-admin-label").html(activeProvince + ", " + activeMunicipality + ", "+ activeBarangay);
  analyzeData();
}

function buildMunicipalityDropdown(){
  $('#dropdown-menu-municipality').empty();
  $('#dropdown-menu-barangay').html('<li class="disabled"><a role="menuitem" href="#">First select a municipality</a></li>');
  var municipalityList = [];
  $.each(surveyData, function(index, survey){
    var thisMunicipality = survey["municipality"];
    if($.inArray(thisMunicipality, municipalityList) === -1 && survey["province"] === activeProvince){
      municipalityList.push(thisMunicipality);
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  municipalityList = municipalityList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < municipalityList.length; i++) {
      var item = municipalityList[i];
      var listItemHtml = '<li><a href="#" onClick="municipalitySelect(' +"'"+ item +"'"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-municipality').append(listItemHtml);       
  }
}

function buildBarangayDropdown() {
  $('#dropdown-menu-barangay').empty();
  var barangayList = [];
  $.each(surveyData, function(index, survey){
    var thisBarangay = survey["barangay"];
    if($.inArray(thisBarangay, barangayList) === -1 && survey["province"] === activeProvince && survey["municipality"] === activeMunicipality){
      barangayList.push(thisBarangay);
    }
  });
  // sort so that they appear in alphabetical order in dropdown
  barangayList = barangayList.sort(); 
  // create item elements in dropdown list   
  for(var i = 0; i < barangayList.length; i++) {
      var item = barangayList[i];
      var listItemHtml = '<li><a href="#" onClick="barangaySelect(' +"'"+ item +"'"+ '); return false;">' + item + "</li>"
      $('#dropdown-menu-barangay').append(listItemHtml);       
  }
}

function analyzeData() {
  $("#infoWrapper").empty();
  filteredData = [];
  $.each(surveyData, function(index, survey){
    if(survey["province"] === activeProvince || activeProvince === "ALL"){
      if(survey["municipality"] === activeMunicipality || activeMunicipality === "ALL"){
        if(survey["barangay"] === activeBarangay || activeBarangay === "ALL"){
          filteredData.push(survey);
        }
      }
    }
  });

  $("#selected-survey-count").html(filteredData.length.toString());

  FA1();
}


function FA1(){
  // yesNo Required question
  $(infoWrapper).append("<h3><span class='jumpto' id='firstaid'></span>Topic: First Aid</h3><hr>");
  var questionID = "cbhfa-FA1";
  var questionEnglish = "Have you ever attended any training program to learn basic first aid?";
  var questionTagalog = "Nakadalo ka na ba ng pagsasanay patungkol sa paunang lunas?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    totalCount++;
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/skip",
      y: noCount + skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  var noskipPerc = formatPerc( (noCount+skipped) / totalCount);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents (required question)</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noskipPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noPerc + ", " + noCount.toString() + ") or" + 
    " no response <span class='text-tagalog'>[walang sagot]</span> ("+ skipPerc + ", " + skipped.toString()+")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA2();     
}

function FA2() {
  var questionID = "cbhfa-FA2-FA2_units";
  var questionEnglish = "When did you attend this training program?";
  var questionTagalog = "Kailan ka nagsanay?";
  var less2years = 0;
  var more2years = 0;
  var noTraining = 0;
  var dontKnow = 0;
  var noResponse = 0;
  var totalAttended = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      noTraining ++;
    } else {
      totalAttended ++;
      if (survey[questionID] === "years"){
        more2years ++;
      }
      if (survey[questionID] === "months"){
        less2years ++;
      }
      if (survey[questionID] === "dk"){
        dontKnow ++;
      }
      if (survey[questionID] === "skip"){
        noResponse ++;
      }
    }
  });
  var thisPieData = [
    {
      key: ">2 yrs",
      y: more2years,
    },
    {
      key: "<2 yrs",
      y: less2years,
    },
    {
      key: "dk/skip",
      y: dontKnow + noResponse,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var more2Perc = formatPerc(more2years / totalAttended); 
  var less2Perc = formatPerc(less2years / totalAttended);
  var dkPerc = formatPerc(dontKnow / totalAttended);
  var noResponsePerc = formatPerc(noResponse / totalAttended);
  var dkskipPerc = formatPerc( (dontKnow + noResponse) /totalAttended);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>Of the " + totalAttended.toString() + " respondents attending a training program to learn basic first aid:</strong><br>"+
    "<span class='percText-1'>" + less2Perc + "</span> did so in the last 2 years (" +
    less2years.toString() + ")<br>" +
    "<span class='percText-2'>" + more2Perc + "</span> did so more than 2 years ago (" + 
    more2years.toString() + ")<br>" + 
    "<span class='percText-3'>" + dkskipPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dontKnow.toString() + ") or no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    noResponsePerc + ", " + noResponse.toString() + ")<br>" + 
    "(" + noTraining.toString() + ((noTraining == 1) ? " respondent has" : " respondents have") + " not attended a training" +
      ")</p><br>";
  $(infoSelector).append(thisInfoHtml)
  FA5();
}

function FA5(){
  // does respondent know the key intervention?
  var questionID = "cbhfa-FA5";
  var questionEnglish = "What will be your first action if you see someone is bleeding?";
  var questionTagalog = "Ano ang iyong magiging unang pagkilos o gagawing pangunang lunas kapag ikaw ay makakakita ng taong nagdurugo?";
  var keyInterventionEnglish = "put pressure to stop bleeding";
  var keyInterventionTagalog = "lagyan ng pressure o diin ang apektadong bahagi para huminto ang pagdurugo";
  var know = 0;
  var other = 0;
  var dk = 0;
  var skip = 0;
  var notAsked = 0;
  var totalAttended = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAsked ++;
    } else { 
      totalAttended ++;
      if (survey[questionID] === "A"){
        know ++;
      }
      if (survey[questionID] === "other"){
        other ++;
      }
      if (survey[questionID] === "dk"){
        dk ++;
      }
      if (survey[questionID] === "skip"){
        skip ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "know",
      y: know,
    },
    {
      key: "other",
      y: other,
    },
    {
      key: "dk/skip",
      y: dk + skip,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var knowPerc = formatPerc(know / totalAttended); 
  var otherPerc = formatPerc(other / totalAttended);
  var dkPerc = formatPerc(dk / totalAttended);
  var skipPerc = formatPerc(skip / totalAttended);
  var dkskipPerc = formatPerc( (dk + skip) / totalAttended);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>Of the " + totalAttended.toString() + " respondents attending a training program to learn basic first aid:</strong><br>"+
    "<span class='percText-1'>" + knowPerc + "</span> " + keyInterventionEnglish +
    " <span class='text-tagalog'>[" + keyInterventionTagalog + "]</span> (" +
    know.toString() + ")<br>" +
    "<span class='percText-2'>" + otherPerc + "</span> gave some other answer (" + 
    other.toString() + ")<br>" +
    "<span class='percText-3'>" + dkskipPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dk.toString() + ") or no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipPerc + ", " + skip.toString() + ")<br>" + 
    "(" + notAsked.toString() + ((notAsked == 1) ? " respondent" : " respondents") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA6();
}

function FA6(){
  // does respondent know the key intervention?
  var questionID = "cbhfa-FA6";
  var questionEnglish = "What will be your first action if you see someone has been burnt?";
  var questionTagalog = "Ano ang iyong magiging unang tugon/aksyon kapag nakakita ka ng taong napaso?";
  var keyInterventionEnglish = "put cold clean water on the burned area";
  var keyInterventionTagalog = "lagyan ng malamig at malinis na tubig sa napasong bahagi";
  var know = 0;
  var other = 0;
  var dk = 0;
  var skip = 0;
  var notAsked = 0;
  var totalAttended = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAsked ++;
    } else {
      totalAttended ++;
      if (survey[questionID] === "A"){
        know ++;
      }
      if (survey[questionID] === "other"){
        other ++;
      }
      if (survey[questionID] === "dk"){
        dk ++;
      }
      if (survey[questionID] === "skip"){
        skip ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "know",
      y: know,
    },
    {
      key: "other",
      y: other,
    },
    {
      key: "dk/skip",
      y: dk + skip,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var knowPerc = formatPerc(know / totalAttended); 
  var otherPerc = formatPerc(other / totalAttended);
  var dkPerc = formatPerc(dk / totalAttended);
  var skipPerc = formatPerc(skip / totalAttended);
  var dkskipPerc = formatPerc( (dk + skip) / totalAttended);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>Of the " + totalAttended.toString() + " respondents attending a training program to learn basic first aid:</strong><br>"+
    "<span class='percText-1'>" + knowPerc + "</span> " + keyInterventionEnglish +
    " <span class='text-tagalog'>[" + keyInterventionTagalog + "]</span> (" +
    know.toString() + ")<br>" +
    "<span class='percText-2'>" + otherPerc + "</span> gave some other answer (" + 
    other.toString() + ")<br>" +
    "<span class='percText-3'>" + dkskipPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dk.toString() + ") or no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipPerc + ", " + skip.toString() + ")<br>" +  
    "(" + notAsked.toString() + ((notAsked == 1) ? " respondent" : " respondents") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA7();
}

function FA7(){
  // yesnodk, required!
  var questionID = "cbhfa-FA7";
  var questionEnglish = "Did you at any occasion in the last year injure yourself and was given first aid by a volunteer?";
  var questionTagalog = "Mayroon bang naging pagkakataon kung saan nasaktan mo ang iyong sarili at nilapatan ka ng pangunang lunas ng isang volunteer?";
  var yesCount = 0;
  var noCount = 0;
  var dkCount = 0;
  var skipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    totalCount++;
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "dk"){
      dkCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dkCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dkCount;
  var yesPerc = formatPerc(yesCount / totalCount); 
  var nodkPerc = formatPerc(nodk / totalCount);
  var noPerc = formatPerc(noCount / totalCount);
  var dkPerc =formatPerc(dkCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents (required question)</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noPerc + ", " +noCount.toString() + ") or don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dkCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  $(infoSelector).append(thisInfoHtml);   
  CM1();
}

function CM1(){
  // know >3  or  <3/dont know, required!
  $(infoWrapper).append("<h3><span class='jumpto' id='majoremergencies'></span>Topic: Community Mobilization in Major Emergencies</h3></div><hr>");
  var questionID = "CM1";
  var questionEnglish = "What would you do to respond safely to a disaster?";
  var questionTagalog = "Ano ang iyong gagawin upang makatugon ng ligtas sa isang kalamidad?";
  var answersEnglish = {
    "CM1-A":"listen to the media and other reliable sources and follow advice",
    "CM1-B":"follow advice issued by the government / local authorities",
    "CM1-C":"move immediately to the nearest safe evacuation place with family members",
    "CM1-D":"follow safe route to reach shelter sited",
    "CM1-E":"take water, food, and essential items to the shelter site",
    "CM1-F":"go back home only when authorities declare that the situation is safe",
    "CM1-G":"help evacuate and/or rescue the others, while not putting self in danger",
    "CM1-H":"provide first aid if qualified",
    "CM1-I":"be calm and quiet",
    "CM1-other":"other",
    "CM1-dk":"don't know",
    "CM1-skip":"no response"
  };
  var answersTagalog = {
    "CM1-A":"makinig sa media at iba pang mapapakukunan ng mapagkakatiwalaang impormasyon",
    "CM1-B":"sundin ang payo ng pamahalaan o lokal na mga awtoridad",
    "CM1-C":"pumunta agad sa pinakamalapit na ligtas na evacuation area kasama ang pamilya",
    "CM1-D":"sundin ang ligtas na daan/ruta patungo sa evacuation area",
    "CM1-E":"magdala ng malinis na inumin, pagkain at iba pang mahahalagang bagay sa evacuation site",
    "CM1-F":"bumalik lamang sa mga tahanan kung may pahintulot na ng mga lokal na awtoridad at idineklara na itong ligtas",
    "CM1-G":"tumulong sa pagpapalikas at/o pagsagip sa iba na hindi nilalagay ang sarili sa panganib",
    "CM1-H":"magbigay ng pangunang lunas kung kinakailangan",
    "CM1-I":"maging mahinahon at tahimik",
    "CM1-other":"ibang sagot",
    "CM1-dk":"hindi alam",
    "CM1-skip":"walang sagot"
  };
  var optionCount = 9;
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var skipped = 0;
  var totalCount = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    totalCount++;
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "TRUE"){
      dontKnow ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + dontKnow,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var dontKnowPerc = formatPerc(dontKnow / totalCount);
  var lessThreeDontKnowPerc = formatPerc((lessThanThree + dontKnow)/totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents (required question)</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or don't know <span class='text-tagalog'>[walang sagot]</span> " + 
    " (" + dontKnowPerc + ", " + dontKnow.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span> ("+ thisResponseCount +")<br>";
    $(infoSelector).append(thisHtml);
  }
  CM2(); 
}


function CM2(){
  // yesnodk, required!
  var questionID = "cbhfa-CM2";
  var questionEnglish = "Did you receive psychosocial support from a volunteer following the disaster?";
  var questionTagalog = "Nakatanggap ka ba ng psychosocial support mula sa isang volunteer matapos ang isang kalamidad?";
  var yesCount = 0;
  var noCount = 0;
  var dkCount = 0;
  var skipped = 0;
  // var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    totalCount ++;
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "dk"){
      dkCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    // if (survey[questionID] === "n/a"){
    //   topicSkipped ++;
    // }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dkCount,
    },
    {
      key: "skip",
      y: skipped,
    }

  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var dkPerc = formatPerc(dkCount / totalCount);
  var nodkPerc = formatPerc((noCount + dkCount) / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents (required question)</strong><br>" +
    "<p><span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> ("+
    noPerc + ", " + noCount.toString() + ") or don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dkCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  // if(topicSkipped > 0){}
  $(infoSelector).append(thisInfoHtml);   
  SM1();
}

function SM1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='safemotherhood'></span>Topic: Safe Motherhood</h3><hr>");
  var questionID = "SM1";
  var questionEnglish = "During your last pregnancy, did you see anyone for antenatal care?";
  var questionTagalog = "Sa panahon ng iyong huling pagbubuntis, kumunsulta ka ba ng isang healthcare worker para mapangalagaan ang iyong pagbubuntis?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  SM2();
}

function SM2(){
  var questionID = "SM2";
  var optionCount = 4;
  var questionEnglish = "Whom did you see?";
  var questionTagalog = "Sino ang iyong kinunsulta?";
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersEnglish = {
    "SM2-A":"doctor/ medical assistant",
    "SM2-B":"nurse",
    "SM2-C":"midwife",
    "SM2-D":"traditional birth attendant",
    "SM2-other":"other",
    "SM2-dk":"don't know",
    "SM2-skip":"no response"
  };
  var answersTagalog = {
    "SM2-A":"duktor",
    "SM2-B":"nars",
    "SM2-C":"kumadrona",
    "SM2-D":"hilot",
    "SM2-other":"ibang sagot",
    "SM2-dk":"hindi alam",
    "SM2-skip":"walang sagot"
  };
  var answersArray = [];
  var notAskedCount = 0;
  var askedCount = 0;
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // topic skipped?
    if(survey[skip] === "n/a"){
      notAskedCount ++;
    } else {
      askedCount ++;
      // counts for each of the responses
      for (response in allResponses){
        if (survey[response] === "TRUE"){
          allResponses[response] ++;          
        }
      };
    }  
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + askedCount.toString() + " respondents (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / askedCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount + " not asked this question)");  
  SM3();
}

function SM3(){
  var questionID = "SM3";
  var optionCount = 9;
  var questionEnglish = "During your last pregnancy, where did you receive antenatal care?";
  var questionTagalog = "Sa panahon ng iyong pagbubuntis , saan ka nagpakonsulta para mapangalagaan ang iyong pagbubuntis?";
  var other = questionID + "-other";
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var totalCount = 0;
  var homeCare = 0;
  var publicCare = 0;
  var privateCare = 0;
  var topicSkipped = 0;
  var answersEnglish = {
    "SM3-A":"your home",
    "SM3-B":"midwife",
    "SM3-C":"traditional birth attendant",
    "SM3-D":"public hospital",
    "SM3-E":"rural health unit (RHU)",
    "SM3-F":"barangay health station (BHS)",
    "SM3-G":"barangay health center (BHC)",
    "SM3-H":"private hospital",
    "SM3-I":"private clinic",
    "SM3-other":"other",
    "SM3-dk":"don't know",
    "SM3-skip":"no response"
  };
  var answersTagalog = {
    "SM3-A":"sa bahay",
    "SM3-B":"kumadrona",
    "SM3-C":"hilot",
    "SM3-D":"ospital",
    "SM3-E":"rural health unit (RHU)",
    "SM3-F":"barangay health station (BHS)",
    "SM3-G":"barangay health center (BHC)",
    "SM3-H":"pribadong ospital",
    "SM3-I":"pribadon klinika",
    "SM3-other":"ibang sagot",
    "SM3-dk":"hindi alam",
    "SM3-skip":"walang sagot"
  };
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[dk] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      // counts for each of the responses
      for (response in allResponses){
        
        if (survey[response] === "TRUE"){
          allResponses[response] ++;
        }
      };
      if (survey["SM3-A"] === "TRUE" || survey["SM3-B"] === "TRUE" || survey["SM3-C"] === "TRUE"){
        homeCare ++;
      } 
      if (survey["SM3-D"] === "TRUE" || survey["SM3-E"] === "TRUE" || survey["SM3-F"] === "TRUE" || survey["SM3-G"] === "TRUE"){
        publicCare ++;
      } 
      if (survey["SM3-H"] === "TRUE" || survey["SM3-I"] === "TRUE"){
        privateCare ++;
      }
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var homePerc = formatPerc(homeCare / totalCount); 
  var publicPerc = formatPerc(publicCare / totalCount);
  var privatePerc = formatPerc(privateCare / totalCount);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents (may have received care in more than one sector)</strong><br>" +
    "<span class='percText-other1'>" + homePerc + "</span> received care in home" + 
    " (" + homeCare.toString() + ")<br>" +
    "<span class='percText-other1'>" + publicPerc + "</span> received care at a public facility" + 
    " (" + publicCare.toString() + ")<br>" +
    "<span class='percText-other1'>" + privatePerc + "</span> received care at a private facility" + 
    " (" + privateCare.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped.toString() + " not asked this question)"); 
  SM4();
}

function SM4(){
  var questionID = "cbhfa-SM_group-SM4";
  var questionEnglish = "During your last pregnancy, how many months pregnant were you when you first received antenatal care?";
  var questionTagalog = "Sa panahon ng iyong pagbubuntis, ilang buwan kang buntis noong una kang magpakonsulta sa isang healthcare worker?";
  var monthResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        monthResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxMonths = Math.max.apply(Math,monthResponses);
  var minMonths = Math.min.apply(Math,monthResponses);
  var sum = 0;
  for( var i = 0; i < monthResponses.length; i++ ){
      sum += monthResponses[i];
  }
  var avgMonths = d3.round(sum/monthResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + monthResponses.length.toString() + " respondents providing # of months</strong><br>" +
    "Average months: " + avgMonths.toString() + "<br>" +
    "Min: " + minMonths.toString() + " / Max: " + maxMonths.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know <span class='text-tagalog'>[hindi alam]</span>, " + noResponseCount.toString() + " no response <span class='text-tagalog'>[walang sagot]</span>, " + 
    notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  SM5();
}

function SM5(){
  var questionID = "cbhfa-SM_group-SM5";
  var questionEnglish = "During your last pregnancy, how many times did you receive antenatal care?";
  var questionTagalog = "Sa panahon ng iyong huling pagbubuntis, ilang beses ka kumonsulta sa isang healthcare worker?";
  var numberResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        numberResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxTimes = Math.max.apply(Math,numberResponses);
  var minTimes = Math.min.apply(Math,numberResponses);
  var sum = 0;
  for( var i = 0; i < numberResponses.length; i++ ){
      sum += numberResponses[i];
  }
  var avgTimes = d3.round(sum/numberResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + numberResponses.length.toString() + " respondents providing # of times</strong><br>" +
    "Average Times: " + avgTimes.toString() + "<br>" +
    "Min: " + minTimes.toString() + " / Max: " + maxTimes.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know <span class='text-tagalog'>[hindi alam]</span>, " + noResponseCount.toString() + " no response <span class='text-tagalog'>[walang sagot]</span>, " + 
    notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  SM6();
}


function SM6(){
  var heightID = "SM6_A";
  var bpID = "SM6_B"
  var urineID = "SM6_C"
  var bloodID = "SM6_D"
  var questionEnglish = "As part of your antenatal care during this pregnancy, were any of the following done at least once?";
  var questionTagalog = "Bilang bahagi ng pangangalaga sa iyong pagbubuntis, alin man sa mga sumusunod ay nagawa isa o higit pa?";
  var heightYes = 0;
  var heightNo = 0;
  var heightSkip = 0;  
  var bpYes = 0;
  var bpNo = 0;
  var bpSkip = 0;
  var urineYes = 0;
  var urineNo = 0;
  var urineSkip = 0;
  var bloodYes = 0;
  var bloodNo = 0;
  var bloodSkip = 0;
  var notAskedCount = 0;
  var totalCount =0;
  $.each(filteredData, function(surveyIndex, survey){
    if(survey[heightID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      switch(survey[heightID]){
        case "yes": heightYes ++;
        break;
        case "no": heightNo ++;
        break;
        case "skip": heightSkip ++;
        break;
      }
      switch(survey[bpID]){
        case "yes": bpYes ++;
        break;
        case "no": bpNo ++;
        break;
        case "skip": bpSkip ++;
        break;
      }
      switch(survey[urineID]){
        case "yes": urineYes ++;
        break;
        case "no": urineNo ++;
        break;
        case "skip": urineSkip ++;
        break;
      }
      switch(survey[bloodID]){
        case "yes": bloodYes ++;
        break;
        case "no": bloodNo ++;
        break;
        case "skip": bloodSkip ++;
        break;
      }
    }
  });
  function pieData(yesCount, noCount, skipCount){
    return [
      {
        key: "yes",
        y: yesCount,
      },
      {
        key: "no",
        y: noCount,
      },
      {
        key: "skip",
        y: skipCount,
      }
    ];
  }
  $("#infoWrapper").append('<div class="row"><h4>'+ questionEnglish +'<br><small>' +  
    questionTagalog +'</small></h4><p><strong>' + totalCount.toString() + ' respondents reporting having received antenatal care</strong></p>'+
    '</div><div class="row"><div class="col-sm-6">'+
    '<h4>Was your height taken? <br><small>Sinukat ba ang iyong laki/tangkad?</small></h4>'+'<div id="' + 
    heightID + '" class="box-chart-no-float"><svg id="' +
    heightID + '_chart"></svg></div><div id="'+
    heightID + '_info" class="box-info"></div></div>'+
    '<div class="col-sm-6">' +
    '<h4>Was your blood pressure measured? <br><small>Sinukat ba ang iyong blood pressure?</small></h4>'+'<div id="' +
    bpID + '" class="box-chart-no-float"><svg id="' +
    bpID + '_chart"></svg></div><div id="'+
    bpID + '_info" class="box-info"></div></div></div>'+
    '<div class="row"><div class="col-sm-6">' + 
    '<h4>Did you give a urine sample? <br><small>Nagbigay kaba ng sample ng iyong ihi?</small></h4>'+'<div id="' +
    urineID + '" class="box-chart-no-float"><svg id="' +
    urineID + '_chart"></svg></div><div id="'+
    urineID + '_info" class="box-info"></div></div>'+
    '<div class="col-sm-6">' +
    '<h4>Did you give a blood sample? <br><small>Nagbigay k aba ng sample ng iyong dugo?</small></h4>'+'<div id="' + 
    bloodID + '" class="box-chart-no-float"><svg id="' +
    bloodID + '_chart"></svg></div><div id="'+
    bloodID + '_info" class="box-info"></div></div></div>'+
    '<hr>');
  $.each(["SM6_A","SM6_B","SM6_C","SM6_D"], function(index, questionID){
    var width = 180;
    var chart = nv.models.pie().width(width - 60).height(width - 60)
      .x(function(d) { return d.key }) 
      .y(function(d) { return d.y })
      .color(pieColors)
      .showLabels(true);
    var chartSelector = "#" + questionID + "_chart";
    var thisPieData = [];
    var yesCount = 0;
    var noCount = 0;
    var skipCount = 0;
    switch(questionID){
      case "SM6_A": 
        thisPieData = pieData(heightYes, heightNo, heightSkip);
        yesCount = heightYes;
        noCount = heightNo;
        skipCount = heightSkip;
        break;
      case "SM6_B": 
        thisPieData = pieData(bpYes, bpNo, bpSkip);
        yesCount = bpYes;
        noCount = bpNo;
        skipCount = bpSkip;
        break;
      case "SM6_C": 
        thisPieData = pieData(urineYes, urineNo, urineSkip);
        yesCount = urineYes;
        noCount = urineNo;
        skipCount = urineSkip;
        break;
      case "SM6_D": 
        thisPieData = pieData(bloodYes, bloodNo, bloodSkip);
        yesCount = bloodYes;
        noCount = bloodNo;
        skipCount = bloodSkip;
        break;
    }
    d3.select(chartSelector)
      .datum(thisPieData)
      .transition().duration(1200)
      .attr('width', width)
      .attr('height', width)
      .call(chart);
    var el = $(".nv-pieLabels");
    $.each(el, function(aIndex, a){
      a.parentNode.appendChild(a);
    });
    var infoSelector = "#" + questionID + "_info";
    var thisInfoHtml = "";
    var yesPerc = formatPerc(yesCount / (yesCount + noCount + skipCount)); 
    var noPerc = formatPerc(noCount / (yesCount + noCount + skipCount));
    var skipPerc = formatPerc(skipCount / (yesCount + noCount + skipCount));
    thisInfoHtml = "<p><span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
      yesCount.toString() + ")<br>" +
      "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
      noCount.toString() + ")<br>" + 
      "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
      skipCount.toString() + ")</p><br>";
    $(infoSelector).append(thisInfoHtml);
  });
  SM7();
}

function SM7(){
  var questionID = "SM7";
  var questionEnglish = "During your Last pregnancy did you receive an injection in the arm to prevent the baby from getting tetanus that is convulsions after birth?";
  var questionTagalog = "Sa panahon ng iyong pagbubuntis, nabigyan ka ba ng bakuna laban sa tetanus upang maiwasan ng iyong sanggol ang pagkakaroon nito?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var totalCount = yesCount + noCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents </strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  SM9();
}

function SM9(){
  var questionID = "SM9";
  var optionCount = 9;
  var questionEnglish = "Who assisted with the delivery of  your last child?";
  // var questionTagalog = "";
  var skip = questionID + "-skip";
  var totalCount = 0;
  var topicSkipped = 0;
  var answersEnglish = {
    "SM9-A":"doctor",
    "SM9-B":"nurse",
    "SM9-C":"midwife",
    "SM9-D":"trained traditional birth attendant",
    "SM9-E":"trained community/ barangay health worker",
    "SM9-F":"relative/friend",
    "SM9-other":"other",
    "SM9-none":"no one",
    "SM9-skip":"no response"
  };
  var answersTagalog = {
    "SM9-A":"duktor",
    "SM9-B":"nars",
    "SM9-C":"kumadrona",
    "SM9-D":"hilot",
    "SM9-E":"trained community/ barangay health worker",
    "SM9-F":"kamag-anak o kaibigan",
    "SM9-other":"ibang sagot",
    "SM9-none":"wala",
    "SM9-skip":"walang sagot"
  };
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[skip] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      // counts for each of the responses
      for (response in allResponses){
        if (survey[response] === "TRUE"){
          allResponses[response] ++;
        }
      };
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    // "<br><small>" + questionTagalog + "</small>"+
    "</h4><br>"; 
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + totalCount.toString() + " respondents (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped.toString() + " not asked this question)"); 
  SM10();
}


function SM10(){
  var questionID = "SM10";
  var questionEnglish = "During pregnancy, women may encounter severe problems or illnesses and should go or be taken immediately to a health facility. What types of symptoms would cause you to seek immediate care at a health facility (right away)?";
  var questionTagalog = "Sa panahon ng pagbubuntis , ang mga babae ay maaaring magkaroon ng problema o matinding karamdaman at kinakailangang pumunta o agarang dalhin sa sa isang pagamutan. Anong uri ng mga sintomas ang dahilan ng agarang pagkonsulta sa isang pagamutan?";
  var answersEnglish = {
    "SM10-A":"vaginal bleeding",
    "SM10-B":"fast/difficult breathing",
    "SM10-C":"high fever",
    "SM10-D":"severe abdominal pain",
    "SM10-E":"headache/blurred vision",
    "SM10-F":"convulsions",
    "SM10-G":"foul smelling discharge/fluid from vagina",
    "SM10-H":"baby stops moving",
    "SM10-I":"leaking brownish/greenish fluid from the vagina",
    "SM10-other":"other",
    "SM10-dk":"don't know",
    "SM10-skip":"no response"
  };
  var answersTagalog = {
    "SM10-A":"pagdurugo ng pwerta",
    "SM10-B":"mabilis o hirap na paghinga",
    "SM10-C":"mataas na lagnat",
    "SM10-D":"matinding pananakit ng tiyan",
    "SM10-E":"pananakit ng ulo o panlalabo ng mata",
    "SM10-F":"kumbulsyon",
    "SM10-G":"mabahong likido mula sa pwerta",
    "SM10-H":"huminto ang paggalaw ng sanggol",
    "SM10-I":"umaagos na kulay lupa at berdeng likido mula sa pwerta",
    "SM10-other":"ibang sagot",
    "SM10-dk":"hindi alam",
    "SM10-skip":"walang sagot"
  };
  var optionCount = 9;
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var skipped = 0;
  var totalCount = 0;
  var notAskedCount = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "n/a"){
      notAskedCount ++;
    } else if (survey[dk] === "TRUE"){
      dontKnow ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + dontKnow,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var totalCount = atLeastThree + lessThanThree + dontKnow + skipped;
  var infoSelector = "#" + questionID + "_info";
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var dontKnowPerc = formatPerc(dontKnow / totalCount);
  var lessThreeDontKnowPerc = formatPerc((lessThanThree + dontKnow)/totalCount); 
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or don't know <span class='text-tagalog'>[walang sagot]</span> " + 
    " (" + dontKnowPerc + ", " + dontKnow.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span> ("+ thisResponseCount +")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount.toString() + " not asked this question)"); 
  SM11();
}


function SM11(){
  var questionID = "SM11";
  var questionEnglish = "After your last child was born were you and your baby seen by anyone for postnatal care within the next two days?";
  var questionTagalog = "Matapos ipanganak ang inyong bunsong anak, ikaw ba at ang iyong sanggol ay nakita, natignan ng isang health worker sa loob ng 2 araw?";
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "dk"){
        dontknowCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
    
    
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dontknowCount;
  var nodkPerc = formatPerc(nodk / totalCount);
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(nodk / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> ("+
    noPerc + ", " + noCount.toString() + ")" +
    " or don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  SM12();
}

function SM12(){
  var questionID = "SM12";
  var optionCount = 4;
  var questionEnglish = "Whom did you see?";
  var questionTagalog = "Sino ang iyong kinonsulta?";
  var skip = questionID + "-skip";
  var totalCount = 0;
  var topicSkipped = 0;
  var answersEnglish = {
    "SM9-A":"doctor or medical assistant",
    "SM9-B":"nurse",
    "SM9-C":"midwife",
    "SM9-D":"trained traditional birth attendant",
    "SM9-other":"other",
    "SM9-dk":"don't know",
    "SM9-skip":"no response"
  };
  var answersTagalog = {
    "SM9-A":"duktor",
    "SM9-B":"nars",
    "SM9-C":"kumadrona",
    "SM9-D":"hilot",
    "SM9-other":"ibang sagot",
    "SM9-dk":"hindi alam",
    "SM9-skip":"walang sagot"
  };
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[skip] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      // counts for each of the responses
      for (response in allResponses){
        if (survey[response] === "TRUE"){
          allResponses[response] ++;
        }
      };
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small>"+
    "</h4><br>"; 
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + totalCount.toString() + " respondents (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped.toString() + " respondents not asked this question)"); 
  NB6();
}

function NB6(){
  $(infoWrapper).append("<h3><span class='jumpto' id='newborn'></span>Topic: Care of a Newborn</h3><hr>");
  var questionID = "NB6";
  var questionEnglish = "Sometimes newborns have severe illnesses within the first month of life and should be taken immediately to a health facility. What types of symptoms would cause you to take your newborn to a health facility right away?";
  var questionTagalog = "Minsan ang mga bagong panganak na saggol ay maaaring magkaroon ng matinding karamdaman sa loob lamang ng 1 buwan pagkapanganak kailangang madala agad sa isang pagamutan upang masuri. Anong uri ng mga sintomas ang dahilan ng agarang pagkonsulta sa isang pagamutan?";
  var answersEnglish = {
    "NB6-A":"convulsions",
    "NB6-B":"high fever",
    "NB6-C":"poor suckling or feeding",
    "NB6-D":"fast/difficult breathing",
    "NB6-E":"baby feels cold",
    "NB6-F":"baby too small/too early",
    "NB6-G":"yellow palms/soles/eyes",
    "NB6-H":"swollen abdomen",
    "NB6-I":"unconscious",
    "NB6-J":"pus or redness of the umbilical stump, eyes or skin",
    "NB6-other":"other",
    "NB6-dk":"don't know",
    "NB6-skip":"no response"
  };
  var answersTagalog = {
    "NB6-A":"kumbulsyon",
    "NB6-B":"mataas na lagnat",
    "NB6-C":"hindi makasuso o makakain ng maayos",
    "NB6-D":"mabilis/ hirap na paghinga",
    "NB6-E":"nanlalamig",
    "NB6-F":"sanggol ay maliit/maagang ipinanganak",
    "NB6-G":"madilaw ang palad/talampakan/mata",
    "NB6-H":"namamaga ang tiyan",
    "NB6-I":"walang malay",
    "NB6-J":"may nana o pamumula sa kanyang pusod, mata, o balat",
    "NB6-other":"ibang kasagutan",
    "NB6-dk":"hindi alam",
    "NB6-skip":"walang sagot"
  };
  var optionCount = 10;
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var skipped = 0;
  var notAskedCount = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "n/a"){
      notAskedCount ++;
    } else if(survey[dk] === "TRUE"){
      dontKnow ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + dontKnow,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var totalCount = atLeastThree + lessThanThree + dontKnow + skipped;
  var infoSelector = "#" + questionID + "_info";
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var dontKnowPerc = formatPerc(dontKnow / totalCount);
  var lessThreeDontKnowPerc = formatPerc((lessThanThree + dontKnow)/totalCount); 
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or don't know <span class='text-tagalog'>[hindi alam]</span> " + 
    " (" + dontKnowPerc + ", " + dontKnow.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span> ("+ thisResponseCount +")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount.toString() + " not asked this question)"); 
  NB2();
}

function NB2(){
  var questionID = "NB2";
  var questionEnglish = "Did you breastfeed your last baby?";
  // var questionTagalog = "";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var totalCount = yesCount + noCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    // "<br><small>" + questionTagalog + "</small>"+
    "</h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  NB4();
}

function NB4(){
  var questionID = "NB4";
  var questionEnglish = "Did you give the baby the first liquid (Colostrum) that came from your breasts?";
  var questionTagalog = "Binigyan mo ba ang sanggol ng unang patak ng iyong gatas (Colostrum)?";
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "dk"){
      dontknowCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dontknowCount;
  var totalCount = yesCount + noCount + dontknowCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount);
  var nodkPerc = formatPerc(nodk / totalCount); 
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var noPerc = formatPerc(noCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + noPerc +
    ", " + noCount + ") or don't know <span class='text-tagalog'>[hindi alam]</span> (" + dkPerc + ", " +
    dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  NB5();   
}

function NB5(){
  var questionID = "NB5";
  var questionEnglish = "In the first three days after delivery, was the baby given anything to drink other than breast milk?";
  var questionTagalog = "Sa unang tatlong araw matapos mong manganak, binigyan mo ba ng anumang/ibang inumin ang iyong sanggol maliban sa iyong gatas?";
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "dk"){
      dontknowCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dontknowCount;
  var totalCount = yesCount + noCount + dontknowCount + skipped;
  var yesPerc = formatPerc(yesCount / totalCount); 
  var nodkPerc = formatPerc(nodk / totalCount);
  var noPerc = formatPerc(noCount / totalCount);
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<small><strong>Note:</strong> Survey design error meant all section respondents were asked this question and not just those who answered <i>yes</i> to <i>Did you breastfeed your last baby?</i></small><br>"+
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + noPerc +
    ", " + noCount + ") or don't know <span class='text-tagalog'>[hindi alam]</span> (" + dkPerc + ", " +
    dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question)<br>";
  }
  $(infoSelector).append(thisInfoHtml);
  NU2();
}

function NU2(){
  var questionID = "NU2";
  var questionEnglish = "For how many months did you breastfeed your last baby?";
  var questionTagalog = "Ilang buwan mo pinasuso ng iyong gatas ang iyong bunsong anak?";
  var monthResponses = [];
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "999"){
      dkCount ++;
    } else if (thisAnswer == "777") {
      noResponseCount ++;
    } else if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        monthResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxMonths = Math.max.apply(Math,monthResponses);
  var minMonths = Math.min.apply(Math,monthResponses);
  var sum = 0;
  for( var i = 0; i < monthResponses.length; i++ ){
      sum += monthResponses[i];
  }
  var avgMonths = d3.round(sum/monthResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + monthResponses.length.toString() + " respondents providing # of months</strong><br>" +
    "Average months: " + avgMonths.toString() + "<br>" +
    "Min: " + minMonths.toString() + " / Max: " + maxMonths.toString() + "<br>"+
    "(" + dkCount.toString() + " don't know, " + noResponseCount.toString() + " no response, " + 
    notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  WS1();
}








function WS1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='sanitation'></span>Topic: Safe Water, Hygiene, and Sanitation</h3><hr>");
  var questionID = "cbhfa-WS_group-WS1";
  var optionCount = 13;
  var questionEnglish = "What is the main source of drinking water for members of this household?";
  var questionTagalog = "Ano ang pangunahing pinagkukunan niyo ng inuming tubig sa inyong tahanan?";
  var answersEnglish = {
    "A":"piped water into dwelling",
    "B":"piped water into yard/plot/building",
    "C":"public tap/standpipe",
    "D":"tubewell/borehole",
    "E":"protected dug well",
    "F":"unprotected dug well",
    "G":"protected spring",
    "H":"unprotected spring",
    "I":"rain water collection",
    "J":"cart with small tank/drum",
    "K":"tanker truck",
    "L":"bottled water",
    "M":"surface water (river/pond/lake/dam/stream/canal/irrigation channels) ",
    "other":"other <span class='text-tagalog'>[iba pang kasagutan]</span>",
    "skip":"no response <span class='text-tagalog'>[walang sagot]</span>",
  };
  var topicSkipped = 0;
  var totalCount = 0;
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "n/a"){
      topicSkipped ++;
    } else {
      allResponses[thisAnswer] ++;
      totalCount ++;
    }   
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + totalCount.toString() + " respondents (single response)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponse = answersEnglish[response];   
    thisHtml = thisResponsePerc + " - " + thisResponse;
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + topicSkipped + " not asked this question)");  
  WS4();
}

function WS4(){
  var questionID = "WS4";
  var questionEnglish = "What kind of toilet facility does this household use?";
  var questionTagalog = "Anong uri ng palikuran ang inyong ginagamit sa bahay?";
  var totalCount = 0;
  var questionSkipped = 0;
  var answersEnglish = {
    "A":"piped sewer system and flush/pour-flush toilet",
    "B":"septic tank and flush/pour-flush toilet",
    "C":"pit and flush/pour-flush toilet",
    "D":"elsewhere and flush/pour-flush toilet",
    "E":"to don’t know where and flush/pour-flush toilet",
    "F":"ventilated improved pit latrine (vip)",
    "G":"simple pit latrine with slab",
    "H":"pit latrine without slab/open pit",
    "I":"composting/dry toilet",
    "J":"service or bucket latrine (where excreta are manually removed)",
    "K":"hanging latrine",
    "L":"no facility, field, bush, plastic bag",
    "skip":"no response"
  };

  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer === "n/a"){
      questionSkipped ++;
    } else {
      totalCount ++;
      allResponses[thisAnswer] ++;
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small>"+
    "</h4><br>"; 
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + totalCount.toString() + " respondents</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    // var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng;
    // if(thisResponseEng !== thisResponseTag){
    //   thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    // }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + questionSkipped.toString() + " respondents not asked this question)"); 
  WS5();
}

function WS5(){
  var questionID = "WS5";
  var questionEnglish = "Where is this toilet facility located?";
  var questionTagalog = "Saan matatagpuan ang inyong palikuran/banyo?";
  var totalCount = 0;
  var questionSkipped = 0;
  var answersEnglish = {
    "A":"inside or attached to dwelling",
    "B":"elsewhere inside yard",
    "C":"outside yard",
    "skip":"no response"
  };
  var answersTagalog = {
    "A":"sa loon ng bahay/tahanan",
    "B":"kahit saan sa loon ng bakuran",
    "C":"sa labas ng bakuran",
    "skip":"walang sagot"
  };
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer === "n/a"){
      questionSkipped ++;
    } else {
      totalCount ++;
      allResponses[thisAnswer] ++;
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small>"+
    "</h4><br>"; 
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + totalCount.toString() + " respondents</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + questionSkipped.toString() + " respondents not asked this question)"); 
  WS6();
}


function WS6(){
  var questionID = "WS6";
  var questionEnglish = "Is this toilet facility shared?";
  // var questionTagalog = "";
  var totalCount = 0;
  var questionSkipped = 0;
  var answersEnglish = {
    "yes":"yes",
    "no":"not shared (just myself)",
    "dk":"don't know",
    "skip":"no response"
  };
  var answersTagalog = {
    "yes":"oo",
    "no":"walang iba (ako lang)",
    "dk":"hindi alam",
    "skip":"walang sagot"
  };
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer === "n/a"){
      questionSkipped ++;
    } else {
      totalCount ++;
      allResponses[thisAnswer] ++;
    } 
  });
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + questionEnglish +
    // "<br><small>" + questionTagalog + "</small>"+
    "</h4><br>"; 
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + totalCount.toString() + " respondents</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + questionSkipped.toString() + " respondents not asked this question)"); 
  WS6number();
}

 

function WS6number(){
  var questionID = "WS6_number";
  var questionEnglish = "How many people share this toilet facility?";
  var questionTagalog = "Ilang tao ang gumagamit sa inyong palikuran?";
  var numberResponses = [];
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    var thisAnswer = survey[questionID];
    if (thisAnswer == "n/a"){
      notAskedCount ++;
    } else {
      if(isFinite(parseInt(thisAnswer, 10)) == true){
        numberResponses.push(parseInt(thisAnswer, 10));
      }
    }
  });
  var maxNumber = Math.max.apply(Math,numberResponses);
  var minNumber = Math.min.apply(Math,numberResponses);
  var sum = 0;
  for( var i = 0; i < numberResponses.length; i++ ){
      sum += numberResponses[i];
  }
  var avgNumber = d3.round(sum/numberResponses.length, 2);
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>"+
    "<strong>" + numberResponses.length.toString() + " respondents providing # of people</strong><br>" +
    "Average number: " + avgNumber.toString() + "<br>" +
    "Min: " + minNumber.toString() + " / Max: " + maxNumber.toString() + "<br>"+
    "(" + notAskedCount.toString() + " not asked this question)";
  $(infoSelector).append(thisInfoHtml);
  WS9();
}

function WS9(){
  var questionID = "WS9";
  var questionEnglish = "Toilet facility observation: Is there faecal matter present inside the facility - on seat, floor, door, or walls (human or animal)?";
  var questionTagalog = "Pagmamasid sa palikuran/banyo: Mayroon bang dumi na nakakalat sa sahig, pinto, pader (tao o hayop)?";
  var yesCount = 0;
  var noCount = 0;
  var cannotObserveCount = 0;
  var notAskedCount = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "cannot"){
        cannotObserveCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "no",
      y: noCount,
    },
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "cannot",
      y: cannotObserveCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var cannotPerc =formatPerc(cannotObserveCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " observations</strong><br>" +
    "<span class='percText-1'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ") <br>" + 
    "<span class='percText-2'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + cannotPerc + "</span> cannot assess <span class='text-tagalog'>[hindi masuri]</span> (" + 
    cannotObserveCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " no observation attempted)";
  $(infoSelector).append(thisInfoHtml);   
  WS10();
}

function WS10(){
  var questionID = "WS10";
  var questionEnglish = "Toilet facility observation: Is there any overflow of the sewer or septic systems?";
  var questionTagalog = "Pagmamasid sa palikuran/banyo: Mayroon bang pag-apaw sa padalaluyan o septik?";
  var yesCount = 0;
  var noCount = 0;
  var cannotObserveCount = 0;
  var notAskedCount = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "cannot"){
        cannotObserveCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "no",
      y: noCount,
    },
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "cannot",
      y: cannotObserveCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var cannotPerc =formatPerc(cannotObserveCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " observations</strong><br>" +
    "<span class='percText-1'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ") <br>" + 
    "<span class='percText-2'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + cannotPerc + "</span> cannot assess <span class='text-tagalog'>[hindi masuri]</span> (" + 
    cannotObserveCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " no observation attempted)";
  $(infoSelector).append(thisInfoHtml);   
  WS11();
}

function WS11(){
  var questionID = "WS11";
  var questionEnglish = "Toilet facility observation: Is there a cover on the hole?";
  var questionTagalog = "Pagmamasid sa palikuran/banyo: Mayroon bang takip ang butas?";
  var yesCount = 0;
  var noCount = 0;
  var cannotObserveCount = 0;
  var notAskedCount = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "cannot"){
        cannotObserveCount ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "no",
      y: noCount,
    },
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "cannot",
      y: cannotObserveCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var cannotPerc =formatPerc(cannotObserveCount / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " observations</strong><br>" +
    "<span class='percText-1'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ") <br>" + 
    "<span class='percText-2'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + cannotPerc + "</span> cannot assess <span class='text-tagalog'>[hindi masuri]</span> (" + 
    cannotObserveCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " no observation attempted)";
  $(infoSelector).append(thisInfoHtml);   
  WS16();
}


function WS16(){
  var questionID = "WS16";
  var questionEnglish = "Do you know when to wash hands with soap?";
  var questionTagalog = "Tuwing kalian dapat naghuhugas ng kamay?";
  var answersEnglish = {
    "WS16-never":"never",
    "WS16-A":"after defecating",
    "WS16-B":"after urinating",
    "WS16-C":"before food preparation",
    "WS16-D":"before eating",
    "WS16-E":"before feeding children/baby",
    "WS16-F":"after cleaning baby/changing diapers",
    "WS16-G":"after handling animals",
    "WS16-H":"after caring for an ill person",
    "WS16-I":"no special time, when they are dirty",
    "WS16-dk":"don't know",
    "WS16-other":"other",
    "WS16-skip":"no response"
  };
  var answersTagalog = {
    "WS16-never":"hindi kailanman",
    "WS16-A":"pagkatapos dumumi",
    "WS16-B":"pagkatapos umihi",
    "WS16-C":"bago magluto",
    "WS16-D":"bago kumain",
    "WS16-E":"bago pakainin ang sanggol/anak",
    "WS16-F":"pagkatapos linisan o palitan ng diaper ang sanggol",
    "WS16-G":"pagkatapos humawak ng hayop",
    "WS16-H":"pagkatapos humawak sa may sakit ",
    "WS16-I":"kung madumi lamang ang kamay",
    "WS16-dk":"hindi alam",
    "WS16-other":"ibang sagot",
    "WS16-skip":"walang sagot"
  };
  var optionCount = 9;
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var otherCount = 0;
  var neverCount = 0;
  var skipped = 0;
  var notAskedCount = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var other = questionID + "-other";
  var never = questionID + "-never";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "n/a"){
      notAskedCount ++;
    } else if(survey[dk] === "TRUE"){
      dontKnow ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else if (survey[never] === "TRUE"){
      neverCount ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + dontKnow + neverCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var totalCount = atLeastThree + lessThanThree + dontKnow + neverCount + skipped;
  var infoSelector = "#" + questionID + "_info";
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var dontKnowPerc = formatPerc(dontKnow / totalCount);
  var neverPerc = formatPerc(neverCount / totalCount);
  var lessThreeDontKnowNeverPerc = formatPerc((lessThanThree + dontKnow + neverCount)/totalCount); 
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowNeverPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or never <span class='text-tagalog'>[hindi kailanman]</span> (" +
    neverPerc + ", " + neverCount.toString() + ") " +
    " or don't know <span class='text-tagalog'>[hindi alam]</span> " + 
    " (" + dontKnowPerc + ", " + dontKnow.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span> ("+ thisResponseCount +")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount.toString() + " not asked this question)"); 
  DI1();
}

function DI1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='diarrhea'></span>Topic: Diarrhea and Dehydation</h3><hr>");
  var questionID = "DI1";
  var questionEnglish = "Has any family member had Diarrhea in the last 2 weeks? (define it if needed)";
  var questionTagalog = "Mayroon bang miyembro ng pamilya na nakaranas ng pagtatae sa nakaraang dalawang linggo? (ipalarawan kung kailangan)";
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "dk"){
        dontknowCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      } 
    }    
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dontknowCount;
  var nodkPerc = formatPerc(nodk / totalCount);
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(nodk / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> ("+
    noPerc + ", " + noCount.toString() + ")" +
    " or don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  DI14();  
}

function DI14(){
  var questionID = "DI14";
  var questionEnglish = "Do you know when to wash hands with soap?";
  var questionTagalog = "Tuwing kelan dapat maghugas ng kamay gamit ang sabon?";
  var answersEnglish = {
    "WS16-never":"never",
    "WS16-A":"after defecating",
    "WS16-B":"after urinating",
    "WS16-C":"before food preparation",
    "WS16-D":"before eating",
    "WS16-E":"before feeding children/baby",
    "WS16-F":"after cleaning baby/changing diapers",
    "WS16-G":"after handling animals",
    "WS16-H":"after caring for an ill person",
    "WS16-I":"no special time, when they are dirty",
    "WS16-dk":"don't know",
    "WS16-other":"other",
    "WS16-skip":"no response"
  };
  var answersTagalog = {
    "WS16-never":"hindi kailanman",
    "WS16-A":"pagkatapos dumumi",
    "WS16-B":"pagkatapos umihi",
    "WS16-C":"bago magluto",
    "WS16-D":"bago kumain",
    "WS16-E":"bago pakainin ang sanggol/anak",
    "WS16-F":"pagkatapos linisan o palitan ng diaper ang sanggol",
    "WS16-G":"pagkatapos humawak ng hayop",
    "WS16-H":"pagkatapos humawak sa may sakit ",
    "WS16-I":"kung madumi lamang ang kamay",
    "WS16-dk":"hindi alam",
    "WS16-other":"ibang sagot",
    "WS16-skip":"walang sagot"
  };
  var optionCount = 9;
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var otherCount = 0;
  var neverCount = 0;
  var skipped = 0;
  var notAskedCount = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var other = questionID + "-other";
  var never = questionID + "-never";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in answersEnglish){
    allResponses[responseOption] = 0;
  }
  $.each(filteredData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "n/a"){
      notAskedCount ++;
    } else if(survey[dk] === "TRUE"){
      dontKnow ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else if (survey[never] === "TRUE"){
      neverCount ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "at least 3",
      y: atLeastThree,
    },
    {
      key: "less than 3",
      y: lessThanThree + dontKnow + neverCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var totalCount = atLeastThree + lessThanThree + dontKnow + neverCount + skipped;
  var infoSelector = "#" + questionID + "_info";
  var atLeastThreePerc = formatPerc(atLeastThree / totalCount); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalCount);
  var dontKnowPerc = formatPerc(dontKnow / totalCount);
  var neverPerc = formatPerc(neverCount / totalCount);
  var lessThreeDontKnowNeverPerc = formatPerc((lessThanThree + dontKnow + neverCount)/totalCount); 
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " (" + atLeastThree.toString() + ")<br>" +
    "<span class='percText-2'>" +lessThreeDontKnowNeverPerc + "</span> could identify less than three key responses ("+
    lessThanThreePerc + ", " + lessThanThree.toString()  + ") or never <span class='text-tagalog'>[hindi kailanman]</span> (" +
    neverPerc + ", " + neverCount.toString() + ") " +
    " or don't know <span class='text-tagalog'>[hindi alam]</span> " + 
    " (" + dontKnowPerc + ", " + dontKnow.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> ("+
    skipped.toString() + ")</p>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses (multiple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    var thisHtml = thisResponsePerc + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span> ("+ thisResponseCount +")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append("(" + notAskedCount.toString() + " not asked this question)"); 
  AR2();
}


 
function AR2(){
  $(infoWrapper).append("<h3><span class='jumpto' id='ari'></span>Topic: Acute Respiratory Infections</h3><hr>");
  var questionID = "AR2";
  var questionEnglish = "Has any family member had an illness with a cough at any time in the last two weeks?";
  var questionTagalog = "May miymbro ban g pamilya na nagkasakit na may kasamang ubo sa nakalipas na 2 linggo?";
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "dk"){
        dontknowCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      } 
    }    
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dontknowCount;
  var nodkPerc = formatPerc(nodk / totalCount);
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(nodk / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> ("+
    noPerc + ", " + noCount.toString() + ")" +
    " or don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  AR3();
}


function AR3(){
  var questionID = "AR3";
  var questionEnglish = "When any family member had an illness with a cough, did he/she have trouble breathing or breathe faster than usual with short, fast breaths?";
  var questionTagalog = "Kung nagkasakit at may kasamang ubo at kahit sino sa pamilya, nagkaroon ba sya ng problema sa paghinga?";
  var yesCount = 0;
  var noCount = 0;
  var dontknowCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "dk"){
        dontknowCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      } 
    }    
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no/dk",
      y: noCount + dontknowCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var nodk = noCount + dontknowCount;
  var nodkPerc = formatPerc(nodk / totalCount);
  var dkPerc = formatPerc(dontknowCount / totalCount);
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(nodk / totalCount);
  var skipPerc = formatPerc(skipped / totalCount);
  
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + nodkPerc + "</span> no <span class='text-tagalog'>[hindi]</span> ("+
    noPerc + ", " + noCount.toString() + ")" +
    " or don't know <span class='text-tagalog'>[hindi alam]</span> (" + 
    dkPerc + ", " + dontknowCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + skipPerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  malaria();
}

function malaria(){
  $(infoWrapper).append("<h3><span class='jumpto' id='malaria'></span>Topic: Malaria Prevention and Control</h3><hr>");
  var questionID = "malaria_start";
  var questionEnglish = "Have you ever heard of Malaria?";
  var questionTagalog = "May kaalaman ka ba tungkol sa Malaria?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  DN1();
}

function DN1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='dengue'></span>Topic: Dengue Prevention and Control</h3><hr>");
  var questionID = "DN1";
  var questionEnglish = "Have you ever heard of Dengue Fever?";
  var questionTagalog = "May kaalaman ka ba tungkol sa Dengue?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  MN1();  
}

function MN1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='mosquitonets'></span>Topic: Mosquito Net Use</h3><hr>");
  var questionID = "MN1";
  var questionEnglish = "Does your household have any mosquito nets that can be used while sleeping?";
  var questionTagalog = "Gumagamit ba kayo ng kulambo sa inyong pagtulog?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  HA1();
}
 

function HA1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='hiv'></span>Topic: HIV and Sexually Transmitted Infections (STI)</h3><hr>");
  var questionID = "HA1";
  var questionEnglish = "Have you ever heard of an illness called AIDS or an infection called HIV?";
  var questionTagalog = "Narinig mo na ba ang tungkol sa sakit na AIDS o ang impeksyon na HIV?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  TB1();
}



function TB1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='tb'></span>Topic: Tuberculosis (TB)</h3><hr>");
  var questionID = "TB1";
  var questionEnglish = "Have you heard about the disease called Tuberculosis or TB?";
  var questionTagalog = "Narinig mo na ba ang sakit na Tuberculosis o TB?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  BD1();
}


function BD1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='blooddonation'></span>Topic: Blood Donation</h3><hr>");
  var questionID = "BD1";
  var questionEnglish = "Have you donated blood in the last 12 months?";
  var questionTagalog = "Nag-donate ka ba ng dugo sa nakalipas na 12 buwan?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);  
  BD2(); 
}


function BD2(){
  var questionID = "BD2";
  var questionEnglish = "Have any of your family member donated blood in the last 12 months?";
  var questionTagalog = "Mayroon bang miyembro ng pamilya na nag-donate ng dugo ng nakaraang 12 buwan?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  RS1();  
}


function RS1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='roadsafety'></span>Topic: Road Safety</h3><hr>");
  var questionID = "RS1";
  var questionEnglish = "Do you currently own a motorcycle or has one been provided for you to use?";
  var questionTagalog = "Sa kasalukuyan, ikaw ba ay nagmamay-ari ng isang motosiklo?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  NC1();   
}


function NC1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='noncommunicablediseases'></span>Topic: Noncommunicable Diseases</h3><hr>");
  var questionID = "NC1";
  var questionEnglish = "Have you ever consumed an alcoholic drink such as wine, beer, spirit?";
  var questionTagalog = "Nakainom ka na ba ng mga inumin na may alcohol tulad ng wine, beer, spirit?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  NC2();
}

function NC2(){
  var questionID = "NC2";
  var questionEnglish = "Have you consumed an alcoholic drink within the past 12 months?";
  var questionTagalog = "Nakainom ka na ba ng inumin na may alcohol sa nakalipas na 12 buwan?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  NC3();  
}


function NC3(){
  var questionID = "NC3";
  var questionEnglish = "Have you consumed an alcoholic drink within the past 30 days?";
  var questionTagalog = "Nakainom ka ba ng inuming may alcohol sa nakalipas na 30 araw?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  NC6();  
}

function NC6(){
  var questionID = "NC6";
  var questionEnglish = "Does your work involve moderate-intensity activity that causes large increase in breathing or heart rate like carrying or lifting heavy loads, digging, harvesting for at least 10 minutes continuously?";
  var questionTagalog = "Ang iyong trabaho ba ay nangangailangan ng katamtamang lakas na mga gawain na nagdudulot ng pagbilis ng paghinga at pagbilis ng pintig ng puso kagaya ng pagdadala at pagbubuhat ng mabibigat na bagay, paghuhukay at pag-ani ng tuloy-tuloy sa loob ng kahit na 10 minuto?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  NC9();  
}

function NC9(){
  var questionID = "NC9";
  var questionEnglish = "Do you do any moderate-intensity sports, fitness or recreational activities (adult) that cause large increases in breathing or heart rate like running or football for at least 10 minutes continuously?";
  var questionTagalog = "May ginagawa ka bang katamtamang lakas na mga laro, gawaing pampalakas ng katawan, panlibangan (may sapat na gulang) na nagdudulot ng pagbilis ng paghinga at pintig ng puso kagaya ng pagtakbo o paglalaro ng football na tuloy-tuloy sa loob ng kahit na 10 minuto?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" + 
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);  
  NC12(); 
}

function NC12(){
  var questionID = "NC12";
  var questionEnglish = "Do you currently smoke any tobacco products such as cigarettes, cigars or pipes?";
  var questionTagalog = "Sa kasalukuyan, ikaw ba ay naninigarilyo ng mga produkto ng tabako katulad ng cigarettes, cigars o pipes?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  NC13(); 
}

function NC13(){
  var questionID = "NC13";
  var questionEnglish = "Do you currently smoke tobacco products daily?";
  var questionTagalog = "Sa kasalukuyan, ikaw ba ay naninigarilyo ng tabako araw-araw?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml); 
  NC15(); 
}

function NC15(){
  var questionID = "NC15";
  var questionEnglish = "Have you ever had your blood pressure measured by a doctor or other health worker?";
  var questionTagalog = "Nagkaroon ba ng pagkakataon na ipasuri mo sa duktor/nars ang iyong blood pressure?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);  
  NC16();
}

function NC16(){
  var questionID = "NC16";
  var questionEnglish = "Have you ever been told by a doctor or other health worker that you have raised blood pressure or hypertension?";
  var questionTagalog = "May pagkakataon bang na sinabihan ka ng duktor/nars na mataas ang iyong blood pressure?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  NC17();  
}

function NC17(){
  var questionID = "NC17";
  var questionEnglish = "Have you been told in the past 12 months?";
  var questionTagalog = "Sinabihan ka ba sa nakalipas na 12 buwan?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  var topicSkipped = 0;
  var totalCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      topicSkipped ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "yes"){
        yesCount ++;
      }
      if (survey[questionID] === "no"){
        noCount ++;
      }
      if (survey[questionID] === "skip"){
        skipped ++;
      }
    }
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    }, 
    {
      key: "no",
      y: noCount,
    },
    {
      key: "skip",
      y: skipped,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .color(pieColors)
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var yesPerc = formatPerc(yesCount / totalCount); 
  var noPerc = formatPerc(noCount / totalCount);
  var noResponsePerc = formatPerc(skipped / totalCount);
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='percText-1'>" + yesPerc + "</span> yes <span class='text-tagalog'>[oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-2'>" + noPerc + "</span> no <span class='text-tagalog'>[hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-3'>" + noResponsePerc + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);  
  VP1();
}


function VP1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='violenceprevention'></span>Topic: Violence Prevention</h3><hr>");
  var questionID = "VP1";
  var questionEnglish = 'To what extent do you agree with the statement: "Violence against women, men, girls and boys is preventable."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Ang karahasan sa mga kababaihan at kalalakihan ay maiiwasan."';
  var totalCount = 0;
  var agreeCount = 0;
  var neitherCount = 0;
  var disagreeCount = 0;
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "agree"){ agreeCount ++; }
      if (survey[questionID] === "neither"){ neitherCount ++; }
      if (survey[questionID] === "disagree"){ disagreeCount ++; }
      if (survey[questionID] === "dk"){ dkCount ++; }
      if (survey[questionID] === "skip"){ noResponseCount ++; }
    }
  });
  // the viz is overlapping svg rectangle in the same category order
  // calculate each width as its own percentage plus those to the left
  var agree = (agreeCount / totalCount) * 100
  var neither = agree + ((neitherCount / totalCount) * 100);
  var disagree = neither + ((disagreeCount / totalCount) * 100);
  var dk = disagree + ((dkCount / totalCount) * 100);
  var noResponse = dk + ((noResponseCount / totalCount) * 100);
  agree = agree.toString() + "%";
  neither = neither.toString() + "%";
  disagree = disagree.toString() + "%";
  dk = dk.toString() + "%";
  noResponse = noResponse.toString() + "%";
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4><br>"+
    '<div id="' + questionID + '_bar" class="question-block">' +
    '<div class="responsesBar">' +
      '<svg width="100%" height="30">' +
        '<rect class="response-bar noResponse" y="0" height="100%" width="'+ noResponse +'" ></rect>' +
        '<rect class="response-bar dk" y="0" height="100%" width="'+ dk +'" ></rect>' +
        '<rect class="response-bar disagree" y="0" height="100%" width="'+ disagree +'" ></rect>' +
        '<rect class="response-bar neither" y="0" height="100%" width="'+ neither +'" ></rect>' +
        '<rect class="response-bar agree" y="0" height="100%" width="'+ agree +'" ></rect>' +
      '</svg></div></div>' +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='text-agree'>" + formatPerc(agreeCount / totalCount) + "</span> agree <span class='text-tagalog'>[sang-ayon]</span> (" +
    agreeCount.toString() + ")<br>" +
    "<span class='text-neither'>" + formatPerc(neitherCount / totalCount) + "</span> neither <span class='text-tagalog'>[wala sa anuman]</span> (" +
    neitherCount.toString() + ")<br>" +
    "<span class='text-disagree'>" + formatPerc(disagreeCount / totalCount) + "</span> disagree <span class='text-tagalog'>[hindi sang-ayon]</span> (" +
    disagreeCount.toString() + ")<br>" +
    "<span class='text-dk'>" + formatPerc(dkCount / totalCount) + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" +
    dkCount.toString() + ")<br>" +
    "<span class='text-noResponse'>" + formatPerc(noResponseCount / totalCount) + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" +
    noResponseCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " respondents not asked this question)<br>";
  $(infoSelector).append(thisInfoHtml);
  VP2();
}

function VP2(){
  var questionID = "VP2";
  var questionEnglish = 'To what extent do you agree with the statement: "There are certain situations in a family when it is okay to hit someone else."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "May mga pagkakataon na maaaring paluin o saktan ng pisikal ang isang tao sa pamilya."';
  var totalCount = 0;
  var agreeCount = 0;
  var neitherCount = 0;
  var disagreeCount = 0;
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "agree"){ agreeCount ++; }
      if (survey[questionID] === "neither"){ neitherCount ++; }
      if (survey[questionID] === "disagree"){ disagreeCount ++; }
      if (survey[questionID] === "dk"){ dkCount ++; }
      if (survey[questionID] === "skip"){ noResponseCount ++; }
    }
  });
  // the viz is overlapping svg rectangle in the same category order
  // calculate each width as its own percentage plus those to the left
  var agree = (agreeCount / totalCount) * 100
  var neither = agree + ((neitherCount / totalCount) * 100);
  var disagree = neither + ((disagreeCount / totalCount) * 100);
  var dk = disagree + ((dkCount / totalCount) * 100);
  var noResponse = dk + ((noResponseCount / totalCount) * 100);
  agree = agree.toString() + "%";
  neither = neither.toString() + "%";
  disagree = disagree.toString() + "%";
  dk = dk.toString() + "%";
  noResponse = noResponse.toString() + "%";
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
    var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4><br>"+
    '<div id="' + questionID + '_bar" class="question-block">' +
    '<div class="responsesBar">' +
      '<svg width="100%" height="30">' +
        '<rect class="response-bar noResponse" y="0" height="100%" width="'+ noResponse +'" ></rect>' +
        '<rect class="response-bar dk" y="0" height="100%" width="'+ dk +'" ></rect>' +
        '<rect class="response-bar disagree" y="0" height="100%" width="'+ disagree +'" ></rect>' +
        '<rect class="response-bar neither" y="0" height="100%" width="'+ neither +'" ></rect>' +
        '<rect class="response-bar agree" y="0" height="100%" width="'+ agree +'" ></rect>' +
      '</svg></div></div>' +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='text-agree'>" + formatPerc(agreeCount / totalCount) + "</span> agree <span class='text-tagalog'>[sang-ayon]</span> (" +
    agreeCount.toString() + ")<br>" +
    "<span class='text-neither'>" + formatPerc(neitherCount / totalCount) + "</span> neither <span class='text-tagalog'>[wala sa anuman]</span> (" +
    neitherCount.toString() + ")<br>" +
    "<span class='text-disagree'>" + formatPerc(disagreeCount / totalCount) + "</span> disagree <span class='text-tagalog'>[hindi sang-ayon]</span> (" +
    disagreeCount.toString() + ")<br>" +
    "<span class='text-dk'>" + formatPerc(dkCount / totalCount) + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" +
    dkCount.toString() + ")<br>" +
    "<span class='text-noResponse'>" + formatPerc(noResponseCount / totalCount) + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" +
    noResponseCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " respondents not asked this question)<br>";
  $(infoSelector).append(thisInfoHtml);
  VP3();
}

function VP3(){
  var questionID = "VP3";
  var questionEnglish = 'To what extent do you agree with the statement: "A woman always has the right to refuse sexual contact."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Ang isang babae ay may karapatang tumanggi sa pakikipagtalik."';
  var totalCount = 0;
  var agreeCount = 0;
  var neitherCount = 0;
  var disagreeCount = 0;
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "agree"){ agreeCount ++; }
      if (survey[questionID] === "neither"){ neitherCount ++; }
      if (survey[questionID] === "disagree"){ disagreeCount ++; }
      if (survey[questionID] === "dk"){ dkCount ++; }
      if (survey[questionID] === "skip"){ noResponseCount ++; }
    }
  });
  // the viz is overlapping svg rectangle in the same category order
  // calculate each width as its own percentage plus those to the left
  var agree = (agreeCount / totalCount) * 100
  var neither = agree + ((neitherCount / totalCount) * 100);
  var disagree = neither + ((disagreeCount / totalCount) * 100);
  var dk = disagree + ((dkCount / totalCount) * 100);
  var noResponse = dk + ((noResponseCount / totalCount) * 100);
  agree = agree.toString() + "%";
  neither = neither.toString() + "%";
  disagree = disagree.toString() + "%";
  dk = dk.toString() + "%";
  noResponse = noResponse.toString() + "%";
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
    var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4><br>"+
    '<div id="' + questionID + '_bar" class="question-block">' +
    '<div class="responsesBar">' +
      '<svg width="100%" height="30">' +
        '<rect class="response-bar noResponse" y="0" height="100%" width="'+ noResponse +'" ></rect>' +
        '<rect class="response-bar dk" y="0" height="100%" width="'+ dk +'" ></rect>' +
        '<rect class="response-bar disagree" y="0" height="100%" width="'+ disagree +'" ></rect>' +
        '<rect class="response-bar neither" y="0" height="100%" width="'+ neither +'" ></rect>' +
        '<rect class="response-bar agree" y="0" height="100%" width="'+ agree +'" ></rect>' +
      '</svg></div></div>' +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='text-agree'>" + formatPerc(agreeCount / totalCount) + "</span> agree <span class='text-tagalog'>[sang-ayon]</span> (" +
    agreeCount.toString() + ")<br>" +
    "<span class='text-neither'>" + formatPerc(neitherCount / totalCount) + "</span> neither <span class='text-tagalog'>[wala sa anuman]</span> (" +
    neitherCount.toString() + ")<br>" +
    "<span class='text-disagree'>" + formatPerc(disagreeCount / totalCount) + "</span> disagree <span class='text-tagalog'>[hindi sang-ayon]</span> (" +
    disagreeCount.toString() + ")<br>" +
    "<span class='text-dk'>" + formatPerc(dkCount / totalCount) + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" +
    dkCount.toString() + ")<br>" +
    "<span class='text-noResponse'>" + formatPerc(noResponseCount / totalCount) + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" +
    noResponseCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " respondents not asked this question)<br>";
  $(infoSelector).append(thisInfoHtml);
  VP4();
}

function VP4(){
  var questionID = "VP4";
  var questionEnglish = 'To what extent do you agree with the statement: "Constantly insulting another person is a form of violence."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Ang madalas na pag-iinsulto sa isang tao ay uri ng karahasan."';
  var totalCount = 0;
  var agreeCount = 0;
  var neitherCount = 0;
  var disagreeCount = 0;
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "agree"){ agreeCount ++; }
      if (survey[questionID] === "neither"){ neitherCount ++; }
      if (survey[questionID] === "disagree"){ disagreeCount ++; }
      if (survey[questionID] === "dk"){ dkCount ++; }
      if (survey[questionID] === "skip"){ noResponseCount ++; }
    }
  });
  // the viz is overlapping svg rectangle in the same category order
  // calculate each width as its own percentage plus those to the left
  var agree = (agreeCount / totalCount) * 100
  var neither = agree + ((neitherCount / totalCount) * 100);
  var disagree = neither + ((disagreeCount / totalCount) * 100);
  var dk = disagree + ((dkCount / totalCount) * 100);
  var noResponse = dk + ((noResponseCount / totalCount) * 100);
  agree = agree.toString() + "%";
  neither = neither.toString() + "%";
  disagree = disagree.toString() + "%";
  dk = dk.toString() + "%";
  noResponse = noResponse.toString() + "%";
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
    var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4><br>"+
    '<div id="' + questionID + '_bar" class="question-block">' +
    '<div class="responsesBar">' +
      '<svg width="100%" height="30">' +
        '<rect class="response-bar noResponse" y="0" height="100%" width="'+ noResponse +'" ></rect>' +
        '<rect class="response-bar dk" y="0" height="100%" width="'+ dk +'" ></rect>' +
        '<rect class="response-bar disagree" y="0" height="100%" width="'+ disagree +'" ></rect>' +
        '<rect class="response-bar neither" y="0" height="100%" width="'+ neither +'" ></rect>' +
        '<rect class="response-bar agree" y="0" height="100%" width="'+ agree +'" ></rect>' +
      '</svg></div></div>' +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='text-agree'>" + formatPerc(agreeCount / totalCount) + "</span> agree <span class='text-tagalog'>[sang-ayon]</span> (" +
    agreeCount.toString() + ")<br>" +
    "<span class='text-neither'>" + formatPerc(neitherCount / totalCount) + "</span> neither <span class='text-tagalog'>[wala sa anuman]</span> (" +
    neitherCount.toString() + ")<br>" +
    "<span class='text-disagree'>" + formatPerc(disagreeCount / totalCount) + "</span> disagree <span class='text-tagalog'>[hindi sang-ayon]</span> (" +
    disagreeCount.toString() + ")<br>" +
    "<span class='text-dk'>" + formatPerc(dkCount / totalCount) + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" +
    dkCount.toString() + ")<br>" +
    "<span class='text-noResponse'>" + formatPerc(noResponseCount / totalCount) + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" +
    noResponseCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " respondents not asked this question)<br>";
  $(infoSelector).append(thisInfoHtml);
  VP5();
}

function VP5(){
  var questionID = "VP5";
  var questionEnglish = 'To what extent do you agree with the statement: "People who see or hear violence occurring have an important role to stop the violence when it is safe to do so."';
  var questionTagalog = 'Sang-ayon ka ba o hindi sa panabing: "Sinuman ang nakakakita o nakakarinig ng kahit anong uri ng karahasan ay may importanteng ganap upang maitigil o maihinto sa ligtas na sitwasyon."';
  var totalCount = 0;
  var agreeCount = 0;
  var neitherCount = 0;
  var disagreeCount = 0;
  var dkCount = 0;
  var noResponseCount = 0;
  var notAskedCount = 0;
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "n/a"){
      notAskedCount ++;
    } else {
      totalCount ++;
      if (survey[questionID] === "agree"){ agreeCount ++; }
      if (survey[questionID] === "neither"){ neitherCount ++; }
      if (survey[questionID] === "disagree"){ disagreeCount ++; }
      if (survey[questionID] === "dk"){ dkCount ++; }
      if (survey[questionID] === "skip"){ noResponseCount ++; }
    }
  });
  // the viz is overlapping svg rectangle in the same category order
  // calculate each width as its own percentage plus those to the left
  var agree = (agreeCount / totalCount) * 100
  var neither = agree + ((neitherCount / totalCount) * 100);
  var disagree = neither + ((disagreeCount / totalCount) * 100);
  var dk = disagree + ((dkCount / totalCount) * 100);
  var noResponse = dk + ((noResponseCount / totalCount) * 100);
  agree = agree.toString() + "%";
  neither = neither.toString() + "%";
  disagree = disagree.toString() + "%";
  dk = dk.toString() + "%";
  noResponse = noResponse.toString() + "%";
  $("#infoWrapper").append('<div class="row"><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var infoSelector = "#" + questionID + "_info";
    var thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4><br>"+
    '<div id="' + questionID + '_bar" class="question-block">' +
    '<div class="responsesBar">' +
      '<svg width="100%" height="30">' +
        '<rect class="response-bar noResponse" y="0" height="100%" width="'+ noResponse +'" ></rect>' +
        '<rect class="response-bar dk" y="0" height="100%" width="'+ dk +'" ></rect>' +
        '<rect class="response-bar disagree" y="0" height="100%" width="'+ disagree +'" ></rect>' +
        '<rect class="response-bar neither" y="0" height="100%" width="'+ neither +'" ></rect>' +
        '<rect class="response-bar agree" y="0" height="100%" width="'+ agree +'" ></rect>' +
      '</svg></div></div>' +
    "<p><strong>" + totalCount + " respondents</strong><br>" +
    "<span class='text-agree'>" + formatPerc(agreeCount / totalCount) + "</span> agree <span class='text-tagalog'>[sang-ayon]</span> (" +
    agreeCount.toString() + ")<br>" +
    "<span class='text-neither'>" + formatPerc(neitherCount / totalCount) + "</span> neither <span class='text-tagalog'>[wala sa anuman]</span> (" +
    neitherCount.toString() + ")<br>" +
    "<span class='text-disagree'>" + formatPerc(disagreeCount / totalCount) + "</span> disagree <span class='text-tagalog'>[hindi sang-ayon]</span> (" +
    disagreeCount.toString() + ")<br>" +
    "<span class='text-dk'>" + formatPerc(dkCount / totalCount) + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> (" +
    dkCount.toString() + ")<br>" +
    "<span class='text-noResponse'>" + formatPerc(noResponseCount / totalCount) + "</span> no response <span class='text-tagalog'>[walang sagot]</span> (" +
    noResponseCount.toString() + ")<br>" +
    "(" + notAskedCount.toString() + " respondents not asked this question)<br>";
  $(infoSelector).append(thisInfoHtml);

}






getSurveyData();