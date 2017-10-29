function initializeFireBase() {
    var config = {
        apiKey: "AIzaSyDa1pFV63C-8OpQEZMHMx70EFIdO59PVzI",
        authDomain: "nova-medical-technologies.firebaseapp.com",
        databaseURL: "https://nova-medical-technologies.firebaseio.com",
        projectId: "nova-medical-technologies",
        storageBucket: "",
        messagingSenderId: "315237263721"
    };
    firebase.initializeApp(config);
}

function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = "admin.html";
        } else {
            // No user is signed in.
        }
    });
}

$( document ).ready(function() {
    console.log( "Initialized!" );

    initializeFireBase();
    initializeAuthListener();
});


$(function() {
    function AttemptLogin() {
        var email = $('#email').val();
        var password = $('#password').val();



        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            updateErrorMessage(error);
        });

        function updateErrorMessage(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if(error !== "") {
                $('#error-text').html(errorCode + ": <br>" + errorMessage);
            }
        }
    }

    $('#login-form').on("submit",function(e) {
        e.preventDefault();
        $('#error-text').html("");
        AttemptLogin();
    });
});
