function hide(target) {
	target = target instanceof $ ? target : $(target);
	target.addClass("hide");
}

function show(target) {
	target = target instanceof $ ? target : $(target);
	target.removeClass("hide");
}

function initSendPage() {
	$("#send_textarea").val("");
	show($("#send_textarea"));
	hide($("#send_result"));
	$(".send_state").each((i, e) => {
		hide(e);
	})
	hide($("#send_token"));
	show($(".send_state[state=ongoing]"));
	$("#send_token").text("000000");
	show($("#send_btn"));
	hide($(".copy_btn[target=token]"));
}

function initGetPage() {
	$(".get_state").each((i, e) => {
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

function openSendPage() {
	initSendPage();
	$("#conetent_box").children().each((i, e) => {
		hide(e);
	})
	show($("#send_page"));
}

function openGetPage() {
	initGetPage();
	$("#conetent_box").children().each((i, e) => {
		hide(e);
	})
	show($("#get_page"));
}

function sendMessage(data) {
	hide($("#send_textarea"));
	show($("#send_result"));
	data = enShort(enQrCode(data));
	if (data) {
		hide($(".send_state[state=ongoing]"));
		show($(".send_state[state=success]"));
		$("#send_token").text(data);
		show($("#send_token"));
		hide($("#send_btn"));
		show($(".copy_btn[target=token]"));
	} else {
		hide($(".send_state[state=ongoing]"));
		hide($("#send_btn"));
		show($(".send_state[state=failure]"));
		show($(".return_btn[target=send]"));
	}
}

function getMessage(data) {
	hide($("#get_token"));
	hide($(".get_state[state=wait]"));
	show($(".get_state[state=ongoing]"));
	setTimeout(() => {
		data = deQrCode(data);
		if (data) {
			hide($(".get_state[state=ongoing]"));
			$("#get_textarea").val(data);
			show($("#get_textarea"));
			hide($("#get_btn"));
			show($(".copy_btn[target=content]"));
		} else {
			hide($(".get_state[state=ongoing]"));
			hide($("#get_btn"));
			show($(".get_state[state=failure]"));
			show($(".return_btn[target=get]"));
		}
	})
}

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

function enQrCode(data) {
	return `https://tenapi.cn/qr/?txt=${data}`
}

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
	return resData;
}

function enShort(data) {
	var resData = false;
	$.ajax({
		url: `https://xnz.pub/apis.php?url=${data}`,
		type: "get",
		dataType: "json",
		async: false,
		success: function(res) {
			resData = res.result.shorten
		},
		error: function() {
			resData = false;
		}
	})
	return resData;
}

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

function copeQuery() {
	let query = getQuery();
	if (!query) {
		return false;
	}
	history.pushState("", "", location.href.replace(location.search, ""));
	let type = query.dataType;
	let data = query.data ? query.data.trim() : "";
	if (type === "content") {
		openSendPage();
		$("#send_textarea").val(data);
		$("#send_btn").click();
	} else if (type === "token") {
		openGetPage();
		$("#get_input").val(data);
		$("#get_btn").click();
	}
}

$(document).ready(() => {
	$(".open_btn").click((evt) => {
		let target = $(evt.target).attr("target");
		if (target === "send") {
			openSendPage()
		} else if (target === "get") {
			openGetPage()
		} else {
			console.log("target错误");
		}
	})
	$(".popup_close").each((idx, ele) => {
		$(ele).click(() => {
			$("#conetent_box").children().each((i, e) => {
				hide(e);
			})
			show($("#btn_page"));
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
	copeQuery();
})
