function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (!newUser) {
                window.location.href = "catalog.html";
            } else {
                createNewUser(user.uid);
            }
        }
    });
}

$(document).ready(function () {
    console.log("Initialized!");
    initializeAuthListener();
});

var newUser = false;


var database = firebase.database();


$(function () {
    function AttemptRegister() {
        var password = $('#password').val();
        var email = $('#email').val();

        newUser = true;


        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            updateErrorMessage(error.message);
        });

    }

    $('#login-form').on("submit", function (e) {
        e.preventDefault();
        $('#error-text').html("");
        var password = $('#password').val();
        var password2 = $('#password2').val();
        if (verifyPassword(password, password2)) {
            if(grecaptcha.getResponse()) {
                AttemptRegister();
            } else {
                updateErrorMessage("Please prove you are not a robot by checking the box by the submit button.")
            }
        } else {
            updateErrorMessage("Passwords don't match.")
        }
    });
});

function updateErrorMessage(error) {
    var errorMessage = error;
    if (error !== "") {
        $('#error-text').html("<br>" + errorMessage);
        $("html, body").animate({ scrollTop: 200 }, "slow");

    }

}


function showThankYouScreen() {
    var signUpSection = $('#sign-up');
    var headingContainer = $('#heading-container');
    var titleText = $('#title');
    var doneMessage = $('#done-message');

    var doneMessageText="";
    doneMessageText += "We'll be contacting your phone number within 24 hours.";
    doneMessageText += " In the mean time, please feel free to take a look at our <a class=\"text-primary\" href=\"\/catalog.html\">Catalog<\/a>.";

    $("html, body").animate({ scrollTop: 0 }, "slow");
    headingContainer.addClass('full-screen no-margin');
    titleText.html("Thank you.");
    doneMessage.html(doneMessageText);

    signUpSection.hide();
}

function createNewUser(userID) {
    var newUser = new User();


    newUser.email = sanitizeInput($('#email').val());
    newUser.name = sanitizeInput($('#name').val());
    newUser.company = sanitizeInput($('#company').val());
    newUser.telephone = sanitizeInput($('#telephone').val());
    newUser.address = sanitizeInput($('#address').val());
    newUser.message = sanitizeInput($('#message').val());
    newUser.careSetting = sanitizeInput($('#caresetting').find(":selected").text());


    var userRef = database.ref('users/' + userID);
    userRef.set({
        email: newUser.email,
        name: newUser.name,
        company: newUser.company,
        telephone: newUser.telephone,
        address: newUser.address,
        message: newUser.message,
        careSetting: newUser.careSetting
    }).then(function () {
        // Redirect User
        showThankYouScreen();
    });
}

function User() {
    this.email = "";
    this.password = "";
    this.name = "";
    this.company = ""
    this.telephone = "";
    this.address = "";
    this.message = "";
    this.careSetting = "";
}

function verifyPassword(a, b) {
    if (a.toString() < b.toString()) return false;
    if (a.toString() > b.toString()) return false;
    return true;
}

function sanitizeInput(input) {
    return input.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
}
