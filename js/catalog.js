function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

        }
    });
}
function showProgressBar() {
    var progressBar = $('#progress-bar');

    progressBar.parent().removeClass('gone');
    progressBar.animate({
        width: "100%"
    }, 5000, function () {
        progressBar.addClass('bg-danger');
    });

}

function hideProgressBar() {
    var progressBar = $('#progress-bar');

    progressBar.parent().addClass('gone');

    progressBar.removeClass('bg-danger');
    progressBar.width(0);
}

function openLoginModal() {
    $('.navbar-toggler').click();
    $('#loginModal').modal({
        keyboard: false
    })
    $('#loginModal').modal('show');
}

function presentString(title) {
    return title.replace("_", " ");
}

function unpresentString(title) {
    return title.replace(" ", "_").toLowerCase();
}

var database = firebase.database();
var allItems = [];
var allCategories = [];
var lastItem;


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
            subCategoryHTML += "<option>" + presentString(subCategoryID) + "</option>";
        }
    }

    subCategoriesContainer.html(subCategoryHTML);
}

function InitializeListeners() {

    $('#search-catalog').on('input', function(){

        var searchText = $('#search-catalog').val();

        showProgressBar();
        resetCategories();
        loadItemListener(searchText.toUpperCase());

        function resetCategories(){

            $('#categories-select').prop('selectedIndex',0);
            $('#subcategories-select').prop('selectedIndex',0);
            $('#subcategories-select').html("<option>Sub-Categories</option>");
        }
    });

    $( "#categories-select" ).change(function() {
        var selectedCategory = $('#categories-select').find(":selected").text();
        showProgressBar();
        showSubCategories(unpresentString(selectedCategory));
        loadItemListener();
    });

    $( "#subcategories-select").change(function() {
        showProgressBar();
        loadItemListener();
    });
}

function showAllItems() {

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
            categoryHTML += "<option>" + presentString(category.name) + "</option>";
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
            item.description = itemObject["description"];
            item.measurements = itemObject["measurement"];

            Object.keys(item).forEach(function(key,index) {
                if(item[key] == undefined){
                    item[key] = "";
                }
            });
            allItems[itemID] = item;
            hideProgressBar();
            if(!dontShowChanges){
                showAllItems();
            }
        });
        if(!itemsData) {
            hideProgressBar();
        }

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
        category = (category == "Categories") ? null : category;
        subcategory = (subcategory == "Sub-Categories") ? null : subcategory;
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
    this.imageURL = [];
    this.category = "";
    this.subcategory = "";
    this.measurements = []; // Measurement: price
    this.description = "";
}

function Category() {
    this.name = "";
    this.subCategories = [];
}