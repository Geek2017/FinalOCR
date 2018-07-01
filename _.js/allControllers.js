(function () {
	// window.localStorage.removeItem("filename");
	'use strict';
	// localStorage.clear();
	angular
		.module('ocrSelectAngularApp')
		.controller('OcrSelectCtrl', OcrSelectCtrl);

	// manually inject dependencies
	OcrSelectCtrl.$inject = ['$scope', '$timeout', 'imgPDF', 'boxDrawer', 'PDFJS', 'Tesseract'];

	function OcrSelectCtrl($scope, $timeout, imgPDF, boxDrawer, PDFJS, Tesseract) {
		var vm = this;

		// scope variables
		vm.mouseIsDown = false;
		vm.dropZone = '';
		vm.uploadedCanvas = document.getElementById('uploaded-img');
		vm.$uploadedCanvas = $('#uploaded-img');
		vm.pdf = {
			numPages: 1,
			pageList: [1],
			currentPage: 1
		};
		$('#language').attr('disabled', 'disabled');
			
		$("#yes").hide();
		$("#no").hide();
		$("#language").hide();
		$("#pageSelect").hide();
		$("#ocrapi").hide();

		$scope.Api = function () {
			if ($('#ocrapi').val() == 1) {
				$('#language').attr('disabled', 'disabled');
			} else {
				$('#language').removeAttr('disabled');
			}
		}

		// if (localStorage.getItem('Login') == 1) {
		// 	$('#sys').show();
		// 	$('#document').hide();

		// } else {
		// 	$('#sys').hide();
		// 	$('#document').show();
		// }

		$scope.logout = function () {
			window.location = '/ocr';
			clearListCookies
		}
		// $scope.logIn = function () {
		// 	if ($('#email').val() !== "" && $('#pwd').val()) {
		// 		$('#sys').show();
		// 		$('#document').hide();
		// 		localStorage.setItem('Login', 1)
		// 	} else {
		// 		alert('Password & username required')
		// 	}
		// }

		vm.capturedCanvas = document.getElementById('test-area');



		vm.langs = {
			list: ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'],
			selectedLang: 'eng'
		};



		// scope methods
		vm.removeBox = removeBox;
		vm.fileChangeHandler = fileChangeHandler;
		vm.dragOverHandler = dragOverHandler;
		vm.dragEndHandler = dragEndHandler;
		vm.dropHandler = dropHandler;
		vm.onPageSelect = onPageSelect;
		vm.initBox = initBox;
		vm.drawBox = drawBox;
		vm.captureBox = captureBox;

		$("#thisocr").hide();
		$("#loading").hide();

		$('#bward').click(function () {
			var cnum=localStorage.getItem('cnum');
			if(cnum>1){
			cnum--;
			localStorage.setItem('cnum',cnum);
			$('#thisocr').append("<object class='thisocr' id='thisocr' type='text/html' data='./nonocr/' style='width:100%; height:100%; margin:0%;' scrolling='no'></object>");
			$(".uploaded-img").hide();
		}

		});
		$('#fward').click(function () {
			var cnum=localStorage.getItem('cnum');
			if(cnum<localStorage.getItem('pcount')){
			cnum++;
			localStorage.setItem('cnum',cnum);
			$('#thisocr').append("<object class='thisocr' id='thisocr' type='text/html' data='./nonocr/' style='width:100%; height:100%; margin:0%;' scrolling='no'></object>");
			$(".uploaded-img").hide();
		}
		});
		
		$('#down').click(function () {
			console.log($('#thisocr').get(0).scrollLeft);
			('#thisocr').scrollLeft(100);
	});
	

		function fileChangeHandler(event) {
			var file = event.target.files[0];
			vm.removeBox();
			myFunction();

			localStorage.setItem('cnum',1);

			// location.reload(localStorage.setItem('go',1));

			$("#field1").val('');
			$("#field2").val('')
			$("#field3").val('')
			$("#field4").val('')
			$("#field5").val('')
			$('#pdf-controls').append("<object data='./nonocr' id='hidden' style='visibility: hidden;'></object>");



			localStorage.removeItem('bolean');
			$("#loading").show();
			setTimeout(function () {
				
				$("#hidden").remove();



				if (localStorage.getItem('bolean') > 10 || localStorage.getItem('bolean') == '') {
					$('#thisocr').append("<object class='thisocr' id='thisocr' type='text/html' data='./nonocr/' style='width:100%; height:100%; margin:0%;' scrolling='no'></object>");
					$(".uploaded-img").hide();
					$("#thisocr").show();
					$("#hidden").remove();
					
					$("#yes").hide();
					$("#language").hide();
					$("#ocrapi").hide();
					$("#no").show();
					$("#loading").hide();
					
					$("#pageSelect").hide();
				} else {
					$("#yes").show();
					$("#language").show();
					$("#ocrapi").show();
					$("#no").hide();
					$(".uploaded-img").show();
					imgPDF.checkImgOrPdf(file, uploadImg, uploadPdf);
				
					$('#thisocr').hide();
					$("#hidden").remove();
					$("#loading").hide();
					$("#pageSelect").show();
				}
			}, 3000);




		}

		function onPageSelect(event) {
			updatePdfCurrentPage(event);
			uploadPdf();
		}

		function dragOverHandler(event) {
			console.log('dragOverHandler');
			event.preventDefault();
			event.stopPropagation();
			setDropZone('drop-zone');
			return false;
		}

		function dragEndHandler(event) {
			console.log('dragEndHandler');
			setDropZone('');
			return false;
		}

		function dropHandler(event) {
			console.log('dropHandler');
			setDropZone('');
			event.preventDefault();
			var file = event.dataTransfer;
			imgPDF.checkImgOrPdf(file, uploadImg, uploadPdf);
		}

		function setDropZone(className) {
			vm.dropZone = className;
		}



		function uploadImg() {
			var options = imgPDF.getRenderOptions();
			renderIMG(vm.uploadedCanvas, options);
		}

		function renderIMG(canvas, options) {

			var context = canvas.getContext('2d');
			var dx = options[5],
				dy = options[6],
				dw = options[7],
				dh = options[8];


			context.clearRect(dx, dy, dw, dh);

			// dw++; 
			// dh++;

			canvas.width = dw;
			canvas.height = dh;
			context.drawImage.apply(context, options);

			localStorage.setItem('cw', canvas.width)
			localStorage.setItem('ch', canvas.height)


		}

		function uploadPdf() {
			var src = imgPDF.getPdfSrc();

			PDFJS.getDocument(src)
				.then(function (pdf) {
					// update pdf number of pages if different
					if (pdf.numPages !== vm.pdf.numPages) {
						updatePdfPages(pdf.numPages);
					}
					// get pdf page	
					pdf.getPage(vm.pdf.currentPage)
						.then(function (page) {
							renderPdf(vm.uploadedCanvas, page)
								.then(function () {
									// update img model's source with uploadedCanvas's aDataURL
									var tmpURL = vm.uploadedCanvas.toDataURL("image/jpeg", 1.0);
									// localStorage.setItem('srcImg',tmpURL);
									imgPDF.updateImg(tmpURL);
								});
						});
				});
		}

		function updatePdfPages(numPages) {
			$timeout(function () {
				vm.pdf.numPages = numPages;

				// set pdf vm's pageList array
				vm.pdf.pageList = [];
				for (var i = 1; i <= numPages; i++) {
					vm.pdf.pageList.push(i);
				}
			}, 0);
		}

		function updatePdfCurrentPage(pageNum) {
			$timeout(function () {
				vm.pdf.currentPage = pageNum;
			}, 0);
		}
		localStorage.setItem('zv', 1);


		$scope.zoomIn = function () {
			if (localStorage.getItem('zv') < 5) {
				var inc = localStorage.getItem('zv');
				inc = inc * 1 + 0.5;
				localStorage.setItem('zv', inc)
				$scope.ocrselect.onPageSelect($scope.ocrselect.pdf.currentPage = $scope.ocrselect.pdf.currentPage);
			}
		}

		$scope.zoomOut = function () {
			if (localStorage.getItem('zv') >= 1) {
				var inc = localStorage.getItem('zv');
				inc = inc * 1 - 0.5;
				localStorage.setItem('zv', inc)
				$scope.ocrselect.onPageSelect($scope.ocrselect.pdf.currentPage = $scope.ocrselect.pdf.currentPage);
			}

		}

		localStorage.setItem('switch', 1);

		$scope.dragIt = function () {
			console.log('saving... 0')
			$("#image-area").attachDragger(localStorage.setItem('switch', 0));
			$(".card-body").mousedown();
			$("#container").addClass("grab");
			$("#container").removeClass("crosshair");
		}
		$("#container").mousedown(function () {
			$("#container").removeClass("grab");
			$("#container").addClass("grabbing");
		});

		$("#container").mouseup(function () {
			$("#container").removeClass("grabbing");
			$("#container").addClass("grab");
		});

		$scope.cropIt = function () {
			console.log('saving... 1')
			localStorage.setItem('switch', 1);
			$(".card-body").mousedown();
			$("#container").removeClass("grab");
			$("#container").addClass("crosshair");
		}

		$scope.resetIt = function () {
			localStorage.setItem('zv', 1);
			$scope.ocrselect.onPageSelect($scope.ocrselect.pdf.currentPage = $scope.ocrselect.pdf.currentPage);
			$(".card-body").mousedown();
		}

		$scope.nextp = function () {
			$scope.ocrselect.onPageSelect($scope.ocrselect.pdf.currentPage = $scope.ocrselect.pdf.currentPage + 1);

		}

		$scope.prevp = function () {
			$scope.ocrselect.onPageSelect($scope.ocrselect.pdf.currentPage = $scope.ocrselect.pdf.currentPage - 1);
		}


		function renderPdf(viewEl, page) {
			var zval = localStorage.getItem('zv');

			var scale = zval,
				viewport = page.getViewport(scale),
				context = viewEl.getContext('2d'),
				renderContext = {
					canvasContext: context,
					viewport: viewport
				};
			context.clearRect(0, 0, viewport.width, viewport.height);
			viewEl.width = viewport.width;
			viewEl.height = viewport.height;

			console.log(scale);

			return page.render(renderContext).promise;
		}



		$scope.callme = function () {
			var $pdfContainer = jQuery("#pdfContainer");
			$pdfContainer.css("height", localStorage.getItem("ch") + "px").css("width", localStorage.getItem("cw") + "px");
			$pdfContainer.append($canvas);

			//The following few lines of code set up scaling on the context if we are on a HiDPI display
			var outputScale = getOutputScale();
			if (outputScale.scaled) {
				var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
					(1 / outputScale.sy) + ')';
				CustomStyle.setProp('transform', canvas, cssScale);
				CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

				if ($textLayerDiv.get(0)) {
					CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
					CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
				}
			}

			context._scaleX = outputScale.sx;
			context._scaleY = outputScale.sy;
			if (outputScale.scaled) {
				context.scale(outputScale.sx, outputScale.sy);
			}

			var canvasOffset = $canvas.offset();
			var $textLayerDiv = jQuery("<div />")
				.addClass("textLayer")
				.css("height", viewport.height + "px")
				.css("width", viewport.width + "px")
				.offset({
					top: canvasOffset.top,
					left: canvasOffset.left
				});

			$pdfContainer.append($textLayerDiv);

			page.getTextContent().then(function (textContent) {
				var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
				//the page. It is set to page.number - 1.
				textLayer.setTextContent(textContent);

				var renderContext = {
					canvasContext: context,
					viewport: viewport,
					textLayer: textLayer
				};

				page.render(renderContext);
			});
		}



		function removeBox() {
			vm.isActive = false;
		}

		function getMousePos(event, $canvas) {
			var x = event.pageX - $canvas.parent().offset().left + $canvas.parent().scrollLeft(),
				y = event.pageY - $canvas.parent().offset().top + $canvas.parent().scrollTop();
			return [x, y];
		}

		function initBox(event) {
			if (localStorage.getItem('switch') == '1') {
				event.preventDefault();
				vm.mouseIsDown = true;
				vm.removeBox();
				var xy = getMousePos(event, vm.$uploadedCanvas);
				boxDrawer.init(xy);
			}
		}

		function drawBox(event) {
			if (vm.mouseIsDown && localStorage.getItem('switch') == '1') {
				var xy = getMousePos(event, vm.$uploadedCanvas);
				vm.boxSelect = boxDrawer.draw(xy);
				vm.isActive = 'box-active';
			}
		}

		function captureBox(event) {
			vm.mouseIsDown = false;
			if (vm.isActive && localStorage.getItem('switch') == '1') {
				var box = boxDrawer.getBox();
				imgPDF.captureImg(box, renderCapturedImg);
				vm.removeBox();
				var canvas = document.getElementById('test-area');
				console.log(canvas.height);

				if (canvas.height > 200) {
					alert('excceed')
					canvas.height = "100%";
					renderCapturedImg();
				}

			}

		}

		function renderCapturedImg() {
			var options = imgPDF.getRenderOptions();
			renderIMG(vm.capturedCanvas, options);
			var tmpURL = vm.capturedCanvas.toDataURL("image/jpeg", 1.0);
			// imgPDF.prepOCR(tmpURL, runOCR);
			$scope.getcanvas();
		}

		$("#uploadit").click(function () {
			$("#img-input").click();



		});

		function setfocus() {
			var field1 = $('#field1');
			var value = field1.val();
			field1.val("");
			field1.focus();
			field1.val(value);
		}
		setfocus();

		localStorage.setItem('val', 2);
		$scope.addfields = function () {




			var counter = localStorage.getItem('val');
			// alert(counter);


			if (counter > 5) {
				// alert("Only 5 textboxes allow");
				return false;
			} else {

				var newTextBoxDiv = $(document.createElement('div'))
					.attr("id", 'TextBoxDiv' + counter)
					.attr("class", 'input-group-prepend');

				newTextBoxDiv.after().html('<label class="editable input-group-text">Field #' + counter + ' : </label>' +
					'<input type="text" class="form-control" name="textbox' + counter +
					'" id="field' + counter + '" value="" >');
				//  '<input type="button" value="X" id="removeButton">');

				newTextBoxDiv.appendTo("#TextBoxesGroup");


				counter++;
				localStorage.setItem('val', counter);




			}
		}

		$scope.getcanvas = function () {

			var canvas = document.getElementById('test-area')
			var dataURL = canvas.toDataURL();
			// console.log(dataURL);
			localStorage.setItem('snapbas64', dataURL)

			var language = $('#language').find(":selected").text();
			// 'deu'

			var baseCode64 = localStorage.getItem('snapbas64').replace('data:image/png;base64,', '').replace('data:image/jpeg;base64,', '');

			var requestJson = {
				"requests": [{
					"image": {
						"content": baseCode64
					},
					"features": [{
						"type": "TEXT_DETECTION"
					}]
				}]
			}


			function googleapi() {

				$.ajax({
					url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBbP86Y1NNMQS14N70aiOPCCbf5VK25Vgw",
					type: "POST",
					data: JSON.stringify(requestJson),
					headers: {
						"Content-Type": "application/json"
					},
					success: function (response) {

						setfocus();
						if (typeof response.responses[0].fullTextAnnotation == "undefined") {
							alert('API request Failed Try again');
						} else if ($('#field1').val() == '') {
							$('#field1').val(response.responses[0].fullTextAnnotation.text);
							var ocrtel = $('#field2');
							var value = ocrtel.val();
							ocrtel.val("");
							ocrtel.focus();
							ocrtel.val(value);

						} else if ($('#field1').val() !== '' && $('#field2').val() == '') {
							$('#field2').val(response.responses[0].fullTextAnnotation.text);
							var ocradd = $('#field3');
							var value = ocradd.val();
							ocradd.val("");
							ocradd.focus();
							ocradd.val(value);
						} else if ($('#field2').val() !== '' && $('#field3').val() == '') {
							$('#field3').val(response.responses[0].fullTextAnnotation.text);
							var ocradd = $('#field4');
							var value = ocradd.val();
							ocradd.val("");
							ocradd.focus();
							ocradd.val(value);
						} else if ($('#field3').val() !== '' && $('#field4').val() == '') {
							$('#field4').val(response.responses[0].fullTextAnnotation.text);
							var ocradd = $('#field5');
							var value = ocradd.val();
							ocradd.val("");
							ocradd.focus();
							ocradd.val(value);
						} else if ($('#field4').val() !== '' && $('#field5').val() == '') {
							$('#field5').val(response.responses[0].fullTextAnnotation.text);
							if ($('#field1').val() !== null &&
								$('#field2').val() !== null &&
								$('#field3').val() !== null &&
								$('#field4').val() !== null &&
								$('#field5').val() !== null) {

								localStorage.setItem('filename',
									$('#field1').val() + '_' +
									$('#field2').val() + '_' +
									$('#field3').val() + '_' +
									$('#field4').val() + '_' +
									$('#field5').val());

							} else {
								alert('fields cant be blank');
							}
						}

					},

					error: function (jqXHR, exception) {
						console.log(jqXHR, exception);
						console.log('content:', requestJson)
					},
				});



			}

			if ($('#ocrapi').val() == 0) {
				googleapi();
			} else {

				Tesseract.recognize(dataURL, language)
					.then(function (res) {
						// $scope.addfields();
						console.log('result was:', language + "::" + res.text)
						setfocus();

						if ($('#field1').val() == '') {
							$('#field1').val(res.text);
							var ocrtel = $('#field2');
							var value = ocrtel.val();
							ocrtel.val("");
							ocrtel.focus();
							ocrtel.val(value);

						} else if ($('#field1').val() !== '' && $('#field2').val() == '') {
							$('#field2').val(res.text);
							var ocradd = $('#field3');
							var value = ocradd.val();
							ocradd.val("");
							ocradd.focus();
							ocradd.val(value);
						} else if ($('#field2').val() !== '' && $('#field3').val() == '') {
							$('#field3').val(res.text);
							var ocradd = $('#field4');
							var value = ocradd.val();
							ocradd.val("");
							ocradd.focus();
							ocradd.val(value);
						} else if ($('#field3').val() !== '' && $('#field4').val() == '') {
							$('#field4').val(res.text);
							var ocradd = $('#field5');
							var value = ocradd.val();
							ocradd.val("");
							ocradd.focus();
							ocradd.val(value);
						} else if ($('#field4').val() !== '' && $('#field5').val() == '') {
							$('#field5').val(res.text);
							if ($('#field1').val() !== null &&
								$('#field2').val() !== null &&
								$('#field3').val() !== null &&
								$('#field4').val() !== null &&
								$('#field5').val() !== null) {

								localStorage.setItem('filename',
									$('#field1').val() + '_' +
									$('#field2').val() + '_' +
									$('#field3').val() + '_' +
									$('#field4').val() + '_' +
									$('#field5').val());

							} else {
								alert('fields cant be blank');
							}
						}

					})
			}

		}


		function displayResults(results) {
			$timeout(function () {
				vm.displayResults = results;
			}, 0);
		}
	}





	$("#removeButton").click(function () {
		var counter = localStorage.getItem('val');
		if (counter == 1) {
			alert("No more textbox to remove");
			return false;
		}

		counter--;

		localStorage.setItem('val', localStorage.getItem('val') - 1);

		$("#TextBoxDiv" + counter).remove();

	});

	$("#getButtonValue").click(function () {

		var msg = '';
		for (i = 1; i < counter; i++) {
			msg += "\n Textbox #" + i + " : " + $('#textbox' + i).val();
		}
		alert(msg);
	});





	document.getElementById("img-input").addEventListener("change", myFunction);

	function myFunction() {
		// alert('go')
		var selectedFile = document.getElementById("img-input").files;
		//Check File is not Empty
		if (selectedFile.length > 0) {
			// Select the very first file from list
			var fileToLoad = selectedFile[0];
			// FileReader function for read the file.
			var fileReader = new FileReader();
			var base64;
			// Onload of file read the file content
			fileReader.onload = function (fileLoadedEvent) {
				base64 = fileLoadedEvent.target.result;
				// Print data in console
				// console.log(base64);
				localStorage.setItem('PDFbase64', base64)
			};
			// Convert data to base64
			fileReader.readAsDataURL(fileToLoad);
		}
	}



	window.downloadPDF = function () {

		var filename = $('#field1').val() + "_" +
			$('#field2').val() + "_" +
			$('#field3').val() + "_" +
			$('#field4').val() + "_" +
			$('#field5').val();

		if ($('#field1').val() == "" ||
			$('#field2').val() == "" ||
			$('#field3').val() == "" ||
			$('#field4').val() == "" ||
			$('#field5').val() == "") {
			alert('Blank Fieals not allowed!');
		} else {

			var dlnk = document.getElementById('saveit');
			var a = document.getElementById("saveit");
			a.setAttribute("download", filename);
			dlnk.href = localStorage.getItem('PDFbase64');;

			dlnk.click();

			alert('File Succesfully Saved Check Your Downloads Folder')

		}







	}

	$("#TextBoxesGroup").load(function () {
		alert("Image loaded.");
	});





	$("#cocr").click(function () {

		if (localStorage.getItem('setstat') == '0') {
			// alert( "Searchable" );

			// $("#thisocr").remove();
			$('#image-area').append("<object id='thisocr'  style='width:100%; height:100%; margin:1%;'  type='text/html' scrolling='no' data='./nonocr' hidden></object>");
			$("#uploaded-img").remove();

		} else {
			$("#thisocr").remove();
			$(".thisocr").remove();

			// alert( "not-Searchable" );
			$("#thisocr").hide();
			$(".thisocr").hide();

		}

	});



})();