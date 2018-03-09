var todaysDate = "2018-03-08";

var defaultData = {};
defaultData.slotTime = MakeTime(1,0);
defaultData.numberOfSlots = 3;

// defaultData.startTime = {"hr": 8, "min": 30};
defaultData.startTime = MakeTime(8,30);
defaultData.breakTime = MakeTime(1,0);

var mainData;

var slotTime;
var firstSlotTime;
var numSlots;

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

			
	}
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
	strHTML += '<td><input class="small-input-field" type="number" name="quantity" min="0" max="100" step="1" value="50"></td>'
	strHTML += '<td><input type="button" value="Remove"></td>'
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

