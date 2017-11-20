
function showSnackBar(messageText) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    if (messageText) {
        x.innerHTML = messageText;
    }
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 3000);
}
function logOut() {
    firebase.auth().signOut().then(function () {
        $('.navbar-toggler').click();
        showSnackBar("You've successfully logged out!");
    }).catch(function (error) {
        // An error happened.
    });
}

function pullApprovedUsers() {
    var approvedUsersRef = database.ref('/approved_users/');

    approvedUsersRef.once('value').then(function (snapshot) {
        approvedUsers = [];
        var approvedUsersData = snapshot.val();
        $.each(approvedUsersData, function (approvedID, approvedVal) {
            approvedUsers[approvedID] = true;
        });
    }).then(function () {
        loadCart();
    });
}

$(document).ready(function () {
    console.log("Initialized!");
    initializeAuthListener();
});


var database = firebase.database();
var allCartItems = [];
var approvedUsers = [];


function loadInputListener() {
    var allInputs = $("input");
    allInputs.off();
    allInputs.on('change keyup paste', function () {
        var input = $(this);
        var value = input.val();
        if(value != "") {
            $(this).delay(1500).queue(function() {

                updateVisual($(this));
                $(this).dequeue();

            });
        }


        function updateVisual(input) {
            var user = firebase.auth().currentUser;
            var itemID = input.parent().parent().attr('id');
            var value = input.val();
            var cartItem = allCartItems[itemID];
            var extension = cartItem.extensionSelected;
            if(value != "" ) {
                var cartRef = database.ref('carts/' + user.uid + '/' + itemID);
                if(value < 1) {
                    cartRef.remove().then(function () {
                        showSnackBar("Removed item <custom class=\"text-capitalize\">" + cartItem.item.name + "</custom> from your cart");
                    });
                } else {
                    cartRef.set({
                        amount: value,
                        extensionSelectedID: extension
                    }).then(function () {
                        showSnackBar("Updated your cart to show " + value + " of <custom class=\"text-capitalize\">" + cartItem.item.name + "</custom>");

                    });
                }
            }
        }
    });
}

function showEmptyCart() {
    var topContainer = $('');

}

function loadCart() {
    var user = firebase.auth().currentUser;
    var approvedUser = (user.uid in approvedUsers);
    var amountOfCarItems;
    var carItemsLoaded =0;

    if(approvedUser){
        $('.checkoutContainer').removeClass('gone');
        $('#notApprovedUser').addClass('gone');
    } else {
        $('.checkoutContainer').addClass('gone');
        $('#notApprovedUser').removeClass('gone');
    }

    pullInitialCartData();




    function showCartData() {
        var tableContainer = $('#cartItemsContainer');
        var trHTML="";

        for(var cartItemID in allCartItems) {
            var cartItem = allCartItems[cartItemID];
            var price = "_";
            var multipledPrice = "_";
            if(approvedUser){
                price = (cartItem.measurement.price);
                multipledPrice = (parseFloat(price.replace("$","")) * parseFloat(cartItem.amount)).toFixed(2);
            }
            trHTML += "";
            trHTML += "        <tr id=\"";
            trHTML += cartItemID;
            trHTML += "\">";
            trHTML += "            <td class=\"text-capitalize\">";
            trHTML += cartItem.item.name;
            trHTML += "<\/td>";
            trHTML += "            <td>";
            trHTML += cartItem.item.itemID + " (" + cartItem.measurement.id + ")";
            trHTML += "<\/td>";
            trHTML += "            <td>";
            trHTML += cartItem.measurement.dimension + " " + cartItem.item.unit;
            trHTML += "<\/td>";
            trHTML += "            <td>";
            trHTML += price;
            trHTML += "<\/td>";
            trHTML += "            <td>";
            trHTML += "                <input type=\"number\" class=\"form-control form-control-sm\" value=\""+
                cartItem.amount
                +"\"";
            trHTML += "                       onkeypress=\"return (event.charCode == 8 ||";
            trHTML += "                                                event.charCode == 0 ||";
            trHTML += "                                                 event.charCode == 13)";
            trHTML += "                                                  ? null : event.charCode >= 48 &&";
            trHTML += "                                                   event.charCode <= 57\" name=\"itemConsumption\" \/>";
            trHTML += "            <\/td>";
            trHTML += "            <td>";
            trHTML += "$"+multipledPrice;
            trHTML += "<\/td>";
            trHTML += "            <td class=\"no-margin remove-cart-button\">";
            trHTML += "                <button type=\"button\" class=\"btn btn-sm btn-outline-danger\" onclick=\"cartItemDelete.call(this)\"><i class=\"material-icons icon\"><\/i><\/button>";
            trHTML += "            <\/td>";
            trHTML += "        <\/tr>";
        }
        tableContainer.html(trHTML);
    }

    function calculateTotalPrice() {
        var salesTaxContainer = $('#cartSalesTax');
        var totalAmountContainer = $('#cartTotalAmount');

        var tax = 0;
        var totalAmount = 0;
        for(var cartItemID in allCartItems) {
            var cartItem = allCartItems[cartItemID];
            var price = (cartItem.measurement.price);
            totalAmount += (parseFloat(price.replace("$","")) * parseFloat(cartItem.amount));
        }
        tax = (totalAmount * 0.07);
        totalAmount += tax;
        salesTaxContainer.html(tax.toFixed(2));
        totalAmountContainer.html(totalAmount.toFixed(2));
    }

    function loadCartItemData() {
        carItemsLoaded = 0;
        for(var cartItemID in allCartItems) {
            performTask(cartItemID);
        }

        function performTask(cartItemID) {
            var cartItem = allCartItems[cartItemID];
            var cartItemRef = database.ref('/catalog/'+cartItem.item);

            cartItemRef.once('value').then(function (snapshot) {
                var cartItemData = snapshot.val();
                var item = new Item();
                item.id = cartItem.item;
                item.itemID = cartItemData["id"];
                item.name = cartItemData["name"];
                item.image = cartItemData["image"];
                item.category = cartItemData["category"];
                item.subcategory = cartItemData["subcategory"];
                item.description = cartItemData["description"];
                item.unit = cartItemData["unit"];
                var measurementObjects = cartItemData["measurement"];

                for (var measurmentObID in measurementObjects) {
                    var measureOb = measurementObjects[measurmentObID];
                    var measurement = new Measurement();
                    measurement.id = measurmentObID;
                    measurement.dimension = measureOb["dimension"];
                    measurement.price = measureOb["price"];
                    item.measurements.push(measurement);
                }
                item.measurements.sort(function (a, b) {
                    return a.dimension - b.dimension;
                });

                Object.keys(item).forEach(function (key, index) {
                    if (item[key] == undefined) {
                        item[key] = "";
                    }
                });

                cartItem.item = item;
                cartItem.measurement = item.measurements[cartItem.extensionSelected];
            }).then(function () {
                carItemsLoaded++;
               if(carItemsLoaded == amountOfCarItems) {
                   showCartData();
                   loadInputListener();
                   if(approvedUser)
                       calculateTotalPrice();
               }
            });
        }
    }

    function pullInitialCartData() {
        var shoppingCartRef = database.ref('/carts/'+user.uid);

        shoppingCartRef.on('value', function (snapshot) {
            parseCartSnapshot(snapshot);
        });

        function parseCartSnapshot(snapshot) {
            var cartData = snapshot.val();
            allCartItems = [];
            var counter = 0;
            $.each(cartData, function (itemID, itemObject) {
                var measurementID = itemObject["extensionSelectedID"];
                var cartItem = new CartItem();
                var itemName = itemID.split("EXT")[0];
                cartItem.item = itemName;
                cartItem.amount = itemObject["amount"];
                cartItem.extensionSelected = measurementID;

                allCartItems[itemID] = cartItem;
                counter++;
            });
            if(jQuery.isEmptyObject(allCartItems)) {
                showEmptyCart();
            } else {
                amountOfCarItems = counter;
                loadCartItemData();
            }
        }
    }
}

function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            pullApprovedUsers();
        } else {
            window.location.href = "catalog.html";
        }
    });
}

var cartItemDelete = function () {
    var user = firebase.auth().currentUser;
    var cartItemRow = $(this).parent().parent();
    var itemID = cartItemRow.attr('id');
    var cartItem = allCartItems[itemID];

    var cartRef = database.ref('carts/' + user.uid + '/' + itemID);

    cartRef.remove().then(function () {
        showSnackBar("Removed item <custom class=\"text-capitalize\">" + cartItem.item.name + "</custom> from your cart");
        cartItemRow.remove();
    });
};

function CartItem() {
    this.item = null;
    this.amount = 0;
    this.measurement = null;
    this.extensionSelected = 0;
}

function Item() {
    this.id = ""; // Used only for the database
    this.itemID = "";
    this.name = "";
    this.image = "";
    this.category = "";
    this.unit = "";
    this.subcategory = "";
    this.measurements = []; // Measurement: price
    this.description = "";
}

function Measurement() {
    this.id = "";
    this.price = "";
    this.dimension = 0;
}