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

  $.each(surveyInfo, function(questionIndex, question){
    if (question["analysis"] === "selectOne") {
      selectOne(question);
    }
    if (question["analysis"] === "yesNo") {
      yesNo(question);
    }
    if (question["analysis"] === "FA2") {
      FA2(question);
    }
    if (question["analysis"] === "keyIntervention") {
      keyIntervention(question);
    }
    if (question["analysis"] === "atLeastThree") {
      atLeastThree(question);
    }
    if (question["analysis"] === "selectMultiple") {
      selectMultiple(question);
    }
    
  });
}

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
  $(infoSelector).append("<strong>Raw Counts of Responses</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponseEng = question["answersEnglish"][response];
    var thisResponseTag = question["answersTagalog"][response];
    thisHtml = thisResponseCount + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span><br>";
    $(infoSelector).append(thisHtml);
  }  
}

function FA2(question) {
  var questionID = question["questionID"];
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
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p>Of those attending a training program to learn basic first aid:<br>"+
    "<span class='percText-dark'>" + less2Perc + "</span> did so in the last 2 years | " +
    less2years.toString() + ((less2years == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + more2Perc + "</span> did so more than 2 years ago | " + 
    more2years.toString() + ((more2years == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + noTraining.toString() + ((noTraining == 1) ? " interviewee" : " interviewees") + " have not attended a training";
  thisInfoHtml += ")</p><br>";
  $(infoSelector).append(thisInfoHtml)
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