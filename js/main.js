//隐藏、显示元素
function hide(target) {
	target = target instanceof $ ? target : $(target);
	target.addClass("hide");
	return target;
}

function show(target) {
	target = target instanceof $ ? target : $(target);
	target.removeClass("hide");
	return target;
}
//初始化页面
function initSendPage() {
	$("#send_textarea").val("");
	show("#send_textarea");
	hide("#send_result");
	$(".send_state").each((i, e) => {
		hide(e);
	})
	hide("#send_token");
	show(".send_state[state=ongoing]");
	$("#send_token").text("000000");
	show("#send_btn");
	hide(".copy_btn[target=token]");
	$(".return_btn").each((i, e) => {
		hide(e);
	})
}

function initGetPage() {
	$(".get_state").each((i, e) => {
		hide(e);
	})
	show(".get_state[state=wait]");
	show("#get_token");
	$("#get_input").val("");
	hide("#get_textarea");
	$("#get_textarea").val("");
	show("#send_notice");
	show("#get_btn");
	hide(".copy_btn[target=content]");
	$(".return_btn").each((i, e) => {
		hide(e);
	})
}
//打开页面
function openSendPage() {
	initSendPage();
	$("#conetent_box").children().each((i, e) => {
		hide(e);
	})
	show($("#send_page"));
	$("#logo_box").addClass("small_logo_box");
}

function openGetPage() {
	initGetPage();
	$("#conetent_box").children().each((i, e) => {
		hide(e);
	})
	show($("#get_page"));
	$("#logo_box").addClass("small_logo_box");
}
//发送与接收
function sendMessage(data) {
	if (data.length > 500) {
		alert("发送文本限制在500字符以内");
		return false
	}
	hide("#send_textarea");
	hide("#send_notice");
	show("#send_result");
	data = processSend(data);
	if (data) {
		hide(".send_state[state=ongoing]");
		show(".send_state[state=success]");
		$("#send_token").text(data);
		show("#send_token");
		hide("#send_btn");
		show(".copy_btn[target=token]");
	} else {
		hide(".send_state[state=ongoing]");
		hide("#send_btn");
		show(".send_state[state=failure]");
		show(".return_btn[target=send]");
	}
}

function getMessage(data) {
	hide("#get_token");
	hide(".get_state[state=wait]");
	show(".get_state[state=ongoing]");
	setTimeout(() => {
		data = processGet(data);
		if (data) {
			hide(".get_state[state=ongoing]");
			$("#get_textarea").val(data);
			show("#get_textarea");
			hide("#get_btn");
			show(".copy_btn[target=content]");
		} else {
			hide(".get_state[state=ongoing]");
			hide("#get_btn");
			show(".get_state[state=failure]");
			show(".return_btn[target=get]");
		}
	})
}
//复制数据到剪贴板
function copyData(data, msg) {
	var exportBox = document.createElement("input");
	$(exportBox).val(data);
	$("body").append(exportBox);
	$(exportBox).select();
	document.execCommand('copy');
	$(exportBox).remove();
	msg = msg ? msg : "已导出到剪贴板";
	alert(msg);
}
//QR编码
function enQrCode(data) {
	return `https://tenapi.cn/qr/?txt=${data}`;
}
//QR解码
function deQrCode(data) {
	var resData = false;
	$.ajax({
		url: `https://api.uomg.com/api/qr.encode?url=https://xnz.pub/${data}`,
		type: "get",
		dataType: "json",
		async: false,
		success: function(res) {
			resData = res.qrurl;
		},
		error: function() {
			resData = false;
		}
	})
	return resData ? resData : false;
}
//转短链
function enShort(data) {
	var resData = false;
	$.ajax({
		url: `https://xnz.pub/apis.php?url=${data}`,
		type: "get",
		dataType: "json",
		async: false,
		success: function(res) {
			resData = res ? res.result.shorten : false
		},
		error: function() {
			resData = false;
		}
	})

	return resData;
}
//处理数据
function processSend(data) {
	if (data.length <= 50) {
		return enShort(enQrCode(`MessageDrop-single://${data}`));
	}
	var resData = [];
	for (let i = 0; i < Math.ceil(data.length / 50); i++) {
		let temp = `MessageDrop-single://${data.slice(0 + 50 * i, 50 + 50 * i)}`;
		temp = enShort(enQrCode(temp));
		resData[i] = temp;
	}
	return enShort(enQrCode(`MessageDrop-complex://${JSON.stringify(resData)}`));;
}

function processGet(data) {
	var resData = "";
	data = deQrCode(data);
	if (!data) {
		return resData;
	}
	if (/^MessageDrop-complex:\/\//.test(data)) {
		data = data.replace(/^MessageDrop-complex:\/\//, "");
		data = JSON.parse(data);
		let len=data.length;
		let dom=$(".get_state[state=ongoing]");
		let state=`0/${len}`
		dom.html(`接收中...<br>进度：(<span>${state}</span>)`);
		console.log(`正在接收数据，共${len}个数据包。当前进度:${state}`);
		for (let i=0;i<len;i++) {
			let temp = deQrCode(data[i]).replace(/^MessageDrop-single:\/\//, "");
			resData += temp;
			state=`${i+1}/${len}`
			dom.find("span").text(state);
			console.log(state);
			dom.html(`接收中...`);
		}
	} else {
		console.log(`正在接收数据，共1个数据包。当前进度:0/1`);
		resData = data.replace(/^MessageDrop-single:\/\//, "");
		console.log(`1/1`);
	}
	console.log(`接收完成!`);
	return resData;
}
//获取请求参数
function getQuery() {
	let query = location.search.substring(1).split("&");
	if (!query) {
		return false;
	}
	let array = {};
	for (let i in query) {
		let temp = query[i];
		if (temp) {
			temp = temp.split("=");
			array[temp[0]] = temp[1];
		}
	}
	return array
}
//处理请求参数
function copeQuery() {
	let query = getQuery();
	if (!query) {
		return false;
	}
	history.pushState("", "", location.href.replace(location.search, ""));
	let page = query.page;
	let data = query.data ? query.data.trim() : "";
	if (page === "send") {
		openSendPage();
		$("#send_textarea").val(data);
		$("#send_btn").click();
	} else if (page === "get") {
		openGetPage();
		$("#get_input").val(data);
		$("#get_btn").click();
	}
}

function bindEvent() {
	$(".open_btn").click((evt) => {
		let target = $(evt.target).attr("target");
		if (target === "send") {
			openSendPage();
		} else if (target === "get") {
			openGetPage();
		} else {
			console.log("target错误");
		}
	})
	$(".popup_close").each((idx, ele) => {
		$(ele).click(() => {
			$("#conetent_box").children().each((i, e) => {
				hide(e);
			})
			show("#btn_page");
			$("#logo_box").removeClass("small_logo_box");
		})
	})
	$("#send_btn").click(() => {
		let data = $("#send_textarea").val().trim();
		if (data) {
			sendMessage(data);
		} else {
			alert("发送信息不能为空");
		}
	})
	$("#get_btn").click(() => {
		let data = $("#get_input").val().trim();
		data = /^[A-Za-z0-9]{4,8}$/.test(data) ? data : "";
		if (data) {
			getMessage(data);
		} else {
			alert("接收口令错误");
		}
	})
	$(".copy_btn").click((evt) => {
		let target = $(evt.target).attr("target");
		if (target === "token") {
			let d = $("#send_token").text();
			copyData(d, "口令已复制到剪贴板");
		} else if (target === "content") {
			let d = $("#get_textarea").val();
			copyData(d);
		} else {
			console.log("target错误");
		}
	})
	$(".return_btn").click((evt) => {
		let target = $(evt.target).attr("target");
		if (target === "send") {
			let d = $("#send_textarea").val();
			initSendPage();
			$("#send_textarea").val(d);
		} else if (target === "get") {
			let d = $("#get_input").val();
			initGetPage();
			$("#get_input").val(d);
		} else {
			console.log("target错误");
		}
	})
	$("#send_textarea").bind("input propertychange", (evt) => {
		let length = $(evt.target).val().length;
		$("#send_notice span").text(length);
		if (length > 500) {
			$("#send_notice span").css("color", "red");
		} else {
			$("#send_notice span").removeAttr("style");
		}
		console.log()
	});
	$("#send_textarea").trigger('oninput onpropertychange');
	$("#get_input").keyup((evt)=>{
		if(evt.keyCode===13){
			$("#get_btn").click();
		}
	})
}
//主函数
$(document).ready(() => {
	bindEvent();
	copeQuery();
})
