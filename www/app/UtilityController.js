define(['app'], function (app) {
	app.controller('UtilityController', [ '$scope', '$rootScope', '$location', '$http', '$interval', 'permissions', function($scope,$rootScope,$location,$http,$interval,permissions) {

		MakeFavorite = function(id,isfavorite)
		{
			if (!permissions.hasPermission("Admin")) {
				HideNotify();
				ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
				return;
			}

			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $.ajax({
			 url: "json.htm?type=command&param=makefavorite&idx=" + id + "&isfavorite=" + isfavorite, 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  ShowUtilities();
			 }
		  });
		}

		EditUtilityDevice = function(idx,name)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $.devIdx=idx;
		  $("#dialog-editutilitydevice #devicename").val(name);
		  $( "#dialog-editutilitydevice" ).dialog( "open" );
		}

		EditMeterDevice = function(idx,name,switchtype)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $.devIdx=idx;
		  $("#dialog-editmeterdevice #devicename").val(name);
		  $("#dialog-editmeterdevice #combometertype").val(switchtype);
		  $("#dialog-editmeterdevice" ).dialog( "open" );
		}

		EditSetPointInt = function(idx,name,setpoint,isprotected)
		{
			$.devIdx=idx;
			$("#dialog-editsetpointdevice #devicename").val(name);
			$('#dialog-editsetpointdevice #protected').prop('checked',(isprotected==true));
			$("#dialog-editsetpointdevice #setpoint").val(setpoint);
			$("#dialog-editsetpointdevice #tempunit").html($.myglobals.tempsign);
			$("#dialog-editsetpointdevice" ).dialog( "open" );
		}

		EditSetPoint = function(idx,name,setpoint,isprotected)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			if (typeof isprotected != 'undefined') {
				if (isprotected==true) {
					bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
						if (result === null) {
							return;
						} else {
							if (result=="") {
								return;
							}
							//verify password
							$.ajax({
								 url: "json.htm?type=command&param=verifypasscode" + 
										"&passcode=" + result,
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									if (data.status=="OK") {
										EditSetPointInt(idx,name,setpoint,isprotected)
									}
								 },
								 error: function(){
								 }
							});
						}
					});
				}
				else {
					EditSetPointInt(idx,name,setpoint,isprotected)
				}
			}
			else {
				EditSetPointInt(idx,name,setpoint,isprotected)
			}
		}

		AddUtilityDevice = function()
		{
		  bootbox.alert($.i18n('Please use the devices tab for this.'));
		}

		RefreshUtilities = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  var id="";

		  $.ajax({
			 url: "json.htm?type=devices&filter=utility&used=true&order=Name&lastupdate="+$.LastUpdateTime,
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
			  
				if (typeof data.ActTime != 'undefined') {
					$.LastUpdateTime=parseInt(data.ActTime);
				}
			  
				$.each(data.result, function(i,item){
					id="#utilitycontent #" + item.idx;
					var obj=$(id);
					if (typeof obj != 'undefined') {
						if ($(id + " #name").html()!=item.Name) {
							$(id + " #name").html(item.Name);
						}
						var status="";
						var bigtext="";
						if (typeof item.Counter != 'undefined') {
							if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
								status=item.Counter;
								bigtext=item.CounterToday;
							}
							else {
								status=item.Counter + ', ' + $.i18n("Today") + ': ' + item.CounterToday;
							}
						}
						else if ((item.Type == "Current")||(item.Type == "Current/Energy")) {
						  status=item.Data;
						}
						else if (item.Type == "Energy") {
							status=item.Data;
							if (typeof item.CounterToday != 'undefined') {
								status+=', ' + $.i18n("Today") + ': ' + item.CounterToday;
							}
						}
						else if (item.SubType == "Percentage") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Fan") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Air Quality") {
							status=item.Data + " (" + item.Quality + ")";
							bigtext=item.Data;
						}
						else if (item.SubType == "Soil Moisture") {
							status=item.Data + " (" + item.Desc + ")";
							bigtext=item.Data;
						}
						else if (item.SubType == "Leaf Wetness") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if ((item.SubType == "Voltage")||(item.SubType == "A/D")||(item.SubType == "Pressure")) {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Lux") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Weight") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Usage") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
							status=item.Data + '\u00B0 ' + $.myglobals.tempsign;
							bigtext=item.Data + '\u00B0 ' + $.myglobals.tempsign;
						}
						if (typeof item.Usage != 'undefined') {
							bigtext=item.Usage;
						}
						if (typeof item.CounterDeliv != 'undefined') {
							if (item.CounterDeliv!=0) {
								status+='<br>' + $.i18n("Return") + ': ' + item.CounterDeliv + ', ' + $.i18n("Today") + ': ' + item.CounterDelivToday;
								if (item.UsageDeliv.charAt(0) != 0) {
									bigtext='-' + item.UsageDeliv;
								}
							}
						}
						
						var nbackcolor="#D4E1EE";
						if (item.Protected==true) {
							nbackcolor="#A4B1EE";
						}
						if (item.HaveTimeout==true) {
							nbackcolor="#DF2D3A";
						}
						else {
							var BatteryLevel=parseInt(item.BatteryLevel);
							if (BatteryLevel!=255) {
								if (BatteryLevel<=10) {
									nbackcolor="#DDDF2D";
								}
							}
						}
						var obackcolor=rgb2hex($(id + " #name").css( "background-color" )).toUpperCase();
						if (obackcolor!=nbackcolor) {
							$(id + " #name").css( "background-color", nbackcolor );
						}

						if ($(id + " #status").html()!=status) {
							$(id + " #bigtext").html(bigtext);
							$(id + " #status").html(status);
						}
						if ($(id + " #lastupdate").html()!=item.LastUpdate) {
							$(id + " #lastupdate").html(item.LastUpdate);
						}
					}
				});
			  }
			 }
		  });
			$rootScope.RefreshTimeAndSun();
			$scope.mytimer=$interval(function() {
				RefreshUtilities();
			}, 10000);
		}

		ShowUtilities = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $('#modal').show();
		  
		  var htmlcontent = '';
		  var bHaveAddedDevider = false;
			var bAllowWidgetReorder=true;

		  var tophtm=
				'\t<table class="bannav" id="bannav" border="0" cellpadding="0" cellspacing="0" width="100%">\n' +
				'\t<tr>\n' +
				'\t  <td align="left"><div id="timesun" /></td>\n';
		  tophtm+=
				'\t</tr>\n' +
				'\t</table>\n';
		  

		  var i=0;
		  $.ajax({
			 url: "json.htm?type=devices&filter=utility&used=true&order=Name", 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {

				$.FiveMinuteHistoryDays=data["5MinuteHistoryDays"];
				if (typeof data.WindScale != 'undefined') {
					$.myglobals.windscale=parseFloat(data.WindScale);
				}
				if (typeof data.WindSign != 'undefined') {
					$.myglobals.windsign=data.WindSign;
				}
				if (typeof data.TempScale != 'undefined') {
					$.myglobals.tempscale=parseFloat(data.TempScale);
				}
				if (typeof data.TempSign != 'undefined') {
					$.myglobals.tempsign=data.TempSign;
				}
				if (typeof data.ActTime != 'undefined') {
					$.LastUpdateTime=parseInt(data.ActTime);
				}
				
				bAllowWidgetReorder=data.AllowWidgetOrdering;

				$.each(data.result, function(i,item){
				  if (i % 3 == 0)
				  {
					//add devider
					if (bHaveAddedDevider == true) {
					  //close previous devider
					  htmlcontent+='</div>\n';
					}
					htmlcontent+='<div class="row divider">\n';
					bHaveAddedDevider=true;
				  }
				  
				  var xhtm=
						'\t<div class="span4" id="' + item.idx + '">\n' +
						'\t  <section>\n' +
						'\t    <table id="itemtable" border="0" cellpadding="0" cellspacing="0">\n' +
						'\t    <tr>\n';
						var nbackcolor="#D4E1EE";
						if (item.Protected==true) {
							nbackcolor="#A4B1EE";
						}
						if (item.HaveTimeout==true) {
							nbackcolor="#DF2D3A";
						}
						else {
							var BatteryLevel=parseInt(item.BatteryLevel);
							if (BatteryLevel!=255) {
								if (BatteryLevel<=10) {
									nbackcolor="#DDDF2D";
								}
							}
						}
						xhtm+='\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n';
						xhtm+='\t      <td id="bigtext">';
						if ((typeof item.Usage != 'undefined') && (typeof item.UsageDeliv == 'undefined')) {
							xhtm+=item.Usage;
						}
						else if ((typeof item.Usage != 'undefined') && (typeof item.UsageDeliv != 'undefined')) {
							if ((item.UsageDeliv.charAt(0) == 0)||(parseInt(item.Usage)!=0)) {
								xhtm+=item.Usage;
							}
							if (item.UsageDeliv.charAt(0) != 0) {
								xhtm+='-' + item.UsageDeliv;
							}
						}
						else if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
						  xhtm+=item.CounterToday;
						}
						else if (item.Type == "Air Quality") {
						  xhtm+=item.Data;
						}
						else if (item.SubType == "Percentage") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Fan") {
						  xhtm+=item.Data;
						}
						else if (item.SubType == "Soil Moisture") {
						  xhtm+=item.Data;
						}
						else if (item.SubType == "Leaf Wetness") {
						  xhtm+=item.Data;
						}
						else if ((item.SubType == "Voltage")||(item.SubType == "A/D")||(item.SubType == "Pressure")) {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Lux") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Weight") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Usage") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Thermostat") {
						  xhtm+=item.Data + '\u00B0 ' + $.myglobals.tempsign;
						}
						xhtm+='</td>\n';
				  xhtm+='\t      <td id="img"><img src="images/';
					var status="";
					if (typeof item.Counter != 'undefined') {
					  xhtm+='counter.png" height="48" width="48"></td>\n';
					  if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
						status=item.Counter;
					  }
					  else {
						status=item.Counter + ', ' + $.i18n("Today") + ': ' + item.CounterToday;
					  }
					}
					else if ((item.Type == "Current")||(item.Type == "Current/Energy")) {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Energy") {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					  if (typeof item.CounterToday != 'undefined') {
						status+=', ' + $.i18n("Today") + ': ' + item.CounterToday;
					  }
					}
					else if (item.Type == "Air Quality") {
					  xhtm+='air48.png" height="48" width="48"></td>\n';
					  status=item.Data + " (" + item.Quality + ")";
					}
					else if (item.SubType == "Soil Moisture") {
					  xhtm+='moisture48.png" height="48" width="48"></td>\n';
					  status=item.Data + " (" + item.Desc + ")";
					}
					else if (item.SubType == "Percentage") {
					  xhtm+='Percentage48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.SubType == "System fan") {
					  xhtm+='Fan48_On.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.SubType == "Leaf Wetness") {
					  xhtm+='leaf48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if ((item.SubType == "Voltage")||(item.SubType == "A/D")) {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.SubType == "Pressure") {
					  xhtm+='gauge48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Lux") {
					  xhtm+='lux48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Weight") {
					  xhtm+='scale48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Usage") {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
					  xhtm+='override.png" height="48" width="48"></td>\n';
					  status=item.Data + '\u00B0 ' + $.myglobals.tempsign;
					}
					if (typeof item.CounterDeliv != 'undefined') {
						if (item.CounterDeliv!=0) {
							status+='<br>' + $.i18n("Return") + ': ' + item.CounterDeliv + ', ' + $.i18n("Today") + ': ' + item.CounterDelivToday;
						}
					}
					
								xhtm+=      
						'\t      <td id="status">' + status + '</td>\n' +
						'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
						'\t      <td id="type">' + item.Type + ', ' + item.SubType + '</td>\n' +
						'\t      <td>';
				  if (item.Favorite == 0) {
					xhtm+=      
						  '<img src="images/nofavorite.png" title="' + $.i18n('Add to Dashboard') +'" onclick="MakeFavorite(' + item.idx + ',1);" class="lcursor">&nbsp;&nbsp;&nbsp;&nbsp;';
				  }
				  else {
					xhtm+=      
						  '<img src="images/favorite.png" title="' + $.i18n('Remove from Dashboard') +'" onclick="MakeFavorite(' + item.idx + ',0);" class="lcursor">&nbsp;&nbsp;&nbsp;&nbsp;';
				  }

				  if (typeof item.Counter != 'undefined') {
					if ((item.Type == "P1 Smart Meter")&&(item.SubType=="Energy")) {
						xhtm+='<a class="btnsmall" onclick="ShowSmartLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" data-i18n="Log">Log</a> ';
					}
					else {
						xhtm+='<a class="btnsmall" onclick="ShowCounterLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" data-i18n="Log">Log</a> ';
					}
					if (permissions.hasPermission("Admin")) {
						if (item.Type == "P1 Smart Meter") {
							xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
						}
						else {
							xhtm+='<a class="btnsmall" onclick="EditMeterDevice(' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal +');" data-i18n="Edit">Edit</a> ';
						}
					}
				  }
				  else if (item.Type == "Air Quality") {
					xhtm+='<a class="btnsmall" onclick="ShowAirQualityLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.SubType == "Percentage") {
					xhtm+='<a class="btnsmall" onclick="ShowPercentageLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Fan") {
					xhtm+='<a class="btnsmall" onclick="ShowFanLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.SubType == "Soil Moisture")||(item.SubType == "Leaf Wetness")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Lux") {
					xhtm+='<a class="btnsmall" onclick="ShowLuxLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Weight") {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',\'' + item.Type +'\', \'' + item.SubType + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Usage") {
					xhtm+='<a class="btnsmall" onclick="ShowUsageLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.Type == "Current")||(item.Type == "Current/Energy")) {
					xhtm+='<a class="btnsmall" onclick="ShowCurrentLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.displaytype + ');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Energy") {
						xhtm+='<a class="btnsmall" onclick="ShowCounterLogSpline(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" data-i18n="Log">Log</a> ';
						if (permissions.hasPermission("Admin")) {
							xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
						}
				  }
				  else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
						if (permissions.hasPermission("Admin")) {
							xhtm+='<a class="btnsmall" onclick="ShowTempLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
							xhtm+='<a class="btnsmall" onclick="EditSetPoint(' + item.idx + ',\'' + item.Name + '\', ' + item.SetPoint + ',' + item.Protected +');" data-i18n="Edit">Edit</a> ';
						}
				  }
				  else if ((item.Type == "General")&&(item.SubType == "Voltage")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'VoltageGeneral\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.Type == "General")&&(item.SubType == "Pressure")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'Pressure\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.SubType == "Voltage")||(item.SubType == "A/D")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else {
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  if (permissions.hasPermission("Admin")) {
					  if (item.Notifications == "true")
						xhtm+='<a class="btnsmall-sel" onclick="ShowNotifications(' + item.idx + ',\'' + item.Name + '\', \'#utilitycontent\', \'ShowUtilities\');" data-i18n="Notifications">Notifications</a>';
					  else
						xhtm+='<a class="btnsmall" onclick="ShowNotifications(' + item.idx + ',\'' + item.Name + '\', \'#utilitycontent\', \'ShowUtilities\');" data-i18n="Notifications">Notifications</a>';
				  }
				  xhtm+=      
						'</td>\n' +
						'\t    </tr>\n' +
						'\t    </table>\n' +
						'\t  </section>\n' +
						'\t</div>\n';
				  htmlcontent+=xhtm;
				});
			  }
			 }
		  });
		  if (bHaveAddedDevider == true) {
			//close previous devider
			htmlcontent+='</div>\n';
		  }
		  if (htmlcontent == '')
		  {
			htmlcontent='<h2>' + $.i18n('No Utility sensors found or added in the system...') + '</h2>';
		  }
		  $('#modal').hide();
		  $('#utilitycontent').html(tophtm+htmlcontent);
		  $('#utilitycontent').i18n();

			if (bAllowWidgetReorder==true) {
				if (permissions.hasPermission("Admin")) {
					if (window.myglobals.ismobileint==false) {
						$("#utilitycontent .span4").draggable({
								drag: function() {
									if (typeof $scope.mytimer != 'undefined') {
										$interval.cancel($scope.mytimer);
										$scope.mytimer = undefined;
									}
									$.devIdx=$(this).attr("id");
									$(this).css("z-index", 2);
								},
								revert: true
						});
						$("#utilitycontent .span4").droppable({
								drop: function() {
									var myid=$(this).attr("id");
									$.devIdx.split(' ');
									$.ajax({
										 url: "json.htm?type=command&param=switchdeviceorder&idx1=" + myid + "&idx2=" + $.devIdx,
										 async: false, 
										 dataType: 'json',
										 success: function(data) {
												ShowUtilities();
										 }
									});
								}
						});
					}
				}
			}
			$rootScope.RefreshTimeAndSun();
			$scope.mytimer=$interval(function() {
				RefreshUtilities();
			}, 10000);
		  return false;
		}

		init();

		function init()
		{
			//global var
			$.devIdx=0;
			$.LastUpdateTime=parseInt(0);
			
			$( "#dialog-editutilitydevice" ).dialog({
				  autoOpen: false,
				  width: 450,
				  height: 160,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editutilitydevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editutilitydevice #devicename").val()) + '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							  
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editutilitydevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							}
						});
					  },
					  "Replace": function() {
						  $( this ).dialog( "close" );
						  ReplaceDevice($.devIdx,ShowUtilities);
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});
			$( "#dialog-editmeterdevice" ).dialog({
				  autoOpen: false,
				  width: 370,
				  height: 200,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editmeterdevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editmeterdevice #devicename").val()) + '&switchtype=' + $("#dialog-editmeterdevice #combometertype").val() + '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							  
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editmeterdevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							}
						});
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});

			$( "#dialog-editsetpointdevice" ).dialog({
				  autoOpen: false,
				  width: 390,
				  height: 250,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editsetpointdevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx +
								 '&name=' + encodeURIComponent($("#dialog-editsetpointdevice #devicename").val()) +
								 '&setpoint=' + $("#dialog-editsetpointdevice #setpoint").val() + 
								 '&protected=' + $('#dialog-editsetpointdevice #protected').is(":checked") +
								 '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							  
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editsetpointdevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							}
						});
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});

		  ShowUtilities();

			$( "#dialog-editutilitydevice" ).keydown(function (event) {
				if (event.keyCode == 13) {
					$(this).siblings('.ui-dialog-buttonpane').find('button:eq(0)').trigger("click");
					return false;
				}
			});
		};
		$scope.$on('$destroy', function(){
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		}); 
	} ]);
});