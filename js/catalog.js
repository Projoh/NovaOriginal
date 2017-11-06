function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

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
    })
    $('#loginModal').modal('show');
}

function presentCategoryText(title) {
    return title.replace("_", " ");
}

function unpresentCategoryText(title) {
    return title.replace(" ", "_").toLowerCase();
}

var database = firebase.database();
var storageRef = firebase.storage().ref();
var allItems = [];
var allCategories = [];
var lastItem;
var itemImages = [];

$(document).ready(function () {
    console.log("Initialized!");
    initializeAuthListener();
    loadCategories();
    loadItemListener();
    InitializeListeners();
    // $('#myModal').modal({
    //     keyboard: false
    // })
    // $('#myModal').modal('show');
});


function showSubCategories(categoryID) {
    var subCategoriesContainer = $("#subcategories-select");
    subCategoriesContainer.html("");

    var subCategoryHTML = "<option>Sub-Categories</option>";
    if(categoryID in allCategories){
        for(var subCategoryID in allCategories[categoryID].subCategories) {
            subCategoryHTML += "<option>" + presentCategoryText(subCategoryID) + "</option>";
        }
    }

    subCategoriesContainer.html(subCategoryHTML);
}

function InitializeListeners() {

    $('#search-catalog').on('input', function(){

        var searchText = $('#search-catalog').val();
        lastItem = null;
        showProgressBar();
        resetCategories();
        loadItemListener(searchText);

        function resetCategories(){

            $('#categories-select').prop('selectedIndex',0);
            $('#subcategories-select').prop('selectedIndex',0);
            $('#subcategories-select').html("<option>Sub-Categories</option>");
        }
    });

    $( "#categories-select" ).change(function() {
        var selectedCategory = $('#categories-select').find(":selected").text();

        lastItem = null;
        showProgressBar();
        showSubCategories(unpresentCategoryText(selectedCategory));
        loadItemListener();
    });

    $( "#subcategories-select").change(function() {

        lastItem = null;
        showProgressBar();
        loadItemListener();
    });
}

function showAllItems() {
    var container = $('#items-container');
    var HTML = "";
    for(var itemID in allItems) {
        var item = allItems[itemID];
        HTML += "                <div id=\"";
        HTML += item.id;
        HTML += "\" class=\"col-sm-12 col-md-6 col-lg-4 margin-bottom-10\" onclick=\"showItemModal('";
        HTML += item.id;
        HTML += "');\">";
        HTML += "                    <div class=\"card text-white\">";
        HTML += "                        <div class=\"img mx-auto row align-items-center\" style=\"height: 300px;width:auto;\">";
        HTML += "                            <img id=\"img-" + item.id +"\" class=\"col card-img-top mh-100 width-auto\" src=\"assets\/scissorsExampe.PNG\"";
        HTML += "                                 alt=\"Image of the specified item\">";
        HTML += "                        <\/div>";
        HTML += "                        <div class=\"card-body bg-dark\">";
        HTML += "                            <h4 class=\"card-title primary-color-text capitalize\">";
        HTML +=  item.name;
        HTML += "<\/h4>";
        HTML += "                            <p class=\"card-text text-truncate\" style=\"height: 4rem;\">";
        HTML += item.description;
        HTML += "                            <\/p>";
        HTML += "                            <div class=\"card-footer float-right bg-transparent no-border no-top-padding no-bottom-padding\">";
        HTML += "                                <a href=\"#\" class=\"btn primary-color-text\">Details<\/a>";
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

    measurement_selector.change(function() {
        var item = allItems[itemID];
        var price_container = $('#item-price');
        var selected_item = measurement_selector.find(":selected");
        var selectedExt = selected_item.attr('id');

        var priceOfSelected = item.measurements[selectedExt].price;
        price_container.html(priceOfSelected);
    });
}

function showItemModal(itemID) {
    var item = allItems[itemID];
    var modalContainer = $('.modals-container');



    modalContainer.html("");
    createModal();
    initalizeModal();
    intializeModalSelectorListener(item.id);


    function FirstPrice() {
        for(var measurementID in item.measurements) {
            var measurementObject = item.measurements[measurementID];
            this.firstItemID = measurementID;
            this.price =  measurementObject["price"];
            break;
        }
    };
    function createModal() {
        var firstPrice = new FirstPrice();
        var measurementsHTML =  function () {
            var measurementHTML = "";
            for(var measurementID in item.measurements) {
                var measurementValue = item.measurements[measurementID];
                measurementHTML += "<option id=\"" + measurementID  + "\" value=\"" + measurementValue["dimension"] + "\">" + measurementValue["dimension"] +  " " + item.unit +"</option>";
            }
            return measurementHTML;
        };
        var modalHTML = "";
        modalHTML += "<div id=\"itemModal\" class=\"modal fade bd-example-modal-lg\" tabindex=\"-1\" role=\"dialog\"";
        modalHTML += "             aria-labelledby=\"myLargeModalLabel\" aria-hidden=\"true\">";
        modalHTML += "            <div class=\"modal-dialog modal-lg\">";
        modalHTML += "                <div class=\"modal-content padding-16\">";
        modalHTML += "                    <div class=\"row padding-bottom-10 padding-left-12 padding-top-10\">";
        modalHTML += "                        <div class=\"col-sm-3 align-content-center\">";
        modalHTML += "                            <div class=\"img mx-auto row align-items-center\" style=\"height: 80%;width:auto;\">";
        modalHTML += "                                <img id=\"modal-image\" class=\"col card-img-top mh-100 width-auto img-thumbnail\" src=\"assets\/moutAndToungeExample.PNG\"";
        modalHTML += "                                     alt=\"Image for item\">";
        modalHTML += "";
        modalHTML += "                            <\/div>";
        modalHTML += "                            <p id=\"item-price\" class=\"h4 padding-top-10 primary-color-text \">";
        modalHTML += firstPrice.price;
        modalHTML += "<\/p>";
        modalHTML += "";
        modalHTML += "                        <\/div>";
        modalHTML += "                        <div class=\"col-sm-9\">";
        modalHTML += "                            <h1 class=\"display-4 capitalize\">" +
            item.name +
            "<\/h1>";
        modalHTML += "                            <small class=\"text-secondary capitalize\"> ";
        modalHTML += item.category;
        modalHTML += " > ";
        modalHTML += item.subcategory;
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
        modalHTML += "                        <button type=\"button\" class=\"btn primary-color text-white\" onclick=\"addItemToCart('";
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
        })
        $('#itemModal').modal('show');
    }
}

function addItemToCart(itemID, extensionSelected) {

}

function loadCategories() {
    var categoriesRef = database.ref('/categories');


    categoriesRef.once('value').then(function (snapshot) {
        var categoriesData = snapshot.val();
        $.each(categoriesData, function(categoriesID, categoriesObject) {
            var category = new Category();
            category.name = categoriesID;
            if(!("no_sub_cat" in categoriesObject)) {
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
        for(var categoryID in allCategories) {
            var category = allCategories[categoryID];
            categoryHTML += "<option>" + presentCategoryText(category.name) + "</option>";
        }
        categoriesContainer.html(categoryHTML);
    }
}


// This function modifies a common item reference based on the filtering requirements
function loadItemListener(searchText) {
    var itemRef = database.ref('/catalog/');

    var category = $('#categories-select').find(":selected").text();
    var subcategory = $('#subcategories-select').find(":selected").text();
    readCategoriesData();


    if(searchText){
        searchText = searchText.toLowerCase();
        searchWithText();
    } else{
        if(category){
            if(subcategory) {
                itemRef = itemRef.orderByChild("cat_sub").equalTo(category + " " + subcategory);
            } else { // If a category is selected but a subcategory isnt
                itemRef = itemRef.orderByChild("category").equalTo(category);
            }
        } else { // If no filtering has happened
            if(!lastItem){
                itemRef = itemRef.limitToFirst(25);
            } else {
                itemRef = itemRef.orderByKey().startAt(lastItem).limitToFirst(25);
            }
        }

        allItems = [];
        itemRef.once('value').then(function(snapshot) {
            parseItemSnapShot(snapshot);
        });
    }



    function parseItemSnapShot(snapshot, dontShowChanges) {
        var itemsData = snapshot.val();
        $.each(itemsData, function(itemID, itemObject) {
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
            item.measurements = itemObject["measurement"];

            Object.keys(item).forEach(function(key,index) {
                if(item[key] == undefined){
                    item[key] = "";
                }
            });
            allItems[itemID] = item;

        });
        hideProgressBar();
        if(!dontShowChanges){
            showAllItems();
        }
        if(!itemsData) {
            hideProgressBar();
        }
        loadPreLoadedItemImages();
        loadItemImages();
    }

    function loadPreLoadedItemImages(){
        for(var itemID in allItems) {
            var img = document.getElementById('img-'+itemID);
            if(itemImages[itemID]){
                img.src = itemImages[itemID];
            } else {
                img.src = "./assets/scissorsExampe.PNG";
            }
        }
    }

    function loadItemImages() {
        for(var itemID in allItems) {
            if(!itemImages[itemID]){
                performTask(itemID);
            }
        }
    }

    function performTask(itemID) {
        var item = allItems[itemID];
        storageRef.child('catalog/'+itemID+'/'+item.image).getDownloadURL().then(function(url) {
            var img = document.getElementById('img-'+itemID);
            img.src = url;
            itemImages[itemID] = url;
            hideProgressBar();
        }).catch(function(error) {
            console.log(error.message);
            hideProgressBar();
        });
    }


    function searchWithText() {
        var searchCategory = itemRef.orderByChild('category')
            .startAt(searchText)
            .endAt(searchText+"\uf8ff");
        var searchName = itemRef.orderByChild('name')
            .startAt(searchText)
            .endAt(searchText+"\uf8ff");
        var searchSubCategory = itemRef.orderByChild('subcategory')
            .startAt(searchText)
            .endAt(searchText+"\uf8ff");

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

function nextPage(){
    var searchText = $('#search-catalog').val();
    searchText = (searchText) ? searchText : null;

    loadItemListener(searchText);
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