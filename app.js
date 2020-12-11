$(function(){
	showFG_mic();
})

$(function(){
	$(".menu").click(function(){
		$(".menu_selecetd").removeClass("menu_selecetd");
		$(this).addClass("menu_selecetd");
		var key = $(this).attr("val");
		if(key.match(/(send|recv)/)){
			$(".box").hide();
			$(".box_"+key).show();
		} else {
			$(".box").show();
		}
	});

	$(".clearButton").click(function(){
		$(".recv_tt").val("").trigger("input");
		$("recvbyte,.preview_recv").html("");

		console.log(Quiet.resetContent());

	});

})


$(function(){
	sendInit();
})

	function sendInit(){

	return (function() {
    Quiet.init({
        profilesPrefix: "lib/quiet/",
        memoryInitializerPrefix: "lib/quiet/",
        libfecPrefix: "lib/quiet/"
    });
    var btn;
    var textbox;
    var warningbox;
    var transmit;

    function onTransmitFinish() {
        textbox.focus();
        btn.addEventListener('click', onClick, false);
        btn.disabled = false;
        var originalText = btn.innerText;
        btn.innerText = btn.getAttribute('data-quiet-sending-text');
        btn.setAttribute('data-quiet-sending-text', originalText);
        
        if($(".loop").is(":checked")){
	        setTimeout(function(){
	        	btn.click();
	        },500);
	      }
        
    };

    function onClick(e) {
        e.target.removeEventListener(e.type, arguments.callee);
        e.target.disabled = true;
        var originalText = e.target.innerText;
        e.target.innerText = e.target.getAttribute('data-quiet-sending-text');
        e.target.setAttribute('data-quiet-sending-text', originalText);
        var payload = textbox.value;
        if (payload === "") {
            onTransmitFinish();
            return;
        }
        transmit.transmit(Quiet.str2ab(payload));
    };

    function onQuietReady() {
        var profilename = document.querySelector('[data-quiet-profile-name]').getAttribute('data-quiet-profile-name');
        transmit = Quiet.transmitter({profile: profilename, onFinish: onTransmitFinish});
        btn.addEventListener('click', onClick, false);
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "Sorry, it looks like there was a problem with this example (" + reason + ")";
    };

    function onDOMLoad() {
        btn = document.querySelector('[data-quiet-send-button]');
        textbox = document.querySelector('[data-quiet-text-input]');
        warningbox = document.querySelector('[data-quiet-warning]');
        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

    onDOMLoad();
})();


	}

$(function(){

	$(".send_tt").bind("change input",function(){
		 $("sendbyte").html( "<font size=2>" + new String($(".send_tt").val()).length + "byte" + "</font>")

		if($(this).val()){
			$(".sendBt").prop("disabled","");
		} else {
			$(".sendBt").prop("disabled","false");
		}
	
	});

	$('.drop_area').on('dragenter dragover', function (e) {
		 $('.drop_area').addClass("dropOver");
			e.stopPropagation();
			e.preventDefault();
	});

	$('.drop_area').on('dragleave', function (event) {
	  event.stopPropagation();
	  event.preventDefault();
		$('.drop_area').removeClass("dropOver");
});

$('.drop_area').on('drop', function (event) {
	event.preventDefault();
	$('.drop_area').removeClass("dropOver");
  $('.file')[0].files = event.originalEvent.dataTransfer.files;

	if ($('.file')[0].files.length > 1) {
		alert('複数ファイルは対応してぬい。。');
		return;
	}

	$('.file').trigger("change");


});


	$(".file").change(function(e){
		handleFile(e.target.files[0]);
	})

})

	function handleFile(file){
		
		var fileReader = new FileReader();
		 fileReader.onload = function() {
		 $(".send_tt").val(file.name +"\n"+ this.result).trigger("change");
		}
		fileReader.readAsDataURL(file);
	
	}


$(function(){
	$(".fileSelect").click(function(){
		$(".file").click();
	});
});



$(function(){
	$(".download").click(function(){
		
		var recvText = $(".recv_tt").val();
		
		if(recvText == ""){
			alert("まだ何もないやん。");
			return;
		}
		
		var is_file = recvText.match(/^(.*)\ndata:/);
		var blob;
		var filename;

		if(is_file){
			var vals = new String($(".recv_tt").val()).split("\n");
			filename = vals[0] || "sample.txt";

			var dataURI = vals[1];
			
			var byteString = atob( dataURI.split( "," )[1] ) ;
			var mimeType = dataURI.match( /(:)([a-z\/]+)(;)/ )[2] ;

			for( var i=0, l=byteString.length, content=new Uint8Array( l ); l>i; i++ ) {
				content[i] = byteString.charCodeAt( i ) ;
			}

			blob = new Blob( [ content ], {
					type: mimeType ,
			} ) ;

		} else {
			blob = new Blob( [ recvText ], {
					type: "text/plain" ,
			} ) ;
			filename = "plain.txt";
		}

		 var a = document.createElement("a");
		  a.href = URL.createObjectURL(blob);
		  a.target = '_blank';
		  a.download = filename;
		  a.click();

	
	})
})



$(function(){

	$(".recv_tt").bind("input",function(){
		if($(this).val()){
		$(".download").prop("disabled","");
		} else {
		$(".download").prop("disabled",true);
		}
	})
	

	$("body").bind("receive",function(e,val){
		$(".recv_tt").val(val).trigger("input");
		$("recvbyte").html(  new String($(".recv_tt").val()).length + "byte" )
	});

})


function viewFG(message,callback){
	var fg = $("<div style='position:fixed;top:0px;left:0px;background:rgba(0,0,0,.3);width:100%;height:100%;text-align:center'></div>");
	$("body").append(fg);
	
	fg.append("<div style='box-shadow: 0 10px 25px 0 rgba(0, 0, 0, .5);margin-top:100px;display:inline-block;padding:10px;background:white'>" + 
	'<div><span class="fas fa-microphone" style="font-size:30pt"></span></div>' + 
	message + "<div><input autofocus style='margin:10px' type=button class=recv_button value='はい'></div></div>");

	$(document).on("click",".recv_button",function(){
		$(fg).remove();
		callback();
	})

}

function showFG_mic(){
	viewFG("マイク＆音量をONにしてね。",function(){
		recvInit();
	});
}

function showMFG_micPermission(){
	viewFG("ページ移動するので、マイク使用を許可してね。<br>（1度許可すれば、今後はアラートは出ません。）",function(){
		window.open("?","_blank");
	});
}

function recvInit(){

(function() {
    Quiet.init({
			profilesPrefix: "lib/quiet/",
			memoryInitializerPrefix: "lib/quiet/",
			libfecPrefix: "lib/quiet/"
    });

    var target;
    var warningbox;
		var content = new ArrayBuffer(0);

		Quiet.resetContent = function(){
			content = new ArrayBuffer(0);
		};

    function onReceive(recvPayload) {
			if($(target).is(":visible")){
				content = Quiet.mergeab(content, recvPayload);
				$("body").trigger("receive",Quiet.ab2str(content));
				warningbox.classList.add("hidden");
			}
    };

    function onReceiverCreateFail(reason) {
        showMFG_micPermission();
        console.log("failed to create quiet receiver: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "マイクを許可してね。chromeを使ってね。"
    };

    function onReceiveFail(num_fails) {
        warningbox.classList.remove("hidden");
        warningbox.textContent = "Error:音量をもうちょいあげてね。。"
    };

    function onQuietReady() {
        var profilename = document.querySelector('[data-quiet-profile-name]').getAttribute('data-quiet-profile-name');
        Quiet.receiver({profile: profilename,
             onReceive: onReceive,
             onCreateFail: onReceiverCreateFail,
             onReceiveFail: onReceiveFail
        });
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "なんかへん.. (" + reason + ")";
    };

    function onDOMLoad() {
        target = document.querySelector('[data-quiet-receive-text-target]');
        warningbox = document.querySelector('[data-quiet-warning]');
        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

		onDOMLoad();

})();
	}