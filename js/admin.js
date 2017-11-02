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

$( document ).ready(function() {
    console.log( "Initialized!" );
    // Pull approved users
    initializeAuthListener();
    $('#myModal').modal({
        keyboard: false
    }).modal('show');
});

var allUsers= [];
var approvedUsers = [];

var allCatalogs = [];
var allItems = [];

var database = firebase.database();
var usersRef;
var catalogRef;
var itemsRef;
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



function loadCatalog(start, end) {

}

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
    this.images = "";
    this.imagesURL = [];
    this.category = "";
    this.subcategory = "";
    this.measurements = []; // Measurement: price
    this.description = "";
}