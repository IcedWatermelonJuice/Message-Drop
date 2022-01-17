function hide(target){
	target=target instanceof $?target:$(target);
	target.addClass("hide");
}
function show(target){
	target=target instanceof $?target:$(target);
	target.removeClass("hide");
}
function initSendPage(){
	$("#send_textarea").val("");
	show($("#send_textarea"));
	hide($("#send_result"));
	$(".send_state").each((i,e)=>{
		hide(e);
	})
	hide($("#send_token"));
	show($(".send_state[state=ongoing]"));
	$("#send_token").text("000000");
	show($("#send_btn"));
	hide($(".copy_btn[target=token]"));
}
function initGetPage(){
	$(".get_state").each((i,e)=>{
		hide(e);
	})
	show($(".get_state[state=wait]"));
	show($("#get_token"));
	$("#get_input").val("");
	hide($("#get_textarea"));
	$("#get_textarea").val("");
	show($("#get_btn"));
	hide($(".copy_btn[target=content]"));
}
function copyData(data,msg){
	var exportBox = document.createElement("input");
	$(exportBox).val(data);
	$("body").append(exportBox);
	$(exportBox).select();
	document.execCommand('copy');
	$(exportBox).remove();
	msg = msg ? msg : "已导出到剪贴板";
	alert(msg);
}
function enQrCode(data) {
	return `https://tenapi.cn/qr/?txt=${data}`
}

function deQrCode(data) {
	var resData=false;
	$.ajax({
		url: `https://api.uomg.com/api/qr.encode?url=https://xnz.pub/${data}`,
		type: "get",
		dataType: "json",
		async: false,
		success: function(res) {
			resData=res.qrurl;
		},
		error:function(){
			resData=false;
		}
	})
	return resData;
}

function enShort(data) {
	var resData=false;
	$.ajax({
		url: `https://xnz.pub/apis.php?url=${data}`,
		type: "get",
		dataType: "json",
		async: false,
		success: function(res) {
			resData=res.result.shorten
		},
		error:function(){
			resData=false;
		}
	})
	return resData;
}

$(document).ready(()=>{
	$(".open_btn").click((evt)=>{
		let target=$(evt.target).attr("target");
		if(target==="send"){
			initSendPage();
			$("#conetent_box").children().each((i,e)=>{
				hide(e);
			})
			show($("#send_page"));
		}else if(target==="get"){
			initGetPage();
			$("#conetent_box").children().each((i,e)=>{
				hide(e);
			})
			show($("#get_page"));
		}else{
			console.log("target错误");
		}
	})
	$(".popup_close").each((idx,ele)=>{
		$(ele).click(()=>{
			$("#conetent_box").children().each((i,e)=>{
				hide(e);
			})
			show($("#btn_page"));
		})
	})
	$("#send_btn").click(()=>{
		let data=$("#send_textarea").val().trim();
		if (data) {
			hide($("#send_textarea"));
			show($("#send_result"));
			data=enShort(enQrCode(data));
			if(data){
				hide($(".send_state[state=ongoing]"));
				show($(".send_state[state=success]"));
				$("#send_token").text(data);
				show($("#send_token"));
				hide($("#send_btn"));
				show($(".copy_btn[target=token]"));
			}else{
				hide($(".send_state[state=ongoing]"));
				show($(".send_state[state=failure]"));
			}
		}else{
			alert("发送信息不能为空");
		}
	})
	$("#get_btn").click(()=>{
		let data=$("#get_input").val().trim();
		data=/^[A-Za-z0-9]{4,8}$/.test(data)?data:"";
		if (data) {
			hide($("#get_token"));
			hide($(".get_state[state=wait]"));
			show($(".get_state[state=ongoing]"));
			data=deQrCode(data);
			if(data){
				hide($(".get_state[state=ongoing]"));
				$("#get_textarea").val(data);
				show($("#get_textarea"));
				hide($("#get_btn"));
				show($(".copy_btn[target=content]"));
			}else{
				hide($(".get_state[state=ongoing]"));
				show($(".get_state[state=failure]"));
			}
		}else{
			alert("接收口令错误");
		}
	})
	$(".copy_btn[target=token]").click(()=>{
		let d=$("#send_token").text();
		copyData(d,"口令已复制到剪贴板");
	})
	$(".copy_btn[target=content]").click(()=>{
		let d=$("#get_textarea").val();
		copyData(d);
	})
})
