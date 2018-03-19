var todaysDate = "2018-03-08";

var defaultData = {};
defaultData.slotTime = MakeTime(1,0);
defaultData.numberOfSlots = 3;

// defaultData.startTime = {"hr": 8, "min": 30};
defaultData.startTime = MakeTime(8,30);
defaultData.breakTime = MakeTime(1,0);
defaultData.slotCapacity = 190;

var mainData;

var slotTime;
var firstSlotTime;
var numSlots;


// ~~~~~~~~~~~~~~~~~~~~ DB Start ~~~~~~~~~~~~~~~~~~~~
var db = {};
db.tblWalkin = [];
db.tblSlotDetails = [];
db.tblSlotDetailsApplicantDetails = [];

var walkinTemplate = {};
walkinTemplate["ID"] = "";
walkinTemplate["Date"] = "";
walkinTemplate["URL"] = "";

var slotDetailsTemplate = {};
slotDetailsTemplate["ID"] = "";
slotDetailsTemplate["WalkinID"] = "";
slotDetailsTemplate["StartTime"] = "";
slotDetailsTemplate["EndTime"] = "";
slotDetailsTemplate["Capacity"] = "";
slotDetailsTemplate["Remaining"] = "";
slotDetailsTemplate["name"] = "";

/*

ApplicantDetails
-
WalkinID int FK >- Walkin.WalkinID
FName string
LName string
Email string
Mobile string
SlotID int FK >- SlotDetails.SlotID */

// ~~~~~~~~~~~~~~~~~~~~ DB End ~~~~~~~~~~~~~~~~~~~~

function onBodyLoad()
{
	$("#btn-create-slots").on("click", CreateSlotsClicked);
	getMainData();
	// $("#slot-details").hide();
}

function CreateSlotsClicked()
{
	//alert("A")
	if(checkForSlotOpened())
	{
		$("#slot-details").show();		
		
		slotTime = MakeTime($("#time-per-slot-hour").val(), $("#time-per-slot-min").val());
		//firstSlotTime = MakeTime(Number($("#start-time").val().split(":")[0]), Number($("#start-time").val().split(":")[1]))
		
		var slotStartTime = MakeTime(Number($("#start-time").val().split(":")[0]), Number($("#start-time").val().split(":")[1]))
		
		for (var i=0; i<defaultData.numberOfSlots; i++)
		{
			MakeSlot(slotStartTime);
			slotStartTime = AddTime(AddTime(slotStartTime, slotTime), defaultData.breakTime);
		}
		
		//MakeSlot(firstSlotTime);
		$("#slot-details").append('<input type="button" value="Add Another Slot" id="AddAnotherSlot">');	
		$("#slot-details").append('<input type="button" value="Save to DB" id="SaveToDB">');

		AddEventListeners();
		
		
	}
}

function AddEventListeners()
{
	$('.start-time').on("change", StartTimeChanged)
	$('.end-time').on("change", endTimeChanged);

	$('.remove-slot').on("click", RemoveSlot)

	$("#AddAnotherSlot").on("click", AddAnotherSlot)
	$("#SaveToDB").on("click", saveToDB)
}

function RemoveSlot(params) 
{
	var rowElem =$($(event.currentTarget).parent()).parent();
	rowElem.remove();	
}

function AddAnotherSlot(event)
{
	var inputElemEndTimeLastSlot = $($('.end-time')[$('.end-time').length-1]);
	var lastSlotEndTimeHour = inputElemEndTimeLastSlot.val().split(":")[0];
	var lastSlotEndTimeMin = inputElemEndTimeLastSlot.val().split(":")[1];

	var oStartTimeNewSlot = AddTime(MakeTime(lastSlotEndTimeHour, lastSlotEndTimeMin), slotTime);
	MakeSlot(oStartTimeNewSlot);
}

function endTimeChanged(event)
{
	// console.log("a")
	var inputElemEndTime = $(event.currentTarget);
	var endTime = inputElemEndTime.val();
	console.log(endTime);
	var endTimeHour = Number(endTime.split(":")[0]);
	var endTimeMin = Number(endTime.split(":")[1]);

	var oEndTime = MakeTime(endTimeHour, endTimeMin);
	
	var updatedStartTime = SubtractTime(oEndTime, slotTime);
	var strUpdatedStartTime = GetTimeString(updatedStartTime);
	
	var inputElemStartTime = $(inputElemEndTime.parent().parent().find('.start-time')[0]);
	inputElemStartTime.val(strUpdatedStartTime);
}

function SubtractTime(oTimeA, oTimeB)
{
	var hourA = oTimeA.hr;
	var minA = oTimeA.min;

	var hourB = oTimeB.hr;
	var minB = oTimeB.min;

	var resultantHour = hourA - hourB;
	var resultantMins = minA - minB;

	if (resultantMins < 0)
	{
		resultantHour--;
		resultantMins += 60;
	}

	var resultantTime = MakeTime(resultantHour, resultantMins)

	return resultantTime;
}

function StartTimeChanged(event)
{
	// console.log(event)
	var inputElemStartTime = $(event.currentTarget);
	var startTime = inputElemStartTime.val();

	var startTimeHour = Number(startTime.split(":")[0]);
	var startTimeMin = Number(startTime.split(":")[1]);

	var oStartTime = MakeTime(startTimeHour, startTimeMin);

	var updatedEndTime = AddTime(oStartTime, slotTime);
	var strUpdatedEndTime = GetTimeString(updatedEndTime);
	
	var inputElemEndTime = $(inputElemStartTime.parent().parent().find('.end-time')[0]);
	inputElemEndTime.val(strUpdatedEndTime);
}

function FillDefaults()
{
	$("#time-per-slot-hour").val(defaultData.slotTime.hr);
	$("#time-per-slot-min").val(defaultData.slotTime.min);

	$("#start-time").val(GetTimeString(defaultData.startTime));

}

function MakeSlot(startTime)
{
	numSlots++;

	var slotStartTime = GetTimeString(startTime);
	var slotEndTime = GetTimeString(AddTime(startTime, slotTime));
	
	var strClassName = "slot-number-"+ String(numSlots).trim();

	var strHTML = "<tr class='"+ strClassName + "'>";
	strHTML += '<td><input type="time" class="start-time"></td>' 
	strHTML += '<td><input type="time" class="end-time"></td>' 
	strHTML += '<td><input class="small-input-field capacity" type="number" name="quantity" min="0" max="250" step="1" value="'+ String(defaultData.slotCapacity) +'"></td>'
	strHTML += '<td><input type="button" class="remove-slot" value="Remove"></td>'
	strHTML += '</tr>'
	$('.table-body').append(strHTML);


	$('.'+strClassName).find('.start-time').val(slotStartTime);
	$('.'+strClassName).find('.end-time').val(slotEndTime);
}


function AddTime(oTimeA, oTimeB)
{
	var resultantTime = {};
	resultantTime.hr = oTimeA.hr + oTimeB.hr;
	resultantTime.min = oTimeA.min + oTimeB.min;


	if (resultantTime.min > 60)
	{
		resultantTime.hr += Math.floor(resultantTime.min/60);
		resultantTime.min = resultantTime.min%60;
	}

	return resultantTime;
}

function MakeTime(hr, min)
{
	var retTime = {};
	retTime.hr = Number(hr);
	retTime.min = Number(min);

	return retTime;
}

function GetTimeString(oTime)
{
	var strReturn = "";
	var hr = PreceedingZeroes(oTime.hr, 2);
	var min = PreceedingZeroes(oTime.min, 2);
	strReturn = hr + ":" + min;
	return strReturn;
}

function PreceedingZeroes(number, totalLen)
{
	var sZero = "";
	for (var i=0; i<totalLen; i++)
	{
		sZero += "0";
	}

	return (sZero + String(number).trim()).slice(-1*totalLen);
}



function getMainData()
{
	if (localStorage.mainData)
	{
		mainData = JSON.parse(localStorage.mainData)
	}
	else
	{
		Init();
	}
}

function Init()
{
	mainData = {};
	mainData.slotsOpenedFor = [];

	numSlots = 0;

	$("#slot-date").val(todaysDate);

	FillDefaults();

}

function saveToDB()
{
	/* TODO:: update code to have walkin ID generated */
	var walkinID = selectMaxWalkinIDfromWalkin() + 1;
	var walkinDate = $("#slot-date").val();
	var walkinURL = "abc";

	
	insertIntoWalkin(walkinID, walkinDate, walkinURL)
	
	addSlotDetails(walkinID)
}




function addSlotDetails(walkinID)
{
	var slotRows = $(".table-body").children();
	var numSlots = slotRows.length;

	var ret = {};
	var currentSlotRow;
	var slotID, startTime, endTime, capacity;

	for (var i=0; i<numSlots; i++)
	{
		currentSlotRow = $(slotRows[i]);
		slotID = "walkin-" + String(walkinID).trim() + "-" + currentSlotRow[0].classList.value;
		startTime = currentSlotRow.find('.start-time').val();
		endTime = currentSlotRow.find('.end-time').val();
		capacity = currentSlotRow.find('.capacity').val();
	
		insertIntoSlotDetails(slotID, walkinID, startTime, endTime, capacity, capacity)

	}

}

function insertIntoWalkin(WalkinID, WalkinDate, WalkinURL)
{

	var tblWalkin = JSON.parse(JSON.stringify(walkinTemplate));
	
	tblWalkin.ID = WalkinID;
	tblWalkin.Date = WalkinDate;
	tblWalkin.URL = WalkinURL;

	db.tblWalkin[WalkinID] = tblWalkin;
}

function selectFromWalkinWhereWalkinID(walkinID)
{
	var retDataSet;
	
	if (walkinID)
	{
		if (db.tblWalkin[walkinID])
		{
			retDataSet = JSON.parse(JSON.stringify(db.tblWalkin[walkinID]))
		}
		else
		{
			retDataSet = 0;
		}
		
	}
	else
	{
		retDataSet = 0; 
	}
	
	return retDataSet;
}

function selectMaxWalkinIDfromWalkin()
{
	// debugger;
	var maxWalkinID = -1;
	
	var obj = db.tblWalkin
	var objKeys = Object.keys(obj);
	var numKeys = objKeys.length;
	if (numKeys === 0)
	{
		maxWalkinID = 0;
	}
	else if (numKeys === 1)
	{
		maxWalkinID = obj[objKeys[0]].ID;
	}
	else
	{
		for (var i=0; i<numKeys; i++)
		{
			if (obj[objKeys[i]].ID > maxWalkinID)
			{
				maxWalkinID = obj[objKeys[i]].ID
			}
		}
	}
	

	return maxWalkinID;
}

function selectFromWalkinWhereDate(walkinDate)
{
	var retDataSet;

	if (walkinDate)
	{
		retDataSet = -1;

		var obj = db.tblWalkin
		var objKeys = Object.keys(obj);
		var numKeys = objKeys.length;
		for (var i=0; i<numKeys; i++)
		{
			if (obj[objKeys[i]].Date === walkinDate)
			{
				JSON.parse(JSON.stringify(walkinTemplate))
				retDataSet = obj[objKeys[i]];
				// return retDataSet
			}
		}
		if (retDataSet === -1)
		{
			retDataSet = 0;
		}
		
	}
	else
	{
		retDataSet = 0;
	}

	return retDataSet;

}


function insertIntoSlotDetails(ID, WalkinID, StartTime, EndTime, Capacity, Remaining, Name)
{
		var slotDetails = JSON.parse(JSON.stringify(slotDetailsTemplate));
		slotDetails.ID = ID;
		slotDetails.WalkinID = WalkinID;
		slotDetails.StartTime = StartTime;
		slotDetails.EndTime = EndTime;
		slotDetails.Capacity = Capacity;
		slotDetails.Remaining = Remaining;
		slotDetails.Name = Name;

		db.tblSlotDetails[slotDetails.ID] = slotDetails;
}

function saveMainData()
{
	localStorage.mainData = JSON.stringify(mainData);
}

function checkForSlotOpened()
{
	slotDate = $("#slot-date").val();
	//if slot is not opened
	if (mainData.slotsOpenedFor.indexOf(slotDate) === -1)
	{
		mainData.slotsOpenedFor.push(slotDate);
		return 1;
	}
	else 
	{

		alert("slots already opened for this date");
		return 0;
	}
	
}

