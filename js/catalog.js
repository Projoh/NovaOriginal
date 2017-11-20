function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $('#loginMenuItem').addClass('gone');
            $('#registerMenuItem').addClass('gone');
            $('#logoutMenuItem').removeClass('gone');
            InitializeCartDBListener();
        } else {
            $('#loginMenuItem').removeClass('gone');
            $('#registerMenuItem').removeClass('gone');
            $('#logoutMenuItem').addClass('gone');
        }
    });
}

function showProgressBar() {
    // var progressBar = $('#progress-bar');
    //
    // progressBar.parent().removeClass('gone');
    // progressBar.animate({
    //     width: "100%"
    // }, 400);
    $('#loading-text').removeClass('invisible');
}

function hideProgressBar() {
    // var progressBar = $('#progress-bar');
    //
    // progressBar.parent().addClass('gone');
    //
    // progressBar.width(0);

    $('#loading-text').addClass('invisible');
}

function openLoginModal() {
    $('.navbar-toggler').click();
    $('#loginModal').modal({
        keyboard: false
    });
    $('#loginModal').modal('show');
}

function presentCategoryText(title) {
    return title.replace(/_/g, " ");
}

function unpresentCategoryText(title) {
    return title.replace(/ /g, "_").toLowerCase();
}

$(function () {
    function AttemptLogin() {
        var email = $('#loginEmail').val();
        var password = $('#loginPassword').val();


        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            var user = firebase.auth().currentUser;
            $('#loginModal').modal('hide');
            showSnackBar("Welcome " + user.displayName);
        }).catch(function (error) {
            updateErrorMessage(error.message);
        });

        function updateErrorMessage(error) {
            if (error !== "") {
                $('#error-text').html(error);
            }
        }
    }

    $('#login-form').on("submit", function (e) {
        e.preventDefault();
        $('#error-text').html("");
        AttemptLogin();
    });

});

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

var database = firebase.database();
var storageRef = firebase.storage().ref();
var allItems = [];
var allCategories = [];
var lastItem;
var itemImages = [];
var approvedUsers = [];



$(document).ready(function () {
    console.log("Initialized!");
    initializeAuthListener();
    loadCategories();
    loadItems();
    InitializeListeners();
});

function InitializeCartDBListener() {
    var user = firebase.auth().currentUser;
    var amountOfCartItems = 0;

    function updateCartCounter() {
        var cartItemCounter = $('#shoppingCartAmount');
        cartItemCounter.html(amountOfCartItems);
    }

    if(user){
        var shoppingCartRef = database.ref('/carts/'+user.uid);

        shoppingCartRef.on('value', function(snapshot) {
            parseCartSnapshot(snapshot);
        });

        function parseCartSnapshot(snapshot) {
            var cartData = snapshot.val();
            amountOfCartItems= Object.keys(cartData).length;
            updateCartCounter();
        }
    }


}

function pullApprovedUsers() {
    var approvedUsersRef = database.ref('/approved_users/');

    approvedUsersRef.once('value').then(function (snapshot) {
        approvedUsers = [];
        var approvedUsersData = snapshot.val();
        $.each(approvedUsersData, function (approvedID, approvedVal) {
            approvedUsers[approvedID] = true;
        });
    });
}

function showSubCategories(categoryID) {
    var subCategoriesContainer = $("#subcategories-select");
    subCategoriesContainer.html("");

    var subCategoryHTML = "<option>Sub-Categories</option>";
    if (categoryID in allCategories) {
        for (var subCategoryID in allCategories[categoryID].subCategories) {
            subCategoryHTML += "<option>" + presentCategoryText(subCategoryID) + "</option>";
        }
    }

    subCategoriesContainer.html(subCategoryHTML);
}

function InitializeListeners() {

    $('#search-catalog').on('input', function () {

        var searchText = $('#search-catalog').val();
        lastItem = null;
        showProgressBar();
        resetCategories();
        loadItems(searchText);

        function resetCategories() {

            $('#categories-select').prop('selectedIndex', 0);
            $('#subcategories-select').prop('selectedIndex', 0);
            $('#subcategories-select').html("<option>Sub-Categories</option>");
        }
    });

    $("#categories-select").change(function () {
        var selectedCategory = $('#categories-select').find(":selected").text();

        lastItem = null;
        showProgressBar();
        showSubCategories(unpresentCategoryText(selectedCategory));
        loadItems();
    });

    $("#subcategories-select").change(function () {

        lastItem = null;
        showProgressBar();
        loadItems();
    });
}

function showAllItems() {
    var container = $('#items-container');
    var HTML = "";
    for (var itemID in allItems) {
        var item = allItems[itemID];
        HTML += "                <div id=\"";
        HTML += item.id;
        HTML += "\" class=\"col-sm-12 col-md-6 col-lg-4 margin-bottom-10\" onclick=\"showItemModal('";
        HTML += item.id;
        HTML += "');\">";
        HTML += "                    <div class=\"card text-white full-height\">";
        HTML += "                        <div class=\"img mx-auto row align-items-center\" style=\"height: 300px;width:auto;\">";
        HTML += "                            <img id=\"img-" + item.id + "\" class=\"col card-img-top mh-100 width-auto\" src=\"assets\/noimage.png\"";
        HTML += "                                 alt=\"Image of the specified item\">";
        HTML += "                        <\/div>";
        HTML += "                        <div class=\"card-body bg-dark\">";
        HTML += "                            <h4 class=\"card-title primary-color-text capitalize\">";
        HTML += item.name;
        HTML += "<\/h4>";
        HTML += "                            <p class=\"card-text text-truncate\" style=\"height: 4rem;\">";
        HTML += item.description;
        HTML += "                            <\/p>";
        HTML += "                            <div class=\"card-footer float-right bg-transparent no-border no-top-padding no-bottom-padding\">";
        HTML += "                                <a href=\"javascript:;\" class=\"btn primary-color-text\">Details<\/a>";
        HTML += "                            <\/div>";
        HTML += "                        <\/div>";
        HTML += "";
        HTML += "                    <\/div>";
        HTML += "                <\/div>";
    }
    container.html(HTML);
}

function intializeModalSelectorListener(itemID) {
    var measurement_selector = $('#measurement-select');
    measurement_selector.off("change");

    measurement_selector.change(function () {
        var currentUser = firebase.auth().currentUser;
        var approved = (currentUser) ? (currentUser.uid in approvedUsers) : false;


        if (approved) {
            changePrice();
        }

        function changePrice() {
            var item = allItems[itemID];
            var price_container = $('#item-price');
            var selected_item = measurement_selector.find(":selected");
            var selectedExt = selected_item.attr('id');
            var addItemButton = document.getElementById("addItemToCartButton");
            var measurement = item.measurements[selectedExt];

            var priceOfSelected = measurement.price;
            price_container.html(priceOfSelected);
            addItemButton.setAttribute( "onclick", "addItemToCart('"+item.id+"','" + selectedExt + "')" );
        }
    });
}

function showItemModal(itemID) {
    var item = allItems[itemID];
    var modalContainer = $('.modals-container');
    var currentUser = firebase.auth().currentUser;
    var approved = (currentUser) ? (currentUser.uid in approvedUsers) : false;


    modalContainer.html("");
    createModal();
    initalizeModal();
    intializeModalSelectorListener(item.id);


    function FirstPrice() {
        for (var measurementID in item.measurements) {
            var measurementObject = item.measurements[measurementID];
            this.firstItemID = measurementID;
            this.price = measurementObject["price"];
            break;
        }
    }
    function createModal() {
        var firstPrice = new FirstPrice();
        var measurementsHTML = function () {
            var measurementHTML = "";
            for (var measurementID in item.measurements) {
                var measurementValue = item.measurements[measurementID];
                measurementHTML += "<option id=\"" + measurementID + "\" value=\"" + measurementValue["dimension"] + "\">" + measurementValue["dimension"] + " " + item.unit + "</option>";
            }
            return measurementHTML;
        };
        var modalHTML = "";
        var imageSrc = (itemImages[itemID]) ? itemImages[itemID] : "assets\/noimage.png";
        var priceText = (approved) ? firstPrice.price : (currentUser) ?
            "Verification in progress" :
            "<a class=\"text-info icon\" onclick=\"redirectToRegisterToViewPrice();\">View Price<\/a>";
        modalHTML += "<div id=\"itemModal\" class=\"modal fade bd-example-modal-lg\" tabindex=\"-1\" role=\"dialog\"";
        modalHTML += "             aria-labelledby=\"myLargeModalLabel\" aria-hidden=\"true\">";
        modalHTML += "            <div class=\"modal-dialog modal-lg\">";
        modalHTML += "                <div class=\"modal-content padding-16\">";
        modalHTML += "                    <div class=\"row padding-bottom-10 padding-left-12 padding-top-10\">";
        modalHTML += "                        <div class=\"col-sm-3 align-content-center\">";
        modalHTML += "                            <div class=\"img mx-auto row align-items-center\" style=\"height: 70%;width:auto;\">";
        modalHTML += "                                <img id=\"modal-image\" class=\"col card-img-top mh-100 width-auto img-thumbnail\" src=\"" +
            imageSrc +
            "\"";
        modalHTML += "                                     alt=\"Image for item\">";
        modalHTML += "";
        modalHTML += "                            <\/div>";
        modalHTML += "                            <p id=\"item-price\" class=\"h4 padding-top-10 primary-color-text \">";
        modalHTML += priceText;
        modalHTML += "<\/p>";
        modalHTML += "";
        modalHTML += "                        <\/div>";
        modalHTML += "                        <div class=\"col-sm-9\">";
        modalHTML += "                            <h1 class=\"display-4 capitalize\">" +
            item.name +
            "<\/h1>";
        modalHTML += "                            <small class=\"text-secondary capitalize\"> ";
        modalHTML += "ID: " + item.itemID;
        modalHTML += "<\/small> <br>";
        modalHTML += "                            <small class=\"text-secondary capitalize\"> ";
        modalHTML += presentCategoryText(item.category);
        modalHTML += " > ";
        modalHTML += presentCategoryText(item.subcategory);
        modalHTML += "<\/small>";
        modalHTML += "                            <p class=\"lead\">";
        modalHTML += item.description;
        modalHTML += "                            <\/p>";
        modalHTML += "                            <div class=\"row w-50 padding-left-12\">";
        modalHTML += "";
        modalHTML += "                                <select class=\"form-control form-control-lg padding-bottom-10\" id=\"measurement-select\"";
        modalHTML += "                                        style=\"height: calc(2.875rem + 8px);\">";
        modalHTML += measurementsHTML();
        modalHTML += "                                <\/select>";
        modalHTML += "";
        modalHTML += "";
        modalHTML += "                            <\/div>";
        modalHTML += "";
        modalHTML += "                        <\/div>";
        modalHTML += "";
        modalHTML += "                    <\/div>";
        modalHTML += "";
        modalHTML += "";
        modalHTML += "                    <div class=\"modal-footer\">";
        modalHTML += "                        <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Cancel<\/button>";
        modalHTML += "                        <button type=\"button\" id=\"addItemToCartButton\" class=\"btn primary-color text-white\" onclick=\"addItemToCart('";
        modalHTML += item.id;
        modalHTML += "','";
        modalHTML += firstPrice.firstItemID;
        modalHTML += "');\">Add<\/button>";
        modalHTML += "                    <\/div>";
        modalHTML += "                <\/div>";
        modalHTML += "            <\/div>";
        modalHTML += "        <\/div>";
        modalContainer.html(modalHTML);
    }

    function initalizeModal() {
        $('#itemModal').modal({
            keyboard: false
        });
        $('#itemModal').modal('show');
    }
}

function addItemToCart(itemID, extensionSelectedID) {
    var user = firebase.auth().currentUser;

    if (!user) {
        redirectToRegisterToViewPrice();
        return;
    }
    $('#itemModal').modal('hide');
    $('#finalAddItemToCartButton').off();
    showAddItemModal(itemID, extensionSelectedID, user);

}

function showAddItemModal(itemID, extensionSelected, user) {
    var item = allItems[itemID];
    var count; // Amount of item selected from number input.
    var measurement = item.measurements[extensionSelected];
    var itemPriceContainer = $('#addItemCost');
    var approvedUser = (user.uid in approvedUsers);
    var itemPrice, itemPriceTax, itemTotalPrice;
    var cartName = $('#addCartItemName');
    var cartDimension = $('#addCartDimensionName');
    var cartUnit = $('#addCartUnit');
    var cartCategory = $('#addCartCategory');
    var cartSubCategory = $('#addCartSubCategory');
    var cartID = $('#addCartID');
    var cartMeasurementID = $('#addCartMeasurementID');
    var itemModal =  $('#addItemModal');


    if (approvedUser) {
        itemPrice = $('#itemPrice');
        itemPriceTax = $('#itemPriceTax');
        itemTotalPrice = $('#itemTotalPrice');

        itemPriceContainer.removeClass('gone');
    } else {
        itemPriceContainer.addClass('gone');
    }


    modifyModal();
    showModal();


    function modifyModal() {
        if(approvedUser) {
            var priceFloat = parseFloat(measurement.price.replace("$", ""));
            var priceFloatTax = priceFloat * 0.07;
            itemPrice.html(priceFloat.toFixed(2));
            itemPriceTax.html(priceFloatTax.toFixed(2));
            itemTotalPrice.html((priceFloat + priceFloatTax).toFixed(2));
        }

        cartName.html(item.name);
        cartDimension.html(measurement.dimension);
        cartUnit.html(item.unit);
        cartCategory.html(presentCategoryText(item.category));
        cartSubCategory.html(presentCategoryText(item.subcategory));
        cartID.html(item.itemID);
        cartMeasurementID.html(measurement.id);
        $('#amountOfAddItem').val(1);
    }


    function showModal() {
        itemModal.modal({
            keyboard: true
        });
        itemModal.modal('show');
        itemModal.modal('handleUpdate');
    }



    $('#finalAddItemToCartButton').click(function () {
        var cartRef = database.ref('carts/' + user.uid + '/' + itemID+"EXT"+extensionSelected);
        count = $('#amountOfAddItem').val();
        cartRef.set({
            amount: count,
            extensionSelectedID: extensionSelected
        }).then(function () {
            showSnackBar("Added " + count + " <custom class=\"text-capitalize\">" + item.name + "</custom> to your cart");
            itemModal.modal('hide');
            // Close Modal
        });
    });
}

function redirectToRegisterToViewPrice() {
    showSnackBar("You must register to perform this action!<br> Redirecting you in 1 second...");
    setTimeout(function () {
        window.location.href = "register.html";
    }, 2500);
}

function loadCategories() {
    var categoriesRef = database.ref('/categories');


    categoriesRef.once('value').then(function (snapshot) {
        var categoriesData = snapshot.val();
        $.each(categoriesData, function (categoriesID, categoriesObject) {
            var category = new Category();
            category.name = categoriesID;
            if (!("no_sub_cat" == categoriesID)) {
                category.subCategories = categoriesObject;
            }
            allCategories[categoriesID] = category;
        });

        updateCategories();
    });

    function updateCategories() {
        var categoriesContainer = $("#categories-select");
        categoriesContainer.html("");

        var categoryHTML = "<option>Categories</option>";
        for (var categoryID in allCategories) {
            var category = allCategories[categoryID];
            categoryHTML += "<option>" + presentCategoryText(category.name) + "</option>";
        }
        categoriesContainer.html(categoryHTML);
    }
}

// This function modifies a common item reference based on the filtering requirements
function loadItems(searchText) {
    catalogRef = database.ref('/catalog/');

    var category = $('#categories-select').find(":selected").text();
    var subcategory = $('#subcategories-select').find(":selected").text();
    readCategoriesData();


    if (searchText) {
        searchText = searchText.toLowerCase();
        searchWithText();
    } else {
        if (category) {
            if (subcategory) {
                catalogRef = catalogRef.orderByChild("cat_sub").equalTo(category + " " + subcategory);
            } else { // If a category is selected but a subcategory isnt
                catalogRef = catalogRef.orderByChild("category").equalTo(category);
            }
        } else { // If no filtering has happened
            if (!lastItem) {
                catalogRef = catalogRef.limitToFirst(24);
            } else {
                catalogRef = catalogRef.orderByKey().startAt(lastItem).limitToFirst(24);
            }
        }

        allItems = [];
        catalogRef.once('value').then(function (snapshot) {
            parseItemSnapShot(snapshot);
        });
    }

    pullApprovedUsers();


    function parseItemSnapShot(snapshot, dontShowChanges) {
        var itemsData = snapshot.val();
        $.each(itemsData, function (itemID, itemObject) {
            lastItem = itemID;
            var item = new Item();
            item.id = itemID;
            item.itemID = itemObject["id"];
            item.name = itemObject["name"];
            item.image = itemObject["image"];
            item.category = itemObject["category"];
            item.subcategory = itemObject["subcategory"];
            item.description = itemObject["description"];
            item.unit = itemObject["unit"];
            var measurementObjects = itemObject["measurement"];

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
            allItems[itemID] = item;

        });
        hideProgressBar();
        if (!dontShowChanges) {
            showAllItems();
        }
        if (!itemsData) {
            hideProgressBar();
        }
        loadPreLoadedItemImages();
        loadItemImages();
    }

    function loadPreLoadedItemImages() {
        for (var itemID in allItems) {
            var img = document.getElementById('img-' + itemID);
            if (itemImages[itemID] && img) {
                img.src = itemImages[itemID];
            } else {
                if(img){
                    img.src = "./assets/noimage.png";
                }
            }
        }
    }

    function loadItemImages() {
        for (var itemID in allItems) {
            if (!itemImages[itemID]) {
                performTask(itemID);
            }
        }
    }

    function performTask(itemID) {
        var item = allItems[itemID];
        storageRef.child('catalog/' + itemID + '/' + item.image).getDownloadURL().then(function (url) {
            var img = document.getElementById('img-' + itemID);
            img.src = url;
            itemImages[itemID] = url;
            hideProgressBar();
        }).catch(function (error) {
            console.log(error.message);
            hideProgressBar();
        });
    }


    function searchWithText() {
        var searchCategory, searchName, searchSubCategory;
        searchCategory = catalogRef.orderByChild('category')
                .startAt(searchText)
                .endAt(searchText + "\uf8ff").limitToFirst(15);
        searchName = catalogRef.orderByChild('name')
                .startAt(searchText)
                .endAt(searchText + "\uf8ff").limitToFirst(15);
        searchSubCategory = catalogRef.orderByChild('subcategory')
                .startAt(searchText)
                .endAt(searchText + "\uf8ff").limitToFirst(5);


        allItems = [];
        searchCategory.once('value').then(function (snapshot) {
            showProgressBar();
            parseItemSnapShot(snapshot, true);
        });
        searchName.once('value').then(function (snapshot) {
            showProgressBar();
            parseItemSnapShot(snapshot, true);
        });
        searchSubCategory.once('value').then(function (snapshot) {
            showProgressBar();
            parseItemSnapShot(snapshot);
        });
    }


    function readCategoriesData() {
        category = (category == "Categories") ? null : unpresentCategoryText(category);
        subcategory = (subcategory == "Sub-Categories") ? null : unpresentCategoryText(subcategory);
    }

}

function nextPage() {
    var searchText = $('#search-catalog').val();
    searchText = (searchText) ? searchText : null;

    loadItems(searchText);
    $("html, body").animate({scrollTop: 100}, "slow");
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

function Category() {
    this.name = "";
    this.subCategories = [];
}

function Measurement() {
    this.id = "";
    this.price = "";
    this.dimension = 0;
}

function CartItem() {
    this.item = null;
    this.amount = 0;
    this.measurement = null;
}