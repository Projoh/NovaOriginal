
function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $('#loginMenuItem').addClass('gone');
            $('#registerMenuItem').addClass('gone');
            $('#logoutMenuItem').removeClass('gone');
        } else {
            $('#loginMenuItem').removeClass('gone');
            $('#registerMenuItem').removeClass('gone');
            $('#logoutMenuItem').addClass('gone');
        }
    });
}

$( document ).ready(function() {
    console.log( "Initialized!" );

    initializeAuthListener();

});

function goToContact() {

    $('html, body').animate({
        scrollTop: $("#contact_us").offset().top
    }, 1000);
}

function openLoginModal() {
    $('.navbar-toggler').click();
    $('#loginModal').modal({
        keyboard: false
    })
    $('#loginModal').modal('show');
}


$(function() {
    function AttemptLogin() {
        var email = $('#loginEmail').val();
        var password = $('#loginPassword').val();



        firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
            $('#loginModal').modal('hide');
            var user = firebase.auth().currentUser;
            showSnackBar("Welcome "+user.displayName);
        }).catch(function(error) {
             updateErrorMessage(error.message);
        });

        function updateErrorMessage(error) {
            if(error !== "") {
                $('#error-text').html(error);
            }
        }
    }

    $('#login-form').on("submit",function(e) {
        e.preventDefault();
        $('#error-text').html("");
        AttemptLogin();
    });

});

function showSnackBar(messageText) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    if(messageText) {
        x.innerHTML= messageText;
    }
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function logOut() {
    firebase.auth().signOut().then(function() {
        $('.navbar-toggler').click();
        showSnackBar("You've successfully logged out!");
    }).catch(function(error) {
        // An error happened.
    });
}