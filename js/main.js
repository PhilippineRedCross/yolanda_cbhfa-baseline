var surveyData = [];
var filteredData = [];
var alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];

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

// yesNo
function FA1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='firstaid'></span>Topic: First Aid</h3><hr>");
  var questionID = "cbhfa-FA1";
  var questionEnglish = "Have you ever attended any training program to learn basic first aid? (required)";
  var questionTagalog = "Nakadalo ka na ba ng pagsasanay patungkol sa paunang lunas?";
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
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
  });
  var thisPieData = [
    {
      key: "yes",
      y: yesCount,
    },
    {
      key: "no",
      y: noCount,
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
  var yesPerc = formatPerc(yesCount / (yesCount + noCount)); 
  var noPerc = formatPerc(noCount / (yesCount + noCount));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> answered Yes <span class='text-tagalog'>[Oo]</span> | " +
    yesCount.toString() + ((yesCount == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + noPerc + "</span> answered No <span class='text-tagalog'>[Hindi]</span> | " + 
    noCount.toString() + ((noCount == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer";
  thisInfoHtml += ")</p><br>";
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
  $.each(filteredData, function(surveyIndex, survey){
    if (survey[questionID] === "years"){
      more2years ++;
    }
    if (survey[questionID] === "months"){
      less2years ++;
    }
    if (survey[questionID] === "n/a"){
      noTraining ++;
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
  
  var more2Perc = formatPerc(more2years / (more2years + less2years)); 
  var less2Perc = formatPerc(less2years / (more2years + less2years));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p>Of those attending a training program to learn basic first aid:<br>"+
    "<span class='percText-dark'>" + less2Perc + "</span> did so in the last 2 years | " +
    less2years.toString() + ((less2years == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + more2Perc + "</span> did so more than 2 years ago | " + 
    more2years.toString() + ((more2years == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + noTraining.toString() + ((noTraining == 1) ? " interviewee has" : " interviewees have") + " not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml)
  FA5();
}

function FA5(){
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
  $.each(filteredData, function(surveyIndex, survey){
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
    if (survey[questionID] === "n/a"){
      notAsked ++;
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
      key: "dk",
      y: dk,
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
  var knowPerc = formatPerc(know / (know + other + dk)); 
  var otherPerc = formatPerc(other / (know + other + dk));
  var dkPerc = formatPerc(dk / (know + other + dk));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p>Of those attending a training program to learn basic first aid:<br>"+
    "<span class='percText-dark'>" + knowPerc + "</span> responded " + keyInterventionEnglish +
    " <span class='text-tagalog'>[" + keyInterventionTagalog + "]</span> | " +
    know.toString() + ((know == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + otherPerc + "</span> gave some other answer | " + 
    other.toString() + ((other == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + dkPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> | " + 
    dk.toString() + ((dk == 1) ? " interviewee" : " interviewees") + "<br>" +
    ((skip > 0) ? "(" + skip.toString() + ((skip == 1) ? " interviewee" : " interviewees") + " chose not to answer <span class='text-tagalog'>[walang sagot]</span>)</p>" : "") + 
    "(" + notAsked.toString() + ((notAsked == 1) ? " interviewee" : " interviewees") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA6();
}

function FA6(){
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
  $.each(filteredData, function(surveyIndex, survey){
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
    if (survey[questionID] === "n/a"){
      notAsked ++;
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
      key: "dk",
      y: dk,
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
  var knowPerc = formatPerc(know / (know + other + dk)); 
  var otherPerc = formatPerc(other / (know + other + dk));
  var dkPerc = formatPerc(dk / (know + other + dk));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p>Of those attending a training program to learn basic first aid:<br>"+
    "<span class='percText-dark'>" + knowPerc + "</span> responded " + keyInterventionEnglish +
    " <span class='text-tagalog'>[" + keyInterventionTagalog + "]</span> | " +
    know.toString() + ((know == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + otherPerc + "</span> gave some other answer | " + 
    other.toString() + ((other == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + dkPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> | " + 
    dk.toString() + ((dk == 1) ? " interviewee" : " interviewees") + "<br>" +
    ((skip > 0) ? "(" + skip.toString() + ((skip == 1) ? " interviewee" : " interviewees") + " chose not to answer <span class='text-tagalog'>[walang sagot]</span>)</p>" : "") + 
    "(" + notAsked.toString() + ((notAsked == 1) ? " interviewee" : " interviewees") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);
  FA7();
}

function FA7(){
  var questionID = "cbhfa-FA7";
  var questionEnglish = "Did you at any occasion in the last year injure yourself and was given first aid by a volunteer? (required)";
  var questionTagalog = "Mayroon bang naging pagkakataon kung saan nasaktan mo ang iyong sarili at nilapatan ka ng pangunang lunas ng isang volunteer?";
  var yesCount = 0;
  var noCount = 0;
  var dkCount = 0;
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
      dkCount ++;
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
      y: noCount + dkCount,
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
  var yesPerc = formatPerc(yesCount / (noCount + dkCount)); 
  var noPerc = formatPerc(noCount / (noCount + dkCount));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> answered Yes <span class='text-tagalog'>[Oo]</span> | " +
    yesCount.toString() + ((yesCount == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + noPerc + "</span> answered No <span class='text-tagalog'>[Hindi]</span> or Don't know <span class='text-tagalog'>[Hindi alam]</span> | " + 
    noCount.toString() + ((noCount == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer <span class='text-tagalog'>[Walang sagot]</span>";
  if(topicSkipped > 0){
    thisInfoHtml += " and " + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
  CM1();
}

function CM1(){
  $(infoWrapper).append("<h3><span class='jumpto' id='majoremergencies'></span>Topic: Community Mobilization in Major Emergencies</h3></div><hr>");
  var questionID = "CM1";
  var questionEnglish = "What would you do to respond safely to a disaster?  (required)";
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
    if (survey[dk] === "TRUE"){
      dontKnow ++;
      lessThanThree ++;
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
      y: lessThanThree,
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
  var totalLessSkipped = filteredData.length - skipped;
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var atLeastThreePerc = formatPerc(atLeastThree / totalLessSkipped); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalLessSkipped);
  var dontKnowPerc = formatPerc(dontKnow / totalLessSkipped);
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><span class='percText-dark'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " | " + atLeastThree.toString() + ((atLeastThree == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" +lessThanThreePerc + "</span> could identify less than three key responses or didn't know" + 
    " | " + lessThanThree.toString() + ((lessThanThree == 1) ? " interviewee" : " interviewees") + "<br>" +
    "(" + dontKnowPerc + " of total didn't know | " +
    dontKnow.toString() + ((dontKnow == 1) ? " interviewee" : " interviewees") + ")<br>" +
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer)</p>";

  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponseEng = answersEnglish[response];
    var thisResponseTag = answersTagalog[response];
    thisHtml = thisResponseCount + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span><br>";
    $(infoSelector).append(thisHtml);
  }
  CM2(); 
}

function CM2(){
  var questionID = "cbhfa-CM2";
  var questionEnglish = "Did you receive psychosocial support from a volunteer following the disaster? (required)";
  var questionTagalog = "Nakatanggap ka ba ng psychosocial support mula sa isang volunteer matapos ang isang kalamidad?";
  var yesCount = 0;
  var noCount = 0;
  var dkCount = 0;
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
      dkCount ++;
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
      y: noCount + dkCount,
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
  var yesPerc = formatPerc(yesCount / (noCount + dkCount)); 
  var noPerc = formatPerc(noCount / (noCount + dkCount));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> answered Yes <span class='text-tagalog'>[Oo]</span> | " +
    yesCount.toString() + ((yesCount == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + noPerc + "</span> answered No <span class='text-tagalog'>[Hindi]</span> or Don't know <span class='text-tagalog'>[Hindi alam]</span> | " + 
    noCount.toString() + ((noCount == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer";
  if(topicSkipped > 0){
    thisInfoHtml += " and " + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
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
  var yesPerc = formatPerc(yesCount / (yesCount + noCount)); 
  var noPerc = formatPerc(noCount / (yesCount + noCount));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> answered Yes <span class='text-tagalog'>[Oo]</span> | " +
    yesCount.toString() + ((yesCount == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + noPerc + "</span> answered No <span class='text-tagalog'>[Hindi]</span> | " + 
    noCount.toString() + ((noCount == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer";
  if(topicSkipped > 0){
    thisInfoHtml += ", " + topicSkipped.toString() + " not asked this question";
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
  $(infoSelector).append(notAskedCount + " - respondents not asked this question");  
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
    "<p><span class='percText-dark'>" + homePerc + "</span> received care in home" + 
    " | " + homeCare.toString() + ((homeCare == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-dark'>" + publicPerc + "</span> received care at a public facility" + 
    " | " + publicCare.toString() + ((publicCare == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-dark'>" + privatePerc + "</span> received care at a private facility" + 
    " | " + privateCare.toString() + ((privateCare == 1) ? " interviewee" : " interviewees") + "<br>" +
    "(respondents may have received care in more than one sector)<br>";
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
  $(infoSelector).append(topicSkipped.toString() + " - respondents not asked this question"); 
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
    "(" + dkCount.toString() + " don't know, " + noResponseCount.toString() + " no response, " + 
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
    "(" + dkCount.toString() + " don't know, " + noResponseCount.toString() + " no response, " + 
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
    thisInfoHtml = "<p><span class='percText-dark'>" + yesPerc + "</span> Yes <span class='text-tagalog'>[Oo]</span> (" +
      yesCount.toString() + ")<br>" +
      "<span class='percText-light'>" + noPerc + "</span> No <span class='text-tagalog'>[Hindi]</span> (" + 
      noCount.toString() + ")<br>" + 
      "<span class='percText-light'>" + skipPerc + "</span> No response <span class='text-tagalog'>[Walang sagot]</span> (" + 
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
  var yesPerc = formatPerc(yesCount / (yesCount + noCount + skipped)); 
  var noPerc = formatPerc(noCount / (yesCount + noCount + skipped));
  var skipPerc = formatPerc(skipped / (yesCount + noCount + skipped));
  thisInfoHtml = "<h4>" + questionEnglish +
    "<br><small>" + questionTagalog + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> Yes <span class='text-tagalog'>[Oo]</span> (" +
    yesCount.toString() + ")<br>" +
    "<span class='percText-light'>" + noPerc + "</span> No <span class='text-tagalog'>[Hindi]</span> (" + 
    noCount.toString() + ")<br>" +
    "<span class='percText-light'>" + skipPerc + "</span> No response <span class='text-tagalog'>[Walang sagot]</span> (" + 
    skipped.toString() + ")<br>";
  if(topicSkipped > 0){
    thisInfoHtml += "(" + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
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
  $(infoSelector).append(topicSkipped + " - respondents not asked this question");  

}



// $(infoWrapper).append("<h3><span class='jumpto' id='safemotherhood'></span>Topic: Safe Motherhood</h3><hr>");



















function selectMultiple(question) {
  var questionID = question["questionID"];
  var optionCount = question["optionCount"];
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersArray = [];
  var notAskedCount = 0;
  var askedCount = 0;
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in question["answersEnglish"]){
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

  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>";

  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>" + askedCount.toString() + " respondents (mulitple responses possible)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / askedCount); 
    var thisResponseEng = question["answersEnglish"][response];
    var thisResponseTag = question["answersTagalog"][response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append(notAskedCount + " - respondents not asked this question");  
}

function keyIntervention(question){
  var questionID = question["questionID"];
  var know = 0;
  var other = 0;
  var dk = 0;
  var skip = 0;
  var notAsked = 0;
  $.each(filteredData, function(surveyIndex, survey){
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
    if (survey[questionID] === "n/a"){
      notAsked ++;
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
      key: "dk",
      y: dk,
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
  
  var knowPerc = formatPerc(know / (know + other + dk)); 
  var otherPerc = formatPerc(other / (know + other + dk));
  var dkPerc = formatPerc(dk / (know + other + dk));
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p>Of those attending a training program to learn basic first aid:<br>"+
    "<span class='percText-dark'>" + knowPerc + "</span> responded " + question["answersEnglish"]["A"] +
    " <span class='text-tagalog'>[" + question["answersTagalog"]["A"] + "]</span> | " +
    know.toString() + ((know == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + otherPerc + "</span> gave some other answer | " + 
    other.toString() + ((other == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + dkPerc + "</span> don't know <span class='text-tagalog'>[hindi alam]</span> | " + 
    dk.toString() + ((dk == 1) ? " interviewee" : " interviewees") + "<br>" +
    ((skip > 0) ? "(" + skip.toString() + ((skip == 1) ? " interviewee" : " interviewees") + " chose not to answer <span class='text-tagalog'>[walang sagot]</span>)</p>" : "") + 
    "(" + notAsked.toString() + ((notAsked == 1) ? " interviewee" : " interviewees") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml)
}

function atLeastThree(question) {
  //if not a required section the "not asked" bit needs to be incorporated into this
  var questionID = question["questionID"];
  var optionCount = question["optionCount"];
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var skipped = 0;
  var dk = questionID + "-dk";
  var skip = questionID + "-skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "-" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in question["answersEnglish"]){
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
    if (survey[dk] === "TRUE"){
      dontKnow ++;
      lessThanThree ++;
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
      key: "At least 3",
      y: atLeastThree,
    },
    {
      key: "Less than 3",
      y: lessThanThree,
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
  var totalLessSkipped = filteredData.length - skipped;
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var atLeastThreePerc = formatPerc(atLeastThree / totalLessSkipped); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalLessSkipped);
  var dontKnowPerc = formatPerc(dontKnow / totalLessSkipped);
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p><span class='percText-dark'>" + atLeastThreePerc + "</span> could identify at least three key responses" + 
    " | " + atLeastThree.toString() + ((atLeastThree == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" +lessThanThreePerc + "</span> could identify less than three key responses or didn't know" + 
    " | " + lessThanThree.toString() + ((lessThanThree == 1) ? " interviewee" : " interviewees") + "<br>" +
    "(" + dontKnowPerc + " of total didn't know | " +
    dontKnow.toString() + ((dontKnow == 1) ? " interviewee" : " interviewees") + ")<br>" +
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer)</p>";

  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw counts of responses</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponseEng = question["answersEnglish"][response];
    var thisResponseTag = question["answersTagalog"][response];
    thisHtml = thisResponseCount + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span><br>";
    $(infoSelector).append(thisHtml);
  }  
}



function yesNo(question) {
  var questionID = question["questionID"];
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
      key: "Yes",
      y: yesCount,
    },
    {
      key: "No",
      y: noCount,
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
  var totalLessSkipped = filteredData.length - skipped;
  var yesPerc = formatPerc(yesCount / totalLessSkipped); 
  var noPerc = formatPerc(noCount / totalLessSkipped);
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> answered Yes / Oo | " +
    yesCount.toString() + ((yesCount == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + noPerc + "</span> answered No / Hindi | " + 
    noCount.toString() + ((noCount == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer";
  if(topicSkipped > 0){
    thisInfoHtml += " and " + topicSkipped.toString() + " not asked this question";
  }
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml);   
}

function selectOne(question) {
  
}


getSurveyData();