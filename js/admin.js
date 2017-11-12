function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if(user){
            if (user.uid == 'Dx0MdFm8ajSyn0DRkzvPU3PzljF2') {
                return;
            }
        }
        window.location.href = "index.html";
    });
}
function logOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}
function showSnackBar(messageText) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    if(messageText) {
        x.innerHTML= messageText;
    }
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
function showProgressBar() {
    $('#loading-text').removeClass('invisible');
}
function hideProgressBar() {
    $('#loading-text').addClass('invisible');
}
function presentCategoryText(title) {
    return title.replace(/_/g, " ");
}
function unpresentCategoryText(title) {
    return title.replace(/ /g, "_").toLowerCase();
}
function sanitizeInput(input) {
    return input.replace(/[&\/\\#,+() $~%'":*?<>{}]/g, '');
}
function sanitizeRef(input) {
    return input? input.replace(/[&\/\\#,+() $~%'":*?<>{}.]/g, '') : "";
}

$( document ).ready(function() {
    console.log( "Initialized!" );
    // Pull approved users
    initializeAuthListener();
    loadItems();
    loadCategories();
    initializeCatalogListeners();
});

var allUsers= [];
var approvedUsers = [];


var database = firebase.database();
var storageRef = firebase.storage().ref();
var usersRef;
var catalogRef;
var itemsRef;

var allItems = [];
var allCategories = [];
var lastItem;
var itemImages = [];
// var storageRef = firebase.storage().ref();

function showContent(content) {

    if(usersRef) usersRef.off();
    if(catalogRef) catalogRef.off();
    if(itemsRef) itemsRef.off();


    var containerToShow = $('#'+content+'-container');
    var anchorToHighlight = $('#anchor-'+content);

    var allContainers = $('#all-containers').children("div");
    allContainers.each(function () {
        var container = $(this);
        $(container).addClass('gone');
    });
    var allAnchors = $('#nav-bar').find( "a" );
    allAnchors.each(function () {
        var anchor = $(this);
        $(anchor).removeClass("bg-dark text-white");
        $(anchor).addClass("text-dark")
    });
    $(anchorToHighlight).removeClass("text-dark");
    $(anchorToHighlight).addClass("bg-dark text-white");
    $(containerToShow).removeClass('gone');
}







// USERS
function loadUsers(start, end) {
    var usersRef = database.ref('/users/').orderByChild('registerTime')
        .limitToLast(end).startAt(start);
    showProgressBar();
    usersRef.on('value', function(snapshot) {

        var usersData = snapshot.val();
        allUsers = [];
        $.each(usersData, function(userID, userObject) {
            var user = new User();
            user.id = userID;
            user.name = userObject["name"];
            user.email = userObject["email"];
            user.company = userObject["company"];
            user.telephone = userObject["telephone"];
            user.address = userObject["address"];
            user.message = userObject["message"];
            user.careSetting = userObject["careSetting"];
            user.registerTime = userObject["registerTime"];

            Object.keys(user).forEach(function(key,index) {
                if(user[key] == undefined){
                    user[key] = "";
                }
            });
            allUsers[userID] = user;
        });

        function loadApprovedUsers() {
            var approvedUsersRef = database.ref('/approved_users/');

            approvedUsersRef.on('value', function(snapshot) {
                approvedUsers = [];
                var approvedUsersData = snapshot.val();
                $.each(approvedUsersData, function(userID, userObject) {
                    approvedUsers[userID] = true;
                });

            });
        }

        loadApprovedUsers();
        showUsers();
        hideProgressBar();
    });

}
function showUsers() {
    var userHTML="";
    var usersContainer = $('.all-users');
    usersContainer.html("");
    for(var userID in allUsers) {
        var user = allUsers[userID];
        buildHtmlObject(user);

        function buildHtmlObject(user) {
            userHTML += "<div class=\"card margin-top-10\" id=\"";
            userHTML += user.id;
            userHTML += "\">";
            userHTML += "                <div class=\"card-body\">";
            userHTML += "                    <h4 class=\"card-title\">";
            userHTML += user.company;
            userHTML += "<\/h4>";
            userHTML += "                    <h6 class=\"card-subtitle mb-2 text-muted\">";
            userHTML +=  user.careSetting + " " + user.telephone +"<\/h6>";
            userHTML += "                    <p class=\"card-text\">";
            userHTML += user.name;
            userHTML += ", ";
            userHTML += user.email;
            userHTML += "<br> Location: ";
            userHTML += user.address;
            userHTML += "<\/p>";
            userHTML += "                    <a href=\"#\" class=\"card-link float-right\" onclick=\"manageUser('";
            userHTML += userID;
            userHTML += "');\">MANAGE<\/a>";
            userHTML += "                <\/div>";
            userHTML += "            <\/div>";
        }
    }

    usersContainer.append(userHTML);
}
function manageUser(userID) {
    var user = allUsers[userID];
    function createModal() {
        var userModalHTML="";
        var modalContainer = $(".modals-container");
        userModalHTML += "<div id=\"";
        userModalHTML += "userModal";
        userModalHTML += "\" class=\"modal fade bd-example-modal-lg\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myLargeModalLabel\" aria-hidden=\"true\">";
        userModalHTML += "        <div class=\"modal-dialog modal-lg\">";
        userModalHTML += "            <div class=\"modal-content padding-16\">";
        userModalHTML += "                <h1 class=\"display-4\">";
        userModalHTML += user.company;
        userModalHTML += "<\/h1>";
        userModalHTML += "                <p class=\"h3\">";
        userModalHTML += user.name;
        userModalHTML += "<\/p>";
        userModalHTML += "                <p class=\"h3\">";
        userModalHTML += user.number;
        userModalHTML += "<\/p>";
        userModalHTML += "                <div class=\"text-dark\">";
        userModalHTML += user.email;
        userModalHTML += "<\/div>";
        userModalHTML += "                <p class=\"lead\">";
        userModalHTML += user.message;
        userModalHTML += "                <\/p>";
        userModalHTML += "                <div class=\"modal-footer\">";
        userModalHTML += "                    <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close<\/button>";

        if(user.id in approvedUsers){
            userModalHTML += "                    <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" onclick=\"disapproveUser('";
            userModalHTML += user.id;
            userModalHTML += "');\">Disapprove<\/button>";

        } else {
            userModalHTML += "                    <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" onclick=\"approveUser('";
            userModalHTML += user.id;
            userModalHTML += "');\">Approve<\/button>";
        }
        userModalHTML += "                <\/div>";
        userModalHTML += "            <\/div>";
        userModalHTML += "        <\/div>";
        userModalHTML += "    <\/div>";
        modalContainer.html(userModalHTML);

    }
    function initializeAndShowModal() {
        $('#userModal').modal();
    }


    createModal();
    initializeAndShowModal();
}
function approveUser(userID) {
    var user = allUsers[userID];
    database.ref('/approved_users/' + user.id).set('true');
}
function disapproveUser(userID) {
    var user = allUsers[userID];
    database.ref('/approved_users/' + user.id).remove();
}
// END USERS







// CATALOG
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
        var categoryEditContainer = $("#new-category-select");
        categoriesContainer.html("");
        categoryEditContainer.html("");

        var categoryHTML = "<option>Categories</option>";
        for(var categoryID in allCategories) {
            var category = allCategories[categoryID];
            categoryHTML += "<option>" + presentCategoryText(category.name) + "</option>";
        }
        categoriesContainer.html(categoryHTML);
        categoryEditContainer.html(categoryHTML);
    }
}
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
function showEditSubCategories(categoryID) {
    var subCategoriesContainer = $("#new_subcategory_select");
    subCategoriesContainer.html("");

    var subCategoryHTML = "<option>Other</option>";
    if(categoryID in allCategories){
        for(var subCategoryID in allCategories[categoryID].subCategories) {
            subCategoryHTML += "<option value=\""+ subCategoryID+ "\">" + presentCategoryText(subCategoryID) + "</option>";
        }
    }

    subCategoriesContainer.html(subCategoryHTML);
}
function initializeCatalogListeners() {

    $('#search-catalog').on('input', function(){

        var searchText = $('#search-catalog').val();
        lastItem = null;
        showProgressBar();
        resetCategories();
        loadItems(searchText.toLowerCase());

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
        loadItems();
    });

    $( "#subcategories-select").change(function() {

        lastItem = null;
        showProgressBar();
        loadItems();
    });

    $("#new_category_select").change(function() {
        var selectedCategory = $('#new_category_select').find(":selected").text();
        var otherCategory = document.getElementById("otherCategory");
        var otherSubCategory = document.getElementById("otherSubCategory");

        otherSubCategory.removeAttribute('disabled');

        if(selectedCategory == 'Other') {
            otherCategory.removeAttribute('disabled');
        } else {
            otherCategory.setAttribute('disabled', 'disabled');
        }
        showEditSubCategories(unpresentCategoryText(selectedCategory));
    });

    $( "#new_subcategory_select").change(function() {
        var selectedSubCategory = $('#new_subcategory_select').find(":selected").text();
        var otherSubCategory = document.getElementById("otherSubCategory");

        if(selectedSubCategory == 'Other') {
            otherSubCategory.removeAttribute('disabled');
        } else {
            otherSubCategory.setAttribute('disabled', 'disabled');
        }
    });
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
        var editCategories = $("#new_category_select");
        categoriesContainer.html("");
        editCategories.html("");

        var categoryHTML = "<option>Categories</option>";
        var editCategoryHTML = "<option>Other</option>";
        for(var categoryID in allCategories) {
            var category = allCategories[categoryID];
            categoryHTML += "<option value=\""+ category.name+ "\">" + presentCategoryText(category.name) + "</option>";
            editCategoryHTML += "<option value=\""+ category.name+ "\">" + presentCategoryText(category.name) + "</option>";
        }
        categoriesContainer.html(categoryHTML);
        editCategories.html(editCategoryHTML);
    }
}
function loadItems(searchText) {// Check Catalog.js for more info
    catalogRef = database.ref('/catalog/');

    var category = $('#categories-select').find(":selected").text();
    var subcategory = $('#subcategories-select').find(":selected").text();
    readCategoriesData();


    if(searchText){
        searchText = searchText.toLowerCase();
        searchWithText();
    } else{
        if(category){
            if(subcategory) {
                catalogRef = catalogRef.orderByChild("cat_sub").equalTo(category + " " + subcategory);
            } else { // If a category is selected but a subcategory isnt
                catalogRef = catalogRef.orderByChild("category").equalTo(category);
            }
        } else { // If no filtering has happened
            if(!lastItem){
                catalogRef = catalogRef.limitToFirst(25);
            } else {
                catalogRef = catalogRef.orderByKey().startAt(lastItem).limitToFirst(25);
            }
        }

        allItems = [];
        catalogRef.on('value', function(snapshot) {
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
            var measurementObjects = itemObject["measurement"];

            for(var measurmentObID in measurementObjects) {
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
            if(itemImages[itemID] && img){
                img.src = itemImages[itemID];
            } else {
                if(img)
                    img.src = "./assets/noimage.png";
            }
        }
    }

    function loadItemImages() {
        for(var itemID in allItems) {
            if(!itemImages[itemID]){
                performImageFetchTask(itemID);
            }
        }
    }

    function performImageFetchTask(itemID) {
        var item = allItems[itemID];
        if(item.image == "")
            return;
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
        var searchCategory = catalogRef.orderByChild('category')
            .startAt(searchText)
            .endAt(searchText+"\uf8ff");
        var searchName = catalogRef.orderByChild('name')
            .startAt(searchText)
            .endAt(searchText+"\uf8ff");
        var searchSubCategory = catalogRef.orderByChild('subcategory')
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

    loadItems(searchText);
    $("html, body").animate({ scrollTop: 100 }, "slow");
}
function showAllItems() {
    var container = $('#items-container');
    var HTML = "";
    for(var itemID in allItems) {
        var item = allItems[itemID];
        HTML += "                <div id=\"";
        HTML += item.id;
        HTML += "\" class=\"col-sm-12 col-md-6 col-lg-4 margin-bottom-10\" onclick=\"editItem('";
        HTML += item.id;
        HTML += "');\">";
        HTML += "                    <div class=\"card text-white\">";
        HTML += "                        <div class=\"img mx-auto row align-items-center\" style=\"height: 300px;width:auto;\">";
        HTML += "                            <img id=\"img-" + item.id +"\" class=\"col card-img-top mh-100 width-auto\" src=\"assets\/noimage.png\"";
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
        HTML += "                                <a href=\"javascript:;\" class=\"btn primary-color-text\">Edit<\/a>";
        HTML += "                            <\/div>";
        HTML += "                        <\/div>";
        HTML += "";
        HTML += "                    <\/div>";
        HTML += "                <\/div>";
    }
    container.html(HTML);
}
function editItem(itemID) {
    var item = (itemID) ? allItems[itemID] : null;
    var editItemForm = document.getElementById("editItemForm");
    var submitButton = document.getElementById("submitItemButton");
    var deleteButton = document.getElementById("deleteItemButton");
    var measurementContainer = $('#measurements');

    var otherCategory = document.getElementById("otherCategory");
    var otherSubCategory = document.getElementById("otherSubCategory");

    editItemForm.reset();

    measurementContainer.html("");
    if(item) {
        showEditSubCategories(item.category);
        otherCategory.setAttribute('disabled', 'disabled');
        otherSubCategory.setAttribute('disabled', 'disabled');
        submitButton.setAttribute( "onclick", "submitItem('"+item.id+"')" );
        deleteButton.setAttribute( "onclick", "deleteItem('"+item.id+"')" );
        fillInItemData();
    } else {
        otherCategory.removeAttribute('disabled');
        otherSubCategory.removeAttribute('disabled');
        submitButton.setAttribute( "onclick", "javascript: submitItem()" );
        deleteButton.setAttribute( "onclick", "" );
    }

    showModal();


    function fillInItemData() {
        var publicId = $('#publicID');
        var itemName = $('#itemName');
        var category = $('#new_category_select');
        var subCategory = $('#new_subcategory_select');
        var unit = $('#itemUnits');
        var description = $('#itemDescription');
        publicId.val(item.itemID);
        itemName.val(item.name);
        category.val(item.category +"");
        subCategory.val(item.subcategory+"");
        unit.val(item.unit);
        description.val(item.description);

        var measurementHTML = "";
        for(var measurementID in item.measurements) {
            var measurement = item.measurements[measurementID];
            measurementHTML += "<div class=\"measurement padding-bottom-10 row\" id=\""+ measurement.id +"\"'>";
            measurementHTML += "                            <div class=\"col-sm-2\"><button type=\"button\" class=\"btn btn-outline-danger\"  onclick=\"measurementDelete.call(this)\"><i class=\"material-icons\">&#xE872;<\/i><\/button><\/div>";
            measurementHTML += "                            <div class=\"col-sm-4\"><input value=\"";
            measurementHTML += measurement.id;
            measurementHTML += "\" type=\"text\" class=\"form-control measurementID\" placeholder=\"ID\"><\/div>";
            measurementHTML += "                            <div class=\"col-sm-3\"><input value=\"";
            measurementHTML += measurement.dimension;
            measurementHTML += "\" type=\"text\" class=\"form-control measurementDimension\" placeholder=\"Dimension(Ex: 1.1)\"><\/div>";
            measurementHTML += "                            <div class=\"col-sm-3\"><input type=\"text\" value=\"";
            measurementHTML += measurement.price;
            measurementHTML += "\" class=\"form-control measurementPrice\" placeholder=\"$12\"><\/div>";
            measurementHTML += "                        <\/div>";
        }
        measurementContainer.html(measurementHTML);
    }
    function showModal() {
        $('#editItemModal').modal({
            keyboard: false
        }).modal('show');
    }
}
function addMeasurement() {
    var measurementContainer = $('#measurements');
    var measurementHTML = "";
    measurementHTML += "<div class=\"measurement padding-bottom-10 row\">";
    measurementHTML += "                            <div class=\"col-sm-2\"><button type=\"button\" class=\"btn btn-outline-danger\"  onclick=\"measurementDelete.call(this)\"><i class=\"material-icons\">&#xE872;<\/i><\/button><\/div>";
    measurementHTML += "                            <div class=\"col-sm-4\"><input type=\"text\" class=\"form-control measurementID\" placeholder=\"ID\"><\/div>";
    measurementHTML += "                            <div class=\"col-sm-3\"><input type=\"text\" class=\"form-control measurementDimension\" placeholder=\"Dimension(Ex: 1.1)\"><\/div>";
    measurementHTML += "                            <div class=\"col-sm-3\"><input type=\"text\" class=\"form-control measurementPrice\" placeholder=\"$12\"><\/div>";
    measurementHTML += "                        <\/div>";
    measurementContainer.append(measurementHTML);
}
function deleteItem(itemID) {
    var itemName = allItems[itemID].name;
    if(!itemID || itemID.length < 1){
        return;
    }
    var itemRef = database.ref('catalog/' + itemID);
    delete allItems[itemID];
    delete itemImages[itemID];
    itemRef.remove().then(function () {
        showSnackBar("Removed Item " + itemName);
    });
}
function submitItem(itemID) {
    var publicId = $('#publicID');
    var itemName = $('#itemName');
    var category = $('#new_category_select').find(":selected").text();
    var subCategory = $('#new_subcategory_select').find(":selected").text();
    var otherCategory = document.getElementById("otherCategory");
    var otherSubCategory = document.getElementById("otherSubCategory");
    var measurements = $('#measurements').find('.measurement');
    var unit = $('#itemUnits');
    var imageObject = $("#itemImage").prop('files')[0];
    var description = $('#itemDescription');
    var imageName = (imageObject) ? imageObject.name : "";


    anaylzeCatAndSubCat();

    if(!itemID) {
        var idNumber = Math.floor((Math.random() * 100000) + 1);
        itemID = sanitizeRef(itemName.val() + publicId.val()+idNumber);
    }




    var itemRef = database.ref('catalog/' + itemID);
    itemRef.update({
        category: category,
        subcategory: subCategory,
        id: publicId.val(),
        description: description.val(),
        name: itemName.val().toLowerCase(),
        unit: unit.val(),
        cat_sub: category + " " + subCategory,
        measurement : ""
    }).then(function () {
        loadCategories();
        if(imageObject) {
            uploadImage();
        } else {
            $('#editItemModal').modal('hide');
        }
    });


    database.ref('catalog/' + itemID+'/measurement/').remove();
    for(var measurementID in measurements) {
        var measurement = $(measurements[measurementID]);
        var dimension = measurement.find('.measurementDimension').first().val();
        var price = measurement.find('.measurementPrice').first().val();
        var measurementIDVal = measurement.find('.measurementID').first().val();
        var measurementExt = (measurementIDVal == "") ? sanitizeRef(dimension+price) : sanitizeRef(measurementIDVal);
        if(dimension != "" && price != "") {
            var measurementRef =  database.ref('catalog/' + itemID+'/measurement/'+measurementExt);
            measurementRef.update({
                dimension: dimension,
                price: price
            });
        }
    }

    function uploadImage() {
        new ImageCompressor(imageObject, {
            quality: .4,
            convertSize: 2000000,
            success(result) {
                uploadImageAsPromise(result);
            },
            error(e) {

            },
        });

    }

    function uploadImageAsPromise (imageFile) {
        return new Promise(function (resolve, reject) {
            var storageRef = this.storageRef.child('catalog/' + itemID + '/' + imageName);
            var uploadTask = storageRef.put(imageFile);


            //Update progress bar
            uploadTask.on('state_changed',
                function progress(snapshot) {
                    // var percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                },
                function error(err) {
                    // showCarEditErrorMessage(err.message);
                },
                function complete() {
                    itemImages[itemID] = null;

                    itemRef.update({
                        image: imageName
                    }).then(function () {
                        $('#editItemModal').modal('hide');
                    });
                }
            );
        });
    }



    function anaylzeCatAndSubCat() {
        category = unpresentCategoryText(category);
        subCategory = unpresentCategoryText(subCategory);
        if(category == 'other'){
            category = otherCategory.value;
            category = unpresentCategoryText(category);
            createNewCategory(category);
        }
        if(subCategory == 'other') {
            subCategory = otherSubCategory.value;
            subCategory = unpresentCategoryText(subCategory);
            createNewSubCategory(subCategory);
        }
    }
    function createNewCategory(category) {
        var categoryRef = database.ref('categories/'+category);
        categoryRef.set({
            no_sub_cat: true
        });

    }
    function createNewSubCategory(subCategory) {
        var categoryRef = database.ref('categories/'+category);
        categoryRef.child('no_sub_cat').remove();
        categoryRef.child(subCategory).set(true);
    }
}
var measurementDelete = function () {
    var measurement = $(this).parent().parent();
    measurement.remove();
};

// END CATALOG









function loadCarts(start, end) {

}



function User() {
    this.id = "";
    this.email = "";
    this.name = "";
    this.company = ""
    this.telephone = "";
    this.address = "";
    this.message = "";
    this.careSetting = "";
    this.registerTime = 0;
}

function Cart() {
    this.id = "";

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
    this.price = ""
    this.dimension = 0;
}