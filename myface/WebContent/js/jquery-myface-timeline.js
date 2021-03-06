var nextDay = null;
var fromDate = null;
var toDate = null;
var dateRange = null;
var numberOfEmptyPulling = 0;

function getNextDateRange(){
	if(nextDay == null){
		nextDay = new Date();									//first time = today
		nextDay.setUTCHours(0, 0, 0, 0);
	}else{
		nextDay.setDate(nextDay.getDate() - 1);			//subtract one day
	}
				
	fromDate = Math.round(nextDay .getTime() / 1000);		//from beginning of the day

	toDate = new Date(nextDay);							//to end of the day
	toDate.setUTCHours(23, 59, 59, 0);
	toDate = Math.round(toDate.getTime() / 1000);
	
	dateRange =  "since=" + fromDate + "&untill=" + toDate;
}

function loadUserHome(){
	getNextDateRange();
	appendToTimeLine("https://graph.facebook.com/v2.1/me/home?" + dateRange + "&access_token=" + sessionStorage.getItem("accessToken"));

}

function appendToTimeLine(targetUrl){
	$.ajax({
		url : targetUrl,
		type : "GET",
		Accept : 'application/json',
		contentType : 'application/json',
		dataType : "json",
		success : function(data, status, jqXHR) {

			var dateLabel = "";
			
			//if empty data, get in next date range
			if(data.data.length == 0 && numberOfEmptyPulling < 2){			//numberOfEmptyPulling to prevent infinite loop, in case user has no data at all
				numberOfEmptyPulling += 1
				loadUserHome();
				return;
			}
			
			$('#timeline').empty();
			numberOfEmptyPulling = 0;
			
			$.each(data.data, function(key, value) {
				//Creation date
				var creationDate = new Date(value.created_time);
				creationDate.setUTCHours(0, 0, 0, 0);
				
				if(creationDate.getTime() != nextDay.getTime())
					return true;		//it just skips one iteration
				
				if(dateLabel != creationDate.toDateString()){
					dateLabel = creationDate.toDateString();
					var formattedDate = creationDate.toLocaleFormat('%d %b %Y'); 
					$('#timeline').append("<li class='time-label'><span class='bg-red'> " + formattedDate + " </span></li>");
				}
				
				var timeLineItem = buildTimeLineItem(value);
				
				//append data
				$('#timeline').append(timeLineItem);
			});

			if(data.paging != null)
				$('#nextBtn').attr('href', data.paging.next);
			else
				$('#nextBtn').attr('href', '');
			
			$("#nextBtn").removeAttr('disabled');
//			$('html,body').scrollTop(0);
			$('html, body').animate({ scrollTop: 0 }, 'slow');
		},
		
		error :  function (XMLHttpRequest, textStatus, errorThrown){
			alert('Facebook returned error ' + errorThrown +' , please retry');
			$("#nextBtn").removeAttr('disabled');
		}
	});
}

function getToNames(data){
	var toNames = "";
	
	$.each(data, function(key, value) {
		toNames += value.name + ", ";
	});
	
	return toNames;
}

function buildTimeLineItem(value){
	
	likeBtnClass = 'fa-heart-o';
	
	if(value.likes != null)
		var likesNames = getLikesNames(value.likes.data);
	
	var itemClass = "fa fa-comments bg-yellow";
	
	if(value.type == "video")
		itemClass = "fa fa-video-camera bg-maroon";
	else if(value.type == "photo")
		itemClass = "fa fa-camera bg-purple";
	
	var reshareButton = "";
	if(value.link != null){
		reshareButton = " <button class='btn btn-sm share-btn' value='" + value.link + "'>" +
		"<i class='fa fa-fw fa-retweet'></i>" +
		" </button>";
	}
	else if(value.actions != null){
		reshareButton = " <button class='btn btn-sm share-btn' value='" + value.actions[1].link + "'>" +
		"<i class='fa fa-fw fa-retweet'></i>" +
		" </button>";
	}
	
	var timeLineItem = "<li><i class='" + itemClass +"'></i>" +
		"<div class='timeline-item'>" +
		
		"<span class='time'><i class='fa fa-clock-o'></i> " +
			"<abbr class='timeago' title='"+ value.created_time +"'/>" +
			"&nbsp&nbsp&nbsp&nbsp" +
			" <button class='btn btn-sm like-btn' value=" + value.id + ">" +
			"		<i class='fa fa-fw " + likeBtnClass + " like-icon'></i>" +
			" </button>" +
			reshareButton + 
		"</span>" +
		
		"<h3 class='timeline-header no-border'>" +
			"<a href='https://www.facebook.com/app_scoped_user_id/" + value.from.id + "'>" + value.from.name + "</a>";
	
	if(value.story != null)
		timeLineItem += "&nbsp&nbsp" + value.story.replace(value.from.name, "");
	
	if(value.to != null)
		timeLineItem += "&nbsp&nbsp to &nbsp" + getToNames(value.to.data);

	if(value.caption != null)
		timeLineItem +=	"</br></br><bdi>" + getTextElement(value.caption) + "</bdi></h3>";
	
	if(value.description != null)
		timeLineItem +=	"</br><bdi>" + getTextElement(value.description) + "</bdi></h3>";
	
	if(value.message != null)
		timeLineItem +=	"</br><bdi>" + getTextElement(value.message) + "</bdi></h3>";
	
	if(value.type == "video"){
		timeLineItem +=	"</br></br>" + "<a id='" + value.name + "' href='" + value.source + "' class='video-link'>" +
		"<img style='border:1;' src='img/video_icon.jpg' width='10%' height='10%' \>" + "</a>";
	}
	else if(value.type == "link"){
		timeLineItem +=	"</br></br>" + "<a id='" + value.name + "' href='" + value.link + "' target='_blank' >" +
		"<img style='border:0;' src='" + value.picture + "' width='10%' height='10%' \>" + "</a></br></br>";
	}
	else if(value.type == "photo"){
		timeLineItem +=	"</br></br>" + "<a id='" + value.object_id + "' href='#' class='img-link' >" +
		"<img style='border:0;' src='" + value.picture + "' width='10%' height='10%' \>" + "</a></br></br>";
	}
	
	timeLineItem += 
			" <div class='timeline-footer'>";
	
	if(value.likes != null){
		timeLineItem += 
			"<a id="+ value.id +
			"href='#' data-toggle='tooltip' data-placement='top' data-html='true' " +
			"title='" + likesNames + "'>" +
            value.likes.data.length + " likes </a>";							
	}
	
	if(value.comments != null){
		timeLineItem += "&nbsp;<a href='"+ value.id +"' class='comments-link'>" +
                        value.comments.data.length + " comments </a>";
	}
	else{
		timeLineItem += "&nbsp;<a href='"+ value.id +"' class='comments-link'>write comment</a>";
	}
	
	timeLineItem += "</div>";
	
	timeLineItem +=	"</div></li>";
	
	return timeLineItem;
}

function homeActions(){
		
		 //open friend profile
//		   $(document).on('click', "a.friend-link", function(event){				
//				event.preventDefault();
//				
//				var friendId = $(this).attr("href");
//				
//				$.ajax({
//					url : "https://graph.facebook.com/v2.1/" + friendId + "?fields=link&access_token=" + sessionStorage.getItem("accessToken"),
//					type : "GET",
//					Accept : 'application/json',
//					contentType : 'application/json',
//					dataType : "json",
//					success : function(data, status, jqXHR) {
//						window.open(data.link, '_blank');
//					}
//				});
//		   });
		
	   //open video
	   $(document).on('click', "a.video-link", function(event){				
			event.preventDefault();
			var videoSrc = $(this).attr("href");
			$("#videoSrc").attr("src", videoSrc);			
			$('#videoDiv').modal({ keyboard: false });
	   });
	   
	 //close video
	  $("#videoDiv").on("hidden.bs.modal", function () {
		  $('#videoSrc')[0].contentWindow.
		  		postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
		  $('#videoSrc').attr('src', '');
	  });
	  
	   //open photo
	   $(document).on('click', "a.img-link", function(event){				
			event.preventDefault();
			
			var photoId = $(this).attr("id");
			$("#photoSrc").attr("src", "");
			
			$.ajax({
				url : "https://graph.facebook.com/v2.1/" + photoId + "?fields=source&access_token=" + sessionStorage.getItem("accessToken"),
				type : "GET",
				Accept : 'application/json',
				contentType : 'application/json',
				dataType : "json",
				success : function(data, status, jqXHR) {
					$("#photoSrc").attr("src", data.source);
					$('#photoDiv').modal({ keyboard: false });
				}
			});
	   });
	   
	   //next button		
	   $("#nextBtn").click(function(e){	
		    $("#nextBtn").attr('disabled','disabled');
			e.preventDefault();
			var nextUrl = $(this).attr("href");
			appendToTimeLine(nextUrl);
	   });
}