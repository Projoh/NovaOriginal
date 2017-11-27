
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

    $('#contact-us-form').on("submit",function(e) {
        e.preventDefault();
        sendEmail();
        $('#contact-us-form').reset();
        showSnackBar("Email client initiated! Please  hit send.");
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

function sendEmail() {
    var fullName = fetchValue($('#inputName'));
    var phoneNumber= fetchValue($('#phoneNumber'));
    var address = fetchValue($('#inputAddress')) + " " +
        fetchValue($('#inputCity')) +
        " " + fetchValue($('#inputState')) + " " +
        fetchValue($('#inputZip'));
    var messageText = fetchValue($('#messageTextArea'));

    messageText = encodeURIComponent(messageText +
        "\r\n\r\n\r\n" + address + "\r\n" + phoneNumber + "\r\n" + fullName);
    var subjectText = encodeURIComponent(fullName + " " + phoneNumber + " :Contact Us");

    // window.location.href = "mailto:"+"jaffersyed@novamedicaltechnologies.com"+
    //     "?subject="+subjectText +
    //     +"&body=" + messageText;

    window.location.href = "mailto:" +
        "jaffersyed@novamedicaltechnologies.com" +
        "?subject=" +
        subjectText +
        "&body=" +
        messageText;


}

function fetchValue(object) {
    return (object) ? object.val() : "";
}