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

  $.each(surveyInfo, function(questionIndex, question){
    if (question["analysis"] === "selectOne") {
      selectOne(question);
    }
    if (question["analysis"] === "yesNo") {
      yesNo(question);
    }
  });
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
  var questionID = question["questionID"];
  var optionCount = question["optionCount"];
  var topicSkipped = 0;
  var totalCount = 0;


  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in question["answersEnglish"]){
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

  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>";

  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Responses (select one)</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponsePerc = formatPerc(allResponses[response] / totalCount); 
    var thisResponseEng = question["answersEnglish"][response];
    var thisResponseTag = question["answersTagalog"][response];
    thisHtml = thisResponsePerc + " - " + thisResponseEng;
    if(thisResponseEng !== thisResponseTag){
      thisHtml += " <span class='text-tagalog'>[" + thisResponseTag + "]</span>";
    }
    thisHtml += " ("+ thisResponseCount + ")<br>";
    $(infoSelector).append(thisHtml);
  }
  $(infoSelector).append(topicSkipped + " - respondents not asked this question");  
}


getSurveyData();