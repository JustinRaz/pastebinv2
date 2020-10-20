
(function($) {
  "use strict"; // Start of use strict
  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function() {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

  //turn size and quantity result into sentence for modal display
  function stringResult(test){
      var len = test.length;
      var res = "";
      for (var i=0; i<len; i++){
          res = res+test[i].product_size+": "+test[i].size_quantity+" ";
      }
      return res;
  }
  //total amount for all items in cart
  function countCart(){
      var table = 0;
      var x = 1;
      var price = [];
      var quantity = [];
	  var discount = $("#discountFlag").val();
	  var isPresent = false;
      $("#cart").find("tbody tr").each(function(){          
		  price.push(parseInt($("#cart").find("td").eq(x).text())*((100-parseInt(discount))/100));
          x = x+4;
      })

      //grab data from quantity input for total display
          $("#cart tr").each(function(){
          $(this).find("input").each(function(){
              quantity.push($(this).val());
          });
      });
      for(var i=0; i<quantity.length; i++){
          table = table + (parseInt(quantity[i])*parseInt(price[i]));
      }
	  //checks if the transaction button with id "transaction" doesn't exist. if it doesn't exist, it is appended.
	  if (!$("#transaction").length){
		  $("#cartcard").append('<button class="btn btn-success btn-icon-split" id="transaction"><span class="icon text-white-50"><i class="fas fa-shopping-cart"></i></span><span class="text">Proceed</span></button>');
	  }else if ($("#transaction").length && $("#cart").find("tbody tr").length == 0){
		  $("#transaction").remove();
	  }
      return table;
  }
	
  function countTotal(){
	  var total = 0;
	  var i = 0;
	  var x = 1;
	  var price = [];
	  var quantity = [];
	  $("#transactiondetails").find("tbody tr").each(function(){
		  quantity.push($("#transactiondetails").find("tbody tr td").eq(x).text());
		  price.push($("#transactiondetails").find("tbody tr td").eq(x+1).text());
		  total = total + (parseInt(quantity[i])*parseInt(price[i]));
		  i++;
		  x=x+3;
	  });
	  return total;
  }
//changes total based on amount of quantity changed in cart table
  $(document).on("change", ".amount", function(){
      $("#total").text(countCart().toFixed(2));
  });
  
//change total based on discount tag change
  $(document).on("change", "#discountFlag", function(){
	  $("#total").text(countCart().toFixed(2));
  })
 
  //add to cart mechanism for selected product  
  $(".addtocart").on("click", function(){
      var x = $(this).closest("tr").find("td");
	  var variance = $("#transactTable").find(x).eq(2).text();
	  //grab id from product td for security SQL purposes
	  var id = $("#transactTable").find(x).eq(0).attr("id");
      var productname = $("#transactTable").find(x).eq(0).text();
      var price = $("#transactTable").find(x).eq(1).text();
      $("#cart").append("<tr><td id="+id+">"+productname+" SIZE "+variance+"</td><td>"+price+"</td><td><input type='number' name='quantity' style='width: 80px' class= 'amount nonnegative' value='1' min='1'></td><td><button class='btn btn-danger btn-circle btn-sm delete'><i class='fas fa-trash'></i></button></td></tr>");
      $("#total").text(countCart().toFixed(2));
  })
  //add transaction details to transactiondetails table
  $(".seedetails").on("click", function(){
	  $("#transactiondetails tbody tr").remove();
	  var x = $(this).closest("tr");
	  var id = $("#transactionTable").find(x).eq(0).attr("id");
	  console.log(id);
	  $.ajax({
		  type: "GET",
		  url: "/transactiondetails?transid="+id,
		  success: function(data){
			  for (var i=0; i<data.data.length; i++){
				$("#transactiondetails").append("<tr class='border-bottom-info'><td id="+data.data[i].transaction_details_id+">"+data.data[i].product_name+"-"+data.data[i].product_size+"</td><td>"+data.data[i].quantity+"</td><td>"+data.data[i].price.toFixed(2)+"</td></tr>")
			  }
			  $("#total").text(countTotal().toFixed(2))
		  }
	  })
  })
  //delete item from cart
	$(document).on("click", ".delete", function(){
		$(this).closest("tr").remove();
		$("#total").text(countCart().toFixed(2));
	});
	$(document).ready(function(){
		$("#transactionTable").dataTable({
			"aaSorting": []	
		})
		$("#transactTable").dataTable({
			"aaSorting": []
		})
	})
	//processes transaction details before sending to back-end
	$(document).on("click", "#transaction", function(){
		var x = 0;
		var product = [];
		var product_size = [];
		var split = [];
		var online = $("#onlineFlag").val();
		var discount = $("#discountFlag").val();
		var price = []
		var quantity = [];
		var id = [];
      $("#cart").find("tbody tr").each(function(){
		split = $("#cart").find("td").eq(x).text().split(" SIZE ");
		product.push(split[0]);
		product_size.push(split[1]);
	   	id.push($("#cart").find("td").eq(x).attr("id"));
	   	price.push(parseInt($("#cart").find("td").eq(x+1).text())*((100-parseInt(discount))/100));
       	x = x+4;
      });
      //grab data from quantity input for total display
        $("#cart tr").each(function(){
          $(this).find("input").each(function(){
              quantity.push($(this).val());
          });
      	});
		//collate all arrays in one object passable to AJAX
		var transaction = {};
		transaction.id = id;
		transaction.product = product;
		transaction.product_size = product_size;
		transaction.price = price;
		transaction.quantity = quantity;
		transaction.online = online;
		transaction.discount = discount;
		$.ajax({
			type: "POST", 
			data: transaction,
			url: "/transactions",
			success: function(data){
				console.log(data.status);
				if(data.status == 200){
					$("#transSuccessModal").modal("show");
					//triggers reload event for div on modal close
					$("#transSuccessModal").on("hide.bs.modal", function(e){
						setTimeout(window.location.reload.bind(window.location), 1000);
					});
				//status is 413 if requested quantity is greater than available quantity
				}else if(data.status == 413){
					$("#qtyInsufficientModal").modal("show");
					$("#qtyInsufficientModal").on("hide.bs.modal", function(e){
						$("#cartTable").load(" #cartTable");
						//reloads cart for new transaction
						$("#cartCard").load(" #cartCard .card");
					})
					
				}

			}
		});
	});
	//modal support of querying sizes for the chosen shirt
	$(".size").click(function(){
		var pass = $(this).data("id");
		$.ajax({
			type: "GET",
			url: "/productdetails?product_id="+pass,
			success: function(data){
				$("#available").text("Available sizes -  "+stringResult(data.data));
                $("#image").attr("src", "images/"+data.data2[0].product_img);
                console.log(data);
			}
		});
	});
	//notifications grabber, refreshes every page redirect
	$("#notif").click(function(){
		$(".dropdown-item").remove();
		console.log("test");
		if($(".dropdown-item").length != 3){
			$.ajax({
			type: "GET",
			url: "/notifications",
			success: function(response){
				console.log(response);
				for (var i=0; i<response.data.length; i++)
				{
					$("#testNotif").append('<a class="dropdown-item d-flex align-items-center" href="#"><div class="mr-3"><div class="icon-circle bg-primary"><i class="fas fa-file-alt text-white"></i></div></div><div><div class="small text-gray-500">'+new Date()+'</div><span class="font-weight-bold">Stock Alert! <br>'+response.data[i].product_name+' Variant-'+response.data[i].product_size+' Stocks Left:'+response.data[i].size_quantity+'</span></div></a>');		
				}
			}
		})

		}
	});
	//modal for product details and editing of details of existing products
	//used document on click because productdetails turns into a dynamic element after loading dataTable body
	$(document).on("click", ".productdetails", function(){
		$("#details tr").remove();
		var pass = $(this).data("id");
		$.ajax({
			type: "GET",
			url: "/fullproductdetails?product_id="+pass,
			success: function(response){
				$("#details").attr("data-id", pass);
				var consigneeFlag = response.data[0].consignee;
				if (consigneeFlag == 1){
					consigneeFlag = "Yes";
				}else{
					consigneeFlag = "No";
				}
				$("#details").append("<tr class='col-lg-12'><td>Product Name:</td><td>"+response.data[0].product_name+"</td></tr><tr><td>Sale Price</td><td><input class='col-lg-12 update nonnegative' id='sale_price' type='number' min=1 value='"+response.data[0].sale_price+"'></td></tr><tr><td>Consignee Product: </td><td>"+consigneeFlag+"</td></tr><tr><td><input type='hidden' value='product-id'></td><td><input type='hidden' value='"+pass+"'><p hidden>"+pass+"</p></td></tr>");
				$("#details").append("<tr class='border-top'><td>Variant</td><td>Quantity</td></tr>");
				for (var i=0; i< response.data.length; i++){
					$("#details").append("<tr><td>"+response.data[i].product_size+"</td><td>"+response.data[i].size_quantity+"</td></tr>")
				}
				if(!$("#addvariants").length){
					$("#detailModalBody").append("<br><br><button class='btn btn-info btn-icon-split' id='addvariants' data-id='"+pass+"'><span class='icon text-white-50'><i class='fas fa-plus'></i></span><span class='text'>Add Variants</span></button>&nbsp;");
					//&nbsp adds a space in between 2 buttons positioned side-by-side
				}
				if(!$("#deleteItem").length){
					$("#detailModalFooter").append('<button class="btn btn-danger btn-icon-split" id="deleteItem"><span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Item</span></button>');	
				}
			}
		});
	});
	//adds the button responsible for submitting the edited product values
	$(document).on("click", "#addvariants", function(){
		$("#details").append("<tr class='variantdetails'><td><input class='addedvariants col-lg-8' type='text' placeholder='Variant Name'></td><td><input class='variantquantity nonnegative' type='number' min='1' placeholder='Variant Quantity'></td></tr>")
		if (!$("#submitchanges").length){
			$("#detailModalBody").append("<button class='btn btn-success btn-icon-split' id='submitchanges' data-id='"+$(this).data("id")+"' disabled=true><span class='icon text-white-50'><i class='fas fa-cart-plus'></i></span><span class='text'>Submit</span></button>");
		}else{
			$("#submitchanges").attr("disabled", true);
		}
	})
	//delete item on product detail modal
	$(document).on("click", "#deleteItem", function(){
		$("#confirmDeleteModal").modal("show");
	});
	$(document).on("click", "#confirmDelete", function(){
		var prod_id = $("#details tr td").eq(7).text();
		$.ajax({
			type: "POST",
			url: "/deleteitem",
			data: {prod_id: prod_id},
			success: function(response){
				console.log(response);
				if(response.status==403){
					
				}else if(response.status==200){
					$("#detailModal").modal("hide");
					$("#confirmDeleteModal").modal("hide");
					$("#deleteSuccessModal").modal("show");
					setTimeout(window.location.reload.bind(window.location), 1000);
				}
			}
		})
	})
	$("#detailModal").on("hidden.bs.modal", function(){
		$("#submitchanges").remove();	
	})
	//send the edits and added variants on a product
	$(document).on("click", "#submitchanges", function(){
		//grabs the hidden text input of the product_id for editing. 7 is set for eq because it found on the 8th table cell
		var prod_id = $("#details tr td").eq(7).text();
		var saleprice = $("#sale_price").val();
		var addedvar = [];
		var varquantity = []
		var passable = {};
		$(".variantdetails").each(function(){
			addedvar.push($(this).find(".addedvariants").val());
			varquantity.push($(this).find(".variantquantity").val());
		});
		passable.saleprice = saleprice;
		passable.addedvar = addedvar;
		passable.varquantity = varquantity;
		$.ajax({
			type: "POST",
			url: "/sendedits?product_id="+prod_id,
			data: passable,
			success: function(response){
				$("#detailModal").modal("hide");
				$("#transSuccessModal").modal("show");
//				$("#dataTable").load(" #dataTable");
				//when using setTimeout with location.reload, bind object as proxy $this
//				$("#detailModal").load(" #detailModal");
				//use this to re-initialize the modal content (bad practice)
				setTimeout(window.location.reload.bind(window.location), 1000);
//				setTimeout($.ajax({type: "GET",url: "/editproducts"
//				}), 1000)
			}
		});
	
	});
	//checks if all appended variant inputs have values before submit button becomes enabled
	$(document).on("change", ".addedvariants", function(){
		var isEmpty = false;
		$(".addedvariants").each(function(){
			if (!$(this).val()){
				isEmpty = true;
			}
		})
		if (!isEmpty && $("#submitchanges").length){
			$("#submitchanges").attr("disabled", false);
		}else{
			$("#submitchanges").attr("disabled", false);
		}
	})
	//check if all input fields in addProductModal have values
	$(document).on("change", "#addProductModal input", function(){
		$("#addProductModal input").each(function(){
			var isEmpty = true;
			if (!$(this).val()){
				$("#addproduct").attr("disabled", true);
				console.log("Test");
			}else{
				$("#addproduct").attr("disabled", false);
				console.log("Trials");
			}
		})
	})
	$(document).on("keydown", "form", function(event) { 
		return event.key != "Enter";
	});
//	$(document).on("click", "#addproduct", function(){
//		var addprodname = $("#addprodname").val();
//		var addunitprice = $("#addunitprice").val();
//		var addsaleprice = $("#addsaleprice").val();
//		var consignee = $("#consigneeFlag").val();
//        var addedproduct = {}
//		if($("#consigneeFlag").val() == 1){
//			var consigneeName = $("#consigneeName").val();
//		}else{
//			var consigneeName = "STRAP";
//		}
//		var addedvar = [];
//		var addedvarqty = [];
//        //check if existing barcode input is disabled
//        if(!$(".existingBarcode").prop("disabled")){
//            var addedbarcode = []
//            $(".existingBarcode").each(function(){
//                if($(this).val()!=''){
//                    addedbarcode.push($(this).val());   
//                }else{
//                    console.log($(this).val());
//                }
//            });
//        }
////        if (addedbarcode.length){
////            addedproduct.barcode = addedbarcode;
////        }
//		$("#addvariant tbody tr").each(function(){
//			addedvar.push($(this).find(".addedvariants").val());
//			addedvarqty.push($(this).find(".addedvariantsquantity").val());
//		});
//		console.log($("#prodPic").prop('files'));
//		var prodPic = new FormData();
//		var myFile = $("#prodPic").prop('files')[0];
//		prodPic.append("pictureFile", myFile);
//		addedproduct.product_name = addprodname;
//		addedproduct.unit_price = addunitprice;
//		addedproduct.sale_price = addsaleprice;
//		addedproduct.consignee = consignee;
//		addedproduct.consigneename = consigneeName;
//		addedproduct.variants = addedvar;
//		addedproduct.variantqty = addedvarqty;
//		addedproduct.file = prodPic;
//		$.ajax({
//			type: "POST",
//			processData: false,
////			cache: false,
//			data: addedproduct,
////			enctype: 'multipart/form-data',
//			url: "/addproducts",
//			success: function(response){
//                console.log(response);
//				if (response.status == 200){
//					//show modal saying added product!
//					$("#addProductModal").modal("hide");
//					$("#addProductSuccessModal").modal("show");
//					setTimeout(window.location.reload.bind(window.location), 1000);
//				}else if (response.status == 204){
//					$("#addProductModal").modal("hide");
//					$("#addProductDuplicateModal").modal("show");			
//				}
//			}
//		});
//	})
//	$(document).on("click", "#addproduct", function(){
//		$("#myform").submit();
//		console.log("Test");
//			$.ajax({
//			type: "POST",
//			url: "/addproducts",
//			success: function(response){
//                console.log(response);
//				if (response.status == 200){
//					//show modal saying added product!
//					$("#addProductModal").modal("hide");
//					$("#addProductSuccessModal").modal("show");
//					setTimeout(window.location.reload.bind(window.location), 1000);
//				}else if (response.status == 204){
//					$("#addProductModal").modal("hide");
//					$("#addProductDuplicateModal").modal("show");			
//				}
//			}
//		});
//	})
	$("#myform").submit(function(event){
		var myform = document.getElementById("myform");
		var data = new FormData(myform);
		console.log(data);
		event.preventDefault();
		$.ajax({
			type: "POST",
			data: data,
			processData: false,
			contentType: false,
//			cache: false,
			enctype: "multipart/form-data",
			url: "/addproducts",
			success: function(response){
                console.log(response);
				if (response.status == 200){
					//show modal saying added product!
					$("#addProductModal").modal("hide");
					$("#addProductSuccessModal").modal("show");
					setTimeout(window.location.reload.bind(window.location), 1000);
				}else if (response.status == 204){
					$("#addProductModal").modal("hide");
					$("#addProductDuplicateModal").modal("show");			
				}
			}
		});
	})
	$("#addvariantrow").click(function(){
        if ($("#barcodeFlag").val()==1){
            $("#addvariant").append('<tr><td><input required type="text" class="addedvariants form-control bg-light border-1 small" name="addedvariants" placeholder="Variant"></td><td><input class="form-control bg-light border-1 small existingBarcode" type="number" name="barcode" placeholder="Enter barcode here" min="1"></td><td><input required type="number" class="addedvariantsquantity form-control bg-light border-1 small" name="addedvariantsquantity" placeholder="Qty" min="1"></td><td><button class="btn btn-danger btn-circle btn-sm delete"><i class="fas fa-trash"></i></button></td></tr>');
        }else{   
            $("#addvariant").append('<tr><td><input required type="text" class="addedvariants form-control bg-light border-1 small" name="addedvariants" placeholder="Variant"></td><td><input class="form-control bg-light border-1 small existingBarcode"  type="text" disabled=true name="barcode" placeholder="Disabled"></td><td><input required type="number" class="addedvariantsquantity form-control bg-light border-1 small" name="addedvariantsquantity" placeholder="Qty" min="1"></td><td><button class="btn btn-danger btn-circle btn-sm delete"><i class="fas fa-trash"></i></button></td></tr>');
        }
	});
	//checks if the name, unit price, or sale price has been changed and shows the submit button
	$(document).on("change", "#product_name" , function(){
		if(!$("#submitchanges").length){
			$("#detailModalBody").append("<button class='btn btn-success btn-icon-split' id='submitchanges'><span class='icon text-white-50'><i class='fas fa-cart-plus'></i></span><span class='text'>Submit</span></button>");	
		}
	})
	$(document).on("change", "#sale_price" , function(){
		if(!$("#submitchanges").length){
			$("#detailModalBody").append("<button class='btn btn-success btn-icon-split' id='submitchanges'><span class='icon text-white-50'><i class='fas fa-cart-plus'></i></span><span class='text'>Submit</span></button>");	
		}
	})
	$(document).on("change", "#unit_price" , function(){
		if(!$("#submitchanges").length){
			$("#detailModalBody").append("<button class='btn btn-success btn-icon-split' id='submitchanges'><span class='icon text-white-50'><i class='fas fa-cart-plus'></i></span><span class='text'>Submit</span></button>");	
		}
	})
	$("#barcodeinput").keyup(function(e){
		if(e.keyCode==13){
			var barcode = $("#barcodeinput").val();
			$.ajax({
				type: "GET",
				url: "/barcode?product="+barcode,
				statusCode:{
					204: function(response){
						$("#productNonexistModal").modal("show");
					}
				},
				success: function(response){
					if(response.status==200){
						$("#cart").append("<tr><td id="+response.data[0].product_id+">"+response.data[0].product_name+" SIZE "+response.data[0].product_size+"</td><td>"+response.data[0].sale_price+"</td><td><input type='number' min='1' oninput='validity.valid||(value='');' name='quantity' style='width: 80px' class= 'amount nonnegative' value='1' ></td><td><button class='btn btn-danger btn-circle btn-sm delete nonnegative'><i class='fas fa-trash'></i></button></td></tr>");
						$("#total").text(countCart().toFixed(2));	
						$("#barcodeinput").val("");
					}else if(response.status ==204){
						$("#productNonexistModal").modal("show");
						$("#barcodeinput").val("");
					}

				}
			})

		}
	});
	//all quantity and price value fields are set with class="nonnegative"
	//this function traps possible negative inputs and changes them to 1 by default
	$(document).on("keyup", ".nonnegative", function(){
		var input=0;
		input=$(this).val();
		if(input < 0){
			$(this).val("1");
		}else if(input == "0"){
			$(this).val("1");
		}
	})
	//enables input of consignee name if consignee name isn't part of choices
	$("#consigneeFlag").change(function(e){
		if ($("#consigneeFlag").val() == 1){
			$("#consigneeName").attr("disabled", false);
            $("#consigneeName").attr("placeholder", "Input consignee name here");
		}else if($("#consigneeFlag").val() == 0){
			$("#consigneeName").attr("disabled", true);
            $("#consigneeName").attr("placeholder", "Disabled");
		}
	})
	$("#barcodeFlag").change(function(e){
		if ($("#barcodeFlag").val() == 1){
			$(".existingBarcode").attr("disabled", false);
            $(".existingBarcode").attr("placeholder", "Enter barcode here");
		}else if($("#barcodeFlag").val() == 0){
			$(".existingBarcode").attr("disabled", true);
            $(".existingBarcode").attr("placeholder", "Disabled");
		}
	})
	//generate consignee monthly stock report
	$("#generateConsigneeStock").click(function(){
		var consignee = $("#consigneeChoice").val();
		$.ajax({
			type: "GET",
			url: "/consigneestockreport?consignee="+consignee
		})
	})
	//generate consignee monthly sales report
//	$("#generateConsigneeSales").click(function(){
//		var consignee = $("#consigneeSales").val();
//		$.ajax({
//			type: "GET",
//			url: "/consigneesalesreport?consignee="+consignee
//		})
//	})
	//checks if the selected time interval for report generation is dynamically set so that datepicker is enabled
	$("input[name=period]").on("click", function(){
		if($("#free").is(":checked"))
		{
			$("#toDate").attr("disabled", false);
			$("#fromDate").attr("disabled", false);
		}else{
			$("#toDate").attr("disabled", true);
			$("#fromDate").attr("disabled", true);
		}
		$("#submission").attr("disabled", false);
		$("#submission1").attr("disabled", false);
	})
	//forces all input of text type to be of uppercase
	$(document).on("keyup", "input[type=text]", function(){
		$(this).val($(this).val().toUpperCase());
	});
    $("#choice").change(function(){
        if ($("#choice").val()=="SPECIFIC"){
            $("#productChoice").attr("hidden",false);
            $("#barcodeTable").append("<tr><th class='text-left col-sm-8'>Product</th><th class='text-right col-sm-4'>Quantity</th><tr>");
        }
    })
    $("#productChoice").keyup(function(e){
        $.ajax({
            type: "POST",
            url: "/productautocomplete",
            data: {product:$(this).val()},
            success: function(response){
                console.log(response.data);
                $("#suggestion-box").show();
                var list = "<ul>";
                console.log(response.data.length);
                for (var i=0; i<response.data.length; i++){
                    //list = list + "<li onClick='selectProduct('"+response.data[i].product_name+" SIZE "+response.data[i].product_size+"');'>"+response.data[i].product_name+" SIZE "+response.data[i].product_size+"</li>";
                    list = list + "<li data-value='"+response.data[i].barcode+"'>"+response.data[i].product_name+" SIZE "+response.data[i].product_size+"</li>";
                }
                list = list + "</ul>";
                console.log(list);
                $("#suggestion-box").html(list);
            }
        });
    })
    $(document).on("click","li", function(){
        selectProduct($(this).text(), $(this).data("value"));
    })
    function selectProduct(val, barcode){
        console.log(barcode);
        $("#suggestion-box").hide();
        $("#barcodeTable").append("<tr><td>"+val+"<input type='number' name='barcode' value='"+barcode+"' hidden><input class='text-left' name='product' value='"+val+"' hidden></td><td><input type='number' min='1' name='quantity' value='1'></td></tr>");
        $("#productChoice").val("");
    }
    
})(jQuery); // End of use strict
