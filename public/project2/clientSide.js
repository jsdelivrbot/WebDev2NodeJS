//A very bad implementation of a client side shopping cart. But given how server side data will super ceede client side for purchases. 
var cart = [];
var cartItem = {
	item_id: "",
	item_name: "",
	price: 0,
	qty: 0

};

var tempStock = [""];
var tempPrice = [""];



$(document).on('click', "#store-button", function () {
    $.ajax({
        type: 'POST',
        url: '/getItemsFromDb',
		success: function (result) {
		
		var temp = "<div class='welcome'>Select Item</div><hr/>";
		$("#welcome").html(temp);
		var tempHolder = "";
		for (var i = 0; i < result.length; i++)
		{
			// So I couldn't find pictures of cookie dough containers without branding. So I'm just using pictures of the cookies. Image Soruce iis Otis Spunkmyer's website.  
			tempHolder = tempHolder + "<div class='storeMember' id='member'><img class='itemImage' id = '" + result[i].item_id + "' src='./images/" + result[i].itemimage 
			+ ".png'><div class='itemName'></br>" + result[i].itemname + " " + result[i].itemprice +  " <button id='addToCart-button' name='" + result[i].itemname +  "' class='buy' value='" + result[i].item_id  + "'>Add to Cart</button></div></div>";
			
			//tempStock[result[i].item_id] = result[i].instock;  Disabled stock for now. I feel like my current set up is too clunky. 
			tempPrice[result[i].item_id] = result[i].itemprice; // Both of these are exclusively only for handling of the client side, on sumbission of the order I will double check all values with the server.
 
		}
		
		$("#divResults").html(tempHolder);
		
        },
		statusCode:
		{
			401: function() { $("#divResults").text("Please Log In to view your items."); 
			$("#logout-button").hide();
			$("#signin-button").show();
			$("#signup-button").show();
			sessionStorage.uName = "";
			sessionStorage.loggedIn = 0;
			sessionStorage.clientCart = [];
			}
			
		}
		
		
		
    });
});


$(document).on('click', "#order-button", function () {
    $.ajax({
        type: 'POST',
        url: '/getOrdersFromDb',
		success: function (result) {
			
			if (result) {
				
				$("#welcome").text("Orders");
					var temp = "<hr/><table id='orderTable' border = '1'><tr><th>Order ID</th><th>Items</th><th>Price</th></tr>\n";
					for (var i = 0; i < result.length; i++)
		{		
					temp = temp + "<tr><td>" + result[i].orderid + "</td><td>" + result[i].items + "</td><td>" + result[i].total + "</td></tr>";
		}
					temp = temp + "</table>";	
			
					$("#divResults").text(result);
			
			}
		
        },
		statusCode:
		{
			401: function() { $("#divResults").text("Please Log In to view your items."); 
			$("#logout-button").hide();
			$("#signin-button").show();
			$("#signup-button").show();
			sessionStorage.uName = "";
			sessionStorage.loggedIn = 0;
			sessionStorage.clientCart = [];
			}
			
		}
		
		
    });
});


$(document).on('click', "#addToCart-button", function () {
	
	//This is a clunky way to handle a client side cart. 
	$(this).prop("value")
	cartItem = {
		item_name: $(this).prop("name"),
		item_id: $(this).prop("value"),
		price:  Number(tempPrice[$(this).prop("value")].replace(/[^0-9\.]+/g,"")), //So this is a strange issue with how DB Stored the price
		qty: 1
	}
	
		for (var i = 0; i < cart.length; i++)
		{	
		
			if (cart[i].item_id == cartItem["item_id"])
				{
					cart[i].price += cartItem["price"]
					cart[i].qty += 1;
					//console.log(cart[i]);
					sessionStorage.clientCart = JSON.stringify(cart);
					return;
				}
		}	
			
		
		
		if(cart[0] == undefined)
		{
					
			cart[0] = cartItem;
			sessionStorage.clientCart = JSON.stringify(cart);
			return; 
		}
		else
		{
			
			cart.push(cartItem);
			sessionStorage.clientCart = JSON.stringify(cart);
			
		}
		
});


//Displays cart 
$(document).on('click', "#cart-button", displayCart);


function displayCart() 
{
	
	$("#welcome").text("Shopping Cart");
	var temp = "<hr/><table id='cartTable' border = '1'><tr><th>Item Name</th><th>Qty</th><th>Price</th></tr>\n";
	var tempTotal = 0;
	
	if (cart.length == 0)
	{
		temp = "<div class='welcome'> You have nothing in your cart.</div>"
		$("#divResults").html(temp);
		
		
	}
	
	else
	{
		for(var i = 0; i < cart.length; i++)
		{
		
			temp = temp + "<tr><td>" + cart[i].item_name + "</td><td>" + cart[i].qty + "</td><td>$" + cart[i].price.toFixed(2) + "<span class='remover'><button id='removeFromCart-button' class='remover' value='" + cart[i].item_id 
			+ "'>Remove</button></span></td></tr>";
			tempTotal = tempTotal + cart[i].price;
		
		}
	
		temp = temp + "</table><span class='totalContainer'><p class='totalLabel'>Total: </p><div class='total'> $" + tempTotal.toFixed(2) + "</div></span><div class='confirmOrderContainer'><button id='confrmOrder-button'>Confirm Order</button></div>";
		$("#divResults").html(temp);
	
	}
	
	
	
}

$(document).on('click', "#confrmOrder-button", function () {
	
	
	$.ajax({
		type: 'POST',
		url: '/verifyOrder',
		dataType: "application/JSON",
		data: 
		{
			clientCart: cart
		},
		success: function (result){
			
		sessionStorage.clientCart = [];
		cart = [];
		$("#welcome").text("Order Completed, please pay when you pickup from our store");
		$("#divResults").html("");
		}
		
		
	});
	
	
	
	
	
});



$(document).on('click', "#removeFromCart-button", function () {
	
	var temp = "<table border = '1'><tr><th>Item Name</th><th>Qty</th><th>Price</th></tr>\n";
	var tempTotal = 0;
	var tempId = $(this).prop("value");
	
	for(var i = 0; i < cart.length; i++)
	{
		
		if (cart[i].item_id == tempId)
		{
			//tempTotal = tempTotal - cart[i].price;
			cart[i].price = cart[i].price / cart[i].qty;
			cart[i].qty = cart[i].qty - 1;
			if (cart[i].qty == 0)
			{
				
				cart.splice(i , 1);
				
				
			}
		}
		
	}
displayCart();
	
	
	
	
});


//Create cart button, and order. On click of confirm. Check database one last time to verify that items are in stock. Load order into order database. 


	
$(document).on('click', "#signup-button", function () {
 
 
 $.ajax({
        type: 'GET',
		url: '/project2/signUpForm.html',
		success: function (result) {
			
		document.getElementById("divResults").innerHTML = result;
			
			
		},
	});
});


$(document).on('submit', '#signup', function(e) {
	e.preventDefault();
	
	var userName = $("#uname").val();
	var password1 = $("#pword1").val();
	var password2 = $("#pword2").val();
	userName = userName.toLowerCase();	
	
	if (password1 === password2 && password1 !== ""){
		
		$.ajax({
        type: 'POST',
        url: '/registerUser',
		dataType: "json",
		data: {
			userName: userName,
			pword: password1
			
		},
		success: function (result) {
			
			if (result.succes == "failed")
			{
				document.getElementById("error").innerHTML = "Username Already taken";
				
			}
			else if (result.succes == "success" )
			{
				document.getElementById("divResults").innerHTML = "Account Registered Please Log In";
				
			}
			
		}
			});
	}
	else 
	{
		document.getElementById("error").innerHTML = "Passwords don't match!";
			
	}
});

$(document).on('click', "#signin-button", function () {
 
 
 $.ajax({
        type: 'GET',
		url: '/project2/signInForm.html',
		success: function (result) {
			
		document.getElementById("divResults").innerHTML = result;
			
			
		},
	});
});

$(document).on('submit', '#signin', function(e) {
	e.preventDefault();
	
	var userName = $("#uname").val();
	var pword = $("#pword").val();
	userName = userName.toLowerCase();	
		
		$.ajax({
        type: 'POST',
        url: '/signInUser',
		dataType: "json",
		data: {
			userName: userName,
			pword: pword
			
		},
		success: function (result) {
			
		if (result && result.success) {
			$("#divResults").text("Successfully logged in.");
			$("#signin-button").hide();
			$("#signup-button").hide();
			$("#welcome").text("Welcome, " + result.userName);
			$("#logout-button").show();
			
			sessionStorage.uName = result.userName;
			sessionStorage.loggedIn = 1;
			
		} else {
			$("#error").text("Error logging In.");
		}
			
			
		}
	});
});

$(document).on('click', '#logout-button', function(e) {
		e.preventDefault();
			
		$.ajax({
        type: 'POST',
        url: '/logoutUser',
		success: function (result) {
			
		if (result && result.success) {
			$("#divResults").text("Successfully logged Out.");
			$("#signin-button").show();
			$("#signup-button").show();
			$("#welcome").text("");
			$("#logout-button").hide();
			sessionStorage.uName = "";
			sessionStorage.loggedIn = 0;
			sessionStorage.clientCart = [];
			
		} else {
			$("#error").text("Error logging out.");
		}
			
			
		}
	});
});


//This should automatically log in people with session vars on reload.
$(document).ready(function() {
	//console.log("Checking if logged in");
	//console.log("sesssionName " + sessionStorage.uName)
	if (sessionStorage.loggedIn == 1)
	{
		//console.log("User Is Already Logged in. Checking with Server.");
		$.ajax({
        type: 'POST',
        url: '/verify',
		dataType: "json",
		data: {
			userName: sessionStorage.uName
		},
		success: function (result) {
			
			if (result && result.success)
			{
				
				$("#divResults").text("Successfully logged in.");
				$("#signin-button").hide();
				$("#signup-button").hide();
				$("#welcome").text("Welcome, " + sessionStorage.uName);
				$("#logout-button").show();
				
				if(sessionStorage.clientCart[0] != undefined)
				{
					//console.log("Cart is empty filling it with session storage");
					cart = JSON.parse(sessionStorage.clientCart);
					
					
					
				}
				
			}
			else 
			{
				
				//console.log("Server verifcation failed.")
				
				
			}
		}
		});
	}
	else 
	{
		//console.log("Didn't");
		
	}
});

